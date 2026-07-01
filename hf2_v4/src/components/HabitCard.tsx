import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProgressBar }    from "./ProgressBar";
import { SuccessOverlay } from "./SuccessOverlay";
import { calcProgress }   from "../utils/sensorMath";
import { formatNumber }   from "../utils/dateUtils";
import { colors, radii, shadows, typography } from "../utils/theme";

export interface HabitCardProps {
  id:       string;
  title:    string;
  emoji:    string;
  color:    string;
  current:  number;
  target:   number;
  unit:     string;
  subtitle: string;
  completed: boolean;
  disabled?: boolean;
  sensorLabel?: string;
}

export function HabitCard({
  title, emoji, color, current, target, unit, subtitle, completed, disabled, sensorLabel,
}: HabitCardProps) {
  const progress = calcProgress(current, target);
  const pct      = Math.round(progress * 100);

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      {/* Success overlay */}
      <SuccessOverlay completed={completed} />

      {/* Header row */}
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.pctBox}>
          <Text style={[styles.pct, { color: completed ? colors.success : color }]}>
            {pct}%
          </Text>
        </View>
      </View>

      {/* Value row */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: completed ? colors.success : colors.white }]}>
          {formatNumber(current)}
        </Text>
        <Text style={styles.target}> / {formatNumber(target)} {unit}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barWrap}>
        <ProgressBar progress={progress} color={color} height={7} />
      </View>

      {/* Sensor label */}
      {sensorLabel && (
        <Text style={styles.sensorLabel}>{sensorLabel}</Text>
      )}

      {/* Completed badge */}
      {completed && (
        <View style={[styles.badge, { borderColor: colors.success }]}>
          <Text style={[styles.badgeText, { color: colors.success }]}>✓ Meta alcanzada</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius:    radii.lg,
    borderWidth:     1,
    borderColor:     colors.cardBorder,
    padding:         18,
    marginHorizontal: 16,
    marginBottom:    12,
    overflow:        "hidden",
    ...shadows.card,
  },
  disabled: { opacity: 0.5 },
  row:  { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  icon: { width: 46, height: 46, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 22 },
  info:  { flex: 1, marginLeft: 12 },
  title: { color: colors.white, fontSize: 15, fontWeight: "600" },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  pctBox: { alignItems: "flex-end" },
  pct:  { fontSize: 22, fontWeight: "700" },
  valueRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 10 },
  value:    { fontSize: 26, fontWeight: "700" },
  target:   { color: colors.muted, fontSize: 13 },
  barWrap:  { marginBottom: 10 },
  sensorLabel: { color: colors.muted, fontSize: 10, fontStyle: "italic" },
  badge: {
    alignSelf:    "flex-start",
    borderWidth:  1,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical:   3,
    marginTop:    8,
  },
  badgeText: { fontSize: 11, fontWeight: "500" },
});
