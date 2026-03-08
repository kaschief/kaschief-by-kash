import { ACT_I } from "@data";
import { TOKENS } from "@utilities";

// ─── Color Palette ──────────────────────────────────────────────────────────
// Single source of truth for every color in this section.

export const C = {
  /** Act accent — labels, hairlines, arrows */
  accent: ACT_I.color,
  /** Brighter accent for hover states */
  accentHot: "#F06060",
  /** Muted accent for inline question highlights */
  accentMuted: "#9E3535",

  /** Narrator text — brightest text on screen */
  narrator: "#F5ECD8",
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
export const DRIFT_RATES = [0.9, 1.2, 0.65, 1.05, 0.8, 0.95];
export const DRIFT_DIRS = [-1, 1, -1, 1, -1, 1];

// ─── Position Sets ──────────────────────────────────────────────────────────
// Narrator occupies ~42%–60% vertically on both breakpoints.
// All positions must clear that band and stay within viewport.

export interface NodePosition {
  left: number;
  top: number;
}

// Desktop (lg) — 3×2 elliptical orbit → 3×2 grid
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
// Mobile (< lg) — scattered orbit → 2×3 grid
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

/** On mobile, orbit nodes fade out after order settles, then accordion appears */
export const MOBILE_FADEOUT_START = 0.6;
export const MOBILE_FADEOUT_END = 0.63;
/** Accordion appears after orbit nodes are fully gone */
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

// ─── Orbit Node Animation ────────────────────────────────────────────────────

export const BURST_SPRING = {
  type: "spring" as const,
  stiffness: 80,
  damping: 12,
  mass: 1.2,
};
export const PROOF_MAX_HEIGHT = 80;
