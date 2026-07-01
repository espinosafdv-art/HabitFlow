import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSensors }            from "../context/SensorsContext";
import { colors, typography }    from "../utils/theme";
import { getGreeting, getGreetingEmoji, getFullDateString } from "../utils/dateUtils";

interface DashboardHeaderProps {
  totalHabits:     number;
  completedHabits: number;
  isSyncing:       boolean;
}

export function DashboardHeader({ totalHabits, completedHabits, isSyncing }: DashboardHeaderProps) {
  const { sensorStatus } = useSensors();

  const activeCount = [
    sensorStatus.camera,
    sensorStatus.accelerometer,
    sensorStatus.gyroscope,
    sensorStatus.location,
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Gradient-like top accent */}
      <View style={styles.accent} />

      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreetingEmoji()} {getGreeting()}!
      </Text>
      <Text style={styles.date}>{getFullDateString()}</Text>

      {/* Habit summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{completedHabits}</Text>
          <Text style={styles.summaryLabel}>Completados</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalHabits - completedHabits}</Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Sensores</Text>
        </View>
      </View>

      {/* Overall progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalHabits }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < completedHabits ? styles.dotDone : styles.dotEmpty]}
          />
        ))}
      </View>

      {/* Sync indicator */}
      {isSyncing && (
        <Text style={styles.syncing}>⟳ Sincronizando con Firebase…</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop:  56,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  accent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: "#6C63FF",
  },
  greeting:    { color: colors.white, fontSize: 24, fontWeight: "700", marginBottom: 2 },
  date:        { color: colors.muted, fontSize: 12, marginBottom: 18 },
  summary:     { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  summaryItem: { alignItems: "center" },
  summaryValue:{ color: colors.white, fontSize: 22, fontWeight: "700" },
  summaryLabel:{ color: colors.muted, fontSize: 10, marginTop: 2 },
  divider:     { width: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
  dotsRow:     { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 6 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  dotDone:     { backgroundColor: colors.success },
  dotEmpty:    { backgroundColor: colors.border },
  syncing:     { color: colors.muted, fontSize: 10, textAlign: "center", marginTop: 4 },
  notice:      { color: colors.warning, fontSize: 10, textAlign: "center", marginTop: 4 },
});
