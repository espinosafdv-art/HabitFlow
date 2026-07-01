import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { toDateString } from "../utils/dateUtils";
import type { DailyHabits, DailyLog } from "../types/habits";

// ─── Default Habit Values ─────────────────────────────────────────────────────

export const DEFAULT_HABITS: DailyHabits = {
  steps:    { current: 0, target: 10000, completed: false },
  exercise: { activityScore: 0, target: 500, completed: false },
  focus:    { minutesFlipped: 0, target: 60, completed: false },
  sleep:    { maxDarknessLux: 999, completed: false },
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getDailyLog(userId: string): Promise<DailyLog | null> {
  const ref = doc(db, "users", userId, "daily_logs", toDateString());
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as DailyLog) : null;
  } catch (e) {
    console.error("[Firestore] getDailyLog error:", e);
    return null;
  }
}

// ─── Write (merge) ────────────────────────────────────────────────────────────

export async function upsertDailyLog(userId: string, habits: DailyHabits): Promise<void> {
  const ref = doc(db, "users", userId, "daily_logs", toDateString());
  try {
    await setDoc(ref, { date: toDateString(), updatedAt: serverTimestamp(), habits }, { merge: true });
    console.log("[Firestore] ✅ Synced");
  } catch (e) {
    console.error("[Firestore] upsertDailyLog error:", e);
    throw e;
  }
}

// ─── Initialize (get existing or create default) ──────────────────────────────

export async function initDailyLog(userId: string): Promise<DailyHabits> {
  const existing = await getDailyLog(userId);
  if (existing) return existing.habits;

  console.log("[Firestore] 🆕 Creating new log for", userId);
  await upsertDailyLog(userId, DEFAULT_HABITS);
  return DEFAULT_HABITS;
}
