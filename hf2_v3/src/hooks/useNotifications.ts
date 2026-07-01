import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermission,
  scheduleAllDailyReminders,
  cancelAllReminders,
  sendCompletionNotification,
  getExpoPushToken,
  configureForegroundHandler,
  setupNotificationChannels,
} from "../services/notificationsService";
import type { HabitKey } from "../types/habits";

export interface NotificationsState {
  hasPermission:   boolean;
  pushToken:       string | null;
  remindersEnabled: boolean;
  toggleReminders: () => Promise<void>;
  notifyHabitComplete: (key: HabitKey) => Promise<void>;
  isLoading:       boolean;
}

export function useNotifications(): NotificationsState {
  const [hasPermission,    setHasPermission]    = useState(false);
  const [pushToken,        setPushToken]         = useState<string | null>(null);
  const [remindersEnabled, setRemindersEnabled]  = useState(true);
  const [isLoading,        setIsLoading]         = useState(true);

  const notifiedRef = useRef(new Set<string>());
  const receivedRef = useRef<Notifications.EventSubscription | null>(null);
  const responseRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    let active = true;

    async function init() {
      configureForegroundHandler();
      await setupNotificationChannels();

      const granted = await requestNotificationPermission();
      if (!active) return;
      setHasPermission(granted);

      if (granted) {
        await scheduleAllDailyReminders();
        const token = await getExpoPushToken();
        if (active) setPushToken(token);
      }
      if (active) setIsLoading(false);
    }

    init();

    receivedRef.current = Notifications.addNotificationReceivedListener((n) => {
      console.log("[Notifications] 📨 Received:", n.request.content.title);
    });
    responseRef.current = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log("[Notifications] 👆 Tapped:", r.notification.request.content.data);
    });

    return () => {
      active = false;
      receivedRef.current?.remove();
      responseRef.current?.remove();
    };
  }, []);

  const toggleReminders = async () => {
    if (remindersEnabled) {
      await cancelAllReminders();
      setRemindersEnabled(false);
    } else {
      const ok = await requestNotificationPermission();
      if (ok) { await scheduleAllDailyReminders(); setRemindersEnabled(true); }
    }
  };

  const notifyHabitComplete = async (key: HabitKey) => {
    if (!hasPermission || notifiedRef.current.has(key)) return;
    notifiedRef.current.add(key);
    await sendCompletionNotification(key);
  };

  return { hasPermission, pushToken, remindersEnabled, toggleReminders, notifyHabitComplete, isLoading };
}
