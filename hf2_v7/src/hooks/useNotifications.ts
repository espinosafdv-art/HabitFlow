import { useState, useEffect, useRef, useCallback } from "react";

export interface NotificationsState {
  hasPermission:    boolean;
  pushToken:        string | null;
  remindersEnabled: boolean;
  isLoading:        boolean;
  isSupported:      boolean;
  toggleReminders:       () => Promise<void>;
  notifyHabitComplete:   (habitName: string, emoji?: string) => Promise<void>;
}

const FALLBACK: NotificationsState = {
  hasPermission:       false,
  pushToken:           null,
  remindersEnabled:    false,
  isLoading:           false,
  isSupported:         false,
  toggleReminders:     async () => {},
  notifyHabitComplete: async () => {},
};

export function useNotifications(): NotificationsState {
  const [state, setState] = useState<NotificationsState>({ ...FALLBACK, isLoading: true });
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const Notifications = await import("expo-notifications");
        const svc           = await import("../services/notificationsService");

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

          notifyHabitComplete: async (habitName: string, emoji = "✅") => {
            // Debounce: only notify once per habit per session
            if (notifiedRef.current.has(habitName)) return;
            notifiedRef.current.add(habitName);
            await svc.sendCompletionNotification(habitName, emoji);
          },
        });

        Notifications.addNotificationReceivedListener((n) => {
          console.log("[Notifications] 📨", n.request.content.title);
        });

        console.log("[useNotifications] ✅ Ready");
      } catch (e) {
        console.warn("[useNotifications] ⚠️ Not available (Expo Go). Notifications disabled.");
        if (active) setState({ ...FALLBACK });
      }
    }

    init();
    return () => { active = false; };
  }, []);

  return state;
}
