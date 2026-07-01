import { useState, useEffect, useRef } from "react";
import { Pedometer } from "expo-sensors";

export interface PedometerState {
  steps: number;
  isAvailable: boolean;
}

/**
 * Tracks daily step count using expo-sensors Pedometer.
 * Combines start-of-day baseline with a live subscription.
 */
export function usePedometer(): PedometerState {
  const [steps, setSteps]           = useState(0);
  const [isAvailable, setAvailable] = useState(false);
  const baselineRef                  = useRef(0);

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;
    let mounted = true;

    async function init() {
      const { granted } = await Pedometer.requestPermissionsAsync();
      if (!granted || !mounted) return;

      const available = await Pedometer.isAvailableAsync();
      if (!mounted) return;
      setAvailable(available);
      if (!available) return;

      // Get steps since midnight as baseline
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      try {
        const past = await Pedometer.getStepCountAsync(midnight, new Date());
        if (mounted && past) {
          baselineRef.current = past.steps;
          setSteps(past.steps);
        }
      } catch {
        // HealthKit not configured — live only
      }

      // Live subscription (adds steps since subscription start)
      subscription = Pedometer.watchStepCount((result) => {
        if (mounted) setSteps(baselineRef.current + result.steps);
      });
      console.log("[Pedometer] ✅ Live subscription active");
    }

    init();
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return { steps, isAvailable };
}
