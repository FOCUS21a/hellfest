import { protectedProcedure, publicProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { resales, tickets, users, waitlist } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PRIVATE_RESALE_SELF_OPEN_BLOCK_MS, PRIVATE_RESALE_TOKEN_TTL_MS } from "@shared/const";

export const resaleRouter = router({
  /**
   * Get available tickets for resale
   */
  getAvailable: publicProcedure
    .input(z.object({
      ticketType: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(resales).where(eq(resales.status, "available"));
      
      if (input.ticketType) {
        // In a real app, you'd join with tickets table to filter by type
        // For now, we'll keep it simple
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),

  /**
   * List user's tickets available for resale
   */
  getUserTickets: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(tickets)
        .where(eq(tickets.userId, ctx.user.id));
      
      return result;
    }),

  /**
   * Create a resale listing
   */
  createResale: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      resalePrice: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the ticket belongs to the user
      const ticket = await db
        .select()
        .from(tickets)
        .where(and(
          eq(tickets.id, input.ticketId),
          eq(tickets.userId, ctx.user.id)
        ))
        .limit(1);

      if (ticket.length === 0) {
        throw new Error("Ticket not found or does not belong to you");
      }

      // Create resale listing
      const result = await db.insert(resales).values({
        ticketId: input.ticketId,
        sellerId: ctx.user.id,
        resalePrice: input.resalePrice,
        status: "available",
      });

      // Update ticket status
      await db.update(tickets)
        .set({ status: "for_sale" })
        .where(eq(tickets.id, input.ticketId));

      return result;
    }),

  /**
   * Create a private resale link for a ticket. Only the seller and whoever
   * they send the link to can see/buy it — it's never listed publicly.
   */
  createPrivateResale: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      resalePrice: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const ticket = await db
        .select()
        .from(tickets)
        .where(and(
          eq(tickets.id, input.ticketId),
          eq(tickets.userId, ctx.user.id)
        ))
        .limit(1);

      if (ticket.length === 0) {
        throw new Error("Ticket not found or does not belong to you");
      }
      if (ticket[0].status !== "owned") {
        throw new Error("This ticket is not available for resale");
      }

      const token = nanoid(24);

      const insertResult = await db.insert(resales).values({
        ticketId: input.ticketId,
        sellerId: ctx.user.id,
        resalePrice: input.resalePrice,
        type: "private",
        resaleToken: token,
        tokenExpiresAt: new Date(Date.now() + PRIVATE_RESALE_TOKEN_TTL_MS),
        status: "available",
      });
      const resaleId = insertResult[0].insertId as number;

      await db.update(tickets)
        .set({ status: "for_sale" })
        .where(eq(tickets.id, input.ticketId));

      return { resaleId, token };
    }),

  /**
   * Look up a private resale by its link token. Public procedure (the buyer
   * isn't necessarily logged in yet), but applies all of the private-resale
   * business rules: expiry, self-open lockout, and hiding sold/cancelled links.
   */
  getPrivateResaleByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { state: "not_found" as const };

      const rows = await db
        .select({
          resale: resales,
          ticketType: tickets.ticketType,
        })
        .from(resales)
        .innerJoin(tickets, eq(resales.ticketId, tickets.id))
        .where(eq(resales.resaleToken, input.token))
        .limit(1);

      if (rows.length === 0) {
        return { state: "not_found" as const };
      }

      const { resale, ticketType } = rows[0];
      const now = new Date();

      if (resale.status === "completed") {
        return { state: "completed" as const };
      }
      if (resale.status === "cancelled") {
        return { state: "expired" as const };
      }

      // Lazy expiry: the link's window has passed and nobody bought it —
      // release the ticket back to the seller so it can be resold.
      if (resale.tokenExpiresAt && resale.tokenExpiresAt < now && resale.status === "available") {
        await db.update(resales)
          .set({ status: "cancelled", updatedAt: now })
          .where(eq(resales.id, resale.id));
        await db.update(tickets)
          .set({ status: "owned", updatedAt: now })
          .where(eq(tickets.id, resale.ticketId));
        return { state: "expired" as const };
      }

      const isSeller = ctx.user?.id === resale.sellerId;

      if (isSeller) {
        // The seller opened their own link — lock the sale for a cooldown
        // period rather than let them view/buy their own ticket.
        const blockedUntil = new Date(Date.now() + PRIVATE_RESALE_SELF_OPEN_BLOCK_MS);
        await db.update(resales)
          .set({ blockedUntil })
          .where(eq(resales.id, resale.id));
        return { state: "blocked_self" as const, blockedUntil };
      }

      if (resale.blockedUntil && resale.blockedUntil > now) {
        return { state: "blocked" as const, blockedUntil: resale.blockedUntil };
      }

      if (resale.status !== "available") {
        // e.g. "pending" — a checkout is already in progress for this link.
        return { state: "pending" as const };
      }

      return {
        state: "available" as const,
        resaleId: resale.id,
        ticketType,
        resalePrice: resale.resalePrice,
      };
    }),

  /**
   * Join the waitlist for a ticket type
   */
  joinWaitlist: protectedProcedure
    .input(z.object({
      ticketType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(waitlist).values({
        userId: ctx.user.id,
        ticketType: input.ticketType,
        notified: 0,
      });

      return result;
    }),

  /**
   * Get resale details
   */
  getResaleDetails: publicProcedure
    .input(z.object({
      resaleId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(resales)
        .where(eq(resales.id, input.resaleId))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Cancel a resale listing
   */
  cancelResale: protectedProcedure
    .input(z.object({
      resaleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the resale belongs to the user
      const resale = await db
        .select()
        .from(resales)
        .where(and(
          eq(resales.id, input.resaleId),
          eq(resales.sellerId, ctx.user.id)
        ))
        .limit(1);

      if (resale.length === 0) {
        throw new Error("Resale not found or does not belong to you");
      }

      // Update resale status
      await db.update(resales)
        .set({ status: "cancelled" })
        .where(eq(resales.id, input.resaleId));

      // Update ticket status back to owned
      await db.update(tickets)
        .set({ status: "owned" })
        .where(eq(tickets.id, resale[0].ticketId));

      return { success: true };
    }),

  /**
   * Admin: list private resales that have been paid by the buyer and
   * transferred, but where the seller hasn't been paid out yet.
   */
  getPendingPayouts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rows = await db
      .select({
        resaleId: resales.id,
        resalePrice: resales.resalePrice,
        type: resales.type,
        completedAt: resales.updatedAt,
        payoutStatus: resales.payoutStatus,
        ticketType: tickets.ticketType,
        sellerName: users.name,
        sellerEmail: users.email,
      })
      .from(resales)
      .innerJoin(tickets, eq(resales.ticketId, tickets.id))
      .innerJoin(users, eq(resales.sellerId, users.id))
      .where(and(eq(resales.status, "completed"), eq(resales.payoutStatus, "pending")))
      .orderBy(desc(resales.updatedAt));

    return rows;
  }),

  /**
   * Admin: mark a resale's seller payout as sent (manual bank transfer,
   * done outside Stripe once the ticket handover has been confirmed).
   */
  markPayoutPaid: adminProcedure
    .input(z.object({ resaleId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(resales)
        .set({ payoutStatus: "paid", payoutPaidAt: new Date() })
        .where(eq(resales.id, input.resaleId));

      return { success: true };
    }),
});
