import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { colors } from "../utils/theme";

interface ProgressBarProps {
  progress: number;    // 0.0 → 1.0
  color?: string;
  height?: number;
  animDuration?: number;
}

export function ProgressBar({ progress, color = colors.primary, height = 8, animDuration = 800 }: ProgressBarProps) {
  const animValue   = useRef(new Animated.Value(0)).current;
  const clamped     = Math.min(Math.max(progress, 0), 1);
  const isComplete  = clamped >= 1;
  const activeColor = isComplete ? colors.success : color;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: clamped,
      duration: animDuration,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: activeColor,
            width: animValue.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            ...(isComplete
              ? { shadowColor: colors.success, shadowOpacity: 0.8, shadowRadius: 6, elevation: 8 }
              : { shadowColor: color, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill:  { shadowOffset: { width: 0, height: 0 } },
});
