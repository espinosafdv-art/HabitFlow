import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitForm } from "../../src/components/HabitForm";
import { useHabits } from "../../src/context/HabitsContext";
import { colors } from "../../src/utils/theme";
import type { HabitFormData } from "../../src/types";

export default function NewHabitScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const { addHabit } = useHabits();

  const handleSubmit = async (data: HabitFormData) => {
    await addHabit(data);
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Modal handle + header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.title}>✨ Nuevo hábito</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <HabitForm
        submitLabel="Crear hábito"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  handle: { position: "absolute", top: 8, left: "50%", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginLeft: -20 },
  title:  { flex: 1, color: colors.white, fontSize: 18, fontWeight: "700", textAlign: "center" },
  closeBtn: { padding: 8 },
  closeText: { color: colors.muted, fontSize: 20 },
});
