import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orders, resales } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { TICKET_TYPES, type TicketTypeId } from "../../shared/const";

type StripeClient = InstanceType<typeof Stripe>;

const stripe: StripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const ticketTypeIds = Object.keys(TICKET_TYPES) as [TicketTypeId, ...TicketTypeId[]];

export const paymentRouter = router({
  /**
   * Create a Stripe PaymentIntent for a primary ticket purchase (new tickets),
   * paid via an embedded Stripe Elements card form on /billets.
   */
  createPaymentIntent: protectedProcedure
    .input(z.object({
      ticketType: z.enum(ticketTypeIds),
      quantity: z.number().int().min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const ticketDef = TICKET_TYPES[input.ticketType];
      if (input.quantity > ticketDef.maxPerOrder) {
        throw new Error(`Maximum ${ticketDef.maxPerOrder} billets de ce type par commande`);
      }

      const amountTotal = ticketDef.priceCents * input.quantity;

      // Create a pending order first so we have a stable orderId to attach to the PaymentIntent metadata.
      const insertResult = await db.insert(orders).values({
        userId: ctx.user.id,
        ticketType: input.ticketType,
        quantity: input.quantity,
        amountTotal,
        currency: "EUR",
        status: "pending",
      });
      const orderId = insertResult[0].insertId as number;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountTotal,
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        receipt_email: ctx.user.email || undefined,
        metadata: {
          type: "primary_purchase",
          order_id: orderId.toString(),
          user_id: ctx.user.id.toString(),
          ticket_type: input.ticketType,
          quantity: input.quantity.toString(),
        },
      });

      await db.update(orders)
        .set({ stripePaymentIntentId: paymentIntent.id })
        .where(eq(orders.id, orderId));

      return {
        clientSecret: paymentIntent.client_secret,
        orderId,
        amountTotal,
      };
    }),

  /**
   * Poll an order's status (used on the success page to know when the
   * webhook has finished creating the tickets).
   */
  getOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      const order = result[0];
      if (!order || order.userId !== ctx.user.id) {
        throw new Error("Order not found");
      }
      return order;
    }),

  /**
   * Create a Stripe checkout session for ticket resale (public listing or a
   * private link — pass the link's `token` for private resales).
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      resaleId: z.number(),
      token: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the resale details
      const resale = await db
        .select()
        .from(resales)
        .where(eq(resales.id, input.resaleId))
        .limit(1);

      if (resale.length === 0) {
        throw new Error("Resale not found");
      }

      const resaleData = resale[0];

      if (resaleData.status !== "available") {
        throw new Error("This ticket is no longer available for purchase");
      }

      // Defense in depth: re-validate every private-resale rule server-side,
      // even though the client already checked via getPrivateResaleByToken.
      if (resaleData.type === "private") {
        if (!input.token || input.token !== resaleData.resaleToken) {
          throw new Error("Invalid resale link");
        }
        if (resaleData.tokenExpiresAt && resaleData.tokenExpiresAt < new Date()) {
          throw new Error("This resale link has expired");
        }
        if (resaleData.blockedUntil && resaleData.blockedUntil > new Date()) {
          throw new Error("This resale is temporarily unavailable");
        }
        if (resaleData.sellerId === ctx.user.id) {
          throw new Error("You cannot buy your own ticket");
        }
      }

      // Lock the listing while checkout is in progress so nobody else can buy
      // it concurrently; released automatically if the session expires unused.
      await db.update(resales)
        .set({ status: "pending", updatedAt: new Date() })
        .where(eq(resales.id, input.resaleId));

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Hellfest Ticket",
                description: `Resale ticket from Hellfest`,
              },
              unit_amount: resaleData.resalePrice,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${ctx.req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: resaleData.type === "private"
          ? `${ctx.req.headers.origin}/revente/prive/${resaleData.resaleToken}`
          : `${ctx.req.headers.origin}/revente`,
        customer_email: ctx.user.email || undefined,
        metadata: {
          user_id: ctx.user.id.toString(),
          resale_id: input.resaleId.toString(),
          seller_id: resaleData.sellerId.toString(),
        },
        client_reference_id: ctx.user.id.toString(),
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),


  /**
   * Get checkout session details
   */
  getCheckoutSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      return {
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
      };
    }),

  /**
   * Confirm payment and update resale status
   */
  confirmPayment: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      resaleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the session with Stripe
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      // Update resale status
      await db.update(resales)
        .set({
          status: "completed",
          buyerId: ctx.user.id,
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(resales.id, input.resaleId));

      return { success: true };
    }),
});
