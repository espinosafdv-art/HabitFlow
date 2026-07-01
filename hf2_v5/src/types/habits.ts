import type { Timestamp } from "firebase/firestore";

// ─── Habit Interfaces ────────────────────────────────────────────────────────

/** 📸 Cámara: contar fotos tomadas en el día */
export interface PhotoHabit {
  photosToday:  number;
  target:       number;
  completed:    boolean;
  lastPhotoUri: string | null;
}

/** 🏃 Acelerómetro: actividad física por magnitud de movimiento */
export interface ExerciseHabit {
  activityScore: number;
  target:        number;
  completed:     boolean;
}

/** 🧠 Giroscopio + Acelerómetro: minutos con teléfono boca abajo */
export interface FocusHabit {
  minutesFlipped: number;
  target:         number;
  completed:      boolean;
}

/** 📍 GPS: distancia recorrida en metros durante el día */
export interface LocationHabit {
  distanceMeters: number;
  target:         number;   // 1000 m = 1 km
  completed:      boolean;
  lastLat:        number | null;
  lastLon:        number | null;
}

export interface DailyHabits {
  photo:    PhotoHabit;
  exercise: ExerciseHabit;
  focus:    FocusHabit;
  location: LocationHabit;
}

export interface DailyLog {
  date:      string;   // YYYY-MM-DD
  updatedAt: Timestamp;
  habits:    DailyHabits;
}

export type HabitKey = keyof DailyHabits;

// ─── Reducer Actions ─────────────────────────────────────────────────────────

export type HabitsAction =
  | { type: "UPDATE_PHOTO";    payload: Partial<PhotoHabit> }
  | { type: "UPDATE_EXERCISE"; payload: Partial<ExerciseHabit> }
  | { type: "UPDATE_FOCUS";    payload: Partial<FocusHabit> }
  | { type: "UPDATE_LOCATION"; payload: Partial<LocationHabit> }
  | { type: "LOAD_LOG";        payload: DailyHabits }
  | { type: "SET_SYNCING";     payload: boolean }
  | { type: "RESET" };

// ─── Context Value Types ──────────────────────────────────────────────────────

export interface HabitsState {
  habits:     DailyHabits;
  isLoading:  boolean;
  isSyncing:  boolean;
  lastSynced: Date | null;
}

export interface HabitsContextValue extends HabitsState {
  dispatch: React.Dispatch<HabitsAction>;
  userId:   string;
}

// ─── Sensors Context ─────────────────────────────────────────────────────────

export interface SensorStatus {
  camera:        boolean;
  accelerometer: boolean;
  gyroscope:     boolean;
  location:      boolean;
}

export interface SensorsContextValue {
  sensorStatus: SensorStatus;
  takePhoto:    () => Promise<void>;
}
