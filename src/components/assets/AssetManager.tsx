import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../db/queries/assets";
import { PRESET_ASSETS } from "../../db/seed";
import { formatCurrency, ASSET_TYPE_LABELS } from "../../utils/format";
import type { AssetData, AssetType } from "../../types";
import { useDashboardStore } from "../../store/dashboardStore";

const ASSET_TYPES: AssetType[] = ["cash", "bank", "investment", "other"];

export default function AssetManager() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AssetType>("bank");
  const [newBalance, setNewBalance] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const refresh = useDashboardStore((s) => s.refresh);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const raw = await getAssets();
    setAssets(
      raw.map((a) => ({
        id: a.id,
        name: a.name,
        assetType: (a.assetType ?? "other") as AssetType,
        balance: a.balance,
        isPreset: a.isPreset ?? false,
        sortOrder: a.sortOrder ?? 0,
        updatedAt: a.updatedAt instanceof Date ? a.updatedAt : a.updatedAt ? new Date((a.updatedAt as number) * 1000) : null,
      }))
    );
  }

  async function handleSaveBalance(id: number) {
    const bal = parseInt(editBalance.replace(/,/g, ""), 10);
    if (isNaN(bal)) return;
    await updateAsset(id, { balance: bal, name: editName || undefined });
    setEditId(null);
    await load();
    await refresh();
  }

  async function handleDelete(asset: AssetData) {
    Alert.alert("削除確認", `「${asset.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deleteAsset(asset.id);
          await load();
          await refresh();
        },
      },
    ]);
  }

  async function handleCreate() {
    const bal = parseInt(newBalance.replace(/,/g, ""), 10) || 0;
    if (!newName.trim()) return;
    await createAsset({ name: newName.trim(), assetType: newType, balance: bal });
    setNewName("");
    setNewBalance("");
    setShowAdd(false);
    await load();
    await refresh();
  }

  async function handleAddPreset(name: string, assetType: string) {
    await createAsset({ name, assetType: assetType as AssetType, balance: 0, isPreset: true });
    await load();
    await refresh();
    setShowPresets(false);
  }

  const existingNames = new Set(assets.map((a) => a.name));
  const availablePresets = PRESET_ASSETS.filter((p) => !existingNames.has(p.name));

  // Group by type
  const groups = ASSET_TYPES.map((t) => ({
    type: t,
    label: ASSET_TYPE_LABELS[t],
    items: assets.filter((a) => a.assetType === t),
  })).filter((g) => g.items.length > 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-8 gap-4">
        {groups.map((group) => (
          <View key={group.type}>
            <Text className="text-xs font-semibold text-gray-400 mb-2 ml-1 uppercase">
              {group.label}
            </Text>
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {group.items.map((asset, i) => (
                <View key={asset.id}>
                  {i > 0 && <View className="h-px bg-gray-100 mx-4" />}
                  <View className="px-4 py-3">
                    {editId === asset.id ? (
                      <View className="gap-2">
                        <TextInput
                          value={editName}
                          onChangeText={setEditName}
                          className="bg-gray-50 rounded-xl px-3 py-2 text-sm"
                          placeholder="名前"
                        />
                        <TextInput
                          value={editBalance}
                          onChangeText={setEditBalance}
                          keyboardType="number-pad"
                          className="bg-gray-50 rounded-xl px-3 py-2 text-sm"
                          placeholder="残高（円）"
                        />
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => setEditId(null)}
                            className="flex-1 py-2 rounded-xl bg-gray-100 items-center"
                          >
                            <Text className="text-gray-600 text-sm">キャンセル</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleSaveBalance(asset.id)}
                            className="flex-1 py-2 rounded-xl bg-indigo-500 items-center"
                          >
                            <Text className="text-white text-sm font-semibold">保存</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <View className="flex-1">
                          <Text className="text-sm text-gray-800">{asset.name}</Text>
                          <Text className="text-base font-semibold text-gray-900 mt-0.5">
                            {formatCurrency(asset.balance)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setEditId(asset.id);
                            setEditBalance(String(asset.balance));
                            setEditName(asset.name);
                          }}
                          className="p-2 mr-1"
                        >
                          <Text className="text-gray-400 text-sm">編集</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(asset)} className="p-2">
                          <Text className="text-red-400 text-sm">削除</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Add from preset */}
        {availablePresets.length > 0 && (
          <View>
            <TouchableOpacity
              onPress={() => setShowPresets(!showPresets)}
              className="bg-white rounded-2xl shadow-sm px-4 py-3 flex-row items-center gap-2"
            >
              <Text className="text-blue-500 text-xl">☆</Text>
              <Text className="text-blue-500 font-medium text-sm">プリセットから追加</Text>
            </TouchableOpacity>
            {showPresets && (
              <View className="bg-white rounded-2xl shadow-sm mt-2 overflow-hidden">
                {availablePresets.map((preset, i) => (
                  <View key={preset.name}>
                    {i > 0 && <View className="h-px bg-gray-100 mx-4" />}
                    <TouchableOpacity
                      onPress={() => handleAddPreset(preset.name, preset.assetType)}
                      className="flex-row items-center px-4 py-3"
                    >
                      <Text className="flex-1 text-sm text-gray-700">{preset.name}</Text>
                      <Text className="text-xs text-gray-400">
                        {ASSET_TYPE_LABELS[preset.assetType as AssetType]}
                      </Text>
                      <Text className="text-indigo-400 ml-2">+</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Add custom */}
        {showAdd ? (
          <View className="bg-white rounded-2xl shadow-sm px-4 py-3 gap-3">
            <Text className="text-sm font-semibold text-gray-700">カスタム資産を追加</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="名前（例：メルペイ）"
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm"
              autoFocus
            />
            <TextInput
              value={newBalance}
              onChangeText={setNewBalance}
              keyboardType="number-pad"
              placeholder="現在残高（円）"
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {ASSET_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNewType(t)}
                    className={`px-3 py-1.5 rounded-full border ${newType === t ? "bg-indigo-500 border-indigo-500" : "border-gray-200"}`}
                  >
                    <Text className={`text-xs ${newType === t ? "text-white" : "text-gray-500"}`}>
                      {ASSET_TYPE_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
            onPress={() => setShowAdd(true)}
            className="bg-white rounded-2xl shadow-sm px-4 py-3 flex-row items-center gap-2"
          >
            <Text className="text-indigo-500 text-xl">+</Text>
            <Text className="text-indigo-500 font-medium text-sm">カスタム資産を追加</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
