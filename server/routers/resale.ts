import { protectedProcedure, publicProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { resales, tickets, users, waitlist } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PRIVATE_RESALE_SELF_OPEN_BLOCK_MS, PRIVATE_RESALE_TOKEN_TTL_MS } from "@shared/const";

const MAX_TICKETS_PER_RESALE = 2;

export const resaleRouter = router({
  getAvailable: publicProcedure
    .input(z.object({
      ticketType: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(resales)
        .where(eq(resales.status, "available"))
        .limit(input.limit).offset(input.offset);
      return result;
    }),

  getUserTickets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tickets).where(eq(tickets.userId, ctx.user.id));
  }),

  /** Create a public marketplace resale listing for 1 or 2 tickets at once. */
  createResale: protectedProcedure
    .input(z.object({
      ticketIds: z.array(z.number()).min(1).max(MAX_TICKETS_PER_RESALE),
      resalePrice: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const owned = await db.select().from(tickets)
        .where(and(inArray(tickets.id, input.ticketIds), eq(tickets.userId, ctx.user.id)));
      if (owned.length !== input.ticketIds.length) {
        throw new Error("One or more tickets not found or not yours");
      }
      if (owned.some((t) => t.status !== "owned")) {
        throw new Error("One or more tickets are not available for resale");
      }

      const result = await db.insert(resales).values({
        ticketIds: input.ticketIds,
        sellerId: ctx.user.id,
        resalePrice: input.resalePrice,
        status: "available",
      });

      await db.update(tickets).set({ status: "for_sale" })
        .where(inArray(tickets.id, input.ticketIds));

      return result;
    }),

  /** Create a private resale link for 1 or 2 tickets. Link-only, never listed publicly. */
  createPrivateResale: protectedProcedure
    .input(z.object({
      ticketIds: z.array(z.number()).min(1).max(MAX_TICKETS_PER_RESALE),
      resalePrice: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const owned = await db.select().from(tickets)
        .where(and(inArray(tickets.id, input.ticketIds), eq(tickets.userId, ctx.user.id)));
      if (owned.length !== input.ticketIds.length) {
        throw new Error("One or more tickets not found or not yours");
      }
      if (owned.some((t) => t.status !== "owned")) {
        throw new Error("One or more tickets are not available for resale");
      }

      const token = nanoid(24);
      const insertResult = await db.insert(resales).values({
        ticketIds: input.ticketIds,
        sellerId: ctx.user.id,
        resalePrice: input.resalePrice,
        type: "private",
        resaleToken: token,
        tokenExpiresAt: new Date(Date.now() + PRIVATE_RESALE_TOKEN_TTL_MS),
        status: "available",
      });
      const resaleId = insertResult[0].insertId as number;

      await db.update(tickets).set({ status: "for_sale" })
        .where(inArray(tickets.id, input.ticketIds));

      return { resaleId, token };
    }),

  getPrivateResaleByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { state: "not_found" as const };

      const rows = await db.select().from(resales).where(eq(resales.resaleToken, input.token)).limit(1);
      if (rows.length === 0) return { state: "not_found" as const };
      const resale = rows[0];
      const now = new Date();

      if (resale.status === "completed") return { state: "completed" as const };
      if (resale.status === "cancelled") return { state: "expired" as const };

      if (resale.tokenExpiresAt && resale.tokenExpiresAt < now && resale.status === "available") {
        await db.update(resales).set({ status: "cancelled", updatedAt: now }).where(eq(resales.id, resale.id));
        await db.update(tickets).set({ status: "owned", updatedAt: now }).where(inArray(tickets.id, resale.ticketIds));
        return { state: "expired" as const };
      }

      const isSeller = ctx.user?.id === resale.sellerId;
      if (isSeller) {
        const blockedUntil = new Date(Date.now() + PRIVATE_RESALE_SELF_OPEN_BLOCK_MS);
        await db.update(resales).set({ blockedUntil }).where(eq(resales.id, resale.id));
        return { state: "blocked_self" as const, blockedUntil };
      }
      if (resale.blockedUntil && resale.blockedUntil > now) {
        return { state: "blocked" as const, blockedUntil: resale.blockedUntil };
      }
      if (resale.status !== "available") return { state: "pending" as const };

      const resaleTickets = await db.select().from(tickets).where(inArray(tickets.id, resale.ticketIds));

      return {
        state: "available" as const,
        resaleId: resale.id,
        ticketTypes: resaleTickets.map((t) => t.ticketType),
        resalePrice: resale.resalePrice,
      };
    }),

  joinWaitlist: protectedProcedure
    .input(z.object({ ticketType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.insert(waitlist).values({ userId: ctx.user.id, ticketType: input.ticketType, notified: 0 });
    }),

  getResaleDetails: publicProcedure
    .input(z.object({ resaleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(resales).where(eq(resales.id, input.resaleId)).limit(1);
      return result[0] || null;
    }),

  cancelResale: protectedProcedure
    .input(z.object({ resaleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const resale = await db.select().from(resales)
        .where(and(eq(resales.id, input.resaleId), eq(resales.sellerId, ctx.user.id))).limit(1);
      if (resale.length === 0) throw new Error("Resale not found or does not belong to you");

      await db.update(resales).set({ status: "cancelled" }).where(eq(resales.id, input.resaleId));
      await db.update(tickets).set({ status: "owned" }).where(inArray(tickets.id, resale[0].ticketIds));
      return { success: true };
    }),

  getPendingPayouts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rows = await db.select({
      resaleId: resales.id,
      resalePrice: resales.resalePrice,
      type: resales.type,
      completedAt: resales.updatedAt,
      payoutStatus: resales.payoutStatus,
      ticketIds: resales.ticketIds,
      sellerName: users.name,
      sellerEmail: users.email,
    })
      .from(resales)
      .innerJoin(users, eq(resales.sellerId, users.id))
      .where(and(eq(resales.status, "completed"), eq(resales.payoutStatus, "pending")))
      .orderBy(desc(resales.updatedAt));

    return rows;
  }),

  markPayoutPaid: adminProcedure
    .input(z.object({ resaleId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(resales).set({ payoutStatus: "paid", payoutPaidAt: new Date() }).where(eq(resales.id, input.resaleId));
      return { success: true };
    }),

  /** Admin: tickets acquired via resale that are still waiting for their PDF. */
  getPendingAssignments: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rows = await db.select({
      ticketId: tickets.id,
      ticketType: tickets.ticketType,
      buyerName: users.name,
      buyerEmail: users.email,
      acquiredAt: tickets.updatedAt,
    })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(and(eq(tickets.status, "transferred")))
      .orderBy(desc(tickets.updatedAt));

    // pdfUrl is not filterable in the join above cleanly with drizzle mysql json-less
    // column typing, so filter in JS for tickets still missing a PDF.
    const withPdf = await db.select({ id: tickets.id, pdfUrl: tickets.pdfUrl }).from(tickets)
      .where(eq(tickets.status, "transferred"));
    const pdfMap = new Map(withPdf.map((t) => [t.id, t.pdfUrl]));

    return rows.filter((r) => !pdfMap.get(r.ticketId));
  }),

  /** Admin: attach the downloadable PDF link once the ticket handover is confirmed. */
  assignTicketPdf: adminProcedure
    .input(z.object({ ticketId: z.number(), pdfUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(tickets)
        .set({ pdfUrl: input.pdfUrl, assignedAt: new Date() })
        .where(eq(tickets.id, input.ticketId));
      return { success: true };
    }),
});