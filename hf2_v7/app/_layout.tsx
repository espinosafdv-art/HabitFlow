import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider, useAuth }  from "../src/context/AuthContext";
import { HabitsProvider }         from "../src/context/HabitsContext";
import { NotificationsProvider }  from "../src/context/NotificationsContext";
import { colors } from "../src/utils/theme";

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "login";
    if (!user && !inAuth)   router.replace("/login");
    if (user  &&  inAuth)   router.replace("/(tabs)/");
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

// ─── Root with providers ─────────────────────────────────────────────────────
function AppWithProviders() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  return (
    <NotificationsProvider>
      <HabitsProvider userId={user.uid}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)"  options={{ animation: "fade" }} />
          <Stack.Screen name="habit/new"   options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          <Stack.Screen name="habit/[id]"  options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          <Stack.Screen name="login"       options={{ animation: "fade" }} />
        </Stack>
      </HabitsProvider>
    </NotificationsProvider>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AuthGate>
          <AppWithProviders />
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
});
