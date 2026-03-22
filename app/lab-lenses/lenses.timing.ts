/**
 * Timeline builder for the multi-lens scroll choreography.
 * Pure computation at module level — no React, no DOM, no side effects.
 *
 * Exports the full timeline (LENS_SEGMENTS), auto-derived container height,
 * and flat-ref index helpers. Consumed by the animation hook and page.
 */

import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
  CURTAIN_THESIS,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { CONTENT } from "../engineer-candidate/engineer-data";
import { LENS_NAMES, getLens, LENS_DISPLAY } from "@data";
import { LENS_CARD_CONFIGS } from "./card-config";
import {
  BASE_SCROLL_VH,
  THESIS_PHASE_START,
  THESIS_PHASE_DURATION,
  ARTIFACT_SHUFFLE,
  KEYWORD_RISE,
  FOCUS_CYCLE,
  FOCUS_CARD_TOTAL,
  FOCUS_CARD_STAGGER,
  HOLD_AFTER_FOCUS,
  INTER_LENS_PAUSE,
  FINAL_DISSOLVE,
} from "./lenses.config";
import type { LensSegment, PrologueTiming, FocusWindow } from "./lenses.types";

/* ── Prologue: thesis sentence + first curtain ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

// EC constants scaled to our timeline
const KEYWORD_REVEAL_START =
  THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;
// Keyword timing uses raw EC values scaled to our progress space
// EC_TO_LOCAL_SCALE will be computed after we know CONTAINER_HEIGHT_VH,
// but for the prologue we use a temporary scale based on BASE_SCROLL_VH
const tempScale = EC_CONTAINER_VH / BASE_SCROLL_VH;
const KEYWORD_STAGGER = EC_THESIS.wordStagger * tempScale;
const KEYWORD_REVEAL_DURATION = EC_THESIS.wordRevealDur * tempScale;
const FINAL_KEYWORD_END =
  KEYWORD_REVEAL_START + (KEYWORD_COUNT - 1) * KEYWORD_STAGGER + KEYWORD_REVEAL_DURATION;

const FIRST_CURTAIN_START = FINAL_KEYWORD_END + CURTAIN_THESIS.pauseAfterWords;
const FIRST_CURTAIN_END = FIRST_CURTAIN_START + CURTAIN_THESIS.sweepDuration;

export const PROLOGUE: PrologueTiming = {
  thesisStart: THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  keywordRevealStart: KEYWORD_REVEAL_START,
  keywordStagger: KEYWORD_STAGGER,
  keywordRevealDuration: KEYWORD_REVEAL_DURATION,
  finalKeywordEnd: FINAL_KEYWORD_END,
  curtainStart: FIRST_CURTAIN_START,
  curtainEnd: FIRST_CURTAIN_END,
};

/* ── Per-lens segment builder ── */

function buildFocusWindows(focusCycleStart: number, cardCount: number): FocusWindow[] {
  const windows: FocusWindow[] = [];
  for (let i = 0; i < cardCount; i++) {
    const ws = focusCycleStart + i * FOCUS_CARD_STAGGER;
    windows.push({
      ws,
      rampInEnd: ws + FOCUS_CYCLE.rampIn,
      storyHoldEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold,
      morphEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold + FOCUS_CYCLE.morphDur,
      morphHoldEnd: ws + FOCUS_CYCLE.rampIn + FOCUS_CYCLE.storyHold + FOCUS_CYCLE.morphDur + FOCUS_CYCLE.morphHold,
      rampOutEnd: ws + FOCUS_CARD_TOTAL,
    });
  }
  return windows;
}

