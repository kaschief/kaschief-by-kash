/**
 * The cast of five.
 *
 * Each overlay pairs with the shared NAKED_BASE image: same stretch of price,
 * different lens. This is the spine of every lab-builder variant — the
 * variants differ only in *how* they reveal the transformation, never in
 * *which* transformations they show.
 *
 * `accent` uses Act IV palette tokens so variants can re-accent without
 * depending on global CSS vars (useful for subtle per-scene tinting).
 */

export type IndicatorId = "adr" | "deviations" | "gaps" | "dtt" | "pulse";
export type IndicatorCategory = "Range" | "Liquidity" | "Session";

export interface IndicatorOverlay {
  readonly id: IndicatorId;
  readonly name: string;
  readonly index: string; // "01" – "05", pre-formatted for display
  readonly category: IndicatorCategory;
  readonly accent: string; // hex, no alpha
  readonly overlayImage: string;
  readonly tagline: string; // one-line headline
  readonly body: string; // 1–2 sentence description
  readonly hook: string; // 2–3 word badge
}

export const NAKED_BASE = "/images/indicators/naked.png" as const;

/** Actual rendered aspect (width / height) of the naked.png plates. */
export const CHART_ASPECT = 2.54 as const;

export const INDICATOR_OVERLAYS: readonly IndicatorOverlay[] = [
  {
    id: "adr",
    name: "ADR",
    index: "01",
    category: "Range",
    accent: "#5EBB73",
    overlayImage: "/images/indicators/naked-adr.png",
    tagline: "The average distance price moves in a day.",
    body: "Average Daily Range: a rolling average of (high − low) across the last N sessions. Used for sizing targets, gauging whether a move is within the normal range, and knowing how much room is left in the session.",
    hook: "Daily range",
  },
  {
    id: "deviations",
    name: "Deviations",
    index: "02",
    category: "Range",
    accent: "#5EBB73",
    overlayImage: "/images/indicators/naked-deviations.png",
    tagline: "How far each session typically expands.",
    body: "Expansion levels across thirteen intraday sessions, at 0.5×, 1×, 1.5×, 2× the session range. Shows when price is sitting at a normal level and when it's at an extreme.",
    hook: "Session expansion",
  },
  {
    id: "gaps",
    name: "Gaps",
    index: "03",
    category: "Liquidity",
    accent: "#5B9EC2",
    overlayImage: "/images/indicators/naked-gaps.png",
    tagline: "Price skipped these. It tends to come back.",
    body: "Five gap types tracked at once: weekly opens, daily opens, RTH, balanced price ranges, fair value gaps. Live fill percent on each.",
    hook: "Unfilled gaps",
  },
  {
    id: "dtt",
    name: "DTT",
    index: "04",
    category: "Session",
    accent: "#C9A84C",
    overlayImage: "/images/indicators/naked-dtt.png",
    tagline: "Four weekly sessions. Each one behaves differently.",
    body: "The trading week split into four named sessions: Iscariot, Aries, Ash, Icarus. Each has its own expected range and Fibonacci levels that build as the session develops.",
    hook: "Weekly sessions",
  },
  {
    id: "pulse",
    name: "Pulse",
    index: "05",
    category: "Liquidity",
    accent: "#5B9EC2",
    overlayImage: "/images/indicators/naked-pulse.png",
    tagline: "The highs and lows where stops sit.",
    body: "Session highs and lows across daily, weekly, monthly, and every intraday session. Depth levels show how far past each pool price tends to run, calibrated per instrument.",
    hook: "Liquidity pools",
  },
] as const;
