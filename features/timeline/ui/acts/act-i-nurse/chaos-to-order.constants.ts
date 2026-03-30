import { ACT_I } from "@data";
import { TOKENS } from "@utilities";

// ─── Color Palette ──────────────────────────────────────────────────────────
// Single source of truth for every color in this section.

export const COLORS = {
  /** Act accent — labels, hairlines, arrows */
  accent: ACT_I.color,
  /** Brighter accent for hover states */
  accentHot: TOKENS.actRedHot,
  /** Muted accent for inline question highlights — dimmed red that doesn't compete with gold */
  accentMuted: TOKENS.actRedDim,

  /** Narrator text — brighter than cream-muted for readability over chaos background */
  narrator: TOKENS.narratorBright,
  /** Card title default — muted to defer to narrator */
  cardTitle: TOKENS.creamMuted,
  /** Card title on hover — lifts to cream */
  cardTitleHover: TOKENS.cream,

  /** Card body text (did) */
  cardBody: "#A89E90",
  /** Card body text on hover */
  cardBodyHover: "#D0C8B8",
  /** Card secondary text (built) */
  cardSecondary: "#908878",
  /** Card secondary text on hover */
  cardSecondaryHover: "#C0B8A0",
  /** Card transfer text */
  cardTransfer: "#B0A890",

  /** Hairline border default */
  hairlineBorder: "rgba(224,82,82,0.06)",
  /** Hairline border on hover */
  hairlineBorderHover: "rgba(240,96,96,0.15)",

  /** Narrator background gradient */
  narratorBgCenter: "rgba(7,7,10,0.95)",
  narratorBgEdge: "rgba(7,7,10,0.85)",

  /** Atmospheric glow (ultra-low opacity act red) */
  glowStrong: "rgba(224,82,82,0.012)",
  glowSubtle: "rgba(224,82,82,0.007)",
} as const;

// ─── Layout Constants ────────────────────────────────────────────────────────

/** Scroll progress range where chaos snaps to order */
export const SNAP_START = 0.35;
export const SNAP_END = 0.42;

// ─── Per-Node Animation Tuning ──────────────────────────────────────────────

export const NODE_DELAYS = [0.0, 0.08, 0.15, 0.22, 0.3, 0.38];
export const NODE_START_ROTATIONS = [-12, 8, -6, 14, -10, 7];
export const NODE_END_ROTATIONS = [-2, 1.5, -1, 3, -2.5, 1];
export const NODE_WEIGHTS = [0.9, 1.2, 0.75, 1.0, 1.3, 0.85];
/** Per-card drift multiplier (rate × direction). Negative = drift up, positive = down. */
export const DRIFT_MULTIPLIERS = [-0.9, 1.2, -0.65, 1.05, -0.8, 0.95];

// ─── Position Sets ──────────────────────────────────────────────────────────
// Narrator occupies ~42%–60% vertically on both breakpoints.
// All positions must clear that band and stay within viewport.

export interface NodePosition {
  left: number;
  top: number;
}

// Desktop (lg) — 3×2 scattered → 3×2 grid
export const CHAOS_LG: readonly NodePosition[] = [
  { left: 24, top: 38 },
  { left: 34, top: 16 },
  { left: 54, top: 12 },
  { left: 64, top: 34 },
  { left: 56, top: 58 },
  { left: 32, top: 62 },
];
export const ORDER_LG: readonly NodePosition[] = [
  { left: 24, top: 14 },
  { left: 44, top: 14 },
  { left: 64, top: 14 },
  { left: 24, top: 62 },
  { left: 44, top: 62 },
  { left: 64, top: 62 },
];
// Mobile (< lg) — scattered → 2×3 grid
// Cards are 40vw wide. Narrator at ~54%.
export const CHAOS_SM: readonly NodePosition[] = [
  { left: 18, top: 11 },
  { left: 48, top: 22 },
  { left: 2, top: 32 },
  { left: 54, top: 35 },
  { left: 10, top: 68 },
  { left: 46, top: 72 },
];
export const ORDER_SM: readonly NodePosition[] = [
  { left: 14, top: 12 },
  { left: 56, top: 12 },
  { left: 14, top: 32 },
  { left: 56, top: 32 },
  { left: 14, top: 72 },
  { left: 56, top: 72 },
];
// ─── Stack Phase ──────────────────────────────────────────────────────────────
// After order grid, elements fly to a left-aligned vertical stack.

