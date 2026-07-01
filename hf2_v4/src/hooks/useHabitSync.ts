import { useEffect, useRef } from "react";
import { upsertDailyLog } from "../services/firestoreService";
import type { DailyHabits } from "../types/habits";

const DEBOUNCE_MS = 5000; // write to Firestore at most once every 5s

/**
 * Debounced Firestore sync hook.
 * Call this from HabitsContext with current habits state.
 * Aggregates rapid sensor updates and writes exactly once per 5s window.
 */
export function useHabitSync(userId: string, habits: DailyHabits, enabled: boolean): void {
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const habitsRef = useRef(habits);

  // Keep ref current so the timeout callback sees latest state
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await upsertDailyLog(userId, habitsRef.current);
      } catch (e) {
        console.error("[useHabitSync] Sync failed:", e);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [habits, userId, enabled]);
}
