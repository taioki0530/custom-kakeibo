import { db } from "./client";
import { categories, assets } from "./schema";
import { eq, count } from "drizzle-orm";

const EXPENSE_CATEGORIES = [
  { name: "食費", color: "#f97316", sortOrder: 0 },
  { name: "外食・カフェ", color: "#fb923c", sortOrder: 1 },
  { name: "交際費", color: "#a855f7", sortOrder: 2 },
  { name: "日用品", color: "#06b6d4", sortOrder: 3 },
  { name: "家賃", color: "#3b82f6", sortOrder: 4 },
  { name: "水道光熱費", color: "#0ea5e9", sortOrder: 5 },
  { name: "通信費", color: "#6366f1", sortOrder: 6 },
  { name: "交通費", color: "#84cc16", sortOrder: 7 },
  { name: "医療・健康", color: "#ef4444", sortOrder: 8 },
  { name: "衣服・美容", color: "#ec4899", sortOrder: 9 },
  { name: "娯楽・趣味", color: "#f59e0b", sortOrder: 10 },
  { name: "サブスク", color: "#8b5cf6", sortOrder: 11 },
  { name: "教育", color: "#10b981", sortOrder: 12 },
  { name: "保険", color: "#64748b", sortOrder: 13 },
  { name: "その他", color: "#94a3b8", sortOrder: 14 },
];

const INCOME_CATEGORIES = [
  { name: "給与", color: "#10b981", sortOrder: 0 },
  { name: "賞与", color: "#059669", sortOrder: 1 },
  { name: "副収入", color: "#34d399", sortOrder: 2 },
  { name: "投資収益", color: "#6ee7b7", sortOrder: 3 },
  { name: "その他", color: "#94a3b8", sortOrder: 4 },
];

const PRESET_ASSETS = [
  { name: "現金", assetType: "cash", sortOrder: 0 },
  { name: "普通預金", assetType: "bank", sortOrder: 1 },
  { name: "定期預金", assetType: "bank", sortOrder: 2 },
  { name: "外貨預金", assetType: "bank", sortOrder: 3 },
  { name: "積み立てNISA", assetType: "investment", sortOrder: 4 },
  { name: "一般NISA", assetType: "investment", sortOrder: 5 },
  { name: "株式", assetType: "investment", sortOrder: 6 },
  { name: "投資信託", assetType: "investment", sortOrder: 7 },
  { name: "iDeCo", assetType: "investment", sortOrder: 8 },
  { name: "仮想通貨", assetType: "investment", sortOrder: 9 },
];

export async function seedIfEmpty() {
  const [{ value: catCount }] = await db
    .select({ value: count() })
    .from(categories);

  if (catCount > 0) return;

  for (const cat of EXPENSE_CATEGORIES) {
    await db.insert(categories).values({
      ...cat,
      type: "expense",
      isPreset: true,
    });
  }

  for (const cat of INCOME_CATEGORIES) {
    await db.insert(categories).values({
      ...cat,
      type: "income",
      isPreset: true,
    });
  }

  for (const asset of PRESET_ASSETS) {
    await db.insert(assets).values({
      ...asset,
      balance: 0,
      isPreset: true,
    });
  }
}

export { PRESET_ASSETS };
