"use client";

import { useRef, useCallback } from "react";
import { CONTENT } from "../engineer-candidate/engineer-data";
import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
  CURTAIN_THESIS,
  PREFIX_DISSOLVE,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";
import {
  JiraCard,
  SentryCard,
  SlackCard,
} from "../lab-artifacts/artifact-cards";

/* ── Local config ── */

export const CONTAINER_HEIGHT_VH = 900;

const EC_TO_LOCAL_SCALE = EC_CONTAINER_VH / CONTAINER_HEIGHT_VH;

const THESIS_PHASE_START = 0.0;
const THESIS_PHASE_DURATION = 0.25;

export const SMOOTH_LERP_FACTOR = 0.07;

/* ── Card layout ──
 *
 * Cards use percentage-based widths — NO transform:scale().
 * The card components are already responsive (ArtifactShell adapts to parent width).
 * On smaller viewports, percentage widths naturally give smaller pixel widths,
 * and the card content reflows to stay rectangular.
 *
 * Each card is assigned a zone. Position is computed as a percentage
 * within the zone using deterministic jitter seeds.
 */

/** Card width as % of viewport — wide enough for landscape rectangles.
 *  TODO(S7): Per-pillar config — different card counts need different distributions. */
const CARD_WIDTH_PCT = [34, 33, 36] as const; // Jira, Sentry, Slack

/**
 * Max card width in px per card — prevents cards from blowing up on large screens.
 * TODO(S7): Move into per-pillar config. Gaps has 4 cards, Patterns has 5 —
 * zones, max widths, jitter seeds, and entrance directions will all vary per pillar.
 */
const CARD_MAX_WIDTH_PX = [480, 460, 620] as const; // Jira, Sentry, Slack

/** Card definitions — entrance animation only.
 *  TODO(S7): Per-pillar config — 4 cards need 4 zones, different entrances. */
const CARDS = [
  // Jira — upper-left
  { widthPct: CARD_WIDTH_PCT[0], fromX: -40, fromY: 20, fromRotation: -18, toRotation: -3.5 },
  // Sentry — upper-right
  { widthPct: CARD_WIDTH_PCT[1], fromX: 140, fromY: 15, fromRotation: 12, toRotation: 2.5 },
  // Slack — lower-center
  { widthPct: CARD_WIDTH_PCT[2], fromX: 30, fromY: 120, fromRotation: -6, toRotation: -1.5 },
] as const;

/** Deterministic jitter seeds (0–1). Same scatter at every viewport, every load. */
const JITTER = [
  { x: 0.25, y: 0.3 },
  { x: 0.65, y: 0.2 },
  { x: 0.45, y: 0.4 },
] as const;

/**
 * Zones define where each card can land (% of viewport).
 * Center vertical strip excluded for "users" rise path.
 */
const ZONES = [
  { xMin: 2, xMax: 42, yMin: 3, yMax: 46 },   // upper-left
  { xMin: 56, xMax: 97, yMin: 3, yMax: 46 },   // upper-right
  { xMin: 8, xMax: 92, yMin: 60, yMax: 96 },   // lower strip
] as const;

interface CardPosition {
  toX: number;
  toY: number;
  /** Effective width% after applying max-width cap */
  effectiveWidthPct: number;
}

/**
 * Compute card positions. Pure percentage math.
 * Each card is placed within its zone, offset by deterministic jitter.
 * The card's effective width (capped by CARD_MAX_WIDTH_PX) is subtracted
 * from the zone to prevent right-edge clipping.
 */
function computeCardPositions(viewportWidth: number): CardPosition[] {
  return CARDS.map((card, i) => {
    const zone = ZONES[i];
    const seed = JITTER[i];

    // Cap width: use percentage unless it exceeds this card's max px
    const maxPx = CARD_MAX_WIDTH_PX[i];
    const pctPx = (card.widthPct / 100) * viewportWidth;
    const effectiveWidthPct = pctPx > maxPx
      ? (maxPx / viewportWidth) * 100
      : card.widthPct;

    const minX = zone.xMin;
    const maxX = Math.max(minX, zone.xMax - effectiveWidthPct);
    const minY = zone.yMin;
    const estimatedHeightPct = effectiveWidthPct * 0.6;
    const maxY = Math.max(minY, zone.yMax - estimatedHeightPct);

    return {
      toX: lerp(minX, maxX, seed.x),
      toY: lerp(minY, maxY, seed.y),
      effectiveWidthPct,
    };
  });
}

