// ─── Sensor Math Utilities ────────────────────────────────────────────────────

/** Magnitude of a 3-axis acceleration vector: V = √(x²+y²+z²) */
export function calcMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/** Motion threshold above gravity (1.0 g). Walking ≈ 1.2–1.6, running ≈ 1.6–2.5 */
export const MOVEMENT_THRESHOLD = 1.35;

/** Z-axis threshold for face-down detection (-1.0 = full inversion) */
export const FLIP_Z_THRESHOLD = -0.75;

/** Max angular velocity (rad/s) for a "stable" device */
export const STABLE_GYRO_THRESHOLD = 0.15;

/** Lux below which environment is "dark" (sleep habit) */
export const DARK_LUX_THRESHOLD = 5;

export function isMoving(x: number, y: number, z: number): boolean {
  return calcMagnitude(x, y, z) > MOVEMENT_THRESHOLD;
}

export function isFaceDown(accelZ: number): boolean {
  return accelZ < FLIP_Z_THRESHOLD;
}

export function isDeviceStable(gx: number, gy: number, gz: number): boolean {
  return (
    Math.abs(gx) < STABLE_GYRO_THRESHOLD &&
    Math.abs(gy) < STABLE_GYRO_THRESHOLD &&
    Math.abs(gz) < STABLE_GYRO_THRESHOLD
  );
}

export function isDark(lux: number): boolean {
  return lux < DARK_LUX_THRESHOLD;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Progress ratio [0, 1] */
export function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp(current / target, 0, 1);
}
