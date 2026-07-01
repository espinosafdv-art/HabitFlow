import React, { createContext, useContext, useEffect } from "react";
import { usePedometer }     from "../hooks/usePedometer";
import { useAccelerometer } from "../hooks/useAccelerometer";
import { useGyroscope }     from "../hooks/useGyroscope";
import { useLightSensor }   from "../hooks/useLightSensor";
import { useHabits }        from "./HabitsContext";
import { useNotificationsCtx } from "./NotificationsContext";
import type { SensorsContextValue } from "../types/habits";

const SensorsContext = createContext<SensorsContextValue | null>(null);

/** Must be nested inside both HabitsProvider AND NotificationsProvider */
export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const { dispatch, habits }       = useHabits();
  const { notifyHabitComplete }    = useNotificationsCtx();

  const pedometer     = usePedometer();
  const accelerometer = useAccelerometer();
  const gyroscope     = useGyroscope();
  const light         = useLightSensor();

  // Pedometer → Steps
  useEffect(() => {
    const completed = pedometer.steps >= habits.steps.target;
    dispatch({ type: "UPDATE_STEPS", payload: { current: pedometer.steps, completed } });
    if (completed && !habits.steps.completed) notifyHabitComplete("steps");
  }, [pedometer.steps]);

  // Accelerometer → Exercise
  useEffect(() => {
    const completed = accelerometer.activityScore >= habits.exercise.target;
    dispatch({ type: "UPDATE_EXERCISE", payload: { activityScore: accelerometer.activityScore, completed } });
    if (completed && !habits.exercise.completed) notifyHabitComplete("exercise");
  }, [accelerometer.activityScore]);

  // Gyroscope → Focus
  useEffect(() => {
    const completed = gyroscope.minutesFlipped >= habits.focus.target;
    dispatch({ type: "UPDATE_FOCUS", payload: { minutesFlipped: gyroscope.minutesFlipped, completed } });
    if (completed && !habits.focus.completed) notifyHabitComplete("focus");
  }, [gyroscope.minutesFlipped]);

  // LightSensor → Sleep
  useEffect(() => {
    dispatch({ type: "UPDATE_SLEEP", payload: { maxDarknessLux: light.minLuxTonight, completed: light.completed } });
    if (light.completed && !habits.sleep.completed) notifyHabitComplete("sleep");
  }, [light.completed, light.minLuxTonight]);

  const value: SensorsContextValue = {
    sensorStatus: {
      pedometer:     pedometer.isAvailable,
      accelerometer: true,
      gyroscope:     true,
      lightSensor:   light.isAvailable,
    },
    isIOSLightFallback: light.isIOSFallback,
  };

  return <SensorsContext.Provider value={value}>{children}</SensorsContext.Provider>;
}

export function useSensors(): SensorsContextValue {
  const ctx = useContext(SensorsContext);
  if (!ctx) throw new Error("useSensors must be inside SensorsProvider");
  return ctx;
}
