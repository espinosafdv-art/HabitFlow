import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { toDateString } from "../utils/dateUtils";
import type { DailyLog } from "../types";

function logDoc(userId: string, date: string, habitId: string) {
  return doc(db, "users", userId, "logs", date, "habits", habitId);
}

// ─── Load today's log for one habit ──────────────────────────────────────────
export async function getDailyLog(userId: string, habitId: string): Promise<DailyLog | null> {
  try {
    const snap = await getDoc(logDoc(userId, toDateString(), habitId));
    return snap.exists() ? (snap.data() as DailyLog) : null;
  } catch (e) {
    console.error("[logsService] getDailyLog:", e);
    return null;
  }
}

// ─── Upsert log ───────────────────────────────────────────────────────────────
export async function upsertDailyLog(
  userId: string,
  habitId: string,
  current: number,
  target: number
): Promise<void> {
  const date      = toDateString();
  const completed = current >= target;
  const ref       = logDoc(userId, date, habitId);

  try {
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as DailyLog) : null;

    await setDoc(
      ref,
      {
        habitId,
        date,
        current,
        completed,
        updatedAt: serverTimestamp(),
        // Only set completedAt the first time it completes
        completedAt:
          completed && !existing?.completed
            ? serverTimestamp()
            : (existing?.completedAt ?? null),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("[logsService] upsertDailyLog:", e);
    throw e;
  }
}

// ─── Load all today's logs for a user ────────────────────────────────────────
export async function fetchTodayLogs(
  userId: string,
  habitIds: string[]
): Promise<Record<string, DailyLog>> {
  const date    = toDateString();
  const results: Record<string, DailyLog> = {};

  await Promise.all(
    habitIds.map(async (id) => {
      const snap = await getDoc(logDoc(userId, date, id)).catch(() => null);
      if (snap?.exists()) results[id] = snap.data() as DailyLog;
    })
  );

  return results;
}
