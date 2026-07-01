import React, { createContext, useContext, useReducer, useEffect } from "react";
import { initDailyLog, DEFAULT_HABITS } from "../services/firestoreService";
import { useHabitSync } from "../hooks/useHabitSync";
import type { DailyHabits, HabitsAction, HabitsContextValue } from "../types/habits";

// ─── Reducer ──────────────────────────────────────────────────────────────────

function habitsReducer(state: DailyHabits, action: HabitsAction): DailyHabits {
  switch (action.type) {
    case "UPDATE_PHOTO":
      return { ...state, photo: { ...state.photo, ...action.payload } };
    case "UPDATE_EXERCISE":
      return { ...state, exercise: { ...state.exercise, ...action.payload } };
    case "UPDATE_FOCUS":
      return { ...state, focus: { ...state.focus, ...action.payload } };
    case "UPDATE_LOCATION":
      return { ...state, location: { ...state.location, ...action.payload } };
    case "LOAD_LOG":
      return action.payload;
    case "RESET":
      return DEFAULT_HABITS;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const HabitsContext = createContext<HabitsContextValue | null>(null);

interface HabitsProviderProps {
  children: React.ReactNode;
  userId:   string;
}

export function HabitsProvider({ children, userId }: HabitsProviderProps) {
  const [habits,     dispatch]      = useReducer(habitsReducer, DEFAULT_HABITS);
  const [isLoading,  setIsLoading]  = React.useState(true);
  const [isSyncing,  setIsSyncing]  = React.useState(false);
  const [lastSynced, setLastSynced] = React.useState<Date | null>(null);

  // ── Initial Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    initDailyLog(userId)
      .then((loaded) => { dispatch({ type: "LOAD_LOG", payload: loaded }); })
      .catch((e)     => console.error("[HabitsContext] Load error:", e))
      .finally(()    => setIsLoading(false));
  }, [userId]);

  // ── Debounced Sync ────────────────────────────────────────────────────────
  useHabitSync(userId, habits, !isLoading);

  const value: HabitsContextValue = {
    habits, isLoading, isSyncing, lastSynced, dispatch, userId,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be inside HabitsProvider");
  return ctx;
}
