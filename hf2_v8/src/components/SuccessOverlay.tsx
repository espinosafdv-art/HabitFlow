import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { colors } from "../utils/theme";

export function SuccessOverlay({ completed }: { completed: boolean }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const wasRef  = useRef(false);

  useEffect(() => {
    if (completed && !wasRef.current) {
      wasRef.current = true;
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(scale,   { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]).start();
        }, 1500);
      });
    }
    if (!completed) {
      wasRef.current = false;
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [completed]);

  if (!completed) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity, transform: [{ scale }] }]}>
      <View style={styles.circle}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.label}>¡Completado!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems:     "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius:    16,
    zIndex:          10,
  },
  circle: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: colors.success,
    justifyContent:  "center",
    alignItems:      "center",
    shadowColor:     colors.success,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.6,
    shadowRadius:    12,
    elevation:       10,
  },
  check: { fontSize: 26, color: "#fff", fontWeight: "bold" },
  label: { color: colors.success, marginTop: 6, fontSize: 12, fontWeight: "500" },
});