/** Scroll progress range where order snaps to stack */
export const STACK_START = 0.65;
export const STACK_END = 0.75;

// Desktop (lg) — left-aligned, evenly spaced below nav (~14% gap)
export const STACK_LG: readonly NodePosition[] = [
  { left: 6, top: 14 },
  { left: 6, top: 27 },
  { left: 6, top: 40 },
  { left: 6, top: 53 },
  { left: 6, top: 66 },
  { left: 6, top: 79 },
];

// Mobile/tablet — starts below nav, compact ~11% gap
// left: 6 ≈ matches --page-gutter (1.5rem ≈ 24px on 390px = ~6.2%)
export const STACK_SM: readonly NodePosition[] = [
  { left: 6, top: 10 },
  { left: 6, top: 25 },
  { left: 6, top: 40 },
  { left: 6, top: 55 },
  { left: 6, top: 70 },
  { left: 6, top: 85 },
];

// ─── Max-Width (numeric for Framer Motion interpolation) ─────────────────────

export const MAX_W_LG_PX = [180, 170, 175, 175, 165, 170];
export const MAX_W_LG_VW = [15, 14, 15, 15, 13, 14];
export const MAX_W_SM_VW = 40;
export const MAX_W_STACK_LG_PX = 340;
export const MAX_W_STACK_LG_VW = 30;
export const MAX_W_STACK_MD_PX = 320;
export const MAX_W_STACK_MD_VW = 42;
export const MAX_W_STACK_SM_VW = 70;

// ─── Focus Phase ─────────────────────────────────────────────────────────────
// After stack settles, a white ball emerges from each skill sequentially.

export const FOCUS_START = 0.88;
export const FOCUS_END = 0.98;

/** On mobile, skill cards fade out after order settles, then accordion appears */
export const MOBILE_FADEOUT_START = 0.6;
export const MOBILE_FADEOUT_END = 0.63;
/** Accordion appears after skill cards are fully gone */
export const MOBILE_ACCORDION_START = 0.63;
export const MOBILE_ACCORDION_END = 0.66;
/** Per-node slice within the focus phase */
export const FOCUS_SLICE = (FOCUS_END - FOCUS_START) / 6;

// ─── Mouse Displacement ─────────────────────────────────────────────────────

export const MOUSE_RADIUS = 500;
export const MOUSE_STRENGTH = 100;
export const MAX_DISPLACEMENT = 80;
export const SPRING_CONFIG = { stiffness: 35, damping: 10, mass: 2 };

// ─── Narrator Copy ──────────────────────────────────────────────────────────

export const NARRATOR_CHAOS =
  "Every shift began in the middle of something: competing signals, incomplete information, all at once.";
export const NARRATOR_ORDER_BEFORE =
  "The job was never to eliminate the chaos. It was to use";
export const NARRATOR_ORDER_SKILLS = "my skills";
export const NARRATOR_ORDER_AFTER = "to make order from it.";

// ─── Nudge Timing ────────────────────────────────────────────────────────────

/** Delay (ms) before auto-expand hint per card index. 0 = no nudge. */
export const NUDGE_DELAYS = [600, 0, 3800, 0, 7000, 0];
export const NUDGE_DISPLAY_MS = 2000;

// ─── Skill Card Animation ────────────────────────────────────────────────────

export const BURST_SPRING = {
  type: "spring" as const,
  stiffness: 130,
  damping: 10,
  mass: 1.0,
};
export const PROOF_MAX_HEIGHT = 80;


