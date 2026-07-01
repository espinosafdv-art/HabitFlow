import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export interface LocationState {
  distanceMeters: number;
  isAvailable:    boolean;
  currentCoords:  { lat: number; lon: number } | null;
}

/** Haversine distance between two GPS coordinates in meters */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R  = 6_371_000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Minimum displacement to count as real movement (filters GPS drift) */
const MIN_DISPLACEMENT_M = 5;

/**
 * 📍 Location hook — hábito "Distancia recorrida"
 *
 * Solicita permiso de ubicación en primer plano y suscribe actualizaciones GPS.
 * Acumula la distancia real recorrida (Haversine) descartando drift < 5 m.
 * Meta: 1000 m = hábito completado.
 */
export function useLocation(): LocationState {
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [isAvailable,    setAvailable]      = useState(false);
  const [currentCoords,  setCurrentCoords]  = useState<{ lat: number; lon: number } | null>(null);

  const totalRef   = useRef(0);
  const prevLatRef = useRef<number | null>(null);
  const prevLonRef = useRef<number | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let mounted = true;

    async function init() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || !mounted) {
          console.warn("[Location] ❌ Permiso de ubicación denegado");
          return;
        }
        if (!mounted) return;
        setAvailable(true);

        // Get initial position
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        prevLatRef.current = initial.coords.latitude;
        prevLonRef.current = initial.coords.longitude;
        setCurrentCoords({ lat: initial.coords.latitude, lon: initial.coords.longitude });

        // Live subscription — updates every 10 m or 15 s
        sub = await Location.watchPositionAsync(
          {
            accuracy:          Location.Accuracy.Balanced,
            distanceInterval:  10,   // meters
            timeInterval:      15_000, // ms fallback
          },
          (pos) => {
            if (!mounted) return;
            const { latitude: lat, longitude: lon } = pos.coords;
            setCurrentCoords({ lat, lon });

            if (prevLatRef.current !== null && prevLonRef.current !== null) {
              const delta = haversineMeters(prevLatRef.current, prevLonRef.current, lat, lon);
              if (delta >= MIN_DISPLACEMENT_M) {
                totalRef.current += delta;
                setDistanceMeters(totalRef.current);
                console.log(`[Location] 📍 +${delta.toFixed(1)} m → total ${totalRef.current.toFixed(0)} m`);
              }
            }
            prevLatRef.current = lat;
            prevLonRef.current = lon;
          }
        );
        console.log("[Location] ✅ Subscripción GPS activa");
      } catch (e) {
        console.error("[Location] Error:", e);
      }
    }

    init();
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);

  return { distanceMeters, isAvailable, currentCoords };
}
