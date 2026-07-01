import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, "users", cred.user.uid, "profile", "info"), {
    email,
    displayName,
    isAnonymous: false,
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ─── Anonymous ────────────────────────────────────────────────────────────────
export async function loginAnonymously(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}
