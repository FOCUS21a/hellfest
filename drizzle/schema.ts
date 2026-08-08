import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tickets table - Stores all festival tickets
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticketType: varchar("ticketType", { length: 64 }).notNull(),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: mysqlEnum("status", ["owned", "for_sale", "sold", "transferred"]).default("owned").notNull(),
  /**
   * PaymentIntent used by the CURRENT holder to acquire this ticket (either the
   * original primary purchase, or the checkout that transferred it to them via
   * resale). Used to route private-resale refunds back to the seller's card,
   * per Hellfest's real "carte d'achat d'origine" policy.
   */
  originStripePaymentIntentId: varchar("originStripePaymentIntentId", { length: 255 }),
  /**
   * Set by the admin once the buyer's ticket handover is confirmed and the
   * downloadable PDF is ready. Until then, a resale-acquired ticket shows as
   * "en attente d'attribution" to the buyer.
   */
  pdfUrl: varchar("pdfUrl", { length: 1000 }),
  assignedAt: timestamp("assignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Resales table - Stores ticket resale listings
 */
export const resales = mysqlTable("resales", {
  id: int("id").autoincrement().primaryKey(),
  /** Array of ticket IDs included in this resale (1 or 2 tickets per link/listing). */
  ticketIds: json("ticketIds").$type<number[]>().notNull(),
  sellerId: int("sellerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  buyerId: int("buyerId").references(() => users.id),
  resalePrice: int("resalePrice").notNull(),
  /** "public" = listed on the marketplace. "private" = link-only, sent to a chosen buyer. */
  type: mysqlEnum("type", ["public", "private"]).default("public").notNull(),
  /** Unique token embedded in the private resale link. Null for public listings. */
  resaleToken: varchar("resaleToken", { length: 64 }).unique(),
  /** Private link expiry — after this, the ticket automatically becomes resellable again. */
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  /** Set when the seller opens their own private link; blocks the sale for ~1h (anti self-dealing). */
  blockedUntil: timestamp("blockedUntil"),
  /** Set once the seller's private-resale payout has been sent (manual bank transfer, handled outside Stripe). */
  payoutStatus: mysqlEnum("payoutStatus", ["pending", "paid"]).default("pending").notNull(),
  payoutPaidAt: timestamp("payoutPaidAt"),
  status: mysqlEnum("status", ["available", "pending", "completed", "cancelled"]).default("available").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resale = typeof resales.$inferSelect;
export type InsertResale = typeof resales.$inferInsert;

/**
 * Orders table - Primary ticket purchases (new tickets bought via Stripe PaymentIntent)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticketType: varchar("ticketType", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
  amountTotal: int("amountTotal").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "cancelled"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Waitlist table - Users waiting for tickets
 */
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticketType: varchar("ticketType", { length: 64 }).notNull(),
  notified: int("notified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;
