import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../db/queries/categories";
import type { CategoryData, TransactionType } from "../../types";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#64748b", "#94a3b8",
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [tab, setTab] = useState<TransactionType>("expense");
  const [editId, setEditId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showAdd, setShowAdd] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const cats = await getCategories();
    setCategories(cats as CategoryData[]);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createCategory({ name: newName.trim(), type: tab, color: newColor });
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setShowAdd(false);
    await load();
  }

  async function handleDelete(cat: CategoryData) {
    Alert.alert(
      "削除確認",
      `「${cat.name}」を削除しますか？\n取引のカテゴリ情報は残ります。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(cat.id);
            await load();
          },
        },
      ]
    );
  }

  async function handleUpdate(id: number, name: string) {
    await updateCategory(id, { name });
    setEditId(null);
    await load();
  }

  const filtered = categories.filter((c) => c.type === tab);

  function handleShowAdd() {
    setShowAdd(true);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-gray-50"
        keyboardShouldPersistTaps="handled"
      >
      <View className="px-4 pt-4 pb-8 gap-4">
        {/* Tab */}
        <View className="flex-row bg-white rounded-2xl p-1 shadow-sm">
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl items-center ${tab === t ? "bg-indigo-500" : ""}`}
            >
              <Text className={`font-medium text-sm ${tab === t ? "text-white" : "text-gray-400"}`}>
                {t === "expense" ? "支出" : "収入"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category list */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 && (
            <View className="p-6 items-center">
              <Text className="text-gray-400 text-sm">カテゴリがありません</Text>
            </View>
          )}
          {filtered.map((cat, i) => (
            <View key={cat.id}>
              {i > 0 && <View className="h-px bg-gray-100 mx-4" />}
              <View className="flex-row items-center px-4 py-3">
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: cat.color ?? "#94a3b8" }}
                />
                {editId === cat.id ? (
                  <EditRow
                    initial={cat.name}
                    onSave={(name) => handleUpdate(cat.id, name)}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <>
                    <Text className="flex-1 text-sm text-gray-800">{cat.name}</Text>
                    {cat.isPreset && (
                      <Text className="text-xs text-gray-300 mr-2">プリセット</Text>
                    )}
                    <TouchableOpacity onPress={() => setEditId(cat.id)} className="p-1 mr-1">
                      <Text className="text-gray-400 text-sm">編集</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(cat)} className="p-1">
                      <Text className="text-red-400 text-sm">削除</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add form */}
        {showAdd ? (
          <View className="bg-white rounded-2xl shadow-sm px-4 py-3 gap-3">
            <Text className="text-sm font-semibold text-gray-700">新しいカテゴリ</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="カテゴリ名"
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-800"
              placeholderTextColor="#d1d5db"
              autoFocus
            />
            <View className="flex-row flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewColor(c)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {newColor === c && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 items-center"
              >
                <Text className="text-gray-600 text-sm">キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 items-center"
              >
                <Text className="text-white text-sm font-semibold">追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleShowAdd}
            className="bg-white rounded-2xl shadow-sm px-4 py-3 flex-row items-center gap-2"
          >
            <Text className="text-indigo-500 text-xl">+</Text>
            <Text className="text-indigo-500 font-medium text-sm">
              {tab === "expense" ? "支出" : "収入"}カテゴリを追加
            </Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditRow({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial);
  return (
    <View className="flex-1 flex-row items-center gap-2">
      <TextInput
        value={name}
        onChangeText={setName}
        className="flex-1 bg-gray-50 rounded-lg px-2 py-1 text-sm"
        autoFocus
      />
      <TouchableOpacity onPress={() => onSave(name)}>
        <Text className="text-indigo-500 text-sm font-semibold">保存</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel}>
        <Text className="text-gray-400 text-sm">✕</Text>
      </TouchableOpacity>
    </View>
  );
}
