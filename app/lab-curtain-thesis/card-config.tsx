"use client";

/**
 * Per-card configuration for the curtain-thesis scroll choreography.
 * Single source of truth: identity, layout, entrance, focus behavior.
 *
 * Rendering delegated to render-card.tsx — no direct component imports here.
 *
 * TODO(S7): Per-pillar config — Gaps has 4 cards, Patterns has 5.
 * When we get there, this becomes a function of the active pillar.
 */

import { getEntry } from "@data";
import { renderCard } from "../lab-artifacts/render-card";

/* ── Types ── */

export interface CardConfig {
  /** Lens entry ID from data/lenses.ts */
  entryId: number;
  /** Card brightness on dark bg — determines shadow style + dim target */
  brightness: "light" | "dark";

  /* ── Layout ── */
  /** Width as % of viewport */
  widthPct: number;
  /** Hard max in px — prevents blowup on large screens */
  maxWidthPx: number;
  /** Scatter zone (% of viewport). Center strip excluded for keyword rise path. */
  zone: { xMin: number; xMax: number; yMin: number; yMax: number };
  /** Deterministic jitter seed (0–1). Same scatter at every viewport, every load. */
  jitter: { x: number; y: number };

  /* ── Entrance ── */
  /** Off-screen start position (% of viewport) */
  fromX: number;
  fromY: number;
  /** Rotation at entrance start and resting state (degrees) */
  fromRotation: number;
  toRotation: number;

  /* ── Focus cycle ── */
  /** Opacity when dimmed (0–1). Lower = more invisible. White cards need lower values on dark bg. */
  dimOpacity: number;
  /** Per-card nudge overrides — falls back to FOCUS_CYCLE defaults if omitted */
  nudgeX?: number;
  nudgeY?: number;
  nudgeScale?: number;

  /* ── Narrator story position ── */
  /** Where the story text appears when this card is spotlighted (% of viewport, center-anchored) */
  storyX: number;
  storyY: number;
}

/* ── Users pillar cards ── */

export const USERS_CARDS: readonly CardConfig[] = [
  {
    entryId: 1,
    brightness: "light",
    widthPct: 34,
    maxWidthPx: 480,
    zone: { xMin: 2, xMax: 42, yMin: 3, yMax: 46 },
    jitter: { x: 0.25, y: 0.3 },
    fromX: -40,
    fromY: 20,
    fromRotation: -18,
    toRotation: -3.5,
    dimOpacity: 0.02,
    // Story: card is TL → text in the gap between upper and lower cards, right of center
    storyX: 58, storyY: 53,
  },
  {
    entryId: 2,
    brightness: "dark",
    widthPct: 33,
    maxWidthPx: 460,
    zone: { xMin: 56, xMax: 97, yMin: 3, yMax: 46 },
    jitter: { x: 0.65, y: 0.2 },
    fromX: 140,
    fromY: 15,
    fromRotation: 12,
    toRotation: 2.5,
    dimOpacity: 0.07,
    // Story: card is TR → text in the gap between upper and lower cards, left of center
    storyX: 42, storyY: 53,
  },
  {
    entryId: 3,
    brightness: "light",
    widthPct: 36,
    maxWidthPx: 620,
    zone: { xMin: 8, xMax: 92, yMin: 60, yMax: 96 },
    jitter: { x: 0.45, y: 0.4 },
    fromX: 30,
    fromY: 120,
    fromRotation: -6,
    toRotation: -1.5,
    dimOpacity: 0.02,
    // Story: card is bottom-center → text in the large open space above, centered
    storyX: 50, storyY: 25,
  },
];

/* ── Rendering ── */

/** Render any card by entry ID. Choreography passes style overrides (boxShadow, etc). */
export function renderChoreographyCard(
  entryId: number,
  style?: React.CSSProperties,
): React.JSX.Element | null {
  const entry = getEntry(entryId);
  if (!entry) return null;
  return renderCard(entry, style);
}
