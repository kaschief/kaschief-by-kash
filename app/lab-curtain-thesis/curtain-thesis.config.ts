/**
 * All tunable timing, layout, and phase constants for the curtain-thesis scroll.
 * Pure data — no React, no JSX, no side effects.
 *
 * use-curtain-thesis.tsx imports these and drives the RAF loop.
 * card-config.tsx holds per-card identity/layout/focus config.
 */

/* ── Container ── */

export const CONTAINER_HEIGHT_VH = 900;

export const SMOOTH_LERP_FACTOR = 0.07;

/** Ratio used to estimate a card's height from its width (aspect ratio ~5:3) */
export const CARD_HEIGHT_RATIO = 0.6;

/** Zone split: cards above this Y% are "upper", below are "lower" */
export const ZONE_SPLIT_Y = 50;

/* ── Phase 1: Thesis ── */

export const THESIS_PHASE_START = 0.0;
export const THESIS_PHASE_DURATION = 0.25;

/* ── Phase 5: Artifact shuffle-in ── */

export const ARTIFACT_SHUFFLE = {
  stagger: 0.04,
  entranceDuration: 0.1,
  opacityRamp: 2.5,
} as const;

/* ── Phase 4: Post-curtain subtitle ── */

export const SUBTITLE = {
  fadeInDelay: 0.02,
  fadeInDuration: 0.03,
  fadeOutDuration: 0.03,
  fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
} as const;

/* ── Phase 6: Keyword rise ── */

export const KEYWORD_RISE = {
  holdAfterShrink: 0.03,
  duration: 0.06,
  endTopPercent: 3,
  endFontSizeVw: 2.8,
} as const;

/* ── Phase 7: Focus cycle ── */

export const FOCUS_CYCLE = {
  rampIn: 0.02,
  hold: 0.14,
  rampOut: 0.03,
  cardGap: -0.01,
  nudgeX: 1.5,
  nudgeY: -1,
  nudgeScale: 1.02,
  dimRampDuration: 0.05,
} as const;

/** Total scroll distance per card: rampIn + hold + rampOut */
export const FOCUS_CARD_TOTAL =
  FOCUS_CYCLE.rampIn + FOCUS_CYCLE.hold + FOCUS_CYCLE.rampOut;

/** Stagger between card spotlight starts (total + gap, gap can be negative for overlap) */
export const FOCUS_CARD_STAGGER = FOCUS_CARD_TOTAL + FOCUS_CYCLE.cardGap;

/* ── Phase 2: Curtain edge ── */

export const CURTAIN_EDGE = {
  accentLineHeight: 1,
  gradientOvershoot: 20,
  movingOpacity: 0.7,
} as const;

/* ── Shadows ── */

export const CARD_SHADOWS = {
  light: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
  dark: "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(225,86,124,0.08)",
} as const;

/* ── Z-index layers ── */

export const Z = {
  thesis: 1,
  curtain: 2,
  cards: 4,       // cards use Z.cards + i
  keyword: 10,
  debug: 999,
} as const;

/* ── Blur threshold ── */

export const BLUR_THRESHOLD = 0.1;
