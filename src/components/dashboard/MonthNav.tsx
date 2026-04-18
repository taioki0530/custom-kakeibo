import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { router } from "expo-router";
import { prevMonth, nextMonth, formatYearMonth } from "../../utils/date";

interface Props {
  year: number;
  month: number;
  onOpenSettings: () => void;
}

export default function MonthNav({ year, month, onOpenSettings }: Props) {
  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <TouchableOpacity
        onPress={() => router.replace(`/${prev.year}/${prev.month}`)}
        className="p-2"
      >
        <Text className="text-2xl text-gray-500">‹</Text>
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-gray-800">
        {formatYearMonth(year, month)}
      </Text>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.replace(`/${next.year}/${next.month}`)}
          className="p-2"
        >
          <Text className="text-2xl text-gray-500">›</Text>
        </TouchableOpacity>
        <Pressable onPress={onOpenSettings} className="p-2">
          <Text className="text-xl">⚙️</Text>
        </Pressable>
      </View>
    </View>
  );
}
