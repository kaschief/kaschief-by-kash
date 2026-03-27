"use client";

/**
 * Card configuration for the lenses scroll choreography.
 *
 * HIGHLIGHT_ENTRIES: 4 cards shown in cinematic crossfade
 * REMAINING_ENTRIES: 8 cards shown in Shore desk composition
 */

import { ALL_ENTRIES, LENS_NAMES, LENSES, type LensName, type LensEntry } from "@data";
import { renderCard } from "./render-card";

/* ── Highlight card IDs (crossfade section) ── */

export const HIGHLIGHT_IDS = [1, 5, 6, 11] as const;

/** 4 highlight entries for the cinematic crossfade */
export const HIGHLIGHT_ENTRIES: readonly LensEntry[] = HIGHLIGHT_IDS.map(
  (id) => ALL_ENTRIES.find((e) => e.id === id)!,
);

/** 8 remaining entries for the Shore desk */
export const REMAINING_ENTRIES: readonly LensEntry[] = ALL_ENTRIES.filter(
  (e) => !(HIGHLIGHT_IDS as readonly number[]).includes(e.id),
);

/* ── Lens color map ── */

export const LENS_COLORS: Record<LensName, string> = {
  users: "#5B9EC2",
  gaps: "#C9A84C",
  patterns: "#5EBB73",
};

/* ── Helpers ── */

export function getLensForEntry(entry: LensEntry): LensName {
  for (const name of LENS_NAMES) {
    if (LENSES[name].entries.some((e) => e.id === entry.id)) return name;
  }
  return "users";
}

/** Render any card by entry. Choreography passes style overrides (boxShadow, etc). */
export function renderChoreographyCard(
  entry: LensEntry,
  style?: React.CSSProperties,
): React.JSX.Element {
  return renderCard(entry, style);
}
