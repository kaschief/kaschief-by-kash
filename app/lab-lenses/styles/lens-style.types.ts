/**
 * Strategy interface for per-lens presentation styles.
 *
 * Each style (scattered, crossfade, etc.) implements this contract.
 * The main hook delegates body-phase updates and JSX to the active strategy.
 * Shared infrastructure (curtain, keyword, subtitle) stays in the hook.
 */

import type { LensName } from "@data";

/* ── Style-specific ref bag (opaque to the hook) ── */

export interface StyleRefs {
  /** Hide all elements in this ref bag (for past/future segment cleanup) */
  hideAll: () => void;
  /** Recompute positions on viewport resize */
  recomputePositions: (viewportWidth: number) => void;
  /** Keyword rest Y — where the keyword sits vertically between card zones */
  keywordRestY: number;
}

/* ── Strategy contract ── */

export interface LensStyleStrategy<TRefs extends StyleRefs = StyleRefs> {
  /** Compute the raw progress size of this style's body */
  bodySize: (cardCount: number) => number;

  /** Drive the RAF update for one segment. lp = local progress within body. */
  update: (lp: number, refs: TRefs, isLastLens: boolean) => void;

  /** Return the JSX for one segment */
  render: (
    lensName: LensName,
    entries: readonly { entryId: number }[],
    refs: TRefs,
  ) => React.ReactNode;
}
