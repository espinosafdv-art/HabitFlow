import React, { createContext, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationsState } from "../hooks/useNotifications";

const NotificationsContext = createContext<NotificationsState | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // useNotifications handles all errors internally and never throws
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsCtx(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsCtx must be inside NotificationsProvider");
  return ctx;
}