/** Scroll progress budget for each artifact's entrance */
const ARTIFACT_SHUFFLE = {
  stagger: 0.04,
  entranceDuration: 0.1,
  opacityRamp: 2.5,
} as const;

const SUBTITLE = {
  fadeInDelay: 0.02,
  fadeInDuration: 0.03,
  fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
} as const;

const KEYWORD_RISE = {
  holdAfterShrink: 0.03,
  duration: 0.12,
  endTopPercent: 3,
  endFontSizeVw: 2.8,
} as const;

const FOCUS_CYCLE = {
  cardDuration: 0.10,
  cardGap: 0.005,
  nudgeX: 1.5,
  nudgeY: -1,
  nudgeScale: 1.02,
  dimOpacity: 0.15,
  rampIn: 0.06,
  rampOut: 0.06,
  dimStagger: 0.02,
  dimRampDuration: 0.04,
} as const;

const CURTAIN_EDGE = {
  accentLineHeight: 1,
  gradientOvershoot: 20,
} as const;

const CARD_SHADOWS = {
  light: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
  dark: "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(225,86,124,0.08)",
} as const;

/* ── Derived timing ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

const KEYWORD_REVEAL_START =
  THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;
const KEYWORD_STAGGER = EC_THESIS.wordStagger * EC_TO_LOCAL_SCALE;
const KEYWORD_REVEAL_DURATION = EC_THESIS.wordRevealDur * EC_TO_LOCAL_SCALE;
const FINAL_KEYWORD_END =
  KEYWORD_REVEAL_START + (KEYWORD_COUNT - 1) * KEYWORD_STAGGER + KEYWORD_REVEAL_DURATION;

const SCROLL = {
  thesisStart: THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  curtainStart: FINAL_KEYWORD_END + CURTAIN_THESIS.pauseAfterWords,
  curtainEnd: FINAL_KEYWORD_END + CURTAIN_THESIS.pauseAfterWords + CURTAIN_THESIS.sweepDuration,
} as const;

const ARTIFACT_SHUFFLE_START = SCROLL.curtainEnd + POST_CURTAIN.appearDuration;
const ARTIFACT_SHUFFLE_END =
  ARTIFACT_SHUFFLE_START + (CARDS.length - 1) * ARTIFACT_SHUFFLE.stagger + ARTIFACT_SHUFFLE.entranceDuration;

const KEYWORD_RISE_START = ARTIFACT_SHUFFLE_END + KEYWORD_RISE.holdAfterShrink;
const KEYWORD_RISE_END = KEYWORD_RISE_START + KEYWORD_RISE.duration;

const FOCUS_CYCLE_START = KEYWORD_RISE_START;
const FOCUS_CYCLE_CARD_WINDOW = FOCUS_CYCLE.cardDuration + FOCUS_CYCLE.cardGap;

/* ── Hook ── */

