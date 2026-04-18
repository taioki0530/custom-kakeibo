import { View, Text } from "react-native";
import { formatCurrency } from "../../utils/format";
import type { DashboardData } from "../../types";

interface Props {
  summary: DashboardData["summary"];
}

export default function SummaryBar({ summary }: Props) {
  const { totalIncome, totalExpense, netBalance, totalAssets } = summary;
  const isPositive = netBalance >= 0;

  return (
    <View className="bg-white mx-4 mt-3 rounded-2xl shadow-sm overflow-hidden">
      <View className="flex-row">
        <StatCard
          label="収入"
          value={formatCurrency(totalIncome)}
          color="text-emerald-600"
          flex
        />
        <View className="w-px bg-gray-100" />
        <StatCard
          label="支出"
          value={formatCurrency(totalExpense)}
          color="text-red-500"
          flex
        />
      </View>
      <View className="h-px bg-gray-100" />
      <View className="flex-row">
        <StatCard
          label="収支"
          value={formatCurrency(Math.abs(netBalance))}
          prefix={isPositive ? "+" : "-"}
          color={isPositive ? "text-emerald-600" : "text-red-500"}
          flex
        />
        <View className="w-px bg-gray-100" />
        <StatCard
          label="総資産"
          value={formatCurrency(totalAssets)}
          color="text-blue-600"
          flex
        />
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  prefix = "",
  flex,
}: {
  label: string;
  value: string;
  color: string;
  prefix?: string;
  flex?: boolean;
}) {
  return (
    <View className={`py-4 px-3 items-center ${flex ? "flex-1" : ""}`}>
      <Text className="text-xs text-gray-400 mb-1">{label}</Text>
      <Text className={`text-base font-bold ${color}`} numberOfLines={1} adjustsFontSizeToFit>
        {prefix}{value}
      </Text>
    </View>
  );
}
