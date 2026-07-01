import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import { useCamera }        from "../hooks/useCamera";
import { useAccelerometer } from "../hooks/useAccelerometer";
import { useGyroscope }     from "../hooks/useGyroscope";
import { useLocation }      from "../hooks/useLocation";
import {
  fetchHabits, addHabit as svcAdd, updateHabit as svcUpdate, deleteHabit as svcDelete,
} from "../services/habitsService";
import { fetchTodayLogs, upsertDailyLog } from "../services/logsService";
import { fetchStreaks, onHabitCompleted }  from "../services/streaksService";
import { useNotificationsCtx }             from "./NotificationsContext";
import type {
  Habit, DailyLog, StreakData, HabitFormData, HabitsContextValue, SensorReadings,
} from "../types";

// ─── Context ──────────────────────────────────────────────────────────────────
const HabitsContext = createContext<HabitsContextValue | null>(null);

const DEBOUNCE_MS = 5000;

const EMPTY_READINGS: SensorReadings = {
  photosToday: 0, lastPhotoUri: null, activityScore: 0, minutesFlipped: 0, distanceMeters: 0,
};

export function HabitsProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [habits,    setHabits]    = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, DailyLog>>({});
  const [streaks,   setStreaks]   = useState<Record<string, StreakData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [readings,  setReadings]  = useState<SensorReadings>(EMPTY_READINGS);

  // ── Notifications ─────────────────────────────────────────────────────────
  const { notifyHabitComplete } = useNotificationsCtx();

  // ── Sensor hooks ──────────────────────────────────────────────────────────
  const camera        = useCamera();
  const accelerometer = useAccelerometer();
  const gyroscope     = useGyroscope();
  const location      = useLocation();

  // Keep refs for debounce flush (avoids stale closure)
  const habitsRef    = useRef<Habit[]>([]);
  const logsRef      = useRef<Record<string, DailyLog>>({});
  const streaksRef   = useRef<Record<string, StreakData>>({});
  const pendingRef   = useRef<Record<string, number>>({});
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { habitsRef.current  = habits;    }, [habits]);
  useEffect(() => { logsRef.current    = todayLogs; }, [todayLogs]);
  useEffect(() => { streaksRef.current = streaks;   }, [streaks]);

  // ── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    fetchHabits(userId).then(async (hs) => {
      setHabits(hs);
      habitsRef.current = hs;
      const ids = hs.map((h) => h.id);
      const [logs, strs] = await Promise.all([
        fetchTodayLogs(userId, ids),
        fetchStreaks(userId, ids),
      ]);
      setTodayLogs(logs);
      setStreaks(strs);
      setIsLoading(false);
    });
  }, [userId]);

  // ── Flush pending writes to Firestore ─────────────────────────────────────
  const flushPending = useCallback(() => {
    const pending = { ...pendingRef.current };
    pendingRef.current = {};
    Object.entries(pending).forEach(async ([habitId, current]) => {
      const habit = habitsRef.current.find((h) => h.id === habitId);
      if (!habit) return;
      const wasCompleted = logsRef.current[habitId]?.completed ?? false;
      await upsertDailyLog(userId, habitId, current, habit.target);
      const isNowComplete = current >= habit.target;
      if (isNowComplete && !wasCompleted) {
        const updated = await onHabitCompleted(userId, habitId);
        setStreaks((s) => ({ ...s, [habitId]: updated }));
        // Send push notification for this habit
        notifyHabitComplete(habit.name, habit.emoji).catch(() => {});
      }
    });
  }, [userId, notifyHabitComplete]);

  // ── In-memory progress update with debounced Firestore flush ─────────────
  const updateProgressInMemory = useCallback((habitId: string, current: number) => {
    const habit = habitsRef.current.find((h) => h.id === habitId);
    if (!habit) return;
    const completed = current >= habit.target;
    const wasCompleted = logsRef.current[habitId]?.completed ?? false;

    setTodayLogs((prev) => ({
      ...prev,
      [habitId]: {
        habitId,
        date:        new Date().toISOString().slice(0, 10),
        current,
        completed,
        updatedAt:   null as any,
        completedAt: completed && !wasCompleted ? null : (prev[habitId]?.completedAt ?? null),
      },
    }));

    pendingRef.current[habitId] = current;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushPending, DEBOUNCE_MS);
  }, [flushPending]);

  // ── Sensor readings → in-memory log updates ───────────────────────────────
  useEffect(() => {
    setReadings((r) => ({ ...r, photosToday: camera.photosToday, lastPhotoUri: camera.lastPhotoUri }));
    habitsRef.current.filter((h) => h.sensorType === "camera").forEach((h) => {
      updateProgressInMemory(h.id, camera.photosToday);
    });
  }, [camera.photosToday]);

  useEffect(() => {
    setReadings((r) => ({ ...r, activityScore: accelerometer.activityScore }));
    habitsRef.current.filter((h) => h.sensorType === "accelerometer").forEach((h) => {
      updateProgressInMemory(h.id, accelerometer.activityScore);
    });
  }, [accelerometer.activityScore]);

  useEffect(() => {
    setReadings((r) => ({ ...r, minutesFlipped: gyroscope.minutesFlipped }));
    habitsRef.current.filter((h) => h.sensorType === "gyroscope").forEach((h) => {
      updateProgressInMemory(h.id, gyroscope.minutesFlipped);
    });
  }, [gyroscope.minutesFlipped]);

  useEffect(() => {
    setReadings((r) => ({ ...r, distanceMeters: location.distanceMeters }));
    habitsRef.current.filter((h) => h.sensorType === "location").forEach((h) => {
      updateProgressInMemory(h.id, location.distanceMeters);
    });
  }, [location.distanceMeters]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addHabit = useCallback(async (data: HabitFormData) => {
    const id = await svcAdd(userId, data);
    const newHabit: Habit = {
      ...data, id, userId, isActive: true, createdAt: null as any,
    };
    setHabits((h) => [...h, newHabit]);
  }, [userId]);

  const updateHabit = useCallback(async (id: string, data: Partial<HabitFormData>) => {
    await svcUpdate(userId, id, data);
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, ...data } : h)));
  }, [userId]);

  const deleteHabit = useCallback(async (id: string) => {
    await svcDelete(userId, id);
    setHabits((hs) => hs.filter((h) => h.id !== id));
    setTodayLogs((l) => { const n = { ...l }; delete n[id]; return n; });
    setStreaks((s)   => { const n = { ...s }; delete n[id]; return n; });
  }, [userId]);

  // ── Manual habits ─────────────────────────────────────────────────────────
  const manualComplete = useCallback(async (habitId: string) => {
    const habit = habitsRef.current.find((h) => h.id === habitId);
    if (!habit) return;
    updateProgressInMemory(habitId, habit.target);
  }, [updateProgressInMemory]);

  const manualIncrement = useCallback(async (habitId: string) => {
    const current = logsRef.current[habitId]?.current ?? 0;
    updateProgressInMemory(habitId, current + 1);
  }, [updateProgressInMemory]);

  // ── takePhoto ────────────────────────────────────────────────────────────
  const takePhoto = useCallback(async () => {
    await camera.takePhoto();
  }, [camera.takePhoto]);

  return (
    <HabitsContext.Provider value={{
      habits, todayLogs, streaks, isLoading, readings,
      takePhoto, addHabit, updateHabit, deleteHabit, manualComplete, manualIncrement,
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be inside HabitsProvider");
  return ctx;
}
