import { ACT_I } from "@data";
import { TOKENS } from "@utilities";

// ─── Color Palette ──────────────────────────────────────────────────────────
// Single source of truth for every color in this section.

export const C = {
  /** Act accent — labels, hairlines, arrows */
  accent: ACT_I.color,
  /** Brighter accent for hover states */
  accentHot: "#F06060",

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
export const SNAP_START = 0.55;
export const SNAP_END = 0.62;

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
export const MAX_W_LG = [
  "min(180px, 15vw)",
  "min(170px, 14vw)",
  "min(175px, 15vw)",
  "min(175px, 15vw)",
  "min(165px, 13vw)",
  "min(170px, 14vw)",
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
  { left: 6, top: 12 },
  { left: 52, top: 12 },
  { left: 6, top: 32 },
  { left: 52, top: 32 },
  { left: 6, top: 72 },
  { left: 52, top: 72 },
];
export const MAX_W_SM = "40vw";

// ─── Mouse Displacement ─────────────────────────────────────────────────────

export const MOUSE_RADIUS = 500;
export const MOUSE_STRENGTH = 100;
export const MAX_DISPLACEMENT = 80;
export const SPRING_CONFIG = { stiffness: 35, damping: 10, mass: 2 };