function buildSegment(
  lensName: (typeof LENS_NAMES)[number],
  bodyStart: number,
  isLast: boolean,
): { segment: LensSegment; segmentEnd: number } {
  const cards = LENS_CARD_CONFIGS[lensName];
  const lens = getLens(lensName);

  // Keyword appear after curtain end (bodyStart = curtainEnd for this segment)
  const keywordAppearStart = bodyStart;
  const shuffleStart = bodyStart + POST_CURTAIN.appearDuration;
  const shuffleEnd = shuffleStart + (cards.length - 1) * ARTIFACT_SHUFFLE.stagger + ARTIFACT_SHUFFLE.entranceDuration;

  const keywordRiseStart = shuffleEnd + KEYWORD_RISE.holdAfterShrink;
  const keywordRiseEnd = keywordRiseStart + KEYWORD_RISE.duration;
  const focusCycleStart = keywordRiseStart;

  const focusWindows = buildFocusWindows(focusCycleStart, cards.length);
  const lastFw = focusWindows[focusWindows.length - 1];

  const holdStart = lastFw.rampOutEnd;
  const holdEnd = holdStart + HOLD_AFTER_FOCUS.duration;

  // Last lens gets a final dissolve; others get inter-lens pause before next curtain
  const segmentEnd = isLast
    ? holdEnd + FINAL_DISSOLVE.delay + FINAL_DISSOLVE.duration
    : holdEnd + INTER_LENS_PAUSE;

  return {
    segment: {
      lensName,
      keyword: LENS_DISPLAY[lensName],
      subtitle: lens.desc,
      cards,
      timing: {
        curtainStart: bodyStart - CURTAIN_THESIS.sweepDuration, // curtain starts before body
        curtainEnd: bodyStart,
        keywordAppearStart,
        shuffleStart,
        shuffleEnd,
        keywordRiseStart,
        keywordRiseEnd,
        focusCycleStart,
        focusWindows,
        holdStart,
        holdEnd,
        segmentEnd,
      },
    },
    segmentEnd,
  };
}

/* ── Full timeline ── */

function buildTimeline(): { segments: LensSegment[]; totalEnd: number } {
  const segments: LensSegment[] = [];
  let cursor = FIRST_CURTAIN_END;

  for (let i = 0; i < LENS_NAMES.length; i++) {
    const lensName = LENS_NAMES[i];
    const isFirst = i === 0;
    const isLast = i === LENS_NAMES.length - 1;

    if (isFirst) {
      // First lens: curtain already happened in prologue, body starts at curtainEnd
      const { segment, segmentEnd } = buildSegment(lensName, cursor, isLast);
      // Override curtain timing to match prologue's curtain
      segments.push({
        ...segment,
        timing: {
          ...segment.timing,
          curtainStart: FIRST_CURTAIN_START,
          curtainEnd: FIRST_CURTAIN_END,
        },
      });
      cursor = segmentEnd;
    } else {
      // Subsequent lenses: curtain sweep precedes the body
      const curtainStart = cursor;
      const curtainEnd = curtainStart + CURTAIN_THESIS.sweepDuration;
      const { segment, segmentEnd } = buildSegment(lensName, curtainEnd, isLast);
      segments.push({
        ...segment,
        timing: {
          ...segment.timing,
          curtainStart,
          curtainEnd,
        },
      });
      cursor = segmentEnd;
    }
  }

  return { segments, totalEnd: cursor };
}

const { segments, totalEnd } = buildTimeline();

export const LENS_SEGMENTS: readonly LensSegment[] = segments;
export const TIMELINE_END = totalEnd;

/** Auto-derived container height from total content length */
export const CONTAINER_HEIGHT_VH = Math.ceil(TIMELINE_END * BASE_SCROLL_VH);

/* ── Flat ref index helpers ── */

/** Starting index in the flat card ref arrays for each segment */
export const CARD_OFFSETS: readonly number[] = LENS_SEGMENTS.map((_, i) =>
  LENS_SEGMENTS.slice(0, i).reduce((sum, s) => sum + s.cards.length, 0),
);

/** Total number of cards across all lenses */
export const TOTAL_CARDS = LENS_SEGMENTS.reduce((sum, s) => sum + s.cards.length, 0);
