"use client";

/**
 * Lenses scroll choreography hook — single-lens (users only).
 *
 * ALL timing consumed from lenses.timing.ts (PROLOGUE + LENS_SEGMENTS[0]).
 * No inline timing derivation — the timing file is the single source of truth.
 * EC fractional constants (fadeInFrac, driftFastWeight, etc.) are unitless ratios
 * that remain valid regardless of normalization.
 */

import { useRef, useCallback } from "react";
import { CONTENT } from "../engineer-candidate/engineer-data";
import {
  THESIS as EC_THESIS,
  PREFIX_DISSOLVE,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";
import { getLens, getEntry } from "@data";
import { USERS_CARDS, renderChoreographyCard, type CardConfig } from "./card-config";
import {
  CARD_HEIGHT_RATIO,
  ZONE_SPLIT_Y,
  ARTIFACT_SHUFFLE,
  SUBTITLE,
  KEYWORD_RISE,
  FOCUS_CYCLE,
  MORPH,
  FINAL_DISSOLVE,
  KEYWORD_FONT_CAP,
  NARRATOR_STORY,
  CURTAIN_EDGE,
  CARD_SHADOWS,
  Z,
  BLUR_THRESHOLD,
} from "./lenses.config";
import { PROLOGUE, LENS_SEGMENTS, CONTAINER_HEIGHT_VH } from "./lenses.timing";

export { CONTAINER_HEIGHT_VH };
export { SMOOTH_LERP_FACTOR } from "./lenses.config";

/* ── Active pillar ── */

const CARD_CONFIG: readonly CardConfig[] = USERS_CARDS;

/* ── All timing from the normalized timeline ── */

const P = PROLOGUE;
const SEG = LENS_SEGMENTS[0]; // users segment
const T = SEG.timing;

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

/* ── Card positions ── */

interface CardPosition {
  toX: number;
  toY: number;
  effectiveWidthPct: number;
}

function computeCardPositions(viewportWidth: number): CardPosition[] {
  return CARD_CONFIG.map((cfg) => {
    const { zone, jitter, widthPct, maxWidthPx } = cfg;

    const pctPx = (widthPct / 100) * viewportWidth;
    const capped = pctPx > maxWidthPx;
    const effectiveWidthPct = capped
      ? (maxWidthPx / viewportWidth) * 100
      : widthPct;

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

function resolvePhase(progress: number): string {
  if (progress < P.curtainStart) return "1-thesis";
  if (progress < P.curtainEnd) return "2-curtain";
  if (progress < T.shuffleStart) return "3-post-curtain";
  if (progress < T.shuffleEnd) return "4-shuffle-in";
  if (progress < T.keywordRiseStart) return "5-hold";
  if (progress < T.keywordRiseEnd) return "6-keyword-rise";

  for (let k = 0; k < T.focusWindows.length; k++) {
    const fw = T.focusWindows[k];
    if (progress >= fw.ws && progress < fw.rampOutEnd) {
      const sub = progress < fw.rampInEnd ? "ramp-in"
        : progress < fw.storyHoldEnd ? "story"
        : progress < fw.morphEnd ? "morph"
        : progress < fw.morphHoldEnd ? "morph-hold"
        : "ramp-out";
      return `7-focus → card-${CARD_CONFIG[k].entryId} (${sub})`;
    }
  }

  if (progress < T.holdEnd) return "7-hold";
  return "8-done";
}

/* ── Hook ── */

export function useLenses() {
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);
  const postCurtainRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const artifactRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cardPositionsRef = useRef<CardPosition[]>([]);
  const keywordRestYRef = useRef(50);
  const debugRef = useRef<HTMLPreElement>(null);

  const recomputePositions = useCallback(
    (viewportEl: HTMLDivElement) => {
      const positions = computeCardPositions(viewportEl.clientWidth);
      cardPositionsRef.current = positions;

      const upperCards = positions.filter((_, i) => CARD_CONFIG[i].zone.yMax <= ZONE_SPLIT_Y);
      const lowerCards = positions.filter((_, i) => CARD_CONFIG[i].zone.yMin >= ZONE_SPLIT_Y);

      const upperBottom = upperCards.length > 0
        ? Math.max(...upperCards.map((p) => p.toY + p.effectiveWidthPct * CARD_HEIGHT_RATIO))
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
      const fadeInEnd = P.thesisStart + P.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeInProgress = smoothstep(P.thesisStart, fadeInEnd, progress);
      const fastDrift = smoothstep(P.thesisStart, P.keywordRevealStart, progress);
      const slowDrift = smoothstep(P.keywordRevealStart, P.finalKeywordEnd, progress);
      const combinedDrift = fastDrift * EC_THESIS.driftFastWeight + slowDrift * EC_THESIS.driftSlowWeight;
      const verticalOffset = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, combinedDrift);
      const entranceBlur = lerp(EC_THESIS.initialBlur, 0, fadeInProgress);

      thesisSentenceRef.current.style.opacity = String(fadeInProgress);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${verticalOffset}vh))`;
      thesisSentenceRef.current.style.filter = entranceBlur > BLUR_THRESHOLD ? `blur(${entranceBlur}px)` : "none";

      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const keywordSpan = keywordSpanRefs.current[i];
        if (!keywordSpan) continue;
        const thisKeywordStart = P.keywordRevealStart + i * P.keywordStagger;
        const kp = smoothstep(thisKeywordStart, thisKeywordStart + P.keywordRevealDuration, progress);
        keywordSpan.style.opacity = String(kp);
        keywordSpan.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, kp)}px)`;
        keywordSpan.style.display = "inline-block";
      }
    }

    /* ═══ Phase 2: Curtain ═══ */

    if (curtainOverlayRef.current) {
      const curtainProgress = clamp(
        (progress - P.curtainStart) / (P.curtainEnd - P.curtainStart), 0, 1,
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

      /* ═══ Phase 4: Keyword appear → shrink → rise ═══ */

      if (postCurtainRef.current) {
        const appearProgress = smoothstep(T.curtainEnd, T.curtainEnd + POST_CURTAIN.appearDuration, progress);
        const shrinkProgress = smoothstep(T.shuffleStart, T.shuffleEnd, progress);
        const riseProgress = smoothstep(T.keywordRiseStart, T.keywordRiseEnd, progress);

        const keywordRestY = keywordRestYRef.current;

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
          const sIn = smoothstep(T.shuffleStart + SUBTITLE.fadeInDelay, T.shuffleStart + SUBTITLE.fadeInDelay + SUBTITLE.fadeInDuration, progress);
          const sOut = smoothstep(T.keywordRiseStart, T.keywordRiseStart + SUBTITLE.fadeOutDuration, progress);
          subtitleRef.current.style.opacity = String(sIn * (1 - sOut));
        }
      }

      /* ═══ Phase 5 + 7: Cards ═══ */

      const positions = cardPositionsRef.current;
      if (positions.length === 0) return;

      const fws = T.focusWindows;

      // Per-card focus values
      const focusValues: number[] = [];
      for (let i = 0; i < positions.length; i++) {
        const fw = fws[i];
        const up = smoothstep(fw.ws, fw.rampInEnd, progress);
        const down = 1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, progress);
        focusValues.push(up * down);
      }

      // Dissolve after all cards complete
      const lastFw = fws[fws.length - 1];
      const dissolveStart = lastFw.rampOutEnd + FINAL_DISSOLVE.delay;
      const dissolveEnd = dissolveStart + FINAL_DISSOLVE.duration;
      const dissolveFade = 1 - smoothstep(dissolveStart, dissolveEnd, progress);

      for (let i = 0; i < positions.length; i++) {
        const el = artifactRefs.current[i];
        if (!el) continue;

        const pos = positions[i];
        const cfg = CARD_CONFIG[i];
        const fw = fws[i];

        const cardStart = T.shuffleStart + i * ARTIFACT_SHUFFLE.stagger;
        const slideProgress = smoothstep(cardStart, cardStart + ARTIFACT_SHUFFLE.entranceDuration, progress);

        const currentX = lerp(cfg.fromX, pos.toX, slideProgress);
        const currentY = lerp(cfg.fromY, pos.toY, slideProgress);
        const currentRotation = lerp(cfg.fromRotation, cfg.toRotation, slideProgress);

        const myFocus = focusValues[i];

        // Nudge
        const positionFocus = smoothstep(fw.ws, fw.rampInEnd, progress)
          * (1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, progress));

        const nudgeScale = cfg.nudgeScale ?? FOCUS_CYCLE.nudgeScale;
        const nudgeX = cfg.nudgeX ?? FOCUS_CYCLE.nudgeX;
        const nudgeY = cfg.nudgeY ?? FOCUS_CYCLE.nudgeY;

        // Morph
        const morph = smoothstep(fw.storyHoldEnd, fw.morphEnd, progress);

        const focusScale = lerp(1, nudgeScale, positionFocus);

        const frontEl = cardFrontRefs.current[i];
        const backEl = cardBackRefs.current[i];
        if (frontEl) frontEl.style.opacity = String(1 - morph);
        if (backEl) backEl.style.opacity = String(morph);

        // Dimming
        const dimRamp = smoothstep(
          T.focusCycleStart,
          T.focusCycleStart + FOCUS_CYCLE.dimRampDuration,
          progress,
        );
        const cardDimFloor = morph > 0.5 ? MORPH.dimOpacity : cfg.dimOpacity;
        const dimTarget = lerp(1, cardDimFloor, dimRamp);
        const focusOpacity = lerp(dimTarget, 1, myFocus);

        const baseOpacity = clamp(slideProgress * ARTIFACT_SHUFFLE.opacityRamp, 0, 1);

        el.style.opacity = String(baseOpacity * focusOpacity * dissolveFade);
        el.style.left = `${currentX + positionFocus * nudgeX}%`;
        el.style.top = `${currentY + positionFocus * nudgeY}%`;
        el.style.width = `${pos.effectiveWidthPct}%`;
        el.style.transform = `rotate(${currentRotation}deg)${focusScale !== 1 ? ` scale(${focusScale})` : ""}`;
        el.style.transformOrigin = "top left";

        // Narrator story
        const storyEl = storyRefs.current[i];
        if (storyEl) {
          const delay = i === 0 ? NARRATOR_STORY.firstFadeInDelay : NARRATOR_STORY.laterFadeInDelay;
          const storyStart = fw.ws + delay;
          const fadeDuration = Math.max(
            NARRATOR_STORY.minFadeInDuration,
            NARRATOR_STORY.firstFadeInDuration - i * NARRATOR_STORY.fadeInAccelPerCard,
          );
          const storyUp = smoothstep(storyStart, storyStart + fadeDuration, progress);
          const storyDown = 1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, progress);
          storyEl.style.opacity = String(storyUp * storyDown);
        }
      }

      // Debug HUD
      if (debugRef.current) {
        debugRef.current.textContent = [
          `progress: ${progress.toFixed(4)}`,
          `phase:    ${resolvePhase(progress)}`,
        ].join("\n");
      }
    }
  }

  /* ── JSX ── */

  const fullScreenJsx = (
    <>
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

      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "0%", zIndex: Z.curtain, background: "var(--bg, #07070A)", pointerEvents: "none",
        }}>
        <div ref={curtainAccentLineRef} style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: CURTAIN_EDGE.accentLineHeight, background: "var(--gold, #C9A84C)", opacity: 0,
        }} />
        <div ref={curtainGradientRef} style={{
          position: "absolute", top: -CURTAIN_EDGE.gradientOvershoot, left: 0, right: 0,
          height: CURTAIN_EDGE.gradientOvershoot,
          background: `linear-gradient(to bottom, transparent, var(--bg, #07070A))`, opacity: 0,
        }} />
      </div>
    </>
  );

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

      {CARD_CONFIG.map((cfg, i) => {
        const entry = getEntry(cfg.entryId);
        if (!entry) return null;
        return (
          <div
            key={`story-${cfg.entryId}`}
            ref={(el) => { storyRefs.current[i] = el; }}
            className="absolute select-none pointer-events-none"
            style={{
              opacity: 0, left: `${cfg.storyX}%`, top: `${cfg.storyY}%`,
              transform: "translateX(-50%)", textAlign: "center",
              maxWidth: NARRATOR_STORY.maxWidth, fontSize: NARRATOR_STORY.fontSize,
              lineHeight: NARRATOR_STORY.lineHeight, fontFamily: "var(--font-narrator)",
              fontStyle: "italic", fontWeight: 400, color: "var(--cream-muted)",
              background: NARRATOR_STORY.bgGradient, padding: NARRATOR_STORY.bgPadding,
              zIndex: Z.narrator, willChange: "opacity",
            }}>
            {entry.story}
          </div>
        );
      })}

      {CARD_CONFIG.map((cfg, i) => (
        <div
          key={cfg.entryId}
          ref={(el) => { artifactRefs.current[i] = el; }}
          className="absolute pointer-events-none"
          style={{
            opacity: 0, left: `${cfg.fromX}%`, top: `${cfg.fromY}%`,
            transform: `rotate(${cfg.fromRotation}deg)`,
            width: `${cfg.widthPct}%`, zIndex: Z.cards + i,
            transformOrigin: "top left",
          }}>
          <div
            ref={(el) => { cardFrontRefs.current[i] = el; }}
            style={{ willChange: "opacity" }}>
            {renderChoreographyCard(cfg.entryId, {
              boxShadow: cfg.brightness === "light" ? CARD_SHADOWS.light : CARD_SHADOWS.dark,
            })}
          </div>
          <div
            ref={(el) => { cardBackRefs.current[i] = el; }}
            style={{
              position: "absolute", inset: 0, borderRadius: MORPH.borderRadius,
              background: MORPH.bgGradient, border: MORPH.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: MORPH.padding, opacity: 0, willChange: "opacity",
            }}>
            <div className="font-serif" style={{
              fontSize: MORPH.fontSize, color: MORPH.textColor,
              textAlign: "center", lineHeight: MORPH.lineHeight, fontStyle: "italic",
            }}>
              {getEntry(cfg.entryId)?.iStatement}
            </div>
          </div>
        </div>
      ))}

      <pre
        ref={debugRef}
        style={{
          position: "absolute", bottom: 12, right: 12, zIndex: Z.debug,
          background: "rgba(0,0,0,0.85)", color: "#0f0",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 11, lineHeight: 1.4, padding: "10px 14px",
          borderRadius: 6, border: "1px solid rgba(0,255,0,0.15)",
          pointerEvents: "none", whiteSpace: "pre", minWidth: 280,
        }}
      />
    </>
  );

  return { update, fullScreenJsx, contentJsx, recomputePositions };
}
