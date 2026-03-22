/**
 * Timeline builder for the multi-lens scroll choreography.
 * Pure computation at module level — no React, no DOM, no side effects.
 *
 * All timing values are normalized to 0–1 progress space (matching scrollYProgress).
 * CONTAINER_HEIGHT_VH is auto-derived so physical scroll pacing stays comfortable.
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
  FINAL_DISSOLVE,
} from "./lenses.config";
import type { LensSegment, PrologueTiming, FocusWindow } from "./lenses.types";

/* ══════════════════════════════════════════════════════
   Phase 1: Build raw (unnormalized) timeline
   All values in the same fractional space as the config
   constants. Will be rescaled to 0–1 after totalling.
   ══════════════════════════════════════════════════════ */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

const tempScale = EC_CONTAINER_VH / TUNED_CONTAINER_VH;
const rawKwRevealStart = THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;
const rawKwStagger = EC_THESIS.wordStagger * tempScale;
const rawKwRevealDur = EC_THESIS.wordRevealDur * tempScale;
const rawKwEnd = rawKwRevealStart + (KEYWORD_COUNT - 1) * rawKwStagger + rawKwRevealDur;

const rawCurtain1Start = rawKwEnd + CURTAIN_THESIS.pauseAfterWords;
const rawCurtain1End = rawCurtain1Start + CURTAIN_THESIS.sweepDuration;

/* ── Per-lens focus windows ── */

function buildFocusWindows(start: number, count: number): FocusWindow[] {
  return Array.from({ length: count }, (_, i) => {
    const ws = start + i * FOCUS_CARD_STAGGER;
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

/* ── Build all segments ── */

interface RawSeg {
  lensName: (typeof LENS_NAMES)[number];
  keyword: string;
  subtitle: string;
  cards: LensSegment["cards"];
  curtainStart: number; curtainEnd: number;
  keywordAppearStart: number;
  shuffleStart: number; shuffleEnd: number;
  keywordRiseStart: number; keywordRiseEnd: number;
  focusCycleStart: number;
  focusWindows: FocusWindow[];
  holdStart: number; holdEnd: number;
  segmentEnd: number;
}

function buildRawSegments(): { segs: RawSeg[]; rawPrologue: PrologueTiming; totalEnd: number } {
  const segs: RawSeg[] = [];
  let cursor = rawCurtain1End;

  for (let i = 0; i < LENS_NAMES.length; i++) {
    const lensName = LENS_NAMES[i];
    const cards = LENS_CARD_CONFIGS[lensName];
    const lens = getLens(lensName);
    const isFirst = i === 0;
    const isLast = i === LENS_NAMES.length - 1;

    const curtainStart = isFirst ? rawCurtain1Start : cursor;
    const curtainEnd = isFirst ? rawCurtain1End : cursor + CURTAIN_THESIS.sweepDuration;
    const bodyStart = curtainEnd;
    if (!isFirst) cursor = curtainEnd;

    const shuffleStart = bodyStart + POST_CURTAIN.appearDuration;
    const shuffleEnd = shuffleStart + (cards.length - 1) * ARTIFACT_SHUFFLE.stagger + ARTIFACT_SHUFFLE.entranceDuration;
    const kwRiseStart = shuffleEnd + KEYWORD_RISE.holdAfterShrink;
    const kwRiseEnd = kwRiseStart + KEYWORD_RISE.duration;
    const focusStart = kwRiseStart;
    const fws = buildFocusWindows(focusStart, cards.length);
    const holdStart = fws[fws.length - 1].rampOutEnd;
    const holdEnd = holdStart + HOLD_AFTER_FOCUS.duration;
    const segEnd = isLast
      ? holdEnd + FINAL_DISSOLVE.delay + FINAL_DISSOLVE.duration
      : holdEnd + INTER_LENS_PAUSE;

    segs.push({
      lensName, keyword: LENS_DISPLAY[lensName], subtitle: lens.desc, cards,
      curtainStart, curtainEnd,
      keywordAppearStart: bodyStart,
      shuffleStart, shuffleEnd,
      keywordRiseStart: kwRiseStart, keywordRiseEnd: kwRiseEnd,
      focusCycleStart: focusStart, focusWindows: fws,
      holdStart, holdEnd, segmentEnd: segEnd,
    });

    cursor = segEnd;
  }

  const rawPrologue: PrologueTiming = {
    thesisStart: THESIS_PHASE_START,
    thesisDuration: THESIS_PHASE_DURATION,
    keywordRevealStart: rawKwRevealStart,
    keywordStagger: rawKwStagger,
    keywordRevealDuration: rawKwRevealDur,
    finalKeywordEnd: rawKwEnd,
    curtainStart: rawCurtain1Start,
    curtainEnd: rawCurtain1End,
  };

  return { segs, rawPrologue, totalEnd: cursor };
}

/* ══════════════════════════════════════════════════════
   Phase 2: Normalize everything to 0–1
   ══════════════════════════════════════════════════════ */

function rescaleFw(fw: FocusWindow, s: number): FocusWindow {
  return {
    ws: fw.ws * s, rampInEnd: fw.rampInEnd * s,
    storyHoldEnd: fw.storyHoldEnd * s, morphEnd: fw.morphEnd * s,
    morphHoldEnd: fw.morphHoldEnd * s, rampOutEnd: fw.rampOutEnd * s,
  };
}

const { segs, rawPrologue, totalEnd: rawTotal } = buildRawSegments();
const S = 1 / rawTotal;

export const PROLOGUE: PrologueTiming = {
  thesisStart: rawPrologue.thesisStart * S,
  thesisDuration: rawPrologue.thesisDuration * S,
  keywordRevealStart: rawPrologue.keywordRevealStart * S,
  keywordStagger: rawPrologue.keywordStagger * S,
  keywordRevealDuration: rawPrologue.keywordRevealDuration * S,
  finalKeywordEnd: rawPrologue.finalKeywordEnd * S,
  curtainStart: rawPrologue.curtainStart * S,
  curtainEnd: rawPrologue.curtainEnd * S,
};

export const LENS_SEGMENTS: readonly LensSegment[] = segs.map((r) => ({
  lensName: r.lensName, keyword: r.keyword, subtitle: r.subtitle, cards: r.cards,
  timing: {
    curtainStart: r.curtainStart * S, curtainEnd: r.curtainEnd * S,
    keywordAppearStart: r.keywordAppearStart * S,
    shuffleStart: r.shuffleStart * S, shuffleEnd: r.shuffleEnd * S,
    keywordRiseStart: r.keywordRiseStart * S, keywordRiseEnd: r.keywordRiseEnd * S,
    focusCycleStart: r.focusCycleStart * S,
    focusWindows: r.focusWindows.map((fw) => rescaleFw(fw, S)),
    holdStart: r.holdStart * S, holdEnd: r.holdEnd * S,
    segmentEnd: r.segmentEnd * S,
  },
}));

/** Auto-derived container height: rawTotal × BASE_SCROLL_VH */
export const CONTAINER_HEIGHT_VH = Math.ceil(rawTotal * BASE_SCROLL_VH);

/* ── Flat ref index helpers ── */

export const CARD_OFFSETS: readonly number[] = LENS_SEGMENTS.map((_, i) =>
  LENS_SEGMENTS.slice(0, i).reduce((sum, s) => sum + s.cards.length, 0),
);

export const TOTAL_CARDS = LENS_SEGMENTS.reduce((sum, s) => sum + s.cards.length, 0);
