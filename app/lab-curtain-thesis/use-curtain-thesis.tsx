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
import { getLens, getEntry } from "@data";
import { USERS_CARDS, renderChoreographyCard, type CardConfig } from "./card-config";
import {
  CONTAINER_HEIGHT_VH,
  CARD_HEIGHT_RATIO,
  ZONE_SPLIT_Y,
  THESIS_PHASE_START,
  THESIS_PHASE_DURATION,
  ARTIFACT_SHUFFLE,
  SUBTITLE,
  KEYWORD_RISE,
  FOCUS_CYCLE,
  FOCUS_CARD_STAGGER,
  KEYWORD_FONT_CAP,
  NARRATOR_STORY,
  CURTAIN_EDGE,
  CARD_SHADOWS,
  Z,
  BLUR_THRESHOLD,
  DEBUG_HUD,
} from "./curtain-thesis.config";

export { CONTAINER_HEIGHT_VH, SMOOTH_LERP_FACTOR } from "./curtain-thesis.config";

/* ── Active pillar cards ── */

const CARD_CONFIG: readonly CardConfig[] = USERS_CARDS;

interface CardPosition {
  toX: number;
  toY: number;
  /** Effective width% after applying max-width cap */
  effectiveWidthPct: number;
}

/**
 * Compute card positions from CARD_CONFIG. Pure percentage math.
 * Each card is placed within its zone, offset by deterministic jitter.
 * Width is capped by the card's maxWidthPx to prevent blowup on large screens.
 */
function computeCardPositions(viewportWidth: number): CardPosition[] {
  return CARD_CONFIG.map((cfg) => {
    const { zone, jitter, widthPct, maxWidthPx } = cfg;

    const pctPx = (widthPct / 100) * viewportWidth;
    const capped = pctPx > maxWidthPx;
    const effectiveWidthPct = capped
      ? (maxWidthPx / viewportWidth) * 100
      : widthPct;

    // When the px cap kicks in, the card is smaller than its zone expects.
    // Shrink the zone proportionally so cards don't drift apart on wide viewports.
    const shrinkRatio = capped ? effectiveWidthPct / widthPct : 1;
    const zoneCenterX = (zone.xMin + zone.xMax) / 2;
    const zoneCenterY = (zone.yMin + zone.yMax) / 2;
    const halfW = (zone.xMax - zone.xMin) / 2 * shrinkRatio;
    const halfH = (zone.yMax - zone.yMin) / 2 * shrinkRatio;

    const minX = zoneCenterX - halfW;
    const maxX = Math.max(minX, zoneCenterX + halfW - effectiveWidthPct);
    const minY = zoneCenterY - halfH;
    const estimatedHeightPct = effectiveWidthPct * CARD_HEIGHT_RATIO;
    const maxY = Math.max(minY, zoneCenterY + halfH - estimatedHeightPct);

    return {
      toX: lerp(minX, maxX, jitter.x),
      toY: lerp(minY, maxY, jitter.y),
      effectiveWidthPct,
    };
  });
}

/* ── Debug helpers ── */

interface FocusWindow { ws: number; rampInEnd: number; holdEnd: number; rampOutEnd: number }

/** Read opacity from a ref's inline style, or "?" if null. */
function readRefOpacity(el: HTMLElement | null): string {
  return el ? el.style.opacity.padStart(5) : "    ?";
}

/** Resolve the current scroll phase to a human-readable label for the debug HUD. */
function resolvePhase(progress: number, focusWindows: FocusWindow[]): string {
  if (progress < SCROLL.curtainStart) return "1-thesis";
  if (progress < SCROLL.curtainEnd) return "2-curtain";
  if (progress < ARTIFACT_SHUFFLE_START) return "3-post-curtain";
  if (progress < ARTIFACT_SHUFFLE_END) return "4-shuffle-in";
  if (progress < KEYWORD_RISE_START) return "5-hold";
  if (progress < KEYWORD_RISE_END) return "6-keyword-rise";

  for (let k = 0; k < focusWindows.length; k++) {
    const fw = focusWindows[k];
    if (progress >= fw.ws && progress < fw.rampOutEnd) {
      const sub = progress < fw.rampInEnd ? "ramp-in"
        : progress < fw.holdEnd ? "hold"
        : "ramp-out";
      return `7-focus → card-${CARD_CONFIG[k].entryId} (${sub})`;
    }
  }

  const lastFw = focusWindows[focusWindows.length - 1];
  return progress >= lastFw?.rampOutEnd ? "7-focus-done" : "7-focus";
}

/* ── Derived timing (module-level for resolvePhase access) ── */

