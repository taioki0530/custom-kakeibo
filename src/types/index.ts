export type TransactionType = "income" | "expense";
export type AssetType = "cash" | "bank" | "investment" | "other";

export interface CategoryData {
  id: number;
  name: string;
  type: TransactionType;
  color: string | null;
  isPreset: boolean;
  sortOrder: number;
}

export interface AssetData {
  id: number;
  name: string;
  assetType: AssetType;
  balance: number;
  isPreset: boolean;
  sortOrder: number;
  updatedAt: Date | null;
}

export interface TransactionData {
  id: number;
  amount: number;
  type: TransactionType;
  date: Date;
  categoryId: number | null;
  category: CategoryData | null;
  memo: string | null;
}

export interface CategoryBreakdownItem {
  category: CategoryData;
  amount: number;
  percentage: number;
  prevMonthAmount: number;
  diff: number;
}

export interface DailyTotal {
  day: number;
  total: number;
}

export interface AssetGroup {
  type: AssetType;
  label: string;
  assets: AssetData[];
  subtotal: number;
}

export interface DashboardData {
  month: { year: number; month: number };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    totalAssets: number;
  };
  categoryBreakdown: CategoryBreakdownItem[];
  dailyTotals: DailyTotal[];
  transactions: TransactionData[];
  assetGroups: AssetGroup[];
}

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  date: Date;
  categoryId?: number | null;
  memo?: string;
}
