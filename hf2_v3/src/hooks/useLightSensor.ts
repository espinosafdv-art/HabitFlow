import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { LightSensor } from "expo-sensors";
import { isDark, DARK_LUX_THRESHOLD } from "../utils/sensorMath";
import { isNighttime } from "../utils/dateUtils";

export interface LightSensorState {
  minLuxTonight: number;
  completed: boolean;
  isAvailable: boolean;
  isIOSFallback: boolean;
}

const DARK_DURATION_MS = 60_000; // 60s of darkness → completed

/**
 * Android-only light sensor hook.
 * On iOS returns a fallback state (sensor is not accessible).
 *
 * Records minimum lux during nighttime window (21:00–06:00).
 * Marks completed after 60 consecutive seconds below threshold.
 */
export function useLightSensor(): LightSensorState {
  const isIOS = Platform.OS === "ios";

  const [minLux,    setMinLux]    = useState(999);
  const [completed, setCompleted] = useState(false);

  const darkSinceRef = useRef<number | null>(null);
  const minLuxRef    = useRef(999);

  useEffect(() => {
    if (isIOS) return; // Light sensor not available on iOS

    LightSensor.setUpdateInterval(2000);
    const sub = LightSensor.addListener(({ illuminance }) => {
      if (!isNighttime()) return;

      // Track minimum lux
      if (illuminance < minLuxRef.current) {
        minLuxRef.current = illuminance;
        setMinLux(illuminance);
      }

      // Track consecutive darkness duration
      if (isDark(illuminance)) {
        if (darkSinceRef.current === null) darkSinceRef.current = Date.now();
        if (Date.now() - darkSinceRef.current >= DARK_DURATION_MS) {
          setCompleted(true);
          console.log("[LightSensor] ✅ Sleep habit completed");
        }
      } else {
        darkSinceRef.current = null; // reset if light comes back
      }
    });

    console.log("[LightSensor] ✅ Subscription active (Android)");
    return () => sub.remove();
  }, [isIOS]);

  if (isIOS) {
    return { minLuxTonight: 999, completed: false, isAvailable: false, isIOSFallback: true };
  }

  return { minLuxTonight: minLux, completed, isAvailable: true, isIOSFallback: false };
}
