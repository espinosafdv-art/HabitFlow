import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Habit, HabitFormData } from "../types";

function habitsCol(userId: string) {
  return collection(db, "users", userId, "habits");
}

// ─── Read all active habits ───────────────────────────────────────────────────
export async function fetchHabits(userId: string): Promise<Habit[]> {
  try {
    const q = query(habitsCol(userId), where("isActive", "==", true), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Habit));
  } catch (e) {
    console.error("[habitsService] fetchHabits:", e);
    return [];
  }
}

// ─── Add habit ────────────────────────────────────────────────────────────────
export async function addHabit(userId: string, data: HabitFormData): Promise<string> {
  const ref = await addDoc(habitsCol(userId), {
    ...data,
    userId,
    isActive:  true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Update habit ─────────────────────────────────────────────────────────────
export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<HabitFormData>
): Promise<void> {
  await updateDoc(doc(habitsCol(userId), habitId), data);
}

// ─── Soft delete (mark inactive) ─────────────────────────────────────────────
export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  await updateDoc(doc(habitsCol(userId), habitId), { isActive: false });
}
