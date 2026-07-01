import { Tabs } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { colors } from "../../src/utils/theme";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[tab.wrap, focused && tab.active]}>
      <Text style={tab.emoji}>{emoji}</Text>
      <Text style={[tab.label, focused && { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor:  colors.cardBorder,
          borderTopWidth:  1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Hoy" focused={focused} /> }}
      />
      <Tabs.Screen
        name="habits"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Hábitos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="streaks"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" label="Rachas" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} /> }}
      />
    </Tabs>
  );
}

const tab = StyleSheet.create({
  wrap:   { alignItems: "center", paddingTop: 6 },
  active: {},
  emoji:  { fontSize: 22 },
  label:  { color: colors.muted, fontSize: 10, marginTop: 2 },
});
