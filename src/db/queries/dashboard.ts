import { db } from "../client";
import { transactions, categories, assets } from "../schema";
import { eq, sql } from "drizzle-orm";
import { monthBounds, daysInMonth, prevMonth } from "../../utils/date";
import type {
  DashboardData,
  CategoryBreakdownItem,
  DailyTotal,
  AssetGroup,
  CategoryData,
  AssetType,
} from "../../types";

export async function getDashboardData(
  year: number,
  month: number
): Promise<DashboardData> {
  const { start, end } = monthBounds(year, month);
  const prev = prevMonth(year, month);
  const { start: prevStart, end: prevEnd } = monthBounds(prev.year, prev.month);

  const startTs = Math.floor(start.getTime() / 1000);
  const endTs = Math.floor(end.getTime() / 1000);
  const prevStartTs = Math.floor(prevStart.getTime() / 1000);
  const prevEndTs = Math.floor(prevEnd.getTime() / 1000);

  // Fetch current month transactions with category
  const txRows = await db
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
    .where(
      sql`${transactions.date} >= ${startTs} AND ${transactions.date} < ${endTs}`
    );

  // Fetch prev month transactions
  const prevTxRows = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
    })
    .from(transactions)
    .where(
      sql`${transactions.date} >= ${prevStartTs} AND ${transactions.date} < ${prevEndTs}`
    );

  // Summary
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of txRows) {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }

  // Category breakdown
  const catMap = new Map<number, { cat: CategoryData; amount: number }>();
  for (const tx of txRows) {
    if (!tx.category || !tx.categoryId) continue;
    const existing = catMap.get(tx.categoryId);
    const cat: CategoryData = {
      id: tx.category.id!,
      name: tx.category.name!,
      type: tx.type as "income" | "expense",
      color: tx.category.color ?? null,
      isPreset: tx.category.isPreset ?? false,
      sortOrder: tx.category.sortOrder ?? 0,
    };
    if (existing) {
      existing.amount += tx.amount;
    } else {
      catMap.set(tx.categoryId, { cat, amount: tx.amount });
    }
  }

  const prevCatMap = new Map<number, number>();
  for (const tx of prevTxRows) {
    if (!tx.categoryId) continue;
    prevCatMap.set(tx.categoryId, (prevCatMap.get(tx.categoryId) ?? 0) + tx.amount);
  }

  const categoryBreakdown: CategoryBreakdownItem[] = [];
  for (const [catId, { cat, amount }] of catMap) {
    const base = cat.type === "expense" ? totalExpense : totalIncome;
    const percentage = base > 0 ? Math.round((amount / base) * 100) : 0;
    const prevAmount = prevCatMap.get(catId) ?? 0;
    categoryBreakdown.push({
      category: cat,
      amount,
      percentage,
      prevMonthAmount: prevAmount,
      diff: amount - prevAmount,
    });
  }
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  // Daily totals (expense only)
  const dayMap = new Map<number, number>();
  for (const tx of txRows) {
    if (tx.type !== "expense") continue;
    const d = tx.date instanceof Date ? tx.date : new Date((tx.date as number) * 1000);
    const day = d.getDate();
    dayMap.set(day, (dayMap.get(day) ?? 0) + tx.amount);
  }
  const numDays = daysInMonth(year, month);
  const dailyTotals: DailyTotal[] = Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    total: dayMap.get(i + 1) ?? 0,
  }));

  // Assets
  const allAssets = await db.select().from(assets).orderBy(assets.sortOrder, assets.id);
  const totalAssets = allAssets.reduce((sum, a) => sum + a.balance, 0);

  const assetTypeOrder: AssetType[] = ["cash", "bank", "investment", "other"];
  const assetGroupMap = new Map<AssetType, AssetGroup>();
  for (const type of assetTypeOrder) {
    assetGroupMap.set(type, { type, label: "", assets: [], subtotal: 0 });
  }
  const labels: Record<string, string> = {
    cash: "現金",
    bank: "銀行・預金",
    investment: "投資・運用",
    other: "その他",
  };
  for (const a of allAssets) {
    const t = (a.assetType as AssetType) ?? "other";
    const group = assetGroupMap.get(t)!;
    group.label = labels[t] ?? t;
    group.assets.push({
      id: a.id,
      name: a.name,
      assetType: t,
      balance: a.balance,
      isPreset: a.isPreset ?? false,
      sortOrder: a.sortOrder ?? 0,
      updatedAt: a.updatedAt instanceof Date ? a.updatedAt : a.updatedAt ? new Date((a.updatedAt as number) * 1000) : null,
    });
    group.subtotal += a.balance;
  }
  const assetGroups = assetTypeOrder
    .map((t) => assetGroupMap.get(t)!)
    .filter((g) => g.assets.length > 0);

  // Transactions (sorted by date desc)
  const sortedTx = [...txRows].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : (a.date as number) * 1000;
    const dateB = b.date instanceof Date ? b.date.getTime() : (b.date as number) * 1000;
    return dateB - dateA || b.id - a.id;
  });

  const transactionData = sortedTx.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type as "income" | "expense",
    date: tx.date instanceof Date ? tx.date : new Date((tx.date as number) * 1000),
    categoryId: tx.categoryId ?? null,
    category: tx.category?.id
      ? {
          id: tx.category.id,
          name: tx.category.name,
          type: tx.type as "income" | "expense",
          color: tx.category.color ?? null,
          isPreset: tx.category.isPreset ?? false,
          sortOrder: tx.category.sortOrder ?? 0,
        }
      : null,
    memo: tx.memo ?? null,
  }));

  return {
    month: { year, month },
    summary: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, totalAssets },
    categoryBreakdown,
    dailyTotals,
    transactions: transactionData,
    assetGroups,
  };
}
