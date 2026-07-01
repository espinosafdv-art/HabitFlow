import React from "react";
import { View, Text, Switch, Pressable, Alert, StyleSheet } from "react-native";
import { useNotificationsCtx } from "../context/NotificationsContext";
import { getScheduledSummary } from "../services/notificationsService";
import { colors, radii } from "../utils/theme";

const SCHEDULE = [
  { time: "08:00", label: "Motivación matutina",   emoji: "🌅", color: colors.primary },
  { time: "14:00", label: "Recordatorio de focus", emoji: "🧠", color: "#F59E0B" },
  { time: "21:00", label: "Hora de dormir",         emoji: "🌙", color: colors.success },
];

export function NotificationsPanel() {
  const { hasPermission, remindersEnabled, toggleReminders, isLoading } = useNotificationsCtx();

  const showScheduled = async () => {
    const list = await getScheduledSummary();
    Alert.alert(
      "Notificaciones programadas",
      list.length ? list.join("\n") : "Sin notificaciones pendientes."
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topBar} />
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>🔔 Notificaciones</Text>

        {/* Permission row */}
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Estado de permisos</Text>
            <Text style={[styles.rowSub, { color: hasPermission ? colors.success : colors.accent }]}>
              {isLoading ? "Verificando…" : hasPermission ? "✅ Concedidos" : "❌ No concedidos"}
            </Text>
          </View>
        </View>

        {/* Toggle reminders */}
        <View style={[styles.row, styles.rowBorder]}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Recordatorios diarios</Text>
            <Text style={styles.rowSub}>08:00 · 14:00 · 21:00</Text>
          </View>
          <Switch
            value={remindersEnabled && hasPermission}
            onValueChange={toggleReminders}
            disabled={isLoading || !hasPermission}
            trackColor={{ false: colors.border, true: "rgba(108,99,255,0.45)" }}
            thumbColor={remindersEnabled && hasPermission ? colors.primary : colors.muted}
          />
        </View>

        {/* Schedule rows */}
        {hasPermission && remindersEnabled && (
          <View style={[styles.scheduleBlock, styles.rowBorder]}>
            {SCHEDULE.map((item) => (
              <View key={item.time} style={styles.scheduleRow}>
                <Text style={styles.scheduleEmoji}>{item.emoji}</Text>
                <Text style={styles.scheduleLabel}>{item.label}</Text>
                <View style={[styles.timePill, { borderColor: `${item.color}55`, backgroundColor: `${item.color}18` }]}>
                  <Text style={[styles.timeText, { color: item.color }]}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Dev debug button */}
        {__DEV__ && (
          <Pressable
            onPress={showScheduled}
            style={({ pressed }) => [styles.debugBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.debugText}>[DEV] Ver notificaciones programadas</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius:    radii.lg,
    borderWidth:     1,
    borderColor:     colors.cardBorder,
    marginHorizontal: 16,
    marginBottom:    12,
    overflow:        "hidden",
  },
  topBar:       { height: 3, backgroundColor: colors.primary },
  body:         { padding: 16 },
  sectionLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 },
  row:          { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  rowBorder:    { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 12 },
  rowInfo:      { flex: 1 },
  rowTitle:     { color: colors.white, fontSize: 14, fontWeight: "500" },
  rowSub:       { color: colors.muted, fontSize: 11, marginTop: 2 },
  scheduleBlock:{ gap: 8, paddingBottom: 4 },
  scheduleRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  scheduleEmoji:{ fontSize: 15 },
  scheduleLabel:{ flex: 1, color: colors.muted, fontSize: 12 },
  timePill:     { borderWidth: 1, borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  timeText:     { fontSize: 11, fontWeight: "500" },
  debugBtn:     { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.cardBorder, marginTop: 4, alignItems: "center" },
  debugText:    { color: colors.primary, fontSize: 11 },
});
