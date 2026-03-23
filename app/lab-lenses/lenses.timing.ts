/**
 * Timeline builder for the multi-lens scroll choreography.
 * Pure computation at module level — no React, no DOM, no side effects.
 *
 * Architecture: LOCAL PROGRESS per lens.
 * Each lens occupies a fixed-size scroll region. The hook converts global
 * scrollYProgress (0–1) into a local progress (0–1) per lens. Within that
 * local space, all config constants work exactly as they did in the original
 * single-lens hook — no normalization, no scaling, no coordinate mismatch.
 *
 * The prologue (thesis + first curtain) uses the same raw config constants
 * the old hook used, mapped to its own local progress.
 */

import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { CONTENT } from "../engineer-candidate/engineer-data";
import { LENS_NAMES, getLens, LENS_DISPLAY } from "@data";
import { LENS_CARD_CONFIGS, type CardConfig } from "./card-config";
import {
  TUNED_CONTAINER_VH,
  THESIS_PHASE_START,
  THESIS_PHASE_DURATION,
  ARTIFACT_SHUFFLE,
  KEYWORD_RISE,
  FOCUS_CYCLE,
  FOCUS_CARD_TOTAL,
  FOCUS_CARD_STAGGER,
  HOLD_AFTER_FOCUS,
  INTER_LENS_PAUSE,
  CURTAIN_PAUSE_AFTER_WORDS,
  CURTAIN_SWEEP_DURATION,
  FINAL_DISSOLVE,
} from "./lenses.config";
import type { FocusWindow, PrologueTiming } from "./lenses.types";

/* ── Prologue timing (raw config-constant space, 0–~0.62) ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;
const EC_SCALE = EC_CONTAINER_VH / TUNED_CONTAINER_VH;

const kwRevealStart = THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;
const kwStagger = EC_THESIS.wordStagger * EC_SCALE;
const kwRevealDur = EC_THESIS.wordRevealDur * EC_SCALE;
const kwEnd = kwRevealStart + (KEYWORD_COUNT - 1) * kwStagger + kwRevealDur;
const prologueCurtainStart = kwEnd + CURTAIN_PAUSE_AFTER_WORDS;
const prologueCurtainEnd = prologueCurtainStart + CURTAIN_SWEEP_DURATION;

/** Prologue timing in raw space — consumed by the hook directly for the thesis/curtain. */
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

/* ── Per-lens body size (raw config space) ── */

/** Compute the raw progress size of one lens body (keyword → shuffle → focus → hold). */
function lensBodySize(cardCount: number): number {
  const shuffleEnd = POST_CURTAIN.appearDuration
    + (cardCount - 1) * ARTIFACT_SHUFFLE.stagger
    + ARTIFACT_SHUFFLE.entranceDuration;
  const kwRiseStart = shuffleEnd + KEYWORD_RISE.holdAfterShrink;
  const focusEnd = kwRiseStart + (cardCount - 1) * FOCUS_CARD_STAGGER + FOCUS_CARD_TOTAL;
  const holdEnd = focusEnd + HOLD_AFTER_FOCUS.duration;
  return holdEnd;
}

/* ── Lens body timing (in LOCAL 0–bodySize space) ── */

function buildLocalFocusWindows(focusStart: number, cardCount: number): FocusWindow[] {
  return Array.from({ length: cardCount }, (_, i) => {
    const ws = focusStart + i * FOCUS_CARD_STAGGER;
    return {
      ws,
      rampInEnd: ws + FOCUS_CYCLE.rampIn,
      storyHoldEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold,
      morphEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold + FOCUS_CYCLE.morphDur,
      morphHoldEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold + FOCUS_CYCLE.morphDur + FOCUS_CYCLE.morphHold,
      rampOutEnd: ws + FOCUS_CARD_TOTAL,
    };
  });
}

/** Per-lens body timing — all values in LOCAL progress space (0 to bodySize). */
export interface LensBodyTiming {
  /** Keyword appears at 0, shrinks as cards shuffle */
  shuffleStart: number;
  shuffleEnd: number;
  keywordRiseStart: number;
  keywordRiseEnd: number;
  focusCycleStart: number;
  focusWindows: readonly FocusWindow[];
  holdStart: number;
  holdEnd: number;
}

