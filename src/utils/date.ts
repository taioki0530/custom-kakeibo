import { getDaysInMonth, startOfMonth, endOfMonth, format } from "date-fns";
import { ja } from "date-fns/locale";

export function monthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export function daysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1, 1));
}

export function formatYearMonth(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), "yyyy年M月", { locale: ja });
}

export function prevMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function nextMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
