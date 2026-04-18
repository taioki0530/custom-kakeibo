import { db } from "../client";
import { transactions, categories } from "../schema";
import { eq, gte, lt, desc, asc, sql } from "drizzle-orm";
import { monthBounds } from "../../utils/date";
import type { TransactionInput } from "../../types";

export async function getTransactions(year: number, month: number) {
  const { start, end } = monthBounds(year, month);
  return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      memo: transactions.memo,
      createdAt: transactions.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        isPreset: categories.isPreset,
        sortOrder: categories.sortOrder,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      sql`${transactions.date} >= ${Math.floor(start.getTime() / 1000)} AND ${transactions.date} < ${Math.floor(end.getTime() / 1000)}`
    )
    .orderBy(desc(transactions.date), desc(transactions.id));
}

export async function getRecentTransactions(limit = 20) {
  return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      memo: transactions.memo,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        isPreset: categories.isPreset,
        sortOrder: categories.sortOrder,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(limit);
}

export async function createTransaction(input: TransactionInput) {
  return db
    .insert(transactions)
    .values({
      amount: input.amount,
      type: input.type,
      date: input.date,
      categoryId: input.categoryId ?? null,
      memo: input.memo ?? null,
    })
    .returning();
}

export async function updateTransaction(id: number, input: Partial<TransactionInput>) {
  return db
    .update(transactions)
    .set({
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.memo !== undefined && { memo: input.memo }),
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(eq(transactions.id, id))
    .returning();
}

export async function deleteTransaction(id: number) {
  return db.delete(transactions).where(eq(transactions.id, id));
}
