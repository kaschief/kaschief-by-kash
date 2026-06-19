"use client";

/**
 * Card configuration for the lenses scroll choreography.
 *
 * HIGHLIGHT_ENTRIES: 4 cards shown in cinematic crossfade
 * REMAINING_ENTRIES: 8 cards shown in Shore desk composition
 */

import {
  HIGHLIGHT_ENTRIES,
  LENS_NAMES,
  LENSES,
  REMAINING_ENTRIES,
  type LensEntry,
  type LensName,
} from "@data";
import { renderCard } from "./render-card";

/* ── Highlight card IDs (crossfade section) ── */

export { HIGHLIGHT_ENTRIES, REMAINING_ENTRIES };

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
