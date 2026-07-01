import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { signInAnonymously } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../src/services/firebase";
import { HabitsProvider }        from "../src/context/HabitsContext";
import { NotificationsProvider } from "../src/context/NotificationsContext";
import { SensorsProvider }       from "../src/context/SensorsContext";
import { colors }                from "../src/utils/theme";

const USER_ID_KEY = "@habitflow/userId";

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        // Check cached userId first
        const cached = await AsyncStorage.getItem(USER_ID_KEY);
        if (cached) { setUserId(cached); return; }

        // Anonymous Firebase auth
        const cred = await signInAnonymously(auth);
        const uid  = cred.user.uid;
        await AsyncStorage.setItem(USER_ID_KEY, uid);
        setUserId(uid);
        console.log("[Auth] ✅ Signed in anonymously:", uid);
      } catch (e: any) {
        console.error("[Auth] Error:", e);
        // Offline fallback: use a stable local ID
        const fallback = `local-${Date.now()}`;
        await AsyncStorage.setItem(USER_ID_KEY, fallback).catch(() => {});
        setUserId(fallback);
      }
    }
    bootstrap();
  }, []);

  // Loading state
  if (!userId) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <Text style={styles.splashLogo}>💜</Text>
          <Text style={styles.splashTitle}>HabitFlow</Text>
          {error
            ? <Text style={styles.splashError}>{error}</Text>
            : <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          }
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NotificationsProvider>
        <HabitsProvider userId={userId}>
          <SensorsProvider>
            <Stack
              screenOptions={{
                headerShown:  false,
                contentStyle: { backgroundColor: colors.bg },
                animation:    "fade",
              }}
            />
          </SensorsProvider>
        </HabitsProvider>
      </NotificationsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash:       { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
  splashLogo:   { fontSize: 56, marginBottom: 8 },
  splashTitle:  { color: colors.white, fontSize: 28, fontWeight: "700" },
  splashError:  { color: colors.accent, fontSize: 13, marginTop: 16, textAlign: "center", paddingHorizontal: 24 },
});
