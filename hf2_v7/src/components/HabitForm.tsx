import React, { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { colors, radii } from "../utils/theme";
import type { HabitFormData, SensorType } from "../types";

// ─── Presets ──────────────────────────────────────────────────────────────────
export const PRESET_EMOJIS = [
  "📸","🏃","🧠","📍","💪","🏋","🚴","🏊","🧘","📚",
  "🎯","💧","🌿","😴","⭐","🔥","✨","🎨","🎵","🍎",
  "🏆","💊","🛏","☕","🌅","🦷","🧴","🏔","🌊","💼",
];

export const PRESET_COLORS = [
  "#6C63FF","#FF6584","#F59E0B","#22C55E",
  "#3B82F6","#14B8A6","#EC4899","#F97316",
];

export const SENSOR_OPTIONS: { value: SensorType; label: string; icon: string; defaultUnit: string }[] = [
  { value: "manual",        label: "Manual",        icon: "👆", defaultUnit: "veces" },
  { value: "camera",        label: "Cámara",        icon: "📸", defaultUnit: "foto" },
  { value: "accelerometer", label: "Acelerómetro",  icon: "🏃", defaultUnit: "pts" },
  { value: "gyroscope",     label: "Giroscopio",    icon: "🧠", defaultUnit: "min" },
  { value: "location",      label: "GPS",           icon: "📍", defaultUnit: "m" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface HabitFormProps {
  initialData?: Partial<HabitFormData>;
  onSubmit:     (data: HabitFormData) => Promise<void>;
  submitLabel:  string;
  onCancel:     () => void;
}

const DEFAULT_FORM: HabitFormData = {
  name:        "",
  emoji:       "⭐",
  color:       "#6C63FF",
  target:      1,
  unit:        "veces",
  description: "",
  sensorType:  "manual",
};

export function HabitForm({ initialData, onSubmit, submitLabel, onCancel }: HabitFormProps) {
  const [form,      setForm]      = useState<HabitFormData>({ ...DEFAULT_FORM, ...initialData });
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof HabitFormData, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSensorChange = (sensorType: SensorType) => {
    const opt = SENSOR_OPTIONS.find((o) => o.value === sensorType)!;
    setForm((f) => ({ ...f, sensorType, unit: opt.defaultUnit }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { Alert.alert("Error", "El nombre del hábito es requerido."); return; }
    if (form.target <= 0)  { Alert.alert("Error", "La meta debe ser mayor a 0."); return; }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      Alert.alert("Error", "No se pudo guardar el hábito.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Preview pill */}
        <View style={[styles.preview, { backgroundColor: `${form.color}20`, borderColor: `${form.color}50` }]}>
          <Text style={styles.previewEmoji}>{form.emoji}</Text>
          <Text style={[styles.previewName, { color: form.color }]}>{form.name || "Mi hábito"}</Text>
        </View>

        {/* Name */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(v) => update("name", v)}
          placeholder="Ej. Meditar 10 minutos"
          placeholderTextColor={colors.muted}
          maxLength={40}
        />

        {/* Description */}
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => update("description", v)}
          placeholder="¿Qué quieres lograr con este hábito?"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          maxLength={120}
        />

        {/* Emoji picker */}
        <Text style={styles.label}>Ícono</Text>
        <View style={styles.emojiGrid}>
          {PRESET_EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => update("emoji", e)}
              style={[styles.emojiBtn, form.emoji === e && { backgroundColor: `${form.color}30`, borderColor: form.color }]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>

        {/* Color picker */}
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {PRESET_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => update("color", c)}
              style={[styles.colorDot, { backgroundColor: c },
                form.color === c && styles.colorDotSelected]}
            />
          ))}
        </View>

        {/* Sensor type */}
        <Text style={styles.label}>Tipo de seguimiento</Text>
        <View style={styles.sensorGrid}>
          {SENSOR_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleSensorChange(opt.value)}
              style={[styles.sensorBtn,
                form.sensorType === opt.value && { backgroundColor: `${form.color}20`, borderColor: form.color }]}
            >
              <Text style={styles.sensorIcon}>{opt.icon}</Text>
              <Text style={[styles.sensorLabel, form.sensorType === opt.value && { color: form.color }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Target */}
        <View style={styles.targetRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Meta diaria</Text>
            <TextInput
              style={styles.input}
              value={String(form.target)}
              onChangeText={(v) => update("target", Number(v.replace(/[^0-9]/g, "")) || 1)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.label}>Unidad</Text>
            <TextInput
              style={styles.input}
              value={form.unit}
              onChangeText={(v) => update("unit", v)}
              placeholder="pasos, min, fotos…"
              placeholderTextColor={colors.muted}
              maxLength={15}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.btnRow}>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: form.color }, submitting && { opacity: 0.6 }]}
          >
            <Text style={styles.submitText}>{submitting ? "Guardando…" : submitLabel}</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll:   { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  label:    { color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 16 },
  input:    {
    backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1,
    borderColor: colors.cardBorder, color: colors.white, fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  textArea: { height: 80, textAlignVertical: "top" },

  preview:   { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radii.lg, borderWidth: 1, padding: 14, marginTop: 8 },
  previewEmoji: { fontSize: 30 },
  previewName:  { fontSize: 18, fontWeight: "700", flex: 1 },

  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiBtn:  { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent", backgroundColor: colors.card },
  emojiText: { fontSize: 22 },

  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: colors.white, transform: [{ scale: 1.15 }] },

  sensorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sensorBtn:  {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card,
    alignItems: "center", minWidth: "30%",
  },
  sensorIcon:  { fontSize: 20, marginBottom: 4 },
  sensorLabel: { color: colors.muted, fontSize: 11, fontWeight: "500" },

  targetRow: { flexDirection: "row" },
  btnRow:    { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: "center",
  },
  cancelText:  { color: colors.muted, fontSize: 15 },
  submitBtn:   { flex: 2, paddingVertical: 14, borderRadius: radii.md, alignItems: "center" },
  submitText:  { color: colors.white, fontSize: 15, fontWeight: "700" },
});
