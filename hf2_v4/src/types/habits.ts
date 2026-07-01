import type { Timestamp } from "firebase/firestore";

// ─── Habit Interfaces ────────────────────────────────────────────────────────

export interface StepsHabit {
  current: number;
  target: number;
  completed: boolean;
}

export interface ExerciseHabit {
  activityScore: number;
  target: number;
  completed: boolean;
}

export interface FocusHabit {
  minutesFlipped: number;
  target: number;
  completed: boolean;
}

export interface SleepHabit {
  /** Lowest lux detected during nighttime */
  maxDarknessLux: number;
  completed: boolean;
}

export interface DailyHabits {
  steps: StepsHabit;
  exercise: ExerciseHabit;
  focus: FocusHabit;
  sleep: SleepHabit;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  updatedAt: Timestamp;
  habits: DailyHabits;
}

export type HabitKey = keyof DailyHabits;

// ─── Reducer Actions ─────────────────────────────────────────────────────────

export type HabitsAction =
  | { type: "UPDATE_STEPS";    payload: Partial<StepsHabit> }
  | { type: "UPDATE_EXERCISE"; payload: Partial<ExerciseHabit> }
  | { type: "UPDATE_FOCUS";    payload: Partial<FocusHabit> }
  | { type: "UPDATE_SLEEP";    payload: Partial<SleepHabit> }
  | { type: "LOAD_LOG";        payload: DailyHabits }
  | { type: "SET_SYNCING";     payload: boolean }
  | { type: "RESET" };

// ─── Context Value Types ──────────────────────────────────────────────────────

export interface HabitsState {
  habits: DailyHabits;
  isLoading: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
}

export interface HabitsContextValue extends HabitsState {
  dispatch: React.Dispatch<HabitsAction>;
  userId: string;
}

// ─── Sensor Context Types ─────────────────────────────────────────────────────

export interface SensorStatus {
  pedometer: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
  lightSensor: boolean;
}

export interface SensorsContextValue {
  sensorStatus: SensorStatus;
  isIOSLightFallback: boolean;
}
