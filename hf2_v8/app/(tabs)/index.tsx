import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, Image, RefreshControl, StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits }  from "../../src/context/HabitsContext";
import { useAuth }    from "../../src/context/AuthContext";
import { StreakBadge } from "../../src/components/StreakBadge";
import { ProgressBar } from "../../src/components/ProgressBar";
import { colors, radii, shadows } from "../../src/utils/theme";
import { getGreeting, getFullDateString } from "../../src/utils/dateUtils";
import type { Habit } from "../../src/types";

export default function TodayScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { profile } = useAuth();
  const {
    habits, todayLogs, streaks, isLoading, readings,
    takePhoto, manualComplete, manualIncrement,
  } = useHabits();
  const [refreshing, setRefreshing] = useState(false);

  const completedCount = habits.filter((h) => todayLogs[h.id]?.completed).length;
  const allDone        = completedCount === habits.length && habits.length > 0;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 12 }}>Cargando tus hábitos…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerAccent} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {profile?.displayName?.split(" ")[0] ?? (profile?.isAnonymous ? "Invitado" : "Usuario")} 👋
              </Text>
              <Text style={styles.date}>{getFullDateString()}</Text>
            </View>
            <Pressable onPress={() => router.push("/habit/new")} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Nuevo</Text>
            </Pressable>
          </View>

          {/* Progress summary */}
          <View style={styles.progressSummary}>
            <Text style={styles.progressCount}>
              <Text style={{ color: colors.primary, fontSize: 28 }}>{completedCount}</Text>
              <Text style={{ color: colors.muted }}> / {habits.length}</Text>
            </Text>
            <Text style={styles.progressLabel}>hábitos completados hoy</Text>
            <ProgressBar
              progress={habits.length > 0 ? completedCount / habits.length : 0}
              color={colors.primary}
            />
          </View>

          {allDone && (
            <View style={styles.allDone}>
              <Text style={styles.allDoneText}>🎉 ¡Todos los hábitos del día completados!</Text>
            </View>
          )}
        </View>

        {/* ── No habits ── */}
        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Sin hábitos todavía</Text>
            <Text style={styles.emptySub}>Crea tu primer hábito para empezar</Text>
            <Pressable onPress={() => router.push("/habit/new")} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Crear hábito</Text>
            </Pressable>
          </View>
        )}

        {/* ── Habit cards ── */}
        <View style={{ padding: 16, gap: 12 }}>
          {habits.map((habit) => (
            <HabitDayCard
              key={habit.id}
              habit={habit}
              current={todayLogs[habit.id]?.current ?? 0}
              completed={todayLogs[habit.id]?.completed ?? false}
              streak={streaks[habit.id]}
              lastPhotoUri={readings.lastPhotoUri}
              onCamera={takePhoto}
              onManualComplete={() => manualComplete(habit.id)}
              onManualIncrement={() => manualIncrement(habit.id)}
              onPress={() => router.push(`/habit/${habit.id}`)}
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Habit Day Card ───────────────────────────────────────────────────────────
interface HabitDayCardProps {
  habit:          Habit;
  current:        number;
  completed:      boolean;
  streak:         any;
  lastPhotoUri:   string | null;
  onCamera:       () => Promise<void>;
  onManualComplete:  () => void;
  onManualIncrement: () => void;
  onPress:        () => void;
}

function HabitDayCard({
  habit, current, completed, streak, lastPhotoUri,
  onCamera, onManualComplete, onManualIncrement, onPress,
}: HabitDayCardProps) {
  const progress = Math.min(1, current / (habit.target || 1));
  const pct      = Math.round(progress * 100);

  const valueLabel = habit.sensorType === "location"
    ? current >= 1000 ? `${(current/1000).toFixed(2)} km` : `${Math.round(current)} m`
    : `${Math.round(current)} / ${habit.target} ${habit.unit}`;

  return (
    <Pressable onLongPress={onPress} style={[styles.card, completed && styles.cardDone]}>
      {/* Color accent */}
      <View style={[styles.cardAccent, { backgroundColor: habit.color }]} />

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Title row */}
        <View style={styles.cardTitleRow}>
          <View style={[styles.emojiWrap, { backgroundColor: `${habit.color}20` }]}>
            <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{habit.name}</Text>
            <Text style={styles.cardValue}>{valueLabel}</Text>
          </View>
          {streak && <StreakBadge streak={streak} compact />}
          {completed && <Text style={{ fontSize: 20, marginLeft: 4 }}>✅</Text>}
        </View>

        {/* Progress bar */}
        <View style={styles.cardProgress}>
          <ProgressBar progress={progress} color={habit.color} />
          <Text style={[styles.pctText, { color: habit.color }]}>{pct}%</Text>
        </View>

        {/* Photo thumbnail */}
        {habit.sensorType === "camera" && lastPhotoUri && completed && (
          <Image source={{ uri: lastPhotoUri }} style={styles.photoThumb} resizeMode="cover" />
        )}

        {/* Action buttons */}
        {!completed && (
          <View style={styles.cardActions}>
            {habit.sensorType === "camera" && (
              <Pressable
                onPress={onCamera}
                style={[styles.actionBtn, { backgroundColor: `${habit.color}20`, borderColor: `${habit.color}50` }]}
              >
                <Text style={[styles.actionText, { color: habit.color }]}>📷 Tomar foto</Text>
              </Pressable>
            )}
            {habit.sensorType === "manual" && (
              <>
                <Pressable
                  onPress={onManualIncrement}
                  style={[styles.actionBtn, { flex: 1, backgroundColor: `${habit.color}15`, borderColor: `${habit.color}40` }]}
                >
                  <Text style={[styles.actionText, { color: habit.color }]}>+1 {habit.unit}</Text>
                </Pressable>
                <Pressable
                  onPress={onManualComplete}
                  style={[styles.actionBtn, { flex: 1, backgroundColor: `${habit.color}25`, borderColor: `${habit.color}60` }]}
                >
                  <Text style={[styles.actionText, { color: habit.color }]}>✓ Completar</Text>
                </Pressable>
              </>
            )}
            {["accelerometer","gyroscope","location"].includes(habit.sensorType) && (
              <View style={styles.autoLabel}>
                <Text style={styles.autoText}>
                  {habit.sensorType === "accelerometer" ? "⚡ Auto · Acelerómetro activo"
                   : habit.sensorType === "gyroscope"   ? "🧠 Auto · Giroscopio activo"
                   :                                      "📍 Auto · GPS activo"}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.bg },

  header:     { backgroundColor: colors.card, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  headerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary },
  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting:   { color: colors.white, fontSize: 20, fontWeight: "700" },
  date:       { color: colors.muted, fontSize: 12, marginTop: 2 },
  addBtn:     { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, ...shadows.glow(colors.primary) },
  addBtnText: { color: colors.white, fontWeight: "600", fontSize: 13 },

  progressSummary: { marginBottom: 8 },
  progressCount:   { fontSize: 28, fontWeight: "800", color: colors.white },
  progressLabel:   { color: colors.muted, fontSize: 12, marginBottom: 8 },

  allDone:     { backgroundColor: "rgba(34,197,94,0.12)", borderRadius: radii.md, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", padding: 10, marginTop: 8, alignItems: "center" },
  allDoneText: { color: colors.success, fontSize: 13, fontWeight: "600" },

  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: colors.white, fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptySub:   { color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 24 },
  emptyBtn:   { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full },
  emptyBtnText: { color: colors.white, fontWeight: "600" },

  // Card
  card:      { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden", ...shadows.card },
  cardDone:  { borderColor: "rgba(34,197,94,0.3)" },
  cardAccent:{ height: 3 },
  cardBody:  { padding: 14 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  emojiWrap:    { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle:    { color: colors.white, fontSize: 16, fontWeight: "600" },
  cardValue:    { color: colors.muted, fontSize: 12, marginTop: 2 },
  cardProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  pctText:      { fontSize: 11, fontWeight: "600", minWidth: 32, textAlign: "right" },
  photoThumb:   { width: "100%", height: 100, borderRadius: radii.md, marginTop: 6 },
  cardActions:  { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.md,
    borderWidth: 1, alignItems: "center",
  },
  actionText: { fontSize: 13, fontWeight: "500" },
  autoLabel:  { flex: 1, paddingVertical: 6 },
  autoText:   { color: colors.muted, fontSize: 11 },
});
