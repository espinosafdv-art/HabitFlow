import React from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "../../src/context/HabitsContext";
import { StreakBadge } from "../../src/components/StreakBadge";
import { colors, radii } from "../../src/utils/theme";

export default function StreaksScreen() {
  const insets  = useSafeAreaInsets();
  const { habits, streaks, isLoading } = useHabits();

  const sortedHabits = [...habits].sort((a, b) => {
    const sA = streaks[a.id]?.currentStreak ?? 0;
    const sB = streaks[b.id]?.currentStreak ?? 0;
    return sB - sA;
  });

  const bestStreak = Math.max(0, ...Object.values(streaks).map((s) => s.currentStreak));
  const bestLongest = Math.max(0, ...Object.values(streaks).map((s) => s.longestStreak));
  const totalCompletions = Object.values(streaks).reduce((acc, s) => acc + s.totalCompletions, 0);
  const activeStreaks = Object.values(streaks).filter((s) => s.currentStreak > 0).length;

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
        <Text style={styles.title}>🔥 Rachas</Text>
        <Text style={styles.subtitle}>Tu historial de constancia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Global stats */}
        <View style={styles.statsGrid}>
          {[
            { label: "Mejor racha activa", value: bestStreak, emoji: "🔥" },
            { label: "Racha más larga",    value: bestLongest, emoji: "🏆" },
            { label: "Rachas activas",      value: activeStreaks, emoji: "⚡" },
            { label: "Total completados",   value: totalCompletions, emoji: "✅" },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {habits.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔥</Text>
            <Text style={styles.emptyTitle}>Sin rachas todavía</Text>
            <Text style={styles.emptySub}>Completa hábitos diariamente para construir rachas</Text>
          </View>
        )}

        {/* Per-habit streaks */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text style={styles.sectionTitle}>Por hábito</Text>
          {sortedHabits.map((habit) => {
            const streak = streaks[habit.id];
            if (!streak) return null;
            return (
              <View key={habit.id} style={styles.habitStreakCard}>
                {/* Header row */}
                <View style={styles.habitRow}>
                  <View style={[styles.emojiWrap, { backgroundColor: `${habit.color}20` }]}>
                    <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitSub}>
                      {streak.totalCompletions} completado{streak.totalCompletions !== 1 ? "s" : ""} en total
                    </Text>
                  </View>
                </View>

                {/* Streak details */}
                <StreakBadge streak={streak} />

                {/* Motivational message */}
                <View style={[styles.motivationBanner, { backgroundColor: `${habit.color}10`, borderColor: `${habit.color}25` }]}>
                  <Text style={[styles.motivationText, { color: habit.color }]}>
                    {streak.currentStreak === 0
                      ? "💪 ¡Empieza hoy tu racha!"
                      : streak.currentStreak < 3
                      ? "🌱 ¡Buen comienzo! Sigue así"
                      : streak.currentStreak < 7
                      ? "🔥 ¡Vas muy bien! No pares"
                      : streak.currentStreak < 30
                      ? "⚡ ¡Increíble constancia!"
                      : "🏆 ¡Eres imparable!"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.bg },
  header:  { backgroundColor: colors.card, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, marginBottom: 16 },
  headerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "#F59E0B" },
  title:    { color: colors.white, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },

  statsGrid:  { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8, marginBottom: 24 },
  statCard:   {
    flex: 1, minWidth: "46%", backgroundColor: colors.card, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 16, alignItems: "center", gap: 4,
  },
  statValue: { color: colors.white, fontSize: 26, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 11, textAlign: "center" },

  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "700", marginBottom: 12 },

  habitStreakCard: {
    backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1,
    borderColor: colors.cardBorder, padding: 16, marginBottom: 16,
  },
  habitRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  emojiWrap: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  habitName: { color: colors.white, fontSize: 16, fontWeight: "700" },
  habitSub:  { color: colors.muted, fontSize: 12 },

  motivationBanner: { borderRadius: radii.md, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, marginTop: 4 },
  motivationText:   { fontSize: 13, fontWeight: "500", textAlign: "center" },

  empty:      { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySub:   { color: colors.muted, textAlign: "center" },
});
