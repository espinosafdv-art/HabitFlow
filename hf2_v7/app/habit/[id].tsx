import React, { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitForm } from "../../src/components/HabitForm";
import { StreakBadge } from "../../src/components/StreakBadge";
import { useHabits } from "../../src/context/HabitsContext";
import { colors, radii } from "../../src/utils/theme";
import type { HabitFormData } from "../../src/types";

export default function EditHabitScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { id }    = useLocalSearchParams<{ id: string }>();
  const { habits, streaks, todayLogs, updateHabit, deleteHabit } = useHabits();

  const habit  = habits.find((h) => h.id === id);
  const streak = id ? streaks[id]  : undefined;
  const log    = id ? todayLogs[id] : undefined;

  if (!habit) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const initialData: HabitFormData = {
    name:        habit.name,
    emoji:       habit.emoji,
    color:       habit.color,
    target:      habit.target,
    unit:        habit.unit,
    description: habit.description,
    sensorType:  habit.sensorType,
  };

  const handleSubmit = async (data: HabitFormData) => {
    await updateHabit(id, data);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      `Eliminar "${habit.name}"`,
      "¿Eliminar este hábito? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          await deleteHabit(id);
          router.back();
        }},
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.title}>✏️ Editar hábito</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats preview */}
        <View style={styles.statsBar}>
          {/* Today's progress */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {log?.completed ? "✅" : log ? `${Math.round(log.current)}/${habit.target}` : "—"}
            </Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statDivider} />
          {/* Current streak */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {streak?.currentStreak ?? 0} 🔥
            </Text>
            <Text style={styles.statLabel}>Racha actual</Text>
          </View>
          <View style={styles.statDivider} />
          {/* Longest streak */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {streak?.longestStreak ?? 0} 🏆
            </Text>
            <Text style={styles.statLabel}>Mejor racha</Text>
          </View>
        </View>

        {/* Form */}
        <HabitForm
          initialData={initialData}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />

        {/* Delete button */}
        <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑️ Eliminar este hábito</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.bg },
  header:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  handle:  { position: "absolute", top: 8, left: "50%", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginLeft: -20 },
  title:   { flex: 1, color: colors.white, fontSize: 18, fontWeight: "700", textAlign: "center" },
  closeBtn:  { padding: 8 },
  closeText: { color: colors.muted, fontSize: 20 },

  statsBar:    { flexDirection: "row", justifyContent: "space-around", backgroundColor: colors.card, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  statItem:    { alignItems: "center" },
  statValue:   { color: colors.white, fontSize: 18, fontWeight: "700" },
  statLabel:   { color: colors.muted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.cardBorder },

  deleteBtn:  {
    backgroundColor: "rgba(255,101,132,0.1)", borderRadius: radii.md, borderWidth: 1,
    borderColor: "rgba(255,101,132,0.3)", paddingVertical: 14, alignItems: "center",
  },
  deleteText: { color: "#FF6584", fontSize: 15, fontWeight: "600" },
});
