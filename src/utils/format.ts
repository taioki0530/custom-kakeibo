export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatSign(diff: number): string {
  if (diff > 0) return `+${formatCurrency(diff)}`;
  if (diff < 0) return formatCurrency(diff);
  return "±0";
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  cash: "現金",
  bank: "銀行・預金",
  investment: "投資・運用",
  other: "その他",
};
