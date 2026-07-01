import React, { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, Alert, ScrollView, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth }   from "../../src/context/AuthContext";
import { useHabits } from "../../src/context/HabitsContext";
import { colors, radii, shadows } from "../../src/utils/theme";

export default function ProfileScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { profile, signOut } = useAuth();
  const { habits, streaks }  = useHabits();

  const totalHabits       = habits.length;
  const totalCompletions  = Object.values(streaks).reduce((a, s) => a + s.totalCompletions, 0);
  const activeDays        = new Set(
    Object.values(streaks)
      .filter((s) => s.lastCompletedDate)
      .map((s) => s.lastCompletedDate)
  ).size;
  const bestStreak        = Math.max(0, ...Object.values(streaks).map((s) => s.longestStreak));

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => {
        await signOut();
        router.replace("/login");
      }},
    ]);
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerAccent} />
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.isAnonymous ? "👤" : (profile?.displayName?.[0] ?? profile?.email?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>
              {profile?.isAnonymous ? "Invitado" : (profile?.displayName ?? "Usuario")}
            </Text>
            <Text style={styles.email}>
              {profile?.isAnonymous ? "Cuenta temporal" : profile?.email}
            </Text>
            {profile?.isAnonymous && (
              <Text style={styles.guestNotice}>⚠️ Los datos se pierden al cerrar sesión</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mis estadísticas</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Hábitos",      value: totalHabits,      emoji: "📋" },
              { label: "Completados",  value: totalCompletions, emoji: "✅" },
              { label: "Días activo",  value: activeDays,       emoji: "📅" },
              { label: "Mejor racha",  value: bestStreak,       emoji: "🏆" },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Acciones rápidas</Text>
          <View style={styles.menuCard}>
            {[
              { icon: "➕", label: "Agregar hábito", onPress: () => router.push("/habit/new") },
              { icon: "📋", label: "Ver mis hábitos", onPress: () => router.push("/(tabs)/habits") },
              { icon: "🔥", label: "Ver mis rachas",  onPress: () => router.push("/(tabs)/streaks") },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <Pressable
                  onPress={item.onPress}
                  style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </Pressable>
                {i < arr.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 32 }}>
          <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>🚪 Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, marginBottom: 16 },
  headerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: `${colors.primary}30`, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.primary,
  },
  avatarText:   { color: colors.white, fontSize: 26, fontWeight: "800" },
  name:         { color: colors.white, fontSize: 20, fontWeight: "700" },
  email:        { color: colors.muted, fontSize: 13, marginTop: 2 },
  guestNotice:  { color: "#F59E0B", fontSize: 11, marginTop: 4 },

  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard:  {
    flex: 1, minWidth: "46%", backgroundColor: colors.card, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 14, alignItems: "center",
  },
  statValue: { color: colors.white, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 11 },

  menuCard:    { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden" },
  menuItem:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon:    { fontSize: 20 },
  menuLabel:   { color: colors.white, fontSize: 15, flex: 1 },
  menuArrow:   { color: colors.muted, fontSize: 18 },
  menuDivider: { height: 1, backgroundColor: colors.cardBorder, marginHorizontal: 16 },

  signOutBtn:  {
    backgroundColor: "rgba(255,101,132,0.1)", borderRadius: radii.md, borderWidth: 1,
    borderColor: "rgba(255,101,132,0.3)", paddingVertical: 14, alignItems: "center",
  },
  signOutText: { color: "#FF6584", fontSize: 15, fontWeight: "600" },
});
