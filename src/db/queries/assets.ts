import { db } from "../client";
import { assets } from "../schema";
import { eq, asc, sql } from "drizzle-orm";
import type { AssetType } from "../../types";

export async function getAssets() {
  return db
    .select()
    .from(assets)
    .orderBy(asc(assets.sortOrder), asc(assets.id));
}

export async function createAsset(data: {
  name: string;
  assetType: AssetType;
  balance?: number;
  isPreset?: boolean;
}) {
  return db.insert(assets).values({ ...data, balance: data.balance ?? 0 }).returning();
}

export async function updateAssetBalance(id: number, balance: number) {
  return db
    .update(assets)
    .set({ balance, updatedAt: sql`(strftime('%s', 'now'))` })
    .where(eq(assets.id, id))
    .returning();
}

export async function updateAsset(
  id: number,
  data: { name?: string; balance?: number; assetType?: AssetType }
) {
  return db
    .update(assets)
    .set({ ...data, updatedAt: sql`(strftime('%s', 'now'))` })
    .where(eq(assets.id, id))
    .returning();
}

export async function deleteAsset(id: number) {
  return db.delete(assets).where(eq(assets.id, id));
}
