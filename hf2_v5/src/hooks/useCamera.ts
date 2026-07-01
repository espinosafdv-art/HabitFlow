import { useState, useRef, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";

export interface CameraState {
  photosToday:  number;
  lastPhotoUri: string | null;
  isAvailable:  boolean;
  takePhoto:    () => Promise<void>;
}

/**
 * 📸 Camera hook — hábito "Foto del día"
 *
 * Permite al usuario tomar una foto con la cámara del dispositivo.
 * Cada foto tomada incrementa el contador diario.
 * Meta: 1 foto = hábito completado.
 */
export function useCamera(): CameraState {
  const [photosToday,  setPhotosToday]  = useState(0);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [isAvailable,  setAvailable]    = useState(true);
  const countRef = useRef(0);

  const takePhoto = useCallback(async () => {
    try {
      // Solicitar permiso de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        setAvailable(false);
        console.warn("[Camera] ❌ Permiso de cámara denegado");
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality:    0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        countRef.current += 1;
        setPhotosToday(countRef.current);
        setLastPhotoUri(uri);
        console.log(`[Camera] 📸 Foto #${countRef.current} tomada:`, uri);
      }
    } catch (e) {
      console.error("[Camera] Error al tomar foto:", e);
    }
  }, []);

  return { photosToday, lastPhotoUri, isAvailable, takePhoto };
}
