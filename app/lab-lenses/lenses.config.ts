/**
 * All tunable timing, layout, and phase constants for the lenses scroll.
 * Pure data — no React, no JSX, no side effects.
 *
 * use-lenses.tsx imports these and drives the RAF loop.
 * card-config.tsx holds per-card identity/layout/focus config.
 */

/* ── Container ── */

/**
 * Physical scroll multiplier. Combined with TIMELINE_END from the timing module,
 * this determines the total scroll height: CONTAINER_HEIGHT_VH = ceil(TIMELINE_END * BASE_SCROLL_VH).
 * Higher = more physical scroll per progress unit = slower, more luxurious pacing.
 */
/**
 * Must equal TUNED_CONTAINER_VH so that each raw progress unit maps to the
 * same physical scroll distance the old single-lens hook was tuned against.
 * Changing this changes the pacing of EVERY phase. Don't.
 */
export const BASE_SCROLL_VH = 2400;

/**
 * The original single-lens container height (vh) that the thesis/curtain/keyword
 * timing was tuned against. Used for EC_TO_LOCAL_SCALE so the prologue pacing
 * stays identical regardless of how many lenses the timeline contains.
 * DO NOT CHANGE — this is the tuned reference value.
 */
export const TUNED_CONTAINER_VH = 2400;

/**
 * Max width for the content layer (px).
 * Cards, keyword, narrator — everything positioned absolutely — lives inside
 * this container. Prevents layout blowup on ultra-wide monitors or browser
 * zoom-out (which inflates the CSS-pixel viewport).
 *
 * Matches what Stripe / Linear / Vercel do: the scroll + sticky wrappers are
 * full-width, but the content has a hard cap.
 */
export const MAX_CONTENT_WIDTH = 1600;

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

/**
 * Max pixel sizes for the "users" keyword at each phase.
 * Prevents the vw-based font from growing disproportionately on zoom-out
 * or ultra-wide viewports. Values match what 5vw / 3.5vw / 2.8vw produce
 * on a 1440px viewport.
 */
export const KEYWORD_FONT_CAP = {
  startMaxPx: 72, // 5vw @ 1440 = 72px
  endMaxPx: 50, // 3.5vw @ 1440 = 50.4px
  riseMaxPx: 40, // 2.8vw @ 1440 = 40.3px
} as const;

/* ── Phase 7: Focus cycle (with in-place morph) ── */

export const FOCUS_CYCLE = {
  /** Card brightens, others dim */
  rampIn: 0.02,
  /** Narrator fades in and holds — user reads the full story */
  storyHold: 0.1,
  /** Card crossfades artifact → i-statement; story fades out simultaneously */
  morphDur: 0.022,
  /** I-statement visible — user reads the takeaway */
  morphHold: 0.035,
  /** Card dims but stays morphed permanently */
  rampOut: 0.025,
  /** Overlap between cards (negative = overlap) */
  cardGap: -0.01,
  nudgeX: 1.5,
  nudgeY: -1,
  nudgeScale: 1.02,
  dimRampDuration: 0.04,
} as const;

/** Total scroll distance per card: rampIn + storyHold + morphDur + morphHold + rampOut */
export const FOCUS_CARD_TOTAL =
  FOCUS_CYCLE.rampIn +
  FOCUS_CYCLE.storyHold +
  FOCUS_CYCLE.morphDur +
  FOCUS_CYCLE.morphHold +
  FOCUS_CYCLE.rampOut;

/** Stagger between card spotlight starts (total + gap, gap can be negative for overlap) */
export const FOCUS_CARD_STAGGER = FOCUS_CARD_TOTAL + FOCUS_CYCLE.cardGap;

/* ── Phase 7b: Morph visual parameters ── */

export const MORPH = {
  /** Dim opacity override for morphed cards — dark back-face needs higher floor to stay visible */
  dimOpacity: 0.16,
  /** Back face: --bg-elevated (#0E0E14) to --bg-surface (#131319) at 97%.
   *  Brighter than viewport bg so the card reads as a distinct surface.
   *  Update if palette changes. */
  bgGradient:
    "linear-gradient(145deg, rgba(22,22,30,0.97), rgba(32,30,42,0.97))",
  /** Back face: gold-dim border */
  border: "1px solid var(--gold-dim)",
  /** I-statement text styling */
  fontSize: "clamp(0.85rem, 1.3vw, 1.1rem)",
  textColor: "var(--gold)",
  lineHeight: 1.55,
  padding: "clamp(16px, 3vw, 28px)",
} as const;

/* ── Inter-lens transitions ── */

/** Brief hold after focus cycle — all morphed cards visible together before next curtain */
export const HOLD_AFTER_FOCUS = {
  /** Duration of the hold phase where all morphed cards are visible */
  duration: 0.02,
} as const;

/** Pause between lens segments — breathing room before the next curtain sweeps */
export const INTER_LENS_PAUSE = 0.01;

/** Pause after thesis keywords land before curtain begins */
export const CURTAIN_PAUSE_AFTER_WORDS = 0.03;

/** Curtain sweep duration — single value for ALL curtains (prologue + inter-lens) */
export const CURTAIN_SWEEP_DURATION = 0.12;

/** Fraction of the curtain sweep during which the next keyword starts fading in */
export const KEYWORD_CURTAIN_HEADSTART = 0.2;

/** Final dissolve after the last lens completes (patterns) */
export const FINAL_DISSOLVE = {
  delay: 0.005,
  duration: 0.025,
} as const;

/* ── Phase 7a: Narrator story (tied to focus spotlight) ── */

export const NARRATOR_STORY = {
  /** First card story waits for dim ramp — new element needs breathing room */
  firstFadeInDelay: FOCUS_CYCLE.dimRampDuration,
  /** Subsequent cards enter earlier — user already knows the pattern */
  laterFadeInDelay: FOCUS_CYCLE.dimRampDuration * 0.4,
  /** First card gets a gentle intro */
  firstFadeInDuration: 0.04,
  /** Acceleration per card — each subsequent story fades in this much faster */
  fadeInAccelPerCard: 0.012,
  /** Floor — story fade never goes below this */
  minFadeInDuration: 0.018,
  fontSize: "clamp(0.78rem, 1.05vw, 0.95rem)",
  /** Hard px cap — well under thesis max (900px). Uses min() with vw for fluid sizing. */
  maxWidth: "min(34vw, 480px)",
  lineHeight: 1.65,
  /** Soft radial bg for readability — --bg (#07070A) at 85% opacity, feathers to transparent.
   *  Update if palette changes. */
  bgGradient:
    "radial-gradient(ellipse, rgba(7,7,10,0.85) 0%, rgba(7,7,10,0) 70%)",
  /** Padding to give the gradient room to feather beyond the text bounds */
  bgPadding: "2em 3em",
} as const;

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
  cards: 4, // cards use Z.cards + i
  narrator: 8, // above cards, below keyword
  keyword: 10,
  debug: 999,
} as const;

/* ── Blur threshold ── */

export const BLUR_THRESHOLD = 0.1;

/* ── Debug HUD ── */

export const DEBUG_HUD = {
  /** Focus value above which a card is considered "spotlighted" in the HUD */
  spotlightThreshold: 0.01,
} as const;
