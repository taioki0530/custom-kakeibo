import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatCurrency } from "../../utils/format";
import type { TransactionData } from "../../types";

interface Props {
  transactions: TransactionData[];
  onPress: (tx: TransactionData) => void;
}

export default function TransactionList({ transactions, onPress }: Props) {
  if (transactions.length === 0) {
    return (
      <View className="mx-4 mt-3 mb-24">
        <Text className="text-sm font-semibold text-gray-600 mb-2">取引一覧</Text>
        <View className="bg-white rounded-2xl shadow-sm p-8 items-center">
          <Text className="text-gray-400 text-sm">取引がありません</Text>
          <Text className="text-gray-300 text-xs mt-1">＋ボタンで記録できます</Text>
        </View>
      </View>
    );
  }

  // Group by date
  const groups: Array<{ dateKey: string; label: string; items: TransactionData[] }> = [];
  const dateMap = new Map<string, TransactionData[]>();

  for (const tx of transactions) {
    const d = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const key = format(d, "yyyy-MM-dd");
    if (!dateMap.has(key)) dateMap.set(key, []);
    dateMap.get(key)!.push(tx);
  }

  for (const [key, items] of dateMap) {
    const d = new Date(key);
    groups.push({
      dateKey: key,
      label: format(d, "M月d日(E)", { locale: ja }),
      items,
    });
  }
  groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  return (
    <View className="mx-4 mt-3 mb-24">
      <Text className="text-sm font-semibold text-gray-600 mb-2">取引一覧</Text>
      {groups.map((group) => (
        <View key={group.dateKey} className="mb-2">
          <Text className="text-xs text-gray-400 mb-1 ml-1">{group.label}</Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {group.items.map((tx, i) => (
              <View key={tx.id}>
                {i > 0 && <View className="h-px bg-gray-100 mx-4" />}
                <TouchableOpacity
                  onPress={() => onPress(tx)}
                  className="flex-row items-center px-4 py-3"
                  activeOpacity={0.7}
                >
                  {/* Category color dot */}
                  <View
                    className="w-3 h-3 rounded-full mr-3"
                    style={{
                      backgroundColor: tx.category?.color ?? "#94a3b8",
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-800" numberOfLines={1}>
                      {tx.category?.name ?? "カテゴリなし"}
                    </Text>
                    {tx.memo ? (
                      <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                        {tx.memo}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    className={`text-sm font-semibold ml-3 ${tx.type === "income" ? "text-emerald-600" : "text-gray-800"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
