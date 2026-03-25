/**
 * Tunable timing, layout, and phase constants for the lenses scroll.
 * Pure data — no React, no JSX, no side effects.
 */

/* ── Container ── */

/**
 * Must equal TUNED_CONTAINER_VH so that each raw progress unit maps to the
 * same physical scroll distance the old single-lens hook was tuned against.
 */
export const BASE_SCROLL_VH = 2400;

/**
 * The original single-lens container height (vh) that the thesis/curtain
 * timing was tuned against. Used for EC_TO_LOCAL_SCALE so the prologue pacing
 * stays identical. DO NOT CHANGE — this is the tuned reference value.
 */
export const TUNED_CONTAINER_VH = 2400;

/**
 * Max width for the content layer (px).
 * Cards live inside this container. Prevents layout blowup on ultra-wide.
 */
export const MAX_CONTENT_WIDTH = 1600;

export const SMOOTH_LERP_FACTOR = 0.07;

/* ── Phase 1: Thesis ── */

export const THESIS_PHASE_START = 0.0;
export const THESIS_PHASE_DURATION = 0.25;

/* ── Curtain ── */

/** Pause after thesis keywords land before curtain begins */
export const CURTAIN_PAUSE_AFTER_WORDS = 0.015;

/** Curtain sweep duration */
export const CURTAIN_SWEEP_DURATION = 0.08;

/* ── Crossfade ── */

/** Per-card scroll duration for crossfade style (raw progress units) */
export const CROSSFADE_PER_CARD = 0.10;

/* ── Curtain edge visual ── */

export const CURTAIN_EDGE = {
  accentLineHeight: 1,
  gradientOvershoot: 20,
  movingOpacity: 0.7,
} as const;

/* ── Z-index layers ── */

export const Z = {
  thesis: 1,
  curtain: 2,
  cards: 4,
  keyword: 10,
  debug: 999,
} as const;

/* ── Blur threshold ── */

export const BLUR_THRESHOLD = 0.1;
