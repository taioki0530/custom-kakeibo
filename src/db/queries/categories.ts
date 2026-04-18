import { db } from "../client";
import { categories } from "../schema";
import { eq, asc } from "drizzle-orm";
import type { TransactionType } from "../../types";

export async function getCategories(type?: TransactionType) {
  if (type) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.type, type))
      .orderBy(asc(categories.sortOrder), asc(categories.id));
  }
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.id));
}

export async function createCategory(data: {
  name: string;
  type: TransactionType;
  color?: string;
}) {
  return db.insert(categories).values({ ...data, isPreset: false }).returning();
}

export async function updateCategory(
  id: number,
  data: { name?: string; color?: string }
) {
  return db.update(categories).set(data).where(eq(categories.id, id)).returning();
}

export async function deleteCategory(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}
