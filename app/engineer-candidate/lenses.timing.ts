/**
 * Timeline builder for the lenses scroll choreography.
 * Pure computation at module level — no React, no DOM, no side effects.
 *
 * Architecture:
 * PROLOGUE (thesis → keywords → curtain) → CINEMATIC (4 highlight cards crossfade)
 *
 * The Shore desk section lives in normal document flow below the scroll container
 * and is NOT part of this timing system.
 */

import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
} from "./engineer-candidate.types";
import { CONTENT } from "./engineer-data";
import {
  TUNED_CONTAINER_VH,
  THESIS_PHASE_START,
  THESIS_PHASE_DURATION,
  CURTAIN_PAUSE_AFTER_WORDS,
  CURTAIN_SWEEP_DURATION,
  CROSSFADE_PER_CARD,
} from "./lenses.config";
import { HIGHLIGHT_ENTRIES } from "./card-config";
import type { PrologueTiming } from "./lenses.types";

/* ── Prologue timing (raw config-constant space) ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;
const EC_SCALE = EC_CONTAINER_VH / TUNED_CONTAINER_VH;

const kwRevealStart = THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;
const kwStagger = EC_THESIS.wordStagger * EC_SCALE;
const kwRevealDur = EC_THESIS.wordRevealDur * EC_SCALE;
const kwEnd = kwRevealStart + (KEYWORD_COUNT - 1) * kwStagger + kwRevealDur;
const prologueCurtainStart = kwEnd + CURTAIN_PAUSE_AFTER_WORDS;
const prologueCurtainEnd = prologueCurtainStart + CURTAIN_SWEEP_DURATION;

/** Prologue timing in raw space — consumed by the hook for the thesis/curtain. */
export const PROLOGUE: PrologueTiming = {
  thesisStart: THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  keywordRevealStart: kwRevealStart,
  keywordStagger: kwStagger,
  keywordRevealDuration: kwRevealDur,
  finalKeywordEnd: kwEnd,
  curtainStart: prologueCurtainStart,
  curtainEnd: prologueCurtainEnd,
};

/** Raw size of the prologue in progress units. */
const PROLOGUE_SIZE = prologueCurtainEnd;

/* ── Cinematic section (4 highlight cards in crossfade) ── */

const HIGHLIGHT_COUNT = HIGHLIGHT_ENTRIES.length;

/** Raw progress size of the cinematic crossfade section */
export const CINEMATIC_SIZE = HIGHLIGHT_COUNT * CROSSFADE_PER_CARD;

/** Global progress where the cinematic crossfade starts */
export const CINEMATIC_START = PROLOGUE_SIZE;

/** Total raw progress (prologue + cinematic) */
export const TOTAL_RAW_SIZE = PROLOGUE_SIZE + CINEMATIC_SIZE;

/**
 * Physical scroll multiplier for the cinematic section.
 * TUNED_CONTAINER_VH (2400) was calibrated for the old multi-lens timeline
 * where TOTAL_RAW_SIZE was ~2.0+. Now with only prologue + 4 cards (~1.06),
 * using 2400 makes each card absurdly slow.
 *
 * Target: ~200vh for prologue + ~120vh per card = ~680vh total.
 * The prologue timing constants still work because they're in raw-progress
 * space — only the physical-to-raw mapping changes.
 */
const SCROLL_VH_PER_RAW = 1600;

/**
 * Container height for the scroll-gated section (prologue + cinematic).
 * Exported as LENSES_SECTION_HEIGHT_VH for EC integration.
 */
export const LENSES_SECTION_HEIGHT_VH = Math.ceil(TOTAL_RAW_SIZE * SCROLL_VH_PER_RAW);

/** Alias for backward compat within lab-lenses */
export const CONTAINER_HEIGHT_VH = LENSES_SECTION_HEIGHT_VH;
