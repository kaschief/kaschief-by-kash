import { ACT_II } from "@data";

/* ── Data ── */

export const { act, title, color: COLOR, splash, body } = ACT_II;

/* ── Colors ── */

export const SECTION_BG = "#06060A";
export const SITE_BG = "#0A0A0F";
export const PANEL_BORDER = "#1A1A24";
export const PANEL_HEADER_BG = "#0E0E16";
export const TERMINAL_BG = "#08080C";
export const TERMINAL_TITLE_BG = "#111118";
export const PROMOTED_COLOR = "#5EBB73";
export const NEGATIVE_COLOR = "#E05252";
export const COLOR_HOVER = "#8ECAE6";
export const COMMIT_TYPE_FALLBACK = "#4A4640";
export const ROW_SEPARATOR = "#111118";
export const CLOSE_BORDER = "#2A2A34";

/** COLOR (#5B9EC2) as rgba at various opacities */
const colorRgb = "91,158,194";
export const COLOR_RGBA = (a: number) => `rgba(${colorRgb},${a})`;

/** Overlay backgrounds */
export const OVERLAY_BG = SECTION_BG;
export const OVERLAY_NAV_BG = SECTION_BG;

/* ── Layout ── */

export const CONTENT_MAX_W = 900;
export const PANEL_MAX_W = 860;
export const SPLASH_MAX_W = 500;
export const BODY_MAX_W = 640;
export const STAT_MIN_W = "5.5rem";

/* ── Grid Texture ── */

export const GRID_SIZE = "50px 50px";
export const GRID_OPACITY_MOBILE = 0.12;
export const GRID_OPACITY_DESKTOP = 0.06;

/* ── Atmospheric Glows ── */

export const GLOW_PRIMARY = { size: 1000, top: "25%", right: "10%", opacity: 0.04 };
export const GLOW_SECONDARY = { size: 700, bottom: "20%", left: "5%", opacity: 0.025 };

/* ── Animation Timing ── */

export const SCAN_LINE_DURATION = 12;
export const SCAN_LINE_OPACITY = 0.08;
export const ENTRY_STAGGER_DELAY = 0.15;
export const ENTRY_INVIEW_MARGIN = "-40px";
export const ENTRY_DECODE_STAGGER = 600;

/** Shared scramble config for commit entry text */
export const SCRAMBLE_CONFIG = {
  initiallyScrambled: true,
  idleGlitch: true,
  staggerMs: 50,
  cyclesPerChar: 6,
  intervalMs: 55,
} as const;

/** Lock-to-chevron animation timing */
export const LOCK_TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] } as const;
export const LOCK_BREATHE = {
  opacity: [0.4, 0.9, 0.4],
  scale: [1, 1.1, 1],
  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
};

/* ── Commit Type Colors ── */

export const COMMIT_TYPE_COLORS: Record<string, string> = {
  feat: COLOR,
  fix: NEGATIVE_COLOR,
  perf: PROMOTED_COLOR,
  refactor: "#C9A84C",
  test: "#9B8FCE",
  docs: "#8B9DC3",
  ship: "#C9A84C",
  chore: "#8A8478",
  collab: "#7A8B6E",
};

/* ── Helpers ── */

export function getStatColor(stat: string): string {
  if (stat.startsWith("+") || stat.startsWith("\u2192")) return PROMOTED_COLOR;
  if (stat.startsWith("-")) return NEGATIVE_COLOR;
  return COLOR;
}
