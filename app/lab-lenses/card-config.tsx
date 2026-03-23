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
    dimOpacity: 0,
    // Story: card is TL → gap between upper/lower, right of center, upper portion of gap
    storyX: 58, storyY: 48,
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
    dimOpacity: 0,
    // Story: card is bottom → open space above, centered
    storyX: 50, storyY: 22,
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
    dimOpacity: 0,
    // Story: card is TR → gap between upper/lower, left of center, upper portion of gap
    storyX: 42, storyY: 48,
  },
];

/* ── Gaps pillar cards (4) — two upper, two lower ── */

export const GAPS_CARDS: readonly CardConfig[] = [
  // Spotlight order: side menu → ADR → Marcus → designer
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
    dimOpacity: 0,
    storyX: 50, storyY: 35,
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
    dimOpacity: 0,
    storyX: 50, storyY: 35,
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
    dimOpacity: 0,
    storyX: 50, storyY: 35,
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
    dimOpacity: 0,
    storyX: 50, storyY: 35,
  },
];

/* ── Patterns pillar cards (4) — two upper, two lower ── */

export const PATTERNS_CARDS: readonly CardConfig[] = [
  {
    entryId: 8,
    brightness: "light",
    widthPct: 30,
    maxWidthPx: 420,
    zone: { xMin: 2, xMax: 42, yMin: 3, yMax: 46 },
    jitter: { x: 0.3, y: 0.3 },
    fromX: -40,
    fromY: 15,
    fromRotation: -16,
    toRotation: -3,
    dimOpacity: 0,
    storyX: 50, storyY: 35,
  },
  {
    entryId: 9,
    brightness: "light",
    widthPct: 30,
    maxWidthPx: 420,
    zone: { xMin: 56, xMax: 97, yMin: 3, yMax: 46 },
    jitter: { x: 0.65, y: 0.25 },
    fromX: 140,
    fromY: 12,
    fromRotation: 12,
    toRotation: 2.5,
    dimOpacity: 0,
    storyX: 50, storyY: 35,
  },
  {
    entryId: 11,
    brightness: "dark",
    widthPct: 32,
    maxWidthPx: 450,
    zone: { xMin: 2, xMax: 42, yMin: 55, yMax: 96 },
    jitter: { x: 0.35, y: 0.4 },
    fromX: -35,
    fromY: 115,
    fromRotation: -10,
    toRotation: -2,
    dimOpacity: 0,
    storyX: 50, storyY: 35,
  },
  {
    entryId: 12,
    brightness: "light",
    widthPct: 31,
    maxWidthPx: 430,
    zone: { xMin: 56, xMax: 97, yMin: 55, yMax: 96 },
    jitter: { x: 0.6, y: 0.35 },
    fromX: 140,
    fromY: 110,
    fromRotation: 8,
    toRotation: 1.5,
    dimOpacity: 0,
    storyX: 50, storyY: 35,
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
