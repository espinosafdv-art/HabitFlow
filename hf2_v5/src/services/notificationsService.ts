import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import type { HabitKey } from "../types/habits";

// ─── Foreground Handler ───────────────────────────────────────────────────────

export function configureForegroundHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Android Channels ─────────────────────────────────────────────────────────

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("habitflow-reminders", {
    name: "Recordatorios de Hábitos",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6C63FF",
  });
  await Notifications.setNotificationChannelAsync("habitflow-achievements", {
    name: "Logros",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#22C55E",
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === "granted";
}

// ─── Push Token ───────────────────────────────────────────────────────────────

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    console.log("[Notifications] 📬 Token:", token.data);
    return token.data;
  } catch (e) {
    console.warn("[Notifications] Push token unavailable:", e);
    return null;
  }
}

// ─── Daily Reminders ─────────────────────────────────────────────────────────

const REMINDER_IDS = {
  MORNING:   "hf-morning",
  AFTERNOON: "hf-afternoon",
  NIGHT:     "hf-night",
} as const;

export async function scheduleAllDailyReminders(): Promise<void> {
  await cancelAllReminders();

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDS.MORNING,
    content: { title: "¡Buenos días! 🌅", body: "Empieza el día con tus hábitos.", categoryIdentifier: "habitflow-reminders" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDS.AFTERNOON,
    content: { title: "Hora de enfocarse 🧠", body: "Voltea tu teléfono boca abajo y acumula minutos de concentración.", categoryIdentifier: "habitflow-reminders" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 14, minute: 0 },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDS.NIGHT,
    content: { title: "Hora de descansar 🌙", body: "Apaga las luces y registra tu hábito de sueño.", categoryIdentifier: "habitflow-reminders" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
  });

  console.log("[Notifications] ✅ Reminders scheduled: 08:00, 14:00, 21:00");
}

export async function cancelAllReminders(): Promise<void> {
  await Promise.all(
    Object.values(REMINDER_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}

// ─── Habit Completion Notification ───────────────────────────────────────────

const HABIT_META: Record<HabitKey, { emoji: string; message: string }> = {
  photo:    { emoji: "📸", message: "¡Foto del día registrada!" },
  exercise: { emoji: "🏃", message: "¡Meta de ejercicio completada!" },
  focus:    { emoji: "🧠", message: "¡60 minutos de enfoque acumulados!" },
  location: { emoji: "📍", message: "¡Caminaste más de 1 km hoy!" },
};

export async function sendCompletionNotification(habitKey: HabitKey): Promise<void> {
  const meta = HABIT_META[habitKey];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${meta.emoji} ¡Hábito completado!`,
      body: meta.message,
      categoryIdentifier: "habitflow-achievements",
    },
    trigger: null,
  });
}

export async function getScheduledSummary(): Promise<string[]> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.map((n) => `[${n.identifier}] "${n.content.title}"`);
}
