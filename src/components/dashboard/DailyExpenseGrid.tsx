import { View, Text } from "react-native";
import { formatCurrency } from "../../utils/format";
import type { DailyTotal } from "../../types";
import { daysInMonth } from "../../utils/date";

interface Props {
  year: number;
  month: number;
  dailyTotals: DailyTotal[];
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default function DailyExpenseGrid({ year, month, dailyTotals }: Props) {
  const numDays = daysInMonth(year, month);
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  const maxAmount = Math.max(...dailyTotals.map((d) => d.total), 1);

  // Build grid cells: leading blanks + day cells
  const cells: Array<{ day: number | null; total: number }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, total: 0 });
  for (let d = 1; d <= numDays; d++) {
    cells.push({ day: d, total: dailyTotals[d - 1]?.total ?? 0 });
  }

  return (
    <View className="mx-4 mt-3">
      <Text className="text-sm font-semibold text-gray-600 mb-2">日別支出</Text>
      <View className="bg-white rounded-2xl shadow-sm p-3">
        {/* Header */}
        <View className="flex-row mb-1">
          {DOW.map((d, i) => (
            <Text
              key={d}
              className={`flex-1 text-center text-xs font-medium ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Grid */}
        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
          <View key={row} className="flex-row mb-0.5">
            {cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
              const absCol = row * 7 + col;
              if (!cell.day) return <View key={absCol} className="flex-1 h-12" />;

              const isToday = isCurrentMonth && cell.day === todayDate;
              const hasAmount = cell.total > 0;
              const intensity = hasAmount ? Math.min(cell.total / maxAmount, 1) : 0;
              const bgOpacity = Math.round(intensity * 80 + 10);

              return (
                <View key={absCol} className="flex-1 h-12 p-0.5">
                  <View
                    className={`flex-1 rounded-lg items-center justify-center ${isToday ? "border border-blue-400" : ""}`}
                    style={{
                      backgroundColor: hasAmount
                        ? `rgba(239,68,68,${intensity * 0.6 + 0.05})`
                        : "#f8fafc",
                    }}
                  >
                    <Text
                      className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-600"}`}
                    >
                      {cell.day}
                    </Text>
                    {hasAmount && (
                      <Text className="text-[9px] text-red-600 font-medium" numberOfLines={1}>
                        {cell.total >= 10000
                          ? `${Math.round(cell.total / 1000)}k`
                          : cell.total.toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
            {/* Fill remaining cells in last row */}
            {cells.slice(row * 7, row * 7 + 7).length < 7 &&
              Array.from({ length: 7 - cells.slice(row * 7, row * 7 + 7).length }, (_, i) => (
                <View key={`empty-${i}`} className="flex-1 h-12" />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}
