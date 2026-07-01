import { useState, useEffect, useRef } from "react";
import { Gyroscope, Accelerometer } from "expo-sensors";
import { isFaceDown, isDeviceStable } from "../utils/sensorMath";

export interface GyroscopeState {
  minutesFlipped: number;
}

const GYRO_POLL_MS  = 500;
const TICK_INTERVAL = 5000; // award 5s chunks when stable+facedown

/**
 * Combines Gyroscope (stability) + Accelerometer (face-down) to detect
 * when the device is placed screen-down on a surface for focus tracking.
 * Accumulates time in minutes.
 */
export function useGyroscope(): GyroscopeState {
  const [minutesFlipped, setMinutesFlipped] = useState(0);

  const isFaceDownRef  = useRef(false);
  const isStableRef    = useRef(false);
  const msAccumRef     = useRef(0);
  const lastTickRef    = useRef<number | null>(null);

  // Accel: face-down detection
  useEffect(() => {
    Accelerometer.setUpdateInterval(GYRO_POLL_MS);
    const sub = Accelerometer.addListener(({ z }) => {
      isFaceDownRef.current = isFaceDown(z);
    });
    return () => sub.remove();
  }, []);

  // Gyro: stability detection + timer accumulation
  useEffect(() => {
    Gyroscope.setUpdateInterval(GYRO_POLL_MS);
    const sub = Gyroscope.addListener(({ x, y, z }) => {
      isStableRef.current = isDeviceStable(x, y, z);

      if (isFaceDownRef.current && isStableRef.current) {
        const now = Date.now();
        if (lastTickRef.current === null) {
          lastTickRef.current = now;
        } else if (now - lastTickRef.current >= TICK_INTERVAL) {
          msAccumRef.current += TICK_INTERVAL;
          lastTickRef.current = now;
          setMinutesFlipped(Math.floor(msAccumRef.current / 60000));
        }
      } else {
        lastTickRef.current = null; // reset tick on movement
      }
    });
    console.log("[Gyroscope] ✅ Subscription active");
    return () => sub.remove();
  }, []);

  return { minutesFlipped };
}
