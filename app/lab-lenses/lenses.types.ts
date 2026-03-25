/**
 * Shared types for the lenses scroll choreography.
 * Consumed by timing, config, and the animation hook.
 */

/* ── Thesis prologue timing (one-time, before highlight cards) ── */

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
