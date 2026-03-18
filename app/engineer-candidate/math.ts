/* ==================================================================
   Shared math utilities for Act II scroll animations.
   Single source of truth — imported by page.tsx, forge-data.tsx,
   and re-exported from forge-sankey-data.ts.
   ================================================================== */

/** Clamp value between min and max. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Hermite smoothstep: maps x from [edge0, edge1] to [0, 1] with
 * smooth acceleration/deceleration. Used everywhere for scroll-driven
 * fade-ins, fade-outs, and transitions.
 *
 * Aliased as `ss` for brevity in scroll callback code.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Short alias for smoothstep — used in scroll callbacks. */
export const ss = smoothstep;

/** Linear interpolation from a to b by factor t (0–1). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Remap value from [inMin, inMax] to [outMin, outMax], clamped.
 * Equivalent to lerp(outMin, outMax, smoothstep(inMin, inMax, value))
 * but using linear (not smooth) interpolation for the output range.
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}
