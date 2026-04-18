import { useLocalSearchParams, router } from "expo-router";
import { useDashboard } from "../../src/hooks/useDashboard";
import DashboardScreen from "../../src/components/dashboard/DashboardScreen";

export default function MonthPage() {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const { data, isLoading, refresh } = useDashboard(y, m);

  return (
    <DashboardScreen
      year={y}
      month={m}
      data={data}
      isLoading={isLoading}
      onRefresh={refresh}
    />
  );
}
