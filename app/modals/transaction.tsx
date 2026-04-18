import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { getCategories } from "../../src/db/queries/categories";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getRecentTransactions,
} from "../../src/db/queries/transactions";
import { useDashboardStore } from "../../src/store/dashboardStore";
import TransactionForm from "../../src/components/transactions/TransactionForm";
import type { CategoryData, TransactionData, TransactionInput } from "../../src/types";
import { View, ActivityIndicator } from "react-native";

export default function TransactionModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const refresh = useDashboardStore((s) => s.refresh);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [recent, setRecent] = useState<TransactionData[]>([]);
  const [initial, setInitial] = useState<TransactionData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const [cats, recents] = await Promise.all([
        getCategories(),
        getRecentTransactions(20),
      ]);
      setCategories(cats as CategoryData[]);

      const mappedRecents: TransactionData[] = recents.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type as "income" | "expense",
        date: tx.date instanceof Date ? tx.date : new Date((tx.date as number) * 1000),
        categoryId: tx.categoryId ?? null,
        category: tx.category?.id
          ? {
              id: tx.category.id,
              name: tx.category.name,
              type: tx.type as "income" | "expense",
              color: tx.category.color ?? null,
              isPreset: tx.category.isPreset ?? false,
              sortOrder: tx.category.sortOrder ?? 0,
            }
          : null,
        memo: tx.memo ?? null,
      }));
      setRecent(mappedRecents);

      if (id) {
        const found = mappedRecents.find((tx) => tx.id === parseInt(id, 10));
        setInitial(found ?? null);
      }
      setReady(true);
    }
    load();
  }, [id]);

  async function handleSave(input: TransactionInput) {
    if (id && initial) {
      await updateTransaction(initial.id, input);
    } else {
      await createTransaction(input);
    }
    await refresh();
    router.back();
  }

  async function handleDelete() {
    if (!initial) return;
    await deleteTransaction(initial.id);
    await refresh();
    router.back();
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <TransactionForm
      categories={categories}
      recentTransactions={recent}
      initial={initial}
      onSave={handleSave}
      onDelete={id ? handleDelete : undefined}
      onCancel={() => router.back()}
    />
  );
}
