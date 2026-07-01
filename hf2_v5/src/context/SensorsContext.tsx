import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useCamera }        from "../hooks/useCamera";
import { useAccelerometer } from "../hooks/useAccelerometer";
import { useGyroscope }     from "../hooks/useGyroscope";
import { useLocation }      from "../hooks/useLocation";
import { useHabits }        from "./HabitsContext";
import { useNotificationsCtx } from "./NotificationsContext";
import type { SensorsContextValue } from "../types/habits";

const SensorsContext = createContext<SensorsContextValue | null>(null);

/** Must be nested inside HabitsProvider AND NotificationsProvider */
export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const { dispatch, habits }    = useHabits();
  const { notifyHabitComplete } = useNotificationsCtx();

  const camera        = useCamera();
  const accelerometer = useAccelerometer();
  const gyroscope     = useGyroscope();
  const location      = useLocation();

  // ── 📸 Camera → Photo habit ──────────────────────────────────────────────
  useEffect(() => {
    const completed = camera.photosToday >= habits.photo.target;
    dispatch({
      type: "UPDATE_PHOTO",
      payload: {
        photosToday:  camera.photosToday,
        lastPhotoUri: camera.lastPhotoUri,
        completed,
      },
    });
    if (completed && !habits.photo.completed) notifyHabitComplete("photo");
  }, [camera.photosToday, camera.lastPhotoUri]);

  // ── 🏃 Accelerometer → Exercise habit ───────────────────────────────────
  useEffect(() => {
    const completed = accelerometer.activityScore >= habits.exercise.target;
    dispatch({
      type: "UPDATE_EXERCISE",
      payload: { activityScore: accelerometer.activityScore, completed },
    });
    if (completed && !habits.exercise.completed) notifyHabitComplete("exercise");
  }, [accelerometer.activityScore]);

  // ── 🧠 Gyroscope → Focus habit ───────────────────────────────────────────
  useEffect(() => {
    const completed = gyroscope.minutesFlipped >= habits.focus.target;
    dispatch({
      type: "UPDATE_FOCUS",
      payload: { minutesFlipped: gyroscope.minutesFlipped, completed },
    });
    if (completed && !habits.focus.completed) notifyHabitComplete("focus");
  }, [gyroscope.minutesFlipped]);

  // ── 📍 Location → Distance habit ────────────────────────────────────────
  useEffect(() => {
    const completed = location.distanceMeters >= habits.location.target;
    dispatch({
      type: "UPDATE_LOCATION",
      payload: {
        distanceMeters: location.distanceMeters,
        lastLat: location.currentCoords?.lat ?? null,
        lastLon: location.currentCoords?.lon ?? null,
        completed,
      },
    });
    if (completed && !habits.location.completed) notifyHabitComplete("location");
  }, [location.distanceMeters]);

  // ── takePhoto: exposed so Dashboard can trigger from UI button ───────────
  const takePhoto = useCallback(async () => {
    await camera.takePhoto();
  }, [camera.takePhoto]);

  const value: SensorsContextValue = {
    sensorStatus: {
      camera:        camera.isAvailable,
      accelerometer: true,
      gyroscope:     true,
      location:      location.isAvailable,
    },
    takePhoto,
  };

  return <SensorsContext.Provider value={value}>{children}</SensorsContext.Provider>;
}

export function useSensors(): SensorsContextValue {
  const ctx = useContext(SensorsContext);
  if (!ctx) throw new Error("useSensors must be inside SensorsProvider");
  return ctx;
}
