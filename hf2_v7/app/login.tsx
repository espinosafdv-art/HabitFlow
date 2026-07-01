import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { colors, radii, shadows } from "../src/utils/theme";

type Mode = "login" | "register";

export default function LoginScreen() {
  const router   = useRouter();
  const { login, register, loginAsGuest } = useAuth();

  const [mode,     setMode]     = useState<Mode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Ingresa tu correo y contraseña."); return;
    }
    if (mode === "register" && !name.trim()) {
      Alert.alert("Campos requeridos", "Ingresa tu nombre."); return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      router.replace("/(tabs)/");
    } catch (e: any) {
      const msg = e?.code === "auth/wrong-password"        ? "Contraseña incorrecta."
                : e?.code === "auth/user-not-found"        ? "No existe una cuenta con ese correo."
                : e?.code === "auth/email-already-in-use"  ? "Ese correo ya está registrado."
                : e?.code === "auth/weak-password"         ? "La contraseña debe tener al menos 6 caracteres."
                : "Error al conectar. Verifica tu conexión.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      router.replace("/(tabs)/");
    } catch {
      Alert.alert("Error", "No se pudo continuar como invitado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💜</Text>
          </View>
          <Text style={styles.logoTitle}>HabitFlow</Text>
          <Text style={styles.logoSub}>Construye hábitos que duran</Text>
        </View>

        {/* Mode tabs */}
        <View style={styles.tabs}>
          {(["login", "register"] as Mode[]).map((m) => (
            <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabActive]}>
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "register" && (
            <>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.muted}
                autoComplete="name"
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.fieldLabel}>Contraseña</Text>
          <View style={styles.passWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPass}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.submitText}>
                  {mode === "login" ? "Entrar" : "Crear cuenta"}
                </Text>
            }
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>o</Text>
          <View style={styles.divLine} />
        </View>

        {/* Guest */}
        <Pressable
          onPress={handleGuest}
          disabled={loading}
          style={styles.guestBtn}
        >
          <Text style={styles.guestText}>👤 Continuar como invitado</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Al continuar aceptas que tus datos se almacenan de forma segura en Firebase.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  logoWrap:   { alignItems: "center", marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(108,99,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
    ...shadows.card,
  },
  logoEmoji: { fontSize: 40 },
  logoTitle: { color: colors.white, fontSize: 32, fontWeight: "800" },
  logoSub:   { color: colors.muted, fontSize: 14, marginTop: 4 },

  tabs:         { flexDirection: "row", backgroundColor: colors.card, borderRadius: radii.lg, padding: 4, marginBottom: 24 },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: radii.md, alignItems: "center" },
  tabActive:    { backgroundColor: colors.primary },
  tabText:      { color: colors.muted, fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: colors.white },

  form:        { gap: 0 },
  fieldLabel:  { color: colors.muted, fontSize: 12, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1,
    borderColor: colors.cardBorder, color: colors.white, fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  passWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  eyeBtn:  { paddingHorizontal: 14 },
  eyeText: { fontSize: 18 },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radii.md,
    paddingVertical: 15, alignItems: "center", marginTop: 24,
    ...shadows.glow(colors.primary),
  },
  submitText: { color: colors.white, fontSize: 16, fontWeight: "700" },

  divRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  divText: { color: colors.muted, fontSize: 13 },

  guestBtn:  {
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingVertical: 14, alignItems: "center",
  },
  guestText:  { color: colors.muted, fontSize: 15 },
  disclaimer: { color: colors.border, fontSize: 10, textAlign: "center", marginTop: 24 },
});
