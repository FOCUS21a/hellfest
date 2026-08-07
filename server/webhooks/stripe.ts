import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { orders, resales, tickets } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { TICKET_TYPES, type TicketTypeId } from "../../shared/const";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Only handle primary ticket purchases here — resale payments are
        // finalized in the checkout.session.completed handler above, and
        // their underlying PaymentIntent would otherwise be processed twice.
        if (paymentIntent.metadata?.type === "primary_purchase") {
          await handlePrimaryPurchaseSucceeded(paymentIntent);
        } else {
          console.log(`Payment succeeded: ${paymentIntent.id}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata?.type === "primary_purchase") {
          await handlePrimaryPurchaseFailed(paymentIntent);
        } else {
          console.log(`Payment failed: ${paymentIntent.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const resaleId = session.metadata?.resale_id;
  const buyerId = session.metadata?.user_id;

  if (!resaleId || !buyerId) {
    console.log("Not a resale checkout, skipping");
    return;
  }

  try {
    await db.update(resales)
      .set({
        status: "completed",
        buyerId: parseInt(buyerId),
        stripePaymentIntentId: session.payment_intent as string,
        updatedAt: new Date(),
      })
      .where(eq(resales.id, parseInt(resaleId)));

    const resaleRows = await db.select().from(resales).where(eq(resales.id, parseInt(resaleId))).limit(1);
    if (resaleRows.length === 0) return;
    const resaleData = resaleRows[0];

    // Transfer every ticket in this resale to the buyer. Status becomes
    // "transferred" with pdfUrl left empty — the buyer sees "en attente
    // d'attribution" until the admin manually assigns the downloadable PDF.
    for (const ticketId of resaleData.ticketIds) {
      await db.update(tickets)
        .set({
          status: "transferred",
          userId: parseInt(buyerId),
          originStripePaymentIntentId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId));
    }

    console.log(`Resale ${resaleId} completed, ${resaleData.ticketIds.length} ticket(s) transferred, pending PDF assignment`);
  } catch (error) {
    console.error("Error updating resale status:", error);
    throw error;
  }
}
    // Update resale status to completed
    await db.update(resales)
      .set({
        status: "completed",
        buyerId: parseInt(buyerId),
        stripePaymentIntentId: session.payment_intent as string,
        updatedAt: new Date(),
      })
      .where(eq(resales.id, parseInt(resaleId)));

    // Get the ticket and update its status to transferred
    const resaleData = await db
      .select()
      .from(resales)
      .where(eq(resales.id, parseInt(resaleId)))
      .limit(1);

    if (resaleData.length > 0) {
      await db.update(tickets)
        .set({
          status: "transferred",
          userId: parseInt(buyerId),
          // The buyer's payment becomes the new "origin" for a future resale.
          originStripePaymentIntentId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(inArray(tickets.id, resaleData.ticketIds));

      // Money stays on the platform's Stripe balance. The seller is paid out
      // manually (bank transfer) once you've confirmed the handover went
      // through — see resale.getPendingPayouts / resale.markPayoutPaid.
    }

    console.log(`Resale ${resaleId} completed successfully`);
  } catch (error) {
    console.error("Error updating resale status:", error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const resaleId = session.metadata?.resale_id;
  if (!resaleId) return;

  const resaleIdNum = parseInt(resaleId);
  const resaleRows = await db
    .select()
    .from(resales)
    .where(eq(resales.id, resaleIdNum))
    .limit(1);

  const resaleData = resaleRows[0];
  if (!resaleData || resaleData.status !== "pending") return;

  const now = new Date();
  const linkExpired = resaleData.tokenExpiresAt && resaleData.tokenExpiresAt < now;

  if (resaleData.type === "private" && linkExpired) {
    // The private link's own window is also over — release the ticket
    // entirely rather than reopening this now-expired link.
    await db.update(resales)
      .set({ status: "cancelled", updatedAt: now })
      .where(eq(resales.id, resaleIdNum));
    await db.update(tickets)
      .set({ status: "owned", updatedAt: now })
      .where(eq(tickets.id, resaleData.ticketId));
  } else {
    // Abandoned checkout — make the listing/link available again.
    await db.update(resales)
      .set({ status: "available", updatedAt: now })
      .where(eq(resales.id, resaleIdNum));
  }

  console.log(`Checkout session expired for resale ${resaleId}, listing released`);
}

async function handlePrimaryPurchaseSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const orderId = paymentIntent.metadata?.order_id;
  const userId = paymentIntent.metadata?.user_id;
  const ticketType = paymentIntent.metadata?.ticket_type as TicketTypeId | undefined;
  const quantity = paymentIntent.metadata?.quantity;

  if (!orderId || !userId || !ticketType || !quantity) {
    console.error("Missing metadata on primary purchase PaymentIntent", paymentIntent.id);
    return;
  }

  const orderIdNum = parseInt(orderId);

  // Idempotency guard: Stripe can retry webhook delivery. If this order is
  // already marked paid, the tickets were already minted — skip.
  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderIdNum))
    .limit(1);

  if (existingOrder.length === 0) {
    console.error(`Order ${orderIdNum} not found for PaymentIntent ${paymentIntent.id}`);
    return;
  }
  if (existingOrder[0].status === "paid") {
    console.log(`Order ${orderIdNum} already processed, skipping`);
    return;
  }

  const ticketDef = TICKET_TYPES[ticketType];
  const unitPrice = ticketDef ? ticketDef.priceCents : Math.round(paymentIntent.amount / parseInt(quantity));

  try {
    await db.update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(orders.id, orderIdNum));

    const qtyNum = parseInt(quantity);
    const newTickets = Array.from({ length: qtyNum }, () => ({
      userId: parseInt(userId),
      ticketType,
      price: unitPrice,
      currency: "EUR" as const,
      status: "owned" as const,
      originStripePaymentIntentId: paymentIntent.id,
    }));

    await db.insert(tickets).values(newTickets);

    console.log(`Order ${orderIdNum} paid, ${qtyNum} ticket(s) created for user ${userId}`);
  } catch (error) {
    console.error("Error finalizing primary purchase order:", error);
    throw error;
  }
}

async function handlePrimaryPurchaseFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = await getDb();
  if (!db) return;

  const orderId = paymentIntent.metadata?.order_id;
  if (!orderId) return;

  await db.update(orders)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(orders.id, parseInt(orderId)));

  console.log(`Order ${orderId} marked failed`);
}
