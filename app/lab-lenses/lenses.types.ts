/**
 * Shared types for the multi-lens scroll choreography.
 * Consumed by timing, config, and the animation hook.
 */

import type { LensName } from "@data";
import type { CardConfig } from "./card-config";

/* ── Focus cycle per card ── */

export interface FocusWindow {
  ws: number;
  rampInEnd: number;
  storyHoldEnd: number;
  morphEnd: number;
  morphHoldEnd: number;
  rampOutEnd: number;
}

/* ── Per-lens timing boundaries (absolute progress values) ── */

export interface LensSegmentTiming {
  /** Curtain sweep (bottom → top) that introduces this lens */
  curtainStart: number;
  curtainEnd: number;
  /** Keyword appears at center after curtain completes */
  keywordAppearStart: number;
  /** Cards shuffle in */
  shuffleStart: number;
  shuffleEnd: number;
  /** Keyword shrinks and rises out of view */
  keywordRiseStart: number;
  keywordRiseEnd: number;
  /** Focus cycle: sequential spotlight + morph per card */
  focusCycleStart: number;
  focusWindows: readonly FocusWindow[];
  /** After all cards morphed, brief hold with all visible */
  holdStart: number;
  holdEnd: number;
  /** End of this segment (includes inter-lens pause) */
  segmentEnd: number;
}

/* ── One lens's full data + timing ── */

export interface LensSegment {
  readonly lensName: LensName;
  readonly keyword: string;
  readonly subtitle: string;
  readonly cards: readonly CardConfig[];
  readonly timing: LensSegmentTiming;
}

/* ── Thesis prologue timing (one-time, before first lens) ── */

export interface PrologueTiming {
  thesisStart: number;
  thesisDuration: number;
  keywordRevealStart: number;
  keywordStagger: number;
  keywordRevealDuration: number;
  finalKeywordEnd: number;
  curtainStart: number;
  curtainEnd: number;
}
