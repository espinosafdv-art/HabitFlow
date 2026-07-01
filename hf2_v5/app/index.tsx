import React, { useCallback, useState } from "react";
import {
  View, ScrollView, Text, RefreshControl, Pressable,
  Alert, StyleSheet, Platform, Share, Image,
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
import { colors, radii, shadows }    from "../src/utils/theme";

export default function DashboardScreen() {
  const insets                          = useSafeAreaInsets();
  const { habits, isSyncing, dispatch } = useHabits();
  const { sensorStatus, takePhoto }     = useSensors();
  const [refreshing, setRefreshing]     = useState(false);
  const [takingPhoto, setTakingPhoto]   = useState(false);

  const completedCount = [
    habits.photo.completed,
    habits.exercise.completed,
    habits.focus.completed,
    habits.location.completed,
  ].filter(Boolean).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch({ type: "RESET" });
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const handleTakePhoto = async () => {
    if (takingPhoto) return;
    setTakingPhoto(true);
    try {
      await takePhoto();
    } finally {
      setTakingPhoto(false);
    }
  };

  const handleExport = async () => {
    const log = {
      date:     toDateString(),
      exported: new Date().toISOString(),
      habits: {
        photo:    { count: habits.photo.photosToday, target: habits.photo.target,    completed: habits.photo.completed },
        exercise: { score: habits.exercise.activityScore, target: habits.exercise.target, completed: habits.exercise.completed },
        focus:    { minutes: habits.focus.minutesFlipped, target: habits.focus.target,    completed: habits.focus.completed },
        location: { distanceM: habits.location.distanceMeters, target: habits.location.target, completed: habits.location.completed },
      },
    };
    const json = JSON.stringify(log, null, 2);
    const path = `${FileSystem.documentDirectory}habitflow_${toDateString()}.json`;
    try {
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Share.share({ message: json, title: "HabitFlow Log" });
    } catch {
      Alert.alert("Error", "No se pudo exportar el log.");
    }
  };

  // ── Distance formatting ────────────────────────────────────────────────────
  const distM   = habits.location.distanceMeters;
  const distStr = distM >= 1000
    ? `${(distM / 1000).toFixed(2)} km`
    : `${Math.round(distM)} m`;

  // ── Photo progress (0 or 1) ────────────────────────────────────────────────
  const photoProgress = calcProgress(habits.photo.photosToday, habits.photo.target);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />
        }
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

        <View style={styles.cardList}>

          {/* ── 📸 Cámara ─────────────────────────────────────────────────────── */}
          <HabitCard
            id="photo"
            title="Foto del día"
            emoji="📸"
            color="#6C63FF"
            current={habits.photo.photosToday}
            target={habits.photo.target}
            unit="foto"
            subtitle="Documenta tu hábito con una fotografía diaria"
            completed={habits.photo.completed}
            sensorLabel={sensorStatus.camera ? "Cámara disponible" : "Cámara no disponible"}
          />

          {/* Botón de cámara + miniatura */}
          <View style={styles.cameraRow}>
            <Pressable
              id="take-photo-btn"
              onPress={handleTakePhoto}
              disabled={takingPhoto || habits.photo.completed}
              style={({ pressed }) => [
                styles.cameraBtn,
                habits.photo.completed && styles.cameraBtnDone,
                (pressed || takingPhoto) && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.cameraBtnText}>
                {habits.photo.completed
                  ? "✅ Foto registrada"
                  : takingPhoto
                  ? "📷 Abriendo cámara…"
                  : "📷 Tomar foto ahora"}
              </Text>
            </Pressable>

            {habits.photo.lastPhotoUri && (
              <Image
                source={{ uri: habits.photo.lastPhotoUri }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
            )}
          </View>

          {/* ── 🏃 Acelerómetro ────────────────────────────────────────────────── */}
          <HabitCard
            id="exercise"
            title="Actividad física"
            emoji="🏃"
            color="#FF6584"
            current={habits.exercise.activityScore}
            target={habits.exercise.target}
            unit="pts"
            subtitle="El acelerómetro detecta movimiento continuo"
            completed={habits.exercise.completed}
            sensorLabel="Acelerómetro activo"
          />

          {/* ── 🧠 Giroscopio ──────────────────────────────────────────────────── */}
          <HabitCard
            id="focus"
            title="Minutos de focus"
            emoji="🧠"
            color="#F59E0B"
            current={habits.focus.minutesFlipped}
            target={habits.focus.target}
            unit="min"
            subtitle="Gira el teléfono boca abajo en silencio"
            completed={habits.focus.completed}
            sensorLabel="Giroscopio + Acelerómetro activos"
          />

          {/* ── 📍 GPS ─────────────────────────────────────────────────────────── */}
          <HabitCard
            id="location"
            title="Distancia recorrida"
            emoji="📍"
            color="#22C55E"
            current={Math.round(distM)}
            target={habits.location.target}
            unit="m"
            subtitle={
              sensorStatus.location
                ? `GPS activo · ${distStr} de 1 km`
                : "Esperando permiso de ubicación…"
            }
            completed={habits.location.completed}
            sensorLabel={sensorStatus.location ? `GPS · ${distStr}` : "GPS no disponible"}
          />

          {/* Live GPS coords (debug info) */}
          {__DEV__ && sensorStatus.location && habits.location.lastLat && (
            <Text style={styles.gpsDebug}>
              📡 {habits.location.lastLat?.toFixed(5)}, {habits.location.lastLon?.toFixed(5)}
            </Text>
          )}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: colors.bg },
  cardList:  { paddingTop: 16 },
  allDone:   {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor:     "rgba(34, 197, 94, 0.35)",
    borderWidth:     1,
    borderRadius:    12,
    margin:          16,
    padding:         14,
    alignItems:      "center",
  },
  allDoneText: { color: colors.success, fontSize: 14, fontWeight: "600" },

  // Camera action row
  cameraRow: {
    flexDirection:   "row",
    alignItems:      "center",
    marginHorizontal: 16,
    marginTop:       -4,
    marginBottom:    12,
    gap:             10,
  },
  cameraBtn: {
    flex:             1,
    backgroundColor:  "rgba(108, 99, 255, 0.15)",
    borderColor:      "rgba(108, 99, 255, 0.4)",
    borderWidth:      1,
    borderRadius:     radii.md,
    paddingVertical:  12,
    alignItems:       "center",
  },
  cameraBtnDone: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor:     "rgba(34, 197, 94, 0.4)",
  },
  cameraBtnText: { color: colors.primary, fontSize: 14, fontWeight: "500" },
  photoThumb: {
    width:        64,
    height:       64,
    borderRadius: radii.md,
    borderWidth:  2,
    borderColor:  colors.primary,
    ...shadows.card,
  },

  // GPS debug
  gpsDebug: {
    color:          colors.muted,
    fontSize:       10,
    textAlign:      "center",
    marginBottom:   8,
    fontFamily:     Platform.OS === "ios" ? "Courier" : "monospace",
  },

  // Export
  exportBtn: {
    backgroundColor:  "rgba(108, 99, 255, 0.12)",
    borderColor:      "rgba(108, 99, 255, 0.35)",
    borderWidth:      1,
    borderRadius:     12,
    marginHorizontal: 16,
    marginTop:        4,
    paddingVertical:  14,
    alignItems:       "center",
  },
  exportBtnPressed: { backgroundColor: "rgba(108, 99, 255, 0.22)" },
  exportText:       { color: colors.primary, fontSize: 14, fontWeight: "500" },
});
