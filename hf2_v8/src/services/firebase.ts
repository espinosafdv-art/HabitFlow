import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence, connectAuthEmulator } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Firebase Config ──────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_* variables in your .env file
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? "demo-key",
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "demo.firebaseapp.com",
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? "demo-project",
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? "1:000:web:000",
};

// ─── Singleton Initialization ─────────────────────────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// ─── Auth con persistencia en AsyncStorage ────────────────────────────────────
// Esto evita el WARN: "You are initializing Firebase Auth without providing AsyncStorage"
// y permite que la sesión del usuario persista entre reinicios de la app.
export const auth = getApps().length === 1
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);


// ─── Emulator (dev only) ──────────────────────────────────────────────────────
let _emulatorsConnected = false;
if (__DEV__ && process.env.EXPO_PUBLIC_USE_EMULATOR === "true" && !_emulatorsConnected) {
  _emulatorsConnected = true;
  connectFirestoreEmulator(db,   "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  console.log("[Firebase] 🔌 Emulators connected");
}
