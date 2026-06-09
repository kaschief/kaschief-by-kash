/**
 * Shared motion + layout tokens for lab-builder variants.
 *
 * Every variant pulls its timing/easing from here so the five scenes feel
 * like siblings rather than strangers. Per-variant flavour lives in local
 * consts inside each scene, never here.
 */

export const MOTION = {
  duration: {
    instant: 0.18,
    fast: 0.32,
    base: 0.6,
    slow: 1.1,
  },
  ease: {
    /** Default — smooth deceleration for entrances. */
    silk: [0.22, 1, 0.36, 1] as const,
    /** For heavier, draped movements (curtains, covers). */
    drape: [0.7, 0, 0.2, 1] as const,
    /** Snappy — for micro-interactions. */
    snap: [0.4, 0, 0.2, 1] as const,
  },
} as const;

export const CHART_FRAME = {
  /** Max chart width on desktop; prevents super-wide stretching. */
  maxWidthClass: "max-w-[1400px]",
  /** Subtle elevation token used across frames. */
  ringClass: "ring-1 ring-white/5",
} as const;
