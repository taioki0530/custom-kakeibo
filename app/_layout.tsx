import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "../src/db/client";
import migrations from "../src/db/migrations/migrations";
import { seedIfEmpty } from "../src/db/seed";
import { View, Text } from "react-native";

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
      seedIfEmpty();
    }
  }, [success]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">DBエラー: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[year]/[month]" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/transaction"
          options={{
            presentation: "modal",
            title: "取引を記録",
            headerStyle: { backgroundColor: "#f8f9fa" },
          }}
        />
        <Stack.Screen
          name="modals/categories"
          options={{
            presentation: "modal",
            title: "カテゴリ管理",
            headerStyle: { backgroundColor: "#f8f9fa" },
          }}
        />
        <Stack.Screen
          name="modals/assets"
          options={{
            presentation: "modal",
            title: "資産管理",
            headerStyle: { backgroundColor: "#f8f9fa" },
          }}
        />
      </Stack>
    </>
  );
}
