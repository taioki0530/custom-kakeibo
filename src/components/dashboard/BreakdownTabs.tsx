import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatCurrency, formatSign } from "../../utils/format";
import type { DashboardData, CategoryBreakdownItem } from "../../types";

type Tab = "asset" | "expense" | "income";

interface Props {
  assetGroups: DashboardData["assetGroups"];
  categoryBreakdown: DashboardData["categoryBreakdown"];
  onManageAssets: () => void;
  onManageCategories: () => void;
}

export default function BreakdownTabs({
  assetGroups,
  categoryBreakdown,
  onManageAssets,
  onManageCategories,
}: Props) {
  const [tab, setTab] = useState<Tab>("asset");

  const expenses = categoryBreakdown.filter((b) => b.category.type === "expense");
  const incomes = categoryBreakdown.filter((b) => b.category.type === "income");

  const tabs: { key: Tab; label: string }[] = [
    { key: "asset", label: "資産内訳" },
    { key: "expense", label: "支出内訳" },
    { key: "income", label: "収入内訳" },
  ];

  return (
    <View className="mx-4 mt-3">
      {/* Tab header */}
      <View className="flex-row bg-white rounded-2xl p-1 shadow-sm mb-3">
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl items-center ${tab === t.key ? "bg-indigo-500" : ""}`}
          >
            <Text
              className={`text-xs font-semibold ${tab === t.key ? "text-white" : "text-gray-400"}`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {tab === "asset" && (
        <AssetContent assetGroups={assetGroups} onManage={onManageAssets} />
      )}
      {tab === "expense" && (
        <CategoryContent
          items={expenses}
          barColor="bg-red-400"
          emptyLabel="今月の支出カテゴリはありません"
          onManage={onManageCategories}
        />
      )}
      {tab === "income" && (
        <CategoryContent
          items={incomes}
          barColor="bg-emerald-400"
          emptyLabel="今月の収入カテゴリはありません"
          onManage={onManageCategories}
        />
      )}
    </View>
  );
}

function AssetContent({
  assetGroups,
  onManage,
}: {
  assetGroups: DashboardData["assetGroups"];
  onManage: () => void;
}) {
  return (
    <View>
      <View className="flex-row justify-end mb-1">
        <TouchableOpacity onPress={onManage}>
          <Text className="text-xs text-blue-500">管理</Text>
        </TouchableOpacity>
      </View>
      {assetGroups.length === 0 ? (
        <View className="bg-white rounded-2xl shadow-sm p-6 items-center">
          <Text className="text-gray-400 text-sm">資産が登録されていません</Text>
        </View>
      ) : (
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {assetGroups.map((group, gi) => (
            <View key={group.type}>
              {gi > 0 && <View className="h-px bg-gray-100 mx-3" />}
              <View className="px-4 pt-3 pb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-semibold text-gray-400 uppercase">
                    {group.label}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-700">
                    {formatCurrency(group.subtotal)}
                  </Text>
                </View>
                {group.assets.map((asset) => (
                  <View
                    key={asset.id}
                    className="flex-row justify-between items-center py-1.5"
                  >
                    <Text className="text-sm text-gray-600">{asset.name}</Text>
                    <Text className="text-sm text-gray-800 font-medium">
                      {formatCurrency(asset.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CategoryContent({
  items,
  barColor,
  emptyLabel,
  onManage,
}: {
  items: CategoryBreakdownItem[];
  barColor: string;
  emptyLabel: string;
  onManage: () => void;
}) {
  return (
    <View>
      <View className="flex-row justify-end mb-1">
        <TouchableOpacity onPress={onManage}>
          <Text className="text-xs text-blue-500">管理</Text>
        </TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <View className="bg-white rounded-2xl shadow-sm p-6 items-center">
          <Text className="text-gray-400 text-sm">{emptyLabel}</Text>
        </View>
      ) : (
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <View className="px-4 pt-3 pb-1">
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
                        className={`text-xs ${
                          item.diff > 0
                            ? "text-red-400"
                            : item.diff < 0
                            ? "text-emerald-500"
                            : "text-gray-400"
                        }`}
                      >
                        {formatSign(item.diff)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className={`h-full rounded-full ${barColor}`}
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
      )}
    </View>
  );
}
