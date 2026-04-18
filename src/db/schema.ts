import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // "income" | "expense"
  color: text("color"),
  isPreset: integer("is_preset", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  assetType: text("asset_type").notNull().default("other"),
  // "cash" | "bank" | "investment" | "other"
  balance: integer("balance").notNull().default(0),
  isPreset: integer("is_preset", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "income" | "expense"
  date: integer("date", { mode: "timestamp" }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  memo: text("memo"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
