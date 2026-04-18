import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import MonthNav from "./MonthNav";
import SummaryBar from "./SummaryBar";
import AssetSummary from "./AssetSummary";
import CategoryBreakdown from "./CategoryBreakdown";
import DailyExpenseGrid from "./DailyExpenseGrid";
import TransactionList from "./TransactionList";
import type { DashboardData, TransactionData } from "../../types";

interface Props {
  year: number;
  month: number;
  data: DashboardData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function DashboardScreen({
  year,
  month,
  data,
  isLoading,
  onRefresh,
}: Props) {
  function openTransaction(tx?: TransactionData) {
    if (tx) {
      router.push({
        pathname: "/modals/transaction",
        params: { id: String(tx.id) },
      });
    } else {
      router.push("/modals/transaction");
    }
  }

  function openCategories() {
    router.push("/modals/categories");
  }

  function openAssets() {
    router.push("/modals/assets");
  }

  function openSettings() {
    router.push("/modals/categories");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <MonthNav year={year} month={month} onOpenSettings={openSettings} />

      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : data ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={onRefresh}
        >
          <SummaryBar summary={data.summary} />
          <AssetSummary assetGroups={data.assetGroups} onManage={openAssets} />
          <CategoryBreakdown breakdown={data.categoryBreakdown} onManage={openCategories} />
          <DailyExpenseGrid year={year} month={month} dailyTotals={data.dailyTotals} />
          <TransactionList transactions={data.transactions} onPress={openTransaction} />
        </ScrollView>
      ) : null}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => openTransaction()}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-indigo-500 items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