export function useCurtainThesis() {
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);
  const postCurtainRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const artifactRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cardPositionsRef = useRef<CardPosition[]>([]);
  const keywordRestYRef = useRef(50);

  const recomputePositions = useCallback(
    (viewportEl: HTMLDivElement) => {
      const positions = computeCardPositions(viewportEl.clientWidth);
      cardPositionsRef.current = positions;

      // Keyword rests at the midpoint between the bottom of upper cards and top of lower cards.
      // Upper cards: highest toY + estimated card height. Lower cards: lowest toY.
      const upperCards = positions.filter((_, i) => ZONES[i].yMax <= 50);
      const lowerCards = positions.filter((_, i) => ZONES[i].yMin >= 50);

      const upperBottom = upperCards.length > 0
        ? Math.max(...upperCards.map((p) => {
            return p.toY + p.effectiveWidthPct * 0.6; // toY + estimated card height
          }))
        : 0;
      const lowerTop = lowerCards.length > 0
        ? Math.min(...lowerCards.map((p) => p.toY))
        : 100;

      keywordRestYRef.current = (upperBottom + lowerTop) / 2;
    },
    [],
  );

  function update(
    progress: number,
    viewportRef: React.RefObject<HTMLDivElement | null>,
  ) {
    /* ═══ Phase 1: Thesis entrance ═══ */

    if (thesisSentenceRef.current) {
      const fadeInEnd = SCROLL.thesisStart + SCROLL.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeInProgress = smoothstep(SCROLL.thesisStart, fadeInEnd, progress);
      const fastDrift = smoothstep(SCROLL.thesisStart, KEYWORD_REVEAL_START, progress);
      const slowDrift = smoothstep(KEYWORD_REVEAL_START, FINAL_KEYWORD_END, progress);
      const combinedDrift = fastDrift * EC_THESIS.driftFastWeight + slowDrift * EC_THESIS.driftSlowWeight;
      const verticalOffset = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, combinedDrift);
      const entranceBlur = lerp(EC_THESIS.initialBlur, 0, fadeInProgress);

      thesisSentenceRef.current.style.opacity = String(fadeInProgress);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${verticalOffset}vh))`;
      thesisSentenceRef.current.style.filter = entranceBlur > 0.1 ? `blur(${entranceBlur}px)` : "none";

      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const keywordSpan = keywordSpanRefs.current[i];
        if (!keywordSpan) continue;
        const thisKeywordStart = KEYWORD_REVEAL_START + i * KEYWORD_STAGGER;
        const kp = smoothstep(thisKeywordStart, thisKeywordStart + KEYWORD_REVEAL_DURATION, progress);
        keywordSpan.style.opacity = String(kp);
        keywordSpan.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, kp)}px)`;
        keywordSpan.style.display = "inline-block";
      }
    }

    /* ═══ Phase 2: Curtain ═══ */

    if (curtainOverlayRef.current) {
      const curtainProgress = clamp(
        (progress - SCROLL.curtainStart) / (SCROLL.curtainEnd - SCROLL.curtainStart), 0, 1,
      );
      curtainOverlayRef.current.style.height = `${curtainProgress * 100}%`;

      const curtainIsMoving = curtainProgress > 0 && curtainProgress < 1;
      if (curtainAccentLineRef.current) curtainAccentLineRef.current.style.opacity = curtainIsMoving ? "0.7" : "0";
      if (curtainGradientRef.current) curtainGradientRef.current.style.opacity = curtainIsMoving ? "1" : "0";

      /* ═══ Phase 3: Prefix dissolution ═══ */

      if (prefixSpanRef.current && viewportRef.current && curtainProgress > 0) {
        const viewportRect = viewportRef.current.getBoundingClientRect();
        const viewportHeight = viewportRect.height;
        const curtainLineY = viewportHeight * (1 - curtainProgress);
        const prefixRect = prefixSpanRef.current.getBoundingClientRect();
        const prefixBottomRelative = prefixRect.bottom - viewportRect.top;
        const lookaheadPx = viewportHeight * PREFIX_DISSOLVE.lookaheadFrac;
        const dist = curtainLineY - prefixBottomRelative;

        if (dist < lookaheadPx) {
          const d = clamp(1 - dist / lookaheadPx, 0, 1);
          prefixSpanRef.current.style.filter = d * PREFIX_DISSOLVE.fullBlurPx > 0.1 ? `blur(${d * PREFIX_DISSOLVE.fullBlurPx}px)` : "none";
          prefixSpanRef.current.style.opacity = String(lerp(1, PREFIX_DISSOLVE.minOpacity, d));
        } else {
          prefixSpanRef.current.style.filter = "none";
          prefixSpanRef.current.style.opacity = "1";
        }
      }

      /* ═══ Phase 4: "users" — appear → shrink → rise ═══ */

      if (postCurtainRef.current) {
        const appearProgress = smoothstep(SCROLL.curtainEnd, SCROLL.curtainEnd + POST_CURTAIN.appearDuration, progress);
        const shrinkProgress = smoothstep(ARTIFACT_SHUFFLE_START, ARTIFACT_SHUFFLE_END, progress);
        const riseProgress = smoothstep(KEYWORD_RISE_START, KEYWORD_RISE_END, progress);

        // Keyword rests at the midpoint of the gap between upper and lower card zones
        const keywordRestY = keywordRestYRef.current;

        // Rise AND fade simultaneously — gone by the time it reaches the top
        const riseFade = 1 - riseProgress;
        postCurtainRef.current.style.opacity = String(appearProgress * riseFade);
        const midSize = lerp(POST_CURTAIN.startFontSizeVw, POST_CURTAIN.endFontSizeVw, shrinkProgress);
        postCurtainRef.current.style.fontSize = `${lerp(midSize, KEYWORD_RISE.endFontSizeVw, riseProgress)}vw`;
        postCurtainRef.current.style.top = `${lerp(keywordRestY, KEYWORD_RISE.endTopPercent, riseProgress)}%`;
        postCurtainRef.current.style.transform = `translate(-50%, -${lerp(50, 0, riseProgress)}%)`;

        if (subtitleRef.current) {
          const sIn = smoothstep(ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay, ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay + SUBTITLE.fadeInDuration, progress);
          const sOut = smoothstep(KEYWORD_RISE_START, KEYWORD_RISE_START + 0.03, progress);
          subtitleRef.current.style.opacity = String(sIn * (1 - sOut));
        }
      }

      /* ═══ Phase 5 + 7: Cards ═══ */

      const positions = cardPositionsRef.current;
      if (positions.length === 0) return;

      const focusValues: number[] = [];
      for (let i = 0; i < positions.length; i++) {
        const ws = FOCUS_CYCLE_START + i * FOCUS_CYCLE_CARD_WINDOW;
        const we = ws + FOCUS_CYCLE.cardDuration;
        focusValues.push(smoothstep(ws, ws + FOCUS_CYCLE.rampIn, progress) * (1 - smoothstep(we - FOCUS_CYCLE.rampOut, we, progress)));
      }

      for (let i = 0; i < positions.length; i++) {
        const el = artifactRefs.current[i];
        if (!el) continue;

        const pos = positions[i];
        const card = CARDS[i];

        const cardStart = ARTIFACT_SHUFFLE_START + i * ARTIFACT_SHUFFLE.stagger;
        const slideProgress = smoothstep(cardStart, cardStart + ARTIFACT_SHUFFLE.entranceDuration, progress);

        const currentX = lerp(card.fromX, pos.toX, slideProgress);
        const currentY = lerp(card.fromY, pos.toY, slideProgress);
        const currentRotation = lerp(card.fromRotation, card.toRotation, slideProgress);

        const myFocus = focusValues[i];
        const focusScale = lerp(1, FOCUS_CYCLE.nudgeScale, myFocus);

        // Dimming: a card dims when ANOTHER card is spotlit and this one isn't.
        // Sum of all OTHER cards' focus values = how much "someone else is in the spotlight"
        let othersSpotlit = 0;
        for (let j = 0; j < focusValues.length; j++) {
          if (j !== i) othersSpotlit = Math.max(othersSpotlit, focusValues[j]);
        }
        // Stagger the dim onset per card (cards further from the active one dim slightly later)
        const dimDelay = i * FOCUS_CYCLE.dimStagger;
        const dimProgress = smoothstep(
          FOCUS_CYCLE_START + dimDelay,
          FOCUS_CYCLE_START + dimDelay + FOCUS_CYCLE.dimRampDuration,
          progress,
        );
        // Dim only when others are spotlit AND this card has started its dim ramp
        const dimAmount = dimProgress * othersSpotlit;
        const focusOpacity = lerp(1, FOCUS_CYCLE.dimOpacity, dimAmount * (1 - myFocus));

        const baseOpacity = clamp(slideProgress * ARTIFACT_SHUFFLE.opacityRamp, 0, 1);

        el.style.opacity = String(baseOpacity * focusOpacity);
        el.style.left = `${currentX + myFocus * FOCUS_CYCLE.nudgeX}%`;
        el.style.top = `${currentY + myFocus * FOCUS_CYCLE.nudgeY}%`;
        el.style.width = `${pos.effectiveWidthPct}%`;
        el.style.transform = `rotate(${currentRotation}deg)${focusScale !== 1 ? ` scale(${focusScale})` : ""}`;
        el.style.transformOrigin = "top left";
      }

    }
  }

  /* ---- JSX ---- */
  const jsx = (
    <>
      <div
        ref={thesisSentenceRef}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0, fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)", color: "var(--cream)",
          fontWeight: 400, maxWidth: EC_THESIS.maxWidthLg, lineHeight: 1.5,
          willChange: "transform, opacity, filter", zIndex: 1,
        }}>
        <span ref={prefixSpanRef} style={{ willChange: "filter, opacity" }}>{thesisData.prefix}</span>
        <span style={{ whiteSpace: "nowrap" }}>
          {thesisData.keywords.map((word, i) => (
            <span key={word}>
              <span
                ref={(el) => { keywordSpanRefs.current[i] = el; }}
                style={{
                  opacity: 0, willChange: "opacity, transform",
                  marginRight: i < thesisData.keywords.length - 1 ? "0.3em" : undefined,
                }}>
                {i === thesisData.keywords.length - 1 ? `${thesisData.conjunction}${word}.` : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>

      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "0%", zIndex: 2, background: "var(--bg, #07070A)", pointerEvents: "none",
        }}>
        <div ref={curtainAccentLineRef} style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: CURTAIN_EDGE.accentLineHeight, background: CURTAIN_THESIS.accentColor, opacity: 0,
        }} />
        <div ref={curtainGradientRef} style={{
          position: "absolute", top: -CURTAIN_EDGE.gradientOvershoot, left: 0, right: 0,
          height: CURTAIN_EDGE.gradientOvershoot,
          background: `linear-gradient(to bottom, transparent, var(--bg, #07070A))`, opacity: 0,
        }} />
      </div>

      <div
        ref={postCurtainRef}
        className="absolute select-none pointer-events-none"
        style={{
          opacity: 0, left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-serif)", fontSize: `${POST_CURTAIN.startFontSizeVw}vw`,
          fontWeight: 400, color: POST_CURTAIN.color, letterSpacing: "0.06em",
          textAlign: "center", zIndex: 10, willChange: "opacity, font-size, top, transform",
        }}>
        users
        <div ref={subtitleRef} style={{
          opacity: 0, fontSize: SUBTITLE.fontSize, fontFamily: "var(--font-serif)",
          fontStyle: "italic", color: "var(--cream-muted)", fontWeight: 400,
          letterSpacing: "0.01em", marginTop: "0.5em", whiteSpace: "nowrap", willChange: "opacity",
        }}>
          What people actually experience.
        </div>
      </div>


      {/* Artifact cards — percentage width, no transform:scale for sizing */}
      {CARDS.map((card, i) => (
        <div
          key={i}
          ref={(el) => { artifactRefs.current[i] = el; }}
          className="absolute pointer-events-none"
          style={{
            opacity: 0,
            left: `${card.fromX}%`,
            top: `${card.fromY}%`,
            transform: `rotate(${card.fromRotation}deg)`,
            width: `${card.widthPct}%`,
            zIndex: 4 + i,
            transformOrigin: "top left",
          }}>
          {i === 0 && <JiraCard style={{ boxShadow: CARD_SHADOWS.light }} />}
          {i === 1 && <SentryCard style={{ boxShadow: CARD_SHADOWS.dark }} />}
          {i === 2 && <SlackCard style={{ boxShadow: CARD_SHADOWS.light }} />}
        </div>
      ))}
    </>
  );

  return { update, jsx, recomputePositions };
}
