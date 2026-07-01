import type { Timestamp } from "firebase/firestore";

// ─── Sensor Types ─────────────────────────────────────────────────────────────
export type SensorType = "camera" | "accelerometer" | "gyroscope" | "location" | "manual";

// ─── Habit ───────────────────────────────────────────────────────────────────
export interface Habit {
  id:          string;
  userId:      string;
  name:        string;
  emoji:       string;
  color:       string;
  target:      number;
  unit:        string;
  description: string;
  sensorType:  SensorType;
  isActive:    boolean;
  createdAt:   Timestamp;
}

export type HabitFormData = Omit<Habit, "id" | "userId" | "createdAt" | "isActive">;

// ─── Daily Log ────────────────────────────────────────────────────────────────
export interface DailyLog {
  habitId:     string;
  date:        string;      // YYYY-MM-DD
  current:     number;
  completed:   boolean;
  completedAt: Timestamp | null;
  updatedAt:   Timestamp;
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export interface StreakData {
  habitId:           string;
  currentStreak:     number;
  longestStreak:     number;
  lastCompletedDate: string | null;
  totalCompletions:  number;
  updatedAt:         Timestamp;
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  uid:         string;
  email:       string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

// ─── Sensor Readings ─────────────────────────────────────────────────────────
export interface SensorReadings {
  photosToday:    number;
  lastPhotoUri:   string | null;
  activityScore:  number;
  minutesFlipped: number;
  distanceMeters: number;
}

// ─── Context Value ────────────────────────────────────────────────────────────
export interface HabitsContextValue {
  habits:    Habit[];
  todayLogs: Record<string, DailyLog>;
  streaks:   Record<string, StreakData>;
  isLoading: boolean;
  readings:  SensorReadings;
  takePhoto: () => Promise<void>;
  addHabit:      (data: HabitFormData) => Promise<void>;
  updateHabit:   (id: string, data: Partial<HabitFormData>) => Promise<void>;
  deleteHabit:   (id: string) => Promise<void>;
  manualComplete:(habitId: string) => Promise<void>;
  manualIncrement:(habitId: string) => Promise<void>;
}
