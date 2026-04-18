import { View, Text, TouchableOpacity } from "react-native";
import { formatCurrency, formatSign } from "../../utils/format";
import type { CategoryBreakdownItem } from "../../types";

interface Props {
  breakdown: CategoryBreakdownItem[];
  onManage: () => void;
}

export default function CategoryBreakdown({ breakdown, onManage }: Props) {
  const expenses = breakdown.filter((b) => b.category.type === "expense");
  const incomes = breakdown.filter((b) => b.category.type === "income");

  if (breakdown.length === 0) return null;

  return (
    <View className="mx-4 mt-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-600">カテゴリ別内訳</Text>
        <TouchableOpacity onPress={onManage}>
          <Text className="text-xs text-blue-500">管理</Text>
        </TouchableOpacity>
      </View>

      {expenses.length > 0 && (
        <Section title="支出" items={expenses} color="bg-red-400" />
      )}
      {incomes.length > 0 && (
        <View className="mt-2">
          <Section title="収入" items={incomes} color="bg-emerald-400" />
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: CategoryBreakdownItem[];
  color: string;
}) {
  return (
    <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <View className="px-4 pt-3 pb-1">
        <Text className="text-xs font-semibold text-gray-400 mb-2">{title}</Text>
        {items.map((item, i) => (
          <View key={item.category.id}>
            {i > 0 && <View className="h-px bg-gray-50 my-1" />}
            <View className="py-1">
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center gap-2 flex-1">
                  <View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.category.color ?? "#94a3b8" }}
                  />
                  <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>
                    {item.category.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-semibold text-gray-800">
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text
                    className={`text-xs ${item.diff > 0 ? "text-red-400" : item.diff < 0 ? "text-emerald-500" : "text-gray-400"}`}
                  >
                    {formatSign(item.diff)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-400 w-8 text-right">
                  {item.percentage}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
