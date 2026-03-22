"use client";

/**
 * Per-card configuration for the lenses scroll choreography.
 * Single source of truth: identity, layout, entrance, focus behavior.
 *
 * Rendering delegated to render-card.tsx — no direct component imports here.
 *
 * Per-pillar configs: Users (3), Gaps (4), Patterns (5).
 * Each lens has its own CardConfig[] with zone layouts, entrance vectors, and story positions.
 */

import { getEntry, type LensName } from "@data";
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

/* ── Gaps pillar cards (4) — two upper, two lower ── */

export const GAPS_CARDS: readonly CardConfig[] = [
  {
    entryId: 4,
    brightness: "light",
    widthPct: 32,
    maxWidthPx: 440,
    zone: { xMin: 2, xMax: 42, yMin: 3, yMax: 46 },
    jitter: { x: 0.3, y: 0.35 },
    fromX: -45,
    fromY: 25,
    fromRotation: -14,
    toRotation: -2.5,
    dimOpacity: 0.02,
    storyX: 58, storyY: 53,
  },
  {
    entryId: 5,
    brightness: "dark",
    widthPct: 34,
    maxWidthPx: 460,
    zone: { xMin: 56, xMax: 97, yMin: 3, yMax: 46 },
    jitter: { x: 0.6, y: 0.25 },
    fromX: 140,
    fromY: 18,
    fromRotation: 10,
    toRotation: 2,
    dimOpacity: 0.07,
    storyX: 42, storyY: 53,
  },
  {
    entryId: 6,
    brightness: "light",
    widthPct: 33,
    maxWidthPx: 450,
    zone: { xMin: 2, xMax: 42, yMin: 55, yMax: 96 },
    jitter: { x: 0.35, y: 0.4 },
    fromX: -35,
    fromY: 110,
    fromRotation: -8,
    toRotation: -1.5,
    dimOpacity: 0.02,
    storyX: 58, storyY: 28,
  },
  {
    entryId: 7,
    brightness: "light",
    widthPct: 34,
    maxWidthPx: 470,
    zone: { xMin: 56, xMax: 97, yMin: 55, yMax: 96 },
    jitter: { x: 0.55, y: 0.35 },
    fromX: 140,
    fromY: 105,
    fromRotation: 7,
    toRotation: 1.5,
    dimOpacity: 0.02,
    storyX: 42, storyY: 28,
  },
];

/* ── Patterns pillar cards (5) — two upper, one center, two lower ── */

export const PATTERNS_CARDS: readonly CardConfig[] = [
  {
    entryId: 8,
    brightness: "light",
    widthPct: 30,
    maxWidthPx: 420,
    zone: { xMin: 2, xMax: 40, yMin: 3, yMax: 38 },
    jitter: { x: 0.3, y: 0.3 },
    fromX: -40,
    fromY: 15,
    fromRotation: -16,
    toRotation: -3,
    dimOpacity: 0.02,
    storyX: 60, storyY: 50,
  },
  {
    entryId: 9,
    brightness: "light",
    widthPct: 30,
    maxWidthPx: 420,
    zone: { xMin: 58, xMax: 97, yMin: 3, yMax: 38 },
    jitter: { x: 0.65, y: 0.25 },
    fromX: 140,
    fromY: 12,
    fromRotation: 12,
    toRotation: 2.5,
    dimOpacity: 0.02,
    storyX: 40, storyY: 50,
  },
  {
    entryId: 10,
    brightness: "light",
    widthPct: 36,
    maxWidthPx: 540,
    zone: { xMin: 15, xMax: 85, yMin: 35, yMax: 65 },
    jitter: { x: 0.5, y: 0.5 },
    fromX: 30,
    fromY: -30,
    fromRotation: -4,
    toRotation: -0.5,
    dimOpacity: 0.02,
    storyX: 50, storyY: 78,
  },
  {
    entryId: 11,
    brightness: "dark",
    widthPct: 32,
    maxWidthPx: 450,
    zone: { xMin: 2, xMax: 40, yMin: 62, yMax: 96 },
    jitter: { x: 0.35, y: 0.4 },
    fromX: -35,
    fromY: 115,
    fromRotation: -10,
    toRotation: -2,
    dimOpacity: 0.07,
    storyX: 60, storyY: 25,
  },
  {
    entryId: 12,
    brightness: "light",
    widthPct: 31,
    maxWidthPx: 430,
    zone: { xMin: 58, xMax: 97, yMin: 62, yMax: 96 },
    jitter: { x: 0.6, y: 0.35 },
    fromX: 140,
    fromY: 110,
    fromRotation: 8,
    toRotation: 1.5,
    dimOpacity: 0.02,
    storyX: 40, storyY: 25,
  },
];

/* ── Per-lens card config map ── */

export const LENS_CARD_CONFIGS: Record<LensName, readonly CardConfig[]> = {
  users: USERS_CARDS,
  gaps: GAPS_CARDS,
  patterns: PATTERNS_CARDS,
};

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
