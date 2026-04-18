import { View, Text, TouchableOpacity } from "react-native";
import { formatCurrency } from "../../utils/format";
import type { DashboardData } from "../../types";

interface Props {
  assetGroups: DashboardData["assetGroups"];
  onManage: () => void;
}

export default function AssetSummary({ assetGroups, onManage }: Props) {
  if (assetGroups.length === 0) return null;

  return (
    <View className="mx-4 mt-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-600">資産内訳</Text>
        <TouchableOpacity onPress={onManage}>
          <Text className="text-xs text-blue-500">管理</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {assetGroups.map((group, gi) => (
          <View key={group.type}>
            {gi > 0 && <View className="h-px bg-gray-100 mx-3" />}
            <View className="px-4 pt-3 pb-1">
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
    </View>
  );
}
