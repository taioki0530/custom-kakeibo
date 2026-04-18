import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { CategoryData, TransactionData, TransactionInput, TransactionType } from "../../types";
import { formatCurrency } from "../../utils/format";
import { today } from "../../utils/date";

interface Props {
  categories: CategoryData[];
  recentTransactions: TransactionData[];
  initial?: TransactionData | null;
  onSave: (input: TransactionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({
  categories,
  recentTransactions,
  initial,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : today());
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [showMemoSuggestions, setShowMemoSuggestions] = useState(false);

  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!initial) {
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  const memoSuggestions = memo.length > 0
    ? recentTransactions
        .filter(
          (tx) =>
            tx.memo &&
            tx.memo.toLowerCase().includes(memo.toLowerCase()) &&
            tx.memo !== memo
        )
        .slice(0, 5)
    : [];

  const recentSuggestions = recentTransactions
    .filter((tx) => tx.type === type)
    .slice(0, 5);

  async function handleSave() {
    const parsed = parseInt(amount.replace(/,/g, ""), 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("入力エラー", "金額を正しく入力してください");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        amount: parsed,
        type,
        date,
        categoryId,
        memo: memo.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert("削除確認", "この取引を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          setIsSaving(true);
          try {
            await onDelete?.();
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  }

  function applySuggestion(tx: TransactionData) {
    setAmount(String(tx.amount));
    setType(tx.type);
    setCategoryId(tx.categoryId ?? null);
    setMemo(tx.memo ?? "");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-4 pb-8 gap-3">
          {/* Type toggle */}
          <View className="flex-row bg-white rounded-2xl p-1 shadow-sm">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setType(t);
                  setCategoryId(null);
                }}
                className={`flex-1 py-2.5 rounded-xl items-center ${type === t ? (t === "expense" ? "bg-red-500" : "bg-emerald-500") : ""}`}
              >
                <Text
                  className={`font-semibold ${type === t ? "text-white" : "text-gray-400"}`}
                >
                  {t === "expense" ? "支出" : "収入"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Text className="text-xs text-gray-400 mb-1">金額 *</Text>
            <TextInput
              ref={amountRef}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="number-pad"
              className="text-3xl font-bold text-gray-900"
              placeholderTextColor="#d1d5db"
            />
          </View>

          {/* Date */}
          <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Text className="text-xs text-gray-400 mb-1">日付</Text>
            <Text className="text-base text-gray-800">
              {format(date, "yyyy年M月d日(E)", { locale: ja })}
            </Text>
            {/* Date adjustment buttons */}
            <View className="flex-row gap-2 mt-2">
              {[-1, 0, 1].map((offset) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const label =
                  offset === -1 ? "昨日" : offset === 0 ? "今日" : "明日";
                const isSelected =
                  format(date, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
                return (
                  <TouchableOpacity
                    key={offset}
                    onPress={() => setDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()))}
                    className={`px-3 py-1 rounded-full border ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-200"}`}
                  >
                    <Text
                      className={`text-xs ${isSelected ? "text-white" : "text-gray-500"}`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Text className="text-xs text-gray-400 mb-2">カテゴリ（任意）</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setCategoryId(null)}
                  className={`px-3 py-1.5 rounded-full border ${categoryId === null ? "bg-gray-700 border-gray-700" : "border-gray-200"}`}
                >
                  <Text
                    className={`text-xs ${categoryId === null ? "text-white" : "text-gray-500"}`}
                  >
                    なし
                  </Text>
                </TouchableOpacity>
                {filteredCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1 ${categoryId === cat.id ? "border-transparent" : "border-gray-200"}`}
                    style={
                      categoryId === cat.id
                        ? { backgroundColor: cat.color ?? "#6366f1" }
                        : {}
                    }
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color ?? "#94a3b8" }}
                    />
                    <Text
                      className={`text-xs ${categoryId === cat.id ? "text-white" : "text-gray-600"}`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Memo */}
          <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Text className="text-xs text-gray-400 mb-1">メモ（任意）</Text>
            <TextInput
              value={memo}
              onChangeText={(v) => {
                setMemo(v);
                setShowMemoSuggestions(true);
              }}
              onFocus={() => setShowMemoSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMemoSuggestions(false), 200)}
              placeholder="メモを入力"
              className="text-sm text-gray-800"
              placeholderTextColor="#d1d5db"
            />
            {showMemoSuggestions && memoSuggestions.length > 0 && (
              <View className="mt-2 border-t border-gray-100 pt-2">
                {memoSuggestions.map((tx) => (
                  <TouchableOpacity
                    key={tx.id}
                    onPress={() => {
                      setMemo(tx.memo ?? "");
                      setCategoryId(tx.categoryId ?? null);
                      setShowMemoSuggestions(false);
                    }}
                    className="py-1"
                  >
                    <Text className="text-sm text-gray-600">{tx.memo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Recent suggestions */}
          {!initial && recentSuggestions.length > 0 && (
            <View>
              <Text className="text-xs text-gray-400 mb-2 ml-1">最近の取引から入力</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {recentSuggestions.map((tx) => (
                    <TouchableOpacity
                      key={tx.id}
                      onPress={() => applySuggestion(tx)}
                      className="bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100 min-w-20"
                    >
                      <Text className="text-xs text-gray-400" numberOfLines={1}>
                        {tx.category?.name ?? "なし"}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-800 mt-0.5">
                        {formatCurrency(tx.amount)}
                      </Text>
                      {tx.memo ? (
                        <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                          {tx.memo}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3 mt-2">
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 py-3 rounded-2xl border border-red-200 items-center"
                disabled={isSaving}
              >
                <Text className="text-red-500 font-semibold">削除</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 rounded-2xl bg-gray-100 items-center"
              disabled={isSaving}
            >
              <Text className="text-gray-600 font-semibold">キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className={`flex-2 py-3 rounded-2xl items-center ${type === "expense" ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ flex: 2 }}
              disabled={isSaving}
            >
              <Text className="text-white font-semibold">
                {isSaving ? "保存中..." : "保存"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
