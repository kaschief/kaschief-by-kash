/** Stop words — dissolve first (tier 1) */
export const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "at",
  "of",
  "with",
  "from",
  "by",
  "as",
  "into",
  "end",
  "is",
  "was",
  "it",
  "that",
  "this",
  "be",
  "are",
  "were",
  "been",
  "have",
  "has",
  "had",
  "do",
  "did",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "not",
  "no",
  "but",
  "if",
  "so",
  "up",
  "out",
  "its",
  "all",
  "than",
  "then",
  "them",
  "their",
]);

/** Filler words — dissolve second (tier 2) */
export const FILLER_WORDS = new Set([
  "build",
  "run",
  "ship",
  "new",
  "core",
  "help",
  "take",
  "own",
  "reduce",
  "create",
  "make",
  "use",
  "using",
  "used",
  "directly",
  "product",
  "app",
  "platform",
  "frontend",
  "people",
  "team",
  "time",
  "within",
  "every",
]);

/** Within each company phase (0-1 local), tier dissolve ranges */
export const TIER_RANGES: Record<1 | 2 | 3, readonly [number, number]> = {
  1: [0.05, 0.2],
  2: [0.15, 0.35],
  3: [0.25, 0.45],
};

/** Deterministic pseudo-random jitter for word dissolve order */
export function wordJitter(wordIndex: number, charCode: number): number {
  return ((wordIndex * 7 + charCode * 13) % 100) / 100;
}

/** Per-word dissolve transition duration (local progress units) */
export const WORD_DISSOLVE_SPAN = 0.08;

/* ── Cinematic scroll phases (0–1 within section) ── */

/** Per-company dissolve phases — slower start, accelerating stagger.
 *  Must have one entry per company. See compile-time check below. */
export const DISSOLVE = [
  { start: 0.05, end: 0.33 },
  { start: 0.13, end: 0.39 },
  { start: 0.19, end: 0.45 },
  { start: 0.24, end: 0.50 },
] as const;

/** Number of companies — DISSOLVE entries must match this count */
export const COMPANY_COUNT = DISSOLVE.length;

/** Essences spread into 2×2 grid (triggers layout animation) */
export const SPREAD_THRESHOLD = 0.72;

/** Scroll progress threshold that also triggers spread */
export const SCROLL_SPREAD_THRESHOLD = 0.6;

/** Height of the scroll runway (keeps section pinned during auto-play) */
export const DISTILLATION_HEIGHT = "450vh";

/** Total animation duration in seconds */
export const DISTILLATION_DURATION = 13;

/** Replay speed multiplier (faster on subsequent views) */
export const REPLAY_SPEED = 0.7;

/* ── Hex duplicates of CSS vars — required for Framer Motion color interpolation ── */

export const CREAM_HEX = "#F0E6D0";
export const TEXT_FAINT_HEX = "#4A4640";
export const BG_HEX = "#07070A";

/* ── Per-company local dissolve thresholds (within 0–1 local progress) ── */

/** Company name color drain: cream → dim → bg */
export const NAME_DRAIN = [0.18, 0.30, 0.40] as const;

/** Role opacity fade */
export const ROLE_FADE = [0.28, 0.50] as const;

/** Essence bloom: ghostly → faint → full */
export const ESSENCE_BLOOM = {
  opacity: [0.15, 0.40, 0.70] as const,
  blur: [0.15, 0.55] as const,
  y: [0.15, 0.65] as const,
  scale: [0.15, 0.65] as const,
};

/** Entry vertical contraction */
export const ENTRY_CONTRACT = [0.3, 0.7] as const;
