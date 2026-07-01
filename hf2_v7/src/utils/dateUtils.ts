// ─── Date & Time Utilities ────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for today in local time */
export function toDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns current hour (0-23) */
export function currentHour(): number {
  return new Date().getHours();
}

/** Returns true if current time is in the nighttime window (21:00–06:00) */
export function isNighttime(): boolean {
  const h = currentHour();
  return h >= 21 || h < 6;
}

/** Greeting based on time of day */
export function getGreeting(): string {
  const h = currentHour();
  if (h >= 5 && h < 12)  return "¡Buenos días";
  if (h >= 12 && h < 19) return "¡Buenas tardes";
  return "¡Buenas noches";
}

/** Emoji matching greeting */
export function getGreetingEmoji(): string {
  const h = currentHour();
  if (h >= 5 && h < 12)  return "🌅";
  if (h >= 12 && h < 19) return "☀️";
  return "🌙";
}

/** Full date string: "jueves, 12 de junio de 2026" */
export function getFullDateString(): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

/** Locale-aware thousands separator: 10000 → "10,000" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-MX").format(Math.floor(n));
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
