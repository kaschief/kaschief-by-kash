/**
 * Motion design tokens shared across the app.
 *
 * Why this lives in utilities (not components):
 * - These values are cross-cutting configuration, not UI primitives.
 * - Keeps animation behavior consistent without coupling to component modules.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const TRANSITION = {
  snap: { duration: 0.15, ease: "easeOut" as const }, // backdrop / near-instant covers
  fast: { duration: 0.25, ease: EASE },
  base: { duration: 0.45, ease: EASE },
  slow: { duration: 0.7, ease: EASE },
  page: { duration: 0.9, ease: EASE },
} as const;

/** String form for use in CSS `transition` properties. */
export const CSS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Scroll progress input range shared by act section glow animation.
 * Typed as number[] (not readonly) to satisfy Framer Motion's InputRange.
 */
export const SCROLL_RANGE: { glow: number[] } = {
  glow: [0, 0.3, 0.7, 1],
};

/** Output opacity values for section glows (paired with SCROLL_RANGE.glow). */
export const GLOW_OPACITY: number[] = [0, 0.5, 0.5, 0];

/** Transition for infinitely repeating pulse animations (dots, eyebrows). */
export const PULSE_TRANSITION = { duration: 3, repeat: Infinity } as const;
