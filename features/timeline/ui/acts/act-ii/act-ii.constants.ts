import { ACT_II } from "@data";

/* ── Data ── */

/** Act II accent color — extracted once, used everywhere in this module */
export const ACT_BLUE = ACT_II.color;

/* ══════════════════════════════════════════════════════════════
 * Shared text/UI palette — mirrors CSS vars.
 * GSAP and inline styles can't read CSS vars, so we duplicate
 * the values here as the single source of truth for Act II.
 * ══════════════════════════════════════════════════════════════ */

/** Primary text — headings, active labels, seed words */
export const CREAM = "#F0E6D0";
/** Secondary text — commit messages, body copy */
export const CREAM_MUTED = "#B0A890";
/** Tertiary text — location, period, metadata */
export const TEXT_DIM = "#8A8478";
/** Lowest-contrast text — colons, dollar signs, fallback commit types */
export const TEXT_FAINT = "#4A4640";
/** Accent — hashes, highlights, refactor/ship commit types */
export const GOLD = "#C9A84C";
/** Default border/separator for non-terminal UI */
export const STROKE = "#16161E";

/* ══════════════════════════════════════════════════════════════
 * Section & surface backgrounds
 * ══════════════════════════════════════════════════════════════ */

/** Act II section background */
export const SECTION_BG = "#06060A";
/** Outer site background (behind section) */
export const SITE_BG = "#0A0A0F";

/* ══════════════════════════════════════════════════════════════
 * Terminal (git log) — the interactive commit list
 * ══════════════════════════════════════════════════════════════ */

/** Terminal body background */
export const TERMINAL_BG = "#08080C";
/** Terminal title bar background */
export const TERMINAL_TITLE_BG = "#111118";
/** Terminal border — stronger than STROKE so the frame reads on dark screens */
export const TERMINAL_BORDER = "#24243A";

/* ══════════════════════════════════════════════════════════════
 * Git branch lines & dots — the vertical connectors between entries
 * ══════════════════════════════════════════════════════════════ */

/** Branch line between commit entries — subtler than TERMINAL_BORDER */
export const BRANCH_LINE = "#1C1C2A";
/** Branch dot top offset — fixed px in terminal, cqh in distillation */
export const BRANCH_DOT_TOP_PX = "26px";

/* ══════════════════════════════════════════════════════════════
 * Detail panel (company overlay)
 * ══════════════════════════════════════════════════════════════ */

export const PANEL_BORDER = "#1A1A24";
export const PANEL_HEADER_BG = "#0E0E16";
export const ROW_SEPARATOR = "#111118";
export const CLOSE_BORDER = "#2A2A34";

/* ══════════════════════════════════════════════════════════════
 * Semantic colors
 * ══════════════════════════════════════════════════════════════ */

/** Positive / promoted — green */
export const PROMOTED = "#5EBB73";
/** Negative / fix — red */
export const NEGATIVE = "#E05252";
/** Lighter act-blue used on hover states */
export const ACT_BLUE_HOVER = "#8ECAE6";

/** ACT_BLUE (#5B9EC2) as rgba at various opacities */
const colorRgb = "91,158,194";
export const actBlueRgba = (a: number) => `rgba(${colorRgb},${a})`;

/* ── Tag pill opacity (hex alpha suffix appended to #RRGGBB) ── */

/** Tag background — ~8% opacity */
export const TAG_ALPHA_BG = "14";
/** Tag border — ~15% opacity, detail panel only */
export const TAG_ALPHA_BORDER = "26";

/* ── Layout ── */

export const CONTENT_MAX_W = 900;
export const PANEL_MAX_W = 860;
export const SPLASH_MAX_W = 500;
export const BODY_MAX_W = 640;
export const STAT_MIN_W = "5.5rem";

/* ── Grid Texture ── */

export const GRID_SIZE = "50px 50px";
export const GRID_OPACITY_MOBILE = 0.12;
export const GRID_OPACITY_DESKTOP = 0.10;

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
  staggerMs: 50,
  cyclesPerChar: 6,
  intervalMs: 55,
} as const;

/* ── Commit Type Colors ── */

/** Test commit type — soft purple */
export const COMMIT_TEST = "#9B8FCE";
/** Docs commit type — slate blue */
export const COMMIT_DOCS = "#8B9DC3";
/** Collab commit type — muted olive */
export const COMMIT_COLLAB = "#7A8B6E";

export const COMMIT_TYPE_FALLBACK = TEXT_FAINT;

export const COMMIT_TYPE_COLORS: Record<string, string> = {
  feat: ACT_BLUE,
  fix: NEGATIVE,
  perf: PROMOTED,
  refactor: GOLD,
  test: COMMIT_TEST,
  docs: COMMIT_DOCS,
  ship: GOLD,
  chore: TEXT_DIM,
  collab: COMMIT_COLLAB,
};

/* ── Helpers ── */

export function getStatColor(stat: string): string {
  if (stat.startsWith("+") || stat.startsWith("\u2192")) return PROMOTED;
  if (stat.startsWith("-")) return NEGATIVE;
  return ACT_BLUE;
}
