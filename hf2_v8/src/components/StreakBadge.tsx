import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii } from "../utils/theme";
import type { StreakData } from "../types";

interface StreakBadgeProps {
  streak:  StreakData;
  compact?: boolean;
}

export function StreakBadge({ streak, compact = false }: StreakBadgeProps) {
  const { currentStreak, longestStreak, totalCompletions } = streak;
  const isHot = currentStreak >= 3;

  if (compact) {
    return (
      <View style={[styles.pill, isHot && styles.pillHot]}>
        <Text style={styles.pillText}>
          {currentStreak > 0 ? `🔥 ${currentStreak}` : "💤 0"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Current streak */}
      <View style={[styles.mainStat, isHot && styles.mainStatHot]}>
        <Text style={styles.fireEmoji}>{currentStreak >= 7 ? "🏆" : isHot ? "🔥" : "💤"}</Text>
        <Text style={[styles.streakNum, isHot && { color: "#F59E0B" }]}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>días seguidos</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Mejor racha</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    </View>
  );
}

/** Last 7 days completion dots for streak visualization */
interface WeekDotsProps {
  completedDates: string[];  // YYYY-MM-DD strings
  color:          string;
}

export function WeekDots({ completedDates, color }: WeekDotsProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <View style={dots.row}>
      {days.map((date) => {
        const done = completedDates.includes(date);
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <View
            key={date}
            style={[
              dots.dot,
              done         && { backgroundColor: color },
              isToday      && dots.dotToday,
              !done        && { backgroundColor: colors.border },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pill:    {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  pillHot:   { backgroundColor: "rgba(245, 158, 11, 0.2)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)" },
  pillText:  { color: colors.white, fontSize: 12, fontWeight: "600" },
  card:      { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 16, marginBottom: 12 },
  mainStat:  { alignItems: "center", paddingVertical: 8 },
  mainStatHot: { borderRadius: radii.md, backgroundColor: "rgba(245,158,11,0.08)", padding: 8 },
  fireEmoji: { fontSize: 32 },
  streakNum: { fontSize: 48, fontWeight: "800", color: colors.white, lineHeight: 54 },
  streakLabel: { color: colors.muted, fontSize: 13 },
  statsRow:  { flexDirection: "row", justifyContent: "space-around", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  statItem:  { alignItems: "center" },
  statValue: { color: colors.white, fontSize: 20, fontWeight: "700" },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.cardBorder },
});

const dots = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotToday: { borderWidth: 2, borderColor: colors.white },
});