/** Named devices for JS comparisons (avoids magic "sm"/"md"/"lg" strings) */
export const DEVICES = {
  phone: "phone",
  tablet: "tablet",
  desktop: "desktop",
} as const;
export type Devices = (typeof DEVICES)[keyof typeof DEVICES];

// ─── Scroll-Relative Offsets ────────────────────────────────────────────────
// Small offsets from phase boundaries. Changing these shifts timing subtly.

/** Buffer after SNAP_END before nudge timer starts */
export const NUDGE_TRIGGER_OFFSET = 0.02;
/** Chaos narrator finishes fading out this far before SNAP_START */
export const NARRATOR_CHAOS_OUT_BUFFER = 0.02;
/** Proof opacity starts fading this far before STACK_START */
export const PROOF_FADEOUT_MARGIN = 0.03;
/** Narrator text fade-in/out margin around phase boundaries */
export const NARRATOR_FADE_MARGIN = 0.04;
/** When chaos narrator first appears (scroll progress) */
export const NARRATOR_CHAOS_IN = 0.06;
/** When chaos narrator is fully visible */
export const NARRATOR_CHAOS_PEAK = 0.12;
/** "my skills" starts fading this far after FOCUS_START */
export const SKILLS_LINGER_FADE = 0.03;
/** Accordion bg appears this far before its phase */
export const ACCORDION_BG_LEAD = 0.01;

// ─── Card Opacity Per Phase ─────────────────────────────────────────────────
// Desktop cards are bolder; mobile cards are dimmer to let narrator dominate.

export const CHAOS_OPACITY = { desktop: 0.25, mobile: 0.15 } as const;
export const ORDER_OPACITY = { desktop: 1, mobile: 0.7 } as const;

// ─── Watermark ──────────────────────────────────────────────────────────────

/** Watermark color alpha when card is idle */
export const WATERMARK_ALPHA = 0.13;
/** Watermark color alpha when card is active (hovered/nudged) */
export const WATERMARK_ALPHA_ACTIVE = 0.16;
/** Watermark color for mobile accordion (fainter — no hover transition) */
export const WATERMARK_COLOR_MOBILE = `rgba(224,82,82,${WATERMARK_ALPHA * 0.5})`;

// ─── Burst Animation ────────────────────────────────────────────────────────

/** Initial scale before burst explodes outward */
export const BURST_INITIAL_SCALE = 0.2;
/** Opacity flash: [hidden, peak flash, settle to chaos] */
export const BURST_OPACITY_SEQUENCE = [0, 0.5, 0.25] as const;
/** Burst opacity animation duration (seconds) */
export const BURST_OPACITY_DURATION = 0.65;

// ─── Scene Layout ───────────────────────────────────────────────────────────

/** Total scroll height of the chaos-to-order section */
export const SCENE_HEIGHT_VH = 800;
/** Viewport fraction threshold for triggering burst on scroll-down (higher = triggers sooner) */
export const BURST_TRIGGER_VIEWPORT = 0.9;
/** Section must be this far off-screen (viewport fraction) before burst resets on scroll-up */
export const BURST_RESET_VIEWPORT = 0.5;
/** Max drift displacement in px at full scroll */
export const BASE_DRIFT_RANGE = 60;

// ─── Shared Transition Durations ────────────────────────────────────────────

/** Color/opacity transition for hover states */
export const COLOR_TRANSITION = "0.4s";
/** Max-height transition for proof expand/collapse */
export const PROOF_TRANSITION = "0.35s ease";

// ─── Focus Ball Tuning ──────────────────────────────────────────────────────

/** Fraction of phase where ball reaches its end position */
export const BALL_TRAVEL_FRACTION = 0.6;
/** Ball end X position (% from left) per breakpoint */
export const BALL_END_X = { lg: 38, md: 44 } as const;
/** Ball size keyframes [hidden, appear, peak, shrink] */
export const BALL_SIZE_KEYS = [0, 12, 20, 12] as const;
/** Ball peak opacity */
export const BALL_PEAK_OPACITY = 0.9;
/** Revealed text max width (px) */
export const REVEALED_TEXT_MAX_W = 500;