function buildLensBody(cardCount: number): LensBodyTiming {
  const shuffleStart = POST_CURTAIN.appearDuration;
  const shuffleEnd = shuffleStart + (cardCount - 1) * ARTIFACT_SHUFFLE.stagger + ARTIFACT_SHUFFLE.entranceDuration;
  const kwRiseStart = shuffleEnd + KEYWORD_RISE.holdAfterShrink;
  const kwRiseEnd = kwRiseStart + KEYWORD_RISE.duration;
  const focusStart = kwRiseStart;
  const fws = buildLocalFocusWindows(focusStart, cardCount);
  const holdStart = fws[fws.length - 1].rampOutEnd;
  const holdEnd = holdStart + HOLD_AFTER_FOCUS.duration;
  return {
    shuffleStart, shuffleEnd,
    keywordRiseStart: kwRiseStart, keywordRiseEnd: kwRiseEnd,
    focusCycleStart: focusStart, focusWindows: fws,
    holdStart, holdEnd,
  };
}

/* ── Segment layout (global progress → local progress mapping) ── */

export interface LensSegment {
  readonly lensName: (typeof LENS_NAMES)[number];
  readonly keyword: string;
  readonly subtitle: string;
  readonly cards: readonly CardConfig[];
  /** Global progress where this lens's curtain starts */
  readonly globalStart: number;
  /** Global progress where this lens ends */
  readonly globalEnd: number;
  /** Size of the curtain sweep in global progress */
  readonly curtainSize: number;
  /** Size of the lens body in global progress */
  readonly bodySize: number;
  /** Global progress where the body starts (after curtain) */
  readonly bodyStart: number;
  /** Timing in LOCAL body progress space (0–bodySize). Add bodyStart to get global. */
  readonly body: LensBodyTiming;
}

function buildSegments(): { segments: LensSegment[]; totalSize: number } {
  const segments: LensSegment[] = [];
  let cursor = PROLOGUE_SIZE; // after the prologue

  for (let i = 0; i < LENS_NAMES.length; i++) {
    const lensName = LENS_NAMES[i];
    const cards = LENS_CARD_CONFIGS[lensName];
    const lens = getLens(lensName);
    const isFirst = i === 0;
    const isLast = i === LENS_NAMES.length - 1;

    // First lens: curtain already happened in prologue
    const curtainSize = isFirst ? 0 : CURTAIN_SWEEP_DURATION;
    const globalStart = cursor;
    const bodyStart = cursor + curtainSize;
    const bodyRawSize = lensBodySize(cards.length);

    // Add final dissolve for last lens, inter-lens pause for others
    const tailSize = isLast
      ? FINAL_DISSOLVE.delay + FINAL_DISSOLVE.duration
      : INTER_LENS_PAUSE;

    const globalEnd = bodyStart + bodyRawSize + tailSize;

    segments.push({
      lensName,
      keyword: LENS_DISPLAY[lensName],
      subtitle: lens.desc,
      cards,
      globalStart,
      globalEnd,
      curtainSize,
      bodySize: bodyRawSize,
      bodyStart,
      body: buildLensBody(cards.length),
    });

    cursor = globalEnd;
  }

  return { segments, totalSize: cursor };
}

const { segments, totalSize } = buildSegments();

export const LENS_SEGMENTS: readonly LensSegment[] = segments;

/**
 * Container height: totalSize × TUNED_CONTAINER_VH.
 * Using TUNED_CONTAINER_VH (2400) ensures each raw progress unit maps to the
 * same physical scroll distance the original single-lens hook was tuned against.
 */
export const CONTAINER_HEIGHT_VH = Math.ceil(totalSize * TUNED_CONTAINER_VH);

/**
 * Convert global scrollYProgress (0–1) to the raw progress value within
 * the full timeline. All segment boundaries are in this raw space.
 */
export const TOTAL_RAW_SIZE = totalSize;

/* ── Flat ref index helpers ── */

export const CARD_OFFSETS: readonly number[] = LENS_SEGMENTS.map((_, i) =>
  LENS_SEGMENTS.slice(0, i).reduce((sum, s) => sum + s.cards.length, 0),
);

export const TOTAL_CARDS = LENS_SEGMENTS.reduce((sum, s) => sum + s.cards.length, 0);
