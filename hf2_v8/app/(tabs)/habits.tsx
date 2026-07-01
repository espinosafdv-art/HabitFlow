import React from "react";
import {
  View, Text, ScrollView, Pressable, Alert, StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "../../src/context/HabitsContext";
import { StreakBadge } from "../../src/components/StreakBadge";
import { colors, radii, shadows } from "../../src/utils/theme";
import type { Habit } from "../../src/types";

export default function HabitsScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { habits, todayLogs, streaks, isLoading, deleteHabit } = useHabits();

  const handleDelete = (habit: Habit) => {
    Alert.alert(
      `Eliminar "${habit.name}"`,
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerAccent} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>📋 Mis Hábitos</Text>
          <Pressable onPress={() => router.push("/habit/new")} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Agregar</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {habits.length === 0 ? "Sin hábitos" : `${habits.length} hábito${habits.length > 1 ? "s" : ""} activo${habits.length > 1 ? "s" : ""}`}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {habits.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Sin hábitos todavía</Text>
            <Text style={styles.emptySub}>Crea hábitos para comenzar tu racha</Text>
            <Pressable onPress={() => router.push("/habit/new")} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Crear primer hábito</Text>
            </Pressable>
          </View>
        )}

        {habits.map((habit) => {
          const log    = todayLogs[habit.id];
          const streak = streaks[habit.id];

          return (
            <View key={habit.id} style={[styles.card, { borderLeftColor: habit.color, borderLeftWidth: 4 }]}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={[styles.emojiWrap, { backgroundColor: `${habit.color}20` }]}>
                  <Text style={{ fontSize: 24 }}>{habit.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitSub}>
                    Meta: {habit.target} {habit.unit} · {SENSOR_LABEL[habit.sensorType] ?? habit.sensorType}
                  </Text>
                </View>
                {streak && <StreakBadge streak={streak} compact />}
              </View>

              {/* Today status */}
              <View style={styles.todayRow}>
                <View style={[styles.todayBadge, log?.completed ? styles.todayDone : styles.todayPending]}>
                  <Text style={styles.todayBadgeText}>
                    {log?.completed ? "✅ Completado hoy" : log ? `⏳ ${Math.round(log.current)}/${habit.target} ${habit.unit}` : "⭕ Sin progreso"}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {habit.description ? (
                <Text style={styles.description} numberOfLines={2}>{habit.description}</Text>
              ) : null}

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(habit)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const SENSOR_LABEL: Record<string, string> = {
  manual:        "👆 Manual",
  camera:        "📸 Cámara",
  accelerometer: "⚡ Acelerómetro",
  gyroscope:     "🧠 Giroscopio",
  location:      "📍 GPS",
};

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.bg },
  header:  { backgroundColor: colors.card, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  headerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title:    { color: colors.white, fontSize: 22, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 13 },
  addBtn:   { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, ...shadows.glow(colors.primary) },
  addBtnText: { color: colors.white, fontWeight: "600", fontSize: 13 },

  card:    { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 14, ...shadows.card },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  emojiWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  habitName: { color: colors.white, fontSize: 17, fontWeight: "700" },
  habitSub:  { color: colors.muted, fontSize: 12, marginTop: 2 },

  todayRow:    { marginBottom: 8 },
  todayBadge:  { alignSelf: "flex-start", borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  todayDone:   { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)" },
  todayPending:{ backgroundColor: "rgba(108,99,255,0.08)", borderColor: "rgba(108,99,255,0.25)" },
  todayBadgeText: { color: colors.white, fontSize: 12, fontWeight: "500" },
  description: { color: colors.muted, fontSize: 13, marginBottom: 10 },

  actions:      { flexDirection: "row", gap: 8, marginTop: 4 },
  editBtn:      { flex: 1, backgroundColor: "rgba(108,99,255,0.12)", borderRadius: radii.md, paddingVertical: 9, alignItems: "center", borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" },
  editBtnText:  { color: colors.primary, fontSize: 13, fontWeight: "500" },
  deleteBtn:    { backgroundColor: "rgba(255,101,132,0.1)", borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: "rgba(255,101,132,0.3)" },
  deleteBtnText:{ fontSize: 16 },

  empty:       { alignItems: "center", paddingVertical: 60 },
  emptyEmoji:  { fontSize: 56, marginBottom: 16 },
  emptyTitle:  { color: colors.white, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySub:    { color: colors.muted, textAlign: "center", marginBottom: 24 },
  emptyBtn:    { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full },
  emptyBtnText:{ color: colors.white, fontWeight: "600" },
});
