// ─── Design System Tokens ─────────────────────────────────────────────────────
// Single source of truth for all colors and reusable style fragments.
// Use these instead of hardcoded values throughout the app.

export const colors = {
  bg:           "#13131F",
  card:         "#1E1E2E",
  cardBorder:   "rgba(255,255,255,0.07)",
  primary:      "#6C63FF",
  success:      "#22C55E",
  warning:      "#F59E0B",
  accent:       "#FF6584",
  muted:        "#A0A0B2",
  white:        "#FFFFFF",
  border:       "#2A2A3E",
} as const;

/** Habit-specific accent colors keyed by habit ID */
export const habitColors: Record<string, string> = {
  steps:    colors.primary,
  exercise: colors.accent,
  focus:    colors.warning,
  sleep:    colors.success,
};

/** Reusable shadow presets */
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  }),
} as const;

/** Reusable border radius values */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

/** Typography scale */
export const typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  lg:   { fontSize: 18, lineHeight: 26 },
  xl:   { fontSize: 22, lineHeight: 30 },
  xxl:  { fontSize: 28, lineHeight: 36 },
} as const;
