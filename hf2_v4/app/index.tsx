import React, { useEffect, useState, useCallback } from "react";
import {
  View, ScrollView, Text, RefreshControl,
  Pressable, Alert, StyleSheet, Platform, Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import { useHabits }  from "../src/context/HabitsContext";
import { useSensors } from "../src/context/SensorsContext";
import { DashboardHeader }    from "../src/components/DashboardHeader";
import { HabitCard }          from "../src/components/HabitCard";
import { NotificationsPanel } from "../src/components/NotificationsPanel";
import { calcProgress }       from "../src/utils/sensorMath";
import { toDateString }       from "../src/utils/dateUtils";
import { colors }             from "../src/utils/theme";
import type { HabitCardProps } from "../src/components/HabitCard";

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets                          = useSafeAreaInsets();
  const { habits, isSyncing, dispatch } = useHabits();
  const { sensorStatus }                = useSensors();
  const [refreshing, setRefreshing]     = useState(false);

  const completedCount = [
    habits.steps.completed,
    habits.exercise.completed,
    habits.focus.completed,
    habits.sleep.completed,
  ].filter(Boolean).length;

  // ── Habit Cards Definition ─────────────────────────────────────────────────
  const habitCards: HabitCardProps[] = [
    {
      id:       "steps",
      title:    "Pasos del día",
      emoji:    "🦶",
      color:    "#6C63FF",
      current:  habits.steps.current,
      target:   habits.steps.target,
      unit:     "pasos",
      subtitle: "Medido con el podómetro del dispositivo",
      completed: habits.steps.completed,
      sensorLabel: sensorStatus.pedometer ? "Podómetro activo" : "Podómetro no disponible",
    },
    {
      id:       "exercise",
      title:    "Actividad física",
      emoji:    "🏃",
      color:    "#FF6584",
      current:  habits.exercise.activityScore,
      target:   habits.exercise.target,
      unit:     "pts",
      subtitle: "Acelerómetro detecta movimiento continuo",
      completed: habits.exercise.completed,
      sensorLabel: "Acelerómetro activo",
    },
    {
      id:       "focus",
      title:    "Minutos de focus",
      emoji:    "🧠",
      color:    "#F59E0B",
      current:  habits.focus.minutesFlipped,
      target:   habits.focus.target,
      unit:     "min",
      subtitle: "Gira el teléfono boca abajo en silencio",
      completed: habits.focus.completed,
      sensorLabel: "Giroscopio + Acelerómetro activos",
    },
    {
      id:       "sleep",
      title:    "Hábito de sueño",
      emoji:    "😴",
      color:    "#22C55E",
      current:  habits.sleep.completed ? 1 : 0,
      target:   1,
      unit:     "",
      subtitle: Platform.OS === "ios"
        ? "Sensor de luz no disponible en iOS"
        : "Sensor de luz detecta oscuridad nocturna",
      completed: habits.sleep.completed,
      disabled: Platform.OS === "ios",
      sensorLabel: Platform.OS === "android" ? "LightSensor activo" : undefined,
    },
  ];

  // ── Pull to refresh ────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch({ type: "RESET" });
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  // ── Export log ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const log = {
      date: toDateString(),
      exported: new Date().toISOString(),
      habits: {
        steps:    { current: habits.steps.current, target: habits.steps.target, completed: habits.steps.completed },
        exercise: { score: habits.exercise.activityScore, target: habits.exercise.target, completed: habits.exercise.completed },
        focus:    { minutes: habits.focus.minutesFlipped, target: habits.focus.target, completed: habits.focus.completed },
        sleep:    { completed: habits.sleep.completed, minLux: habits.sleep.maxDarknessLux },
      },
    };
    const json = JSON.stringify(log, null, 2);
    const path = `${FileSystem.documentDirectory}habitflow_${toDateString()}.json`;
    try {
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Share.share({ message: json, title: "HabitFlow Log" });
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el log.");
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
      >
        {/* Header */}
        <DashboardHeader
          totalHabits={4}
          completedHabits={completedCount}
          isSyncing={isSyncing}
        />

        {/* All-done banner */}
        {completedCount === 4 && (
          <View style={styles.allDone}>
            <Text style={styles.allDoneText}>🎉 ¡Todos los hábitos completados hoy!</Text>
          </View>
        )}

        {/* Habit cards */}
        <View style={styles.cardList}>
          {habitCards.map((card) => (
            <HabitCard key={card.id} {...card} />
          ))}
        </View>

        {/* Notifications panel */}
        <NotificationsPanel />

        {/* Export button */}
        <Pressable
          id="export-log-btn"
          onPress={handleExport}
          style={({ pressed }) => [styles.exportBtn, pressed && styles.exportBtnPressed]}
        >
          <Text style={styles.exportText}>📤 Exportar log del día</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: colors.bg },
  cardList:        { paddingTop: 16 },
  allDone:         {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor:     "rgba(34, 197, 94, 0.35)",
    borderWidth:     1,
    borderRadius:    12,
    margin:          16,
    padding:         14,
    alignItems:      "center",
  },
  allDoneText: { color: colors.success, fontSize: 14, fontWeight: "600" },
  exportBtn: {
    backgroundColor: "rgba(108, 99, 255, 0.12)",
    borderColor:     "rgba(108, 99, 255, 0.35)",
    borderWidth:     1,
    borderRadius:    12,
    marginHorizontal: 16,
    marginTop:       4,
    paddingVertical: 14,
    alignItems:      "center",
  },
  exportBtnPressed: { backgroundColor: "rgba(108, 99, 255, 0.22)" },
  exportText:       { color: colors.primary, fontSize: 14, fontWeight: "500" },
});
