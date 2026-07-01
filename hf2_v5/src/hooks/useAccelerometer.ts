import { useState, useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";
import { isMoving } from "../utils/sensorMath";

export interface AccelerometerState {
  activityScore: number;
}

const POLL_MS = 500;
const SCORE_INCREMENT = 1; // points per active sample

/**
 * Measures activity using magnitude of the acceleration vector.
 * Every POLL_MS interval where magnitude > threshold increments the score.
 */
export function useAccelerometer(): AccelerometerState {
  const [activityScore, setActivityScore] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(POLL_MS);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      if (isMoving(x, y, z)) {
        scoreRef.current += SCORE_INCREMENT;
        setActivityScore(scoreRef.current);
      }
    });
    console.log("[Accelerometer] ✅ Subscription active");
    return () => sub.remove();
  }, []);

  return { activityScore };
}
