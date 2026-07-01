import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { toDateString } from "../utils/dateUtils";
import type { StreakData } from "../types";

function streakDoc(userId: string, habitId: string) {
  return doc(db, "users", userId, "streaks", habitId);
}

// ─── Fetch streak for one habit ────────────────────────────────────────────
export async function fetchStreak(userId: string, habitId: string): Promise<StreakData> {
  try {
    const snap = await getDoc(streakDoc(userId, habitId));
    if (snap.exists()) return snap.data() as StreakData;
  } catch { /* no-op */ }
  return defaultStreak(habitId);
}

// ─── Fetch streaks for multiple habits ────────────────────────────────────
export async function fetchStreaks(
  userId: string,
  habitIds: string[]
): Promise<Record<string, StreakData>> {
  const results: Record<string, StreakData> = {};
  await Promise.all(
    habitIds.map(async (id) => {
      results[id] = await fetchStreak(userId, id);
    })
  );
  return results;
}

// ─── Update streak on completion ──────────────────────────────────────────
export async function onHabitCompleted(userId: string, habitId: string): Promise<StreakData> {
  const today     = toDateString();
  const yesterday = toDateString(new Date(Date.now() - 86_400_000));

  const current = await fetchStreak(userId, habitId);

  // Already counted today → no change
  if (current.lastCompletedDate === today) return current;

  let newStreak: number;
  if (current.lastCompletedDate === yesterday) {
    newStreak = current.currentStreak + 1;          // Continuing streak
  } else {
    newStreak = 1;                                   // Streak broken / first time
  }

  const updated: StreakData = {
    habitId,
    currentStreak:     newStreak,
    longestStreak:     Math.max(newStreak, current.longestStreak),
    lastCompletedDate: today,
    totalCompletions:  current.totalCompletions + 1,
    updatedAt:         serverTimestamp() as any,
  };

  await setDoc(streakDoc(userId, habitId), updated, { merge: true });
  console.log(`[streaks] 🔥 ${habitId}: streak=${newStreak}`);
  return updated;
}

export function defaultStreak(habitId: string): StreakData {
  return {
    habitId,
    currentStreak:     0,
    longestStreak:     0,
    lastCompletedDate: null,
    totalCompletions:  0,
    updatedAt:         null as any,
  };
}
