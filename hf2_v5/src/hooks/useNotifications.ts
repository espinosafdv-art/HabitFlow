import { useState, useEffect, useRef } from "react";
import type { HabitKey } from "../types/habits";

export interface NotificationsState {
  hasPermission:    boolean;
  pushToken:        string | null;
  remindersEnabled: boolean;
  toggleReminders:  () => Promise<void>;
  notifyHabitComplete: (key: HabitKey) => Promise<void>;
  isLoading:        boolean;
  isSupported:      boolean; // false in Expo Go
}

/** Safe no-op fallback when expo-notifications is not available (Expo Go SDK 53+) */
const FALLBACK_STATE: NotificationsState = {
  hasPermission:       false,
  pushToken:           null,
  remindersEnabled:    false,
  toggleReminders:     async () => {},
  notifyHabitComplete: async () => {},
  isLoading:           false,
  isSupported:         false,
};

export function useNotifications(): NotificationsState {
  const [state, setState] = useState<NotificationsState>({ ...FALLBACK_STATE, isLoading: true });
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        // Dynamic import so a crash here doesn't break the entire module graph
        const Notifications        = await import("expo-notifications");
        const { default: Device }  = await import("expo-device");
        const svc                  = await import("../services/notificationsService");

        // Configure foreground behavior
        svc.configureForegroundHandler();
        await svc.setupNotificationChannels();

        const granted = await svc.requestNotificationPermission();
        if (!active) return;

        let token: string | null = null;
        if (granted) {
          await svc.scheduleAllDailyReminders();
          token = await svc.getExpoPushToken();
        }

        if (!active) return;
        setState({
          hasPermission:    granted,
          pushToken:        token,
          remindersEnabled: granted,
          isLoading:        false,
          isSupported:      true,
          toggleReminders: async () => {
            if (granted) {
              await svc.cancelAllReminders();
              setState((s) => ({ ...s, remindersEnabled: false }));
            } else {
              const ok = await svc.requestNotificationPermission();
              if (ok) {
                await svc.scheduleAllDailyReminders();
                setState((s) => ({ ...s, remindersEnabled: true }));
              }
            }
          },
          notifyHabitComplete: async (key: HabitKey) => {
            if (!granted || notifiedRef.current.has(key)) return;
            notifiedRef.current.add(key);
            await svc.sendCompletionNotification(key);
          },
        });

        // Listeners (fire-and-forget, optional)
        Notifications.addNotificationReceivedListener((n) => {
          console.log("[Notifications] 📨 Received:", n.request.content.title);
        });

        console.log("[useNotifications] ✅ Initialized");
      } catch (e) {
        // expo-notifications not available in Expo Go SDK 53+
        console.warn("[useNotifications] ⚠️ Not available (Expo Go). Notifications disabled.");
        if (active) setState({ ...FALLBACK_STATE });
      }
    }

    init();
    return () => { active = false; };
  }, []);

  return state;
}