const EC_TO_LOCAL_SCALE = EC_CONTAINER_VH / CONTAINER_HEIGHT_VH;
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
  ARTIFACT_SHUFFLE_START + (CARD_CONFIG.length - 1) * ARTIFACT_SHUFFLE.stagger + ARTIFACT_SHUFFLE.entranceDuration;

const KEYWORD_RISE_START = ARTIFACT_SHUFFLE_END + KEYWORD_RISE.holdAfterShrink;
const KEYWORD_RISE_END = KEYWORD_RISE_START + KEYWORD_RISE.duration;

const FOCUS_CYCLE_START = KEYWORD_RISE_START;

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
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cardPositionsRef = useRef<CardPosition[]>([]);
  const keywordRestYRef = useRef(50);
  const debugRef = useRef<HTMLPreElement>(null);

  const recomputePositions = useCallback(
    (viewportEl: HTMLDivElement) => {
      const positions = computeCardPositions(viewportEl.clientWidth);
      cardPositionsRef.current = positions;

      // Keyword rests at the midpoint between the bottom of upper cards and top of lower cards.
      // Upper cards: highest toY + estimated card height. Lower cards: lowest toY.
      const upperCards = positions.filter((_, i) => CARD_CONFIG[i].zone.yMax <= ZONE_SPLIT_Y);
      const lowerCards = positions.filter((_, i) => CARD_CONFIG[i].zone.yMin >= ZONE_SPLIT_Y);

      const upperBottom = upperCards.length > 0
        ? Math.max(...upperCards.map((p) => {
            return p.toY + p.effectiveWidthPct * CARD_HEIGHT_RATIO;
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
      thesisSentenceRef.current.style.filter = entranceBlur > BLUR_THRESHOLD ? `blur(${entranceBlur}px)` : "none";

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
      if (curtainAccentLineRef.current) curtainAccentLineRef.current.style.opacity = curtainIsMoving ? String(CURTAIN_EDGE.movingOpacity) : "0";
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
          prefixSpanRef.current.style.filter = d * PREFIX_DISSOLVE.fullBlurPx > BLUR_THRESHOLD ? `blur(${d * PREFIX_DISSOLVE.fullBlurPx}px)` : "none";
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
        const midCap = lerp(KEYWORD_FONT_CAP.startMaxPx, KEYWORD_FONT_CAP.endMaxPx, shrinkProgress);
        const finalVw = lerp(midSize, KEYWORD_RISE.endFontSizeVw, riseProgress);
        const finalCap = lerp(midCap, KEYWORD_FONT_CAP.riseMaxPx, riseProgress);
        postCurtainRef.current.style.fontSize = `min(${finalVw}vw, ${finalCap}px)`;
        postCurtainRef.current.style.top = `${lerp(keywordRestY, KEYWORD_RISE.endTopPercent, riseProgress)}%`;
        postCurtainRef.current.style.transform = `translate(-50%, -${lerp(50, 0, riseProgress)}%)`;

        if (subtitleRef.current) {
          const sIn = smoothstep(ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay, ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay + SUBTITLE.fadeInDuration, progress);
          const sOut = smoothstep(KEYWORD_RISE_START, KEYWORD_RISE_START + SUBTITLE.fadeOutDuration, progress);
          subtitleRef.current.style.opacity = String(sIn * (1 - sOut));
        }
      }

      /* ═══ Phase 5 + 7: Cards ═══ */

      const positions = cardPositionsRef.current;
      if (positions.length === 0) return;

      // Per-card focus: trapezoidal (rampIn → hold → rampOut)
      const focusValues: number[] = [];
      const focusWindows: FocusWindow[] = [];
      for (let i = 0; i < positions.length; i++) {
        const ws = FOCUS_CYCLE_START + i * FOCUS_CARD_STAGGER;
        const rampInEnd = ws + FOCUS_CYCLE.rampIn;
        const holdEnd = rampInEnd + FOCUS_CYCLE.hold;
        const rampOutEnd = holdEnd + FOCUS_CYCLE.rampOut;
        focusWindows.push({ ws, rampInEnd, holdEnd, rampOutEnd });

        const up = smoothstep(ws, rampInEnd, progress);
        const down = 1 - smoothstep(holdEnd, rampOutEnd, progress);
        focusValues.push(up * down);
      }

      for (let i = 0; i < positions.length; i++) {
        const el = artifactRefs.current[i];
        if (!el) continue;

        const pos = positions[i];
        const cfg = CARD_CONFIG[i];
        const fw = focusWindows[i];

        const cardStart = ARTIFACT_SHUFFLE_START + i * ARTIFACT_SHUFFLE.stagger;
        const slideProgress = smoothstep(cardStart, cardStart + ARTIFACT_SHUFFLE.entranceDuration, progress);

        const currentX = lerp(cfg.fromX, pos.toX, slideProgress);
        const currentY = lerp(cfg.fromY, pos.toY, slideProgress);
        const currentRotation = lerp(cfg.fromRotation, cfg.toRotation, slideProgress);

        const myFocus = focusValues[i];

        // Nudge: card moves to spotlight position during rampIn, STAYS during hold,
        // only returns during rampOut. We split focus into position vs brightness.
        const positionFocus = smoothstep(fw.ws, fw.rampInEnd, progress)
          * (1 - smoothstep(fw.holdEnd, fw.rampOutEnd, progress));

        const nudgeScale = cfg.nudgeScale ?? FOCUS_CYCLE.nudgeScale;
        const focusScale = lerp(1, nudgeScale, positionFocus);
        const nudgeX = cfg.nudgeX ?? FOCUS_CYCLE.nudgeX;
        const nudgeY = cfg.nudgeY ?? FOCUS_CYCLE.nudgeY;

        // Dimming: all cards dim fast at FOCUS_CYCLE_START.
        // The spotlit card overrides back to full brightness via myFocus.
        const dimRamp = smoothstep(
          FOCUS_CYCLE_START,
          FOCUS_CYCLE_START + FOCUS_CYCLE.dimRampDuration,
          progress,
        );
        const dimTarget = lerp(1, cfg.dimOpacity, dimRamp);
        // myFocus (0→1) pulls from dimTarget back to 1. Spotlit card = 1. Others stay dimmed.
        const focusOpacity = lerp(dimTarget, 1, myFocus);

        const baseOpacity = clamp(slideProgress * ARTIFACT_SHUFFLE.opacityRamp, 0, 1);

        el.style.opacity = String(baseOpacity * focusOpacity);
        el.style.left = `${currentX + positionFocus * nudgeX}%`;
        el.style.top = `${currentY + positionFocus * nudgeY}%`;
        el.style.width = `${pos.effectiveWidthPct}%`;
        el.style.transform = `rotate(${currentRotation}deg)${focusScale !== 1 ? ` scale(${focusScale})` : ""}`;
        el.style.transformOrigin = "top left";

        // Narrator story — first card waits for dim, later cards enter sooner
        const storyEl = storyRefs.current[i];
        if (storyEl) {
          const delay = i === 0 ? NARRATOR_STORY.firstFadeInDelay : NARRATOR_STORY.laterFadeInDelay;
          const storyStart = fw.ws + delay;
          const fadeDuration = Math.max(
            NARRATOR_STORY.minFadeInDuration,
            NARRATOR_STORY.firstFadeInDuration - i * NARRATOR_STORY.fadeInAccelPerCard,
          );
          const storyUp = smoothstep(storyStart, storyStart + fadeDuration, progress);
          const storyDown = 1 - smoothstep(fw.holdEnd, fw.rampOutEnd, progress);
          storyEl.style.opacity = String(storyUp * storyDown);
        }
      }

      // Debug HUD — live values every frame
      if (debugRef.current) {
        const phase = resolvePhase(progress, focusWindows);

        const lines = [
          `progress: ${progress.toFixed(4)}`,
          `phase:    ${phase}`,
          ``,
          `── thresholds ──`,
          `curtain:   ${SCROLL.curtainStart.toFixed(4)}–${SCROLL.curtainEnd.toFixed(4)}`,
          `shuffle:   ${ARTIFACT_SHUFFLE_START.toFixed(4)}–${ARTIFACT_SHUFFLE_END.toFixed(4)}`,
          `kw-rise:   ${KEYWORD_RISE_START.toFixed(4)}–${KEYWORD_RISE_END.toFixed(4)}`,
          `focus:     ${FOCUS_CYCLE_START.toFixed(4)}`,
          ``,
          `── per card ──`,
        ];

        for (let j = 0; j < positions.length; j++) {
          const cfg = CARD_CONFIG[j];
          const fw = focusWindows[j];
          const isSpotlit = focusValues[j] > DEBUG_HUD.spotlightThreshold;

          lines.push(
            `card-${cfg.entryId}${isSpotlit ? " ★" : ""}  focus=${focusValues[j].toFixed(3)} ` +
            `op=${readRefOpacity(artifactRefs.current[j])} ` +
            `story=${readRefOpacity(storyRefs.current[j])} ` +
            `dim=${cfg.dimOpacity}`,
          );
          lines.push(
            `        in=${fw.ws.toFixed(4)}→${fw.rampInEnd.toFixed(4)} ` +
            `hold→${fw.holdEnd.toFixed(4)} ` +
            `out→${fw.rampOutEnd.toFixed(4)}`,
          );
        }

        debugRef.current.textContent = lines.join("\n");
      }

    }
  }

  /* ---- JSX ---- */

  /**
   * Full-screen layers: curtain overlay must span the entire viewport
   * (lives outside the max-width content wrapper in page.tsx).
   */
  const fullScreenJsx = (
    <>
      {/* Thesis sentence — centered via translate, unaffected by wrapper width */}
      <div
        ref={thesisSentenceRef}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0, fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)", color: "var(--cream)",
          fontWeight: 400, maxWidth: EC_THESIS.maxWidthLg, lineHeight: 1.5,
          willChange: "transform, opacity, filter", zIndex: Z.thesis,
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

      {/* Curtain — must cover full viewport width */}
      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "0%", zIndex: Z.curtain, background: "var(--bg, #07070A)", pointerEvents: "none",
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
    </>
  );

  /**
   * Content layers: cards, keyword, narrator — positioned relative to the
   * max-width wrapper so they don't spread apart on zoom-out / ultra-wide.
   */
  const contentJsx = (
    <>
      <div
        ref={postCurtainRef}
        className="absolute select-none pointer-events-none"
        style={{
          opacity: 0, left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-serif)", fontSize: `min(${POST_CURTAIN.startFontSizeVw}vw, ${KEYWORD_FONT_CAP.startMaxPx}px)`,
          fontWeight: 400, color: POST_CURTAIN.color, letterSpacing: "0.06em",
          textAlign: "center", zIndex: Z.keyword, willChange: "opacity, font-size, top, transform",
        }}>
        users
        <div ref={subtitleRef} style={{
          opacity: 0, fontSize: SUBTITLE.fontSize, fontFamily: "var(--font-serif)",
          fontStyle: "italic", color: "var(--cream-muted)", fontWeight: 400,
          letterSpacing: "0.01em", marginTop: "0.5em", whiteSpace: "nowrap", willChange: "opacity",
        }}>
          {getLens("users").desc}
        </div>
      </div>

      {/* Narrator story text — positioned per card config */}
      {CARD_CONFIG.map((cfg, i) => {
        const entry = getEntry(cfg.entryId);
        if (!entry) return null;

        return (
          <div
            key={`story-${cfg.entryId}`}
            ref={(el) => { storyRefs.current[i] = el; }}
            className="absolute select-none pointer-events-none"
            style={{
              opacity: 0,
              left: `${cfg.storyX}%`,
              top: `${cfg.storyY}%`,
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: NARRATOR_STORY.maxWidth,
              fontSize: NARRATOR_STORY.fontSize,
              lineHeight: NARRATOR_STORY.lineHeight,
              fontFamily: "var(--font-narrator)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--cream-muted)",
              background: NARRATOR_STORY.bgGradient,
              padding: NARRATOR_STORY.bgPadding,
              zIndex: Z.narrator,
              willChange: "opacity",
            }}>
            {entry.story}
          </div>
        );
      })}

      {/* Artifact cards — percentage width relative to capped container */}
      {CARD_CONFIG.map((cfg, i) => (
        <div
          key={cfg.entryId}
          ref={(el) => { artifactRefs.current[i] = el; }}
          className="absolute pointer-events-none"
          style={{
            opacity: 0,
            left: `${cfg.fromX}%`,
            top: `${cfg.fromY}%`,
            transform: `rotate(${cfg.fromRotation}deg)`,
            width: `${cfg.widthPct}%`,
            zIndex: Z.cards + i,
            transformOrigin: "top left",
          }}>
          {renderChoreographyCard(cfg.entryId, {
            boxShadow: cfg.brightness === "light" ? CARD_SHADOWS.light : CARD_SHADOWS.dark,
          })}
        </div>
      ))}

      {/* Debug HUD — remove when tuning is done */}
      <pre
        ref={debugRef}
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          zIndex: Z.debug,
          background: "rgba(0,0,0,0.85)",
          color: "#0f0",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 11,
          lineHeight: 1.4,
          padding: "10px 14px",
          borderRadius: 6,
          border: "1px solid rgba(0,255,0,0.15)",
          pointerEvents: "none",
          whiteSpace: "pre",
          minWidth: 340,
        }}
      />
    </>
  );

  return { update, fullScreenJsx, contentJsx, recomputePositions };
}
