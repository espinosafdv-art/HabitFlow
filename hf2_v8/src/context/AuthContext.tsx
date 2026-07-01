import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../services/firebase";
import {
  loginWithEmail,
  loginAnonymously,
  registerWithEmail,
  logout,
} from "../services/authService";
import type { UserProfile } from "../types";

interface AuthContextValue {
  user:        User | null;
  profile:     UserProfile | null;
  isLoading:   boolean;
  login:       (email: string, pass: string) => Promise<void>;
  register:    (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest:() => Promise<void>;
  signOut:     () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const profile: UserProfile | null = user
    ? { uid: user.uid, email: user.email, displayName: user.displayName, isAnonymous: user.isAnonymous }
    : null;

  const login = async (email: string, pass: string) => {
    const u = await loginWithEmail(email, pass);
    await AsyncStorage.setItem("@hf/uid", u.uid);
  };

  const register = async (email: string, pass: string, name: string) => {
    const u = await registerWithEmail(email, pass, name);
    await AsyncStorage.setItem("@hf/uid", u.uid);
  };

  const loginAsGuest = async () => {
    const u = await loginAnonymously();
    await AsyncStorage.setItem("@hf/uid", u.uid);
  };

  const signOut = async () => {
    await logout();
    await AsyncStorage.removeItem("@hf/uid");
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, loginAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
