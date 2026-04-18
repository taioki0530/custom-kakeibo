import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";

export function useDashboard(year: number, month: number) {
  const { data, isLoading, refresh, setMonth, year: storeYear, month: storeMonth } =
    useDashboardStore();

  useEffect(() => {
    if (year !== storeYear || month !== storeMonth) {
      setMonth(year, month);
    } else if (!data) {
      refresh();
    }
  }, [year, month]);

  return { data, isLoading, refresh };
}
