"use client";

/**
 * Multi-lens scroll choreography hook (local progress architecture).
 *
 * Global scrollYProgress (0–1) → raw progress via TOTAL_RAW_SIZE.
 * Each lens body uses local progress (raw p - seg.bodyStart).
 * Config constants work as-is — zero normalization.
 */

import { Fragment, useRef, useCallback } from "react";
import { CONTENT } from "../engineer-candidate/engineer-data";
import {
  THESIS as EC_THESIS,
  PREFIX_DISSOLVE,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";
import { LENS_DISPLAY, getEntry } from "@data";
import { renderChoreographyCard } from "./card-config";
import { CARD_SHELL_RADIUS } from "../lab-artifacts/artifact-cards";
import {
  CARD_HEIGHT_RATIO,
  ZONE_SPLIT_Y,
  ARTIFACT_SHUFFLE,
  SUBTITLE,
  KEYWORD_RISE,
  FOCUS_CYCLE,
  KEYWORD_CURTAIN_HEADSTART,
  MORPH,
  FINAL_DISSOLVE,
  KEYWORD_FONT_CAP,
  NARRATOR_STORY,
  CURTAIN_EDGE,
  CARD_SHADOWS,
  Z,
  BLUR_THRESHOLD,
} from "./lenses.config";
import {
  PROLOGUE,
  LENS_SEGMENTS,
  CONTAINER_HEIGHT_VH,
  TOTAL_RAW_SIZE,
  CARD_OFFSETS,
  TOTAL_CARDS,
  type LensSegment,
} from "./lenses.timing";

export { CONTAINER_HEIGHT_VH };
export { SMOOTH_LERP_FACTOR } from "./lenses.config";

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

/* ── Card positions ── */

interface CardPosition { toX: number; toY: number; effectiveWidthPct: number }

function computeCardPositions(
  cards: LensSegment["cards"],
  viewportWidth: number,
): CardPosition[] {
  return cards.map((cfg) => {
    const { zone, jitter, widthPct, maxWidthPx } = cfg;
    const pctPx = (widthPct / 100) * viewportWidth;
    const capped = pctPx > maxWidthPx;
    const ewp = capped ? (maxWidthPx / viewportWidth) * 100 : widthPct;

    const sr = capped ? ewp / widthPct : 1;
    const cx = (zone.xMin + zone.xMax) / 2;
    const cy = (zone.yMin + zone.yMax) / 2;
    const hw = ((zone.xMax - zone.xMin) / 2) * sr;
    const hh = ((zone.yMax - zone.yMin) / 2) * sr;

    return {
      toX: lerp(cx - hw, Math.max(cx - hw, cx + hw - ewp), jitter.x),
      toY: lerp(cy - hh, Math.max(cy - hh, cy + hh - ewp * CARD_HEIGHT_RATIO), jitter.y),
      effectiveWidthPct: ewp,
    };
  });
}

function computeKeywordRestY(pos: CardPosition[], cards: LensSegment["cards"]): number {
  const up = pos.filter((_, i) => cards[i].zone.yMax <= ZONE_SPLIT_Y);
  const lo = pos.filter((_, i) => cards[i].zone.yMin >= ZONE_SPLIT_Y);
  const uBot = up.length ? Math.max(...up.map((p) => p.toY + p.effectiveWidthPct * CARD_HEIGHT_RATIO)) : 0;
  const lTop = lo.length ? Math.min(...lo.map((p) => p.toY)) : 100;
  return (uBot + lTop) / 2;
}

/* ── Hook ── */

export function useLenses() {
  // Prologue refs
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Curtain (single element, reused across lenses)
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);

  // Per-lens keyword + subtitle
  const keywordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flat card refs (indexed by CARD_OFFSETS[segIdx] + cardIdx)
  const artifactRefs = useRef<(HTMLDivElement | null)[]>(new Array(TOTAL_CARDS).fill(null));
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>(new Array(TOTAL_CARDS).fill(null));
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>(new Array(TOTAL_CARDS).fill(null));
  const storyRefs = useRef<(HTMLDivElement | null)[]>(new Array(TOTAL_CARDS).fill(null));

  // Per-segment positions
  const positionsRef = useRef<CardPosition[][]>(LENS_SEGMENTS.map(() => []));
  const kwRestYRef = useRef<number[]>(LENS_SEGMENTS.map(() => 50));

  const debugRef = useRef<HTMLPreElement>(null);

  const recomputePositions = useCallback((viewportEl: HTMLDivElement) => {
    const vw = viewportEl.clientWidth;
    for (let s = 0; s < LENS_SEGMENTS.length; s++) {
      const seg = LENS_SEGMENTS[s];
      positionsRef.current[s] = computeCardPositions(seg.cards, vw);
      kwRestYRef.current[s] = computeKeywordRestY(positionsRef.current[s], seg.cards);
    }
  }, []);

  /* ── Update ── */

  function update(scrollProgress: number, viewportRef: React.RefObject<HTMLDivElement | null>) {
    const p = scrollProgress * TOTAL_RAW_SIZE;

    /* ═══ Prologue ═══ */

    if (thesisSentenceRef.current) {
      // Hide thesis permanently after prologue curtain completes
      if (p > PROLOGUE.curtainEnd) {
        thesisSentenceRef.current.style.opacity = "0";
      } else {
      const P = PROLOGUE;
      const fadeInEnd = P.thesisStart + P.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeIn = smoothstep(P.thesisStart, fadeInEnd, p);
      const fastDrift = smoothstep(P.thesisStart, P.keywordRevealStart, p);
      const slowDrift = smoothstep(P.keywordRevealStart, P.finalKeywordEnd, p);
      const drift = fastDrift * EC_THESIS.driftFastWeight + slowDrift * EC_THESIS.driftSlowWeight;
      const vOff = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, drift);
      const blur = lerp(EC_THESIS.initialBlur, 0, fadeIn);

      thesisSentenceRef.current.style.opacity = String(fadeIn);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${vOff}vh))`;
      thesisSentenceRef.current.style.filter = blur > BLUR_THRESHOLD ? `blur(${blur}px)` : "none";

      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const span = keywordSpanRefs.current[i];
        if (!span) continue;
        const ks = P.keywordRevealStart + i * P.keywordStagger;
        const kp = smoothstep(ks, ks + P.keywordRevealDuration, p);
        span.style.opacity = String(kp);
        span.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, kp)}px)`;
        span.style.display = "inline-block";
      }

      // Prefix dissolution
      if (prefixSpanRef.current && viewportRef.current) {
        const cp = clamp((p - P.curtainStart) / (P.curtainEnd - P.curtainStart), 0, 1);
        if (cp > 0) {
          const vr = viewportRef.current.getBoundingClientRect();
          const dist = vr.height * (1 - cp) - (prefixSpanRef.current.getBoundingClientRect().bottom - vr.top);
          const la = vr.height * PREFIX_DISSOLVE.lookaheadFrac;
          if (dist < la) {
            const d = clamp(1 - dist / la, 0, 1);
            prefixSpanRef.current.style.filter = d * PREFIX_DISSOLVE.fullBlurPx > BLUR_THRESHOLD ? `blur(${d * PREFIX_DISSOLVE.fullBlurPx}px)` : "none";
            prefixSpanRef.current.style.opacity = String(lerp(1, PREFIX_DISSOLVE.minOpacity, d));
          } else {
            prefixSpanRef.current.style.filter = "none";
            prefixSpanRef.current.style.opacity = "1";
          }
        }
      }
      } // end else (prologue active)
    }

    /* ═══ Curtain — single element reused across all lens transitions ═══ */
    // After each curtain completes, it must reset to 0% so the next one can sweep.
    // We find which curtain event is currently relevant and drive it.

    if (curtainOverlayRef.current) {
      // The curtain has two jobs:
      // 1. Prologue: sweeps 0→100% to cover thesis, stays at 100% as background
      // 2. Inter-lens: sweeps 0→100% to wipe previous lens, stays at 100% as background
      //
      // After a curtain completes, it stays at 100% (hiding what's behind it).
      // It only resets to 0% at the START of the next inter-lens curtain sweep,
      // which creates the visual of the new lens being "revealed" as it sweeps up.
      //
      // Actually the curtain sweeps bottom-to-top: it starts at 0% height (bottom),
      // grows to 100% covering the screen. After that, the new content appears
      // ON TOP of the curtain (same bg color), and the curtain stays at 100%.
      // When the next lens transition starts, the curtain resets to 0% instantly
      // (content from the current lens is still on screen), then sweeps 0→100% again.

      let curtainP: number;
      let isInterLensCurtain = false;

      if (p < PROLOGUE.curtainStart) {
        curtainP = 0;
      } else if (p < PROLOGUE.curtainEnd) {
        // Prologue curtain: covers thesis (z:1), cards not yet visible
        curtainP = clamp((p - PROLOGUE.curtainStart) / (PROLOGUE.curtainEnd - PROLOGUE.curtainStart), 0, 1);
      } else {
        // Default: curtain at 0% (scene visible)
        curtainP = 0;

        // Check for inter-lens curtain sweeps
        for (let s = 1; s < LENS_SEGMENTS.length; s++) {
          const seg = LENS_SEGMENTS[s];
          const cStart = seg.globalStart;
          const cEnd = cStart + seg.curtainSize;

          if (p >= cStart && p < cEnd) {
            curtainP = clamp((p - cStart) / (cEnd - cStart), 0, 1);
            isInterLensCurtain = true;
            break;
          } else if (p >= cEnd && p < seg.bodyStart) {
            // Curtain just finished — hold at 100% until body starts
            curtainP = 1;
            isInterLensCurtain = true;
            break;
          }
        }
      }

      // Inter-lens curtain must be ABOVE cards (z:4) and narrator (z:8) to wipe the scene
      curtainOverlayRef.current.style.zIndex = String(isInterLensCurtain ? Z.keyword + 1 : Z.curtain);

      curtainOverlayRef.current.style.height = `${curtainP * 100}%`;
      const moving = curtainP > 0 && curtainP < 1;
      if (curtainAccentLineRef.current) curtainAccentLineRef.current.style.opacity = moving ? String(CURTAIN_EDGE.movingOpacity) : "0";
      if (curtainGradientRef.current) curtainGradientRef.current.style.opacity = moving ? "1" : "0";
    }

    /* ═══ Per-segment updates ═══ */

    for (let s = 0; s < LENS_SEGMENTS.length; s++) {
      const seg = LENS_SEGMENTS[s];
      const offset = CARD_OFFSETS[s];
      const positions = positionsRef.current[s];

      // Skip future segments
      if (p < seg.globalStart - 0.01) {
        // Ensure hidden
        for (let i = 0; i < seg.cards.length; i++) {
          const el = artifactRefs.current[offset + i];
          if (el) el.style.opacity = "0";
          const st = storyRefs.current[offset + i];
          if (st) st.style.opacity = "0";
        }
        const kw = keywordRefs.current[s];
        if (kw) kw.style.opacity = "0";
        break;
      }

      // Past segments: hide the instant the next curtain reaches 100%.
      // The curtain resets to 0% when the next body starts — cards must be gone by then.
      const nextSeg = LENS_SEGMENTS[s + 1];
      const hideAt = nextSeg ? nextSeg.bodyStart : seg.globalEnd;
      if (p >= hideAt) {
        for (let i = 0; i < seg.cards.length; i++) {
          const el = artifactRefs.current[offset + i];
          if (el) el.style.opacity = "0";
          const st = storyRefs.current[offset + i];
          if (st) st.style.opacity = "0";
        }
        const kw = keywordRefs.current[s];
        if (kw) kw.style.opacity = "0";
        continue;
      }

      // Active segment — local progress within the body
      const lp = p - seg.bodyStart;
      const B = seg.body;
      const restY = kwRestYRef.current[s];
      const isLastLens = s === LENS_SEGMENTS.length - 1;

      /* ── Keyword ── */

      const kwEl = keywordRefs.current[s];
      if (kwEl) {
        // Keyword starts appearing during the tail of the curtain sweep
        const kwHeadStart = seg.curtainSize * KEYWORD_CURTAIN_HEADSTART;
        const appear = smoothstep(-kwHeadStart, POST_CURTAIN.appearDuration, lp);
        const shrink = smoothstep(B.shuffleStart, B.shuffleEnd, lp);
        const rise = smoothstep(B.keywordRiseStart, B.keywordRiseEnd, lp);

        kwEl.style.opacity = String(appear * (1 - rise));
        const midVw = lerp(POST_CURTAIN.startFontSizeVw, POST_CURTAIN.endFontSizeVw, shrink);
        const midCap = lerp(KEYWORD_FONT_CAP.startMaxPx, KEYWORD_FONT_CAP.endMaxPx, shrink);
        kwEl.style.fontSize = `min(${lerp(midVw, KEYWORD_RISE.endFontSizeVw, rise)}vw, ${lerp(midCap, KEYWORD_FONT_CAP.riseMaxPx, rise)}px)`;
        kwEl.style.top = `${lerp(restY, KEYWORD_RISE.endTopPercent, rise)}%`;
        kwEl.style.transform = `translate(-50%, -${lerp(50, 0, rise)}%)`;

        const subEl = subtitleRefs.current[s];
        if (subEl) {
          const sIn = smoothstep(B.shuffleStart + SUBTITLE.fadeInDelay, B.shuffleStart + SUBTITLE.fadeInDelay + SUBTITLE.fadeInDuration, lp);
          const sOut = smoothstep(B.keywordRiseStart, B.keywordRiseStart + SUBTITLE.fadeOutDuration, lp);
          subEl.style.opacity = String(sIn * (1 - sOut));
        }
      }

      /* ── Cards ── */

      if (positions.length === 0) continue;
      const fws = B.focusWindows;

      const focusValues: number[] = [];
      for (let i = 0; i < seg.cards.length; i++) {
        const fw = fws[i];
        focusValues.push(
          smoothstep(fw.ws, fw.rampInEnd, lp) *
          (1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, lp)),
        );
      }

      let dissolveFade = 1;
      if (isLastLens) {
        const ds = fws[fws.length - 1].rampOutEnd + FINAL_DISSOLVE.delay;
        dissolveFade = 1 - smoothstep(ds, ds + FINAL_DISSOLVE.duration, lp);
      }

      for (let i = 0; i < seg.cards.length; i++) {
        const el = artifactRefs.current[offset + i];
        if (!el) continue;

        const pos = positions[i];
        const cfg = seg.cards[i];
        const fw = fws[i];

        const cardStart = B.shuffleStart + i * ARTIFACT_SHUFFLE.stagger;
        const slide = smoothstep(cardStart, cardStart + ARTIFACT_SHUFFLE.entranceDuration, lp);

        const curX = lerp(cfg.fromX, pos.toX, slide);
        const curY = lerp(cfg.fromY, pos.toY, slide);
        const curRot = lerp(cfg.fromRotation, cfg.toRotation, slide);

        const posFocus = smoothstep(fw.ws, fw.rampInEnd, lp)
          * (1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, lp));

        const nudgeScale = cfg.nudgeScale ?? FOCUS_CYCLE.nudgeScale;
        const nudgeX = cfg.nudgeX ?? FOCUS_CYCLE.nudgeX;
        const nudgeY = cfg.nudgeY ?? FOCUS_CYCLE.nudgeY;
        const focusScale = lerp(1, nudgeScale, posFocus);

        const morph = smoothstep(fw.storyHoldEnd, fw.morphEnd, lp);

        const front = cardFrontRefs.current[offset + i];
        const back = cardBackRefs.current[offset + i];
        if (front) front.style.opacity = String(1 - morph);
        if (back) back.style.opacity = String(morph);

        const dimRamp = smoothstep(B.focusCycleStart, B.focusCycleStart + FOCUS_CYCLE.dimRampDuration, lp);
        const dimFloor = morph > 0.5 ? MORPH.dimOpacity : cfg.dimOpacity;
        const focusOp = lerp(lerp(1, dimFloor, dimRamp), 1, focusValues[i]);

        // Hold phase: all cards re-brighten after last card completes
        const holdBrighten = smoothstep(B.holdStart, B.holdEnd, lp);
        const finalOp = lerp(focusOp, 1, holdBrighten);

        const baseOp = clamp(slide * ARTIFACT_SHUFFLE.opacityRamp, 0, 1);

        el.style.opacity = String(baseOp * finalOp * dissolveFade);
        el.style.left = `${curX + posFocus * nudgeX}%`;
        el.style.top = `${curY + posFocus * nudgeY}%`;
        el.style.width = `${pos.effectiveWidthPct}%`;
        el.style.transform = `rotate(${curRot}deg)${focusScale !== 1 ? ` scale(${focusScale})` : ""}`;
        el.style.transformOrigin = "top left";

        // Story narrator
        const storyEl = storyRefs.current[offset + i];
        if (storyEl) {
          const delay = i === 0 ? NARRATOR_STORY.firstFadeInDelay : NARRATOR_STORY.laterFadeInDelay;
          const stStart = fw.ws + delay;
          const dur = Math.max(NARRATOR_STORY.minFadeInDuration, NARRATOR_STORY.firstFadeInDuration - i * NARRATOR_STORY.fadeInAccelPerCard);
          const up = smoothstep(stStart, stStart + dur, lp);
          const down = 1 - smoothstep(fw.morphHoldEnd, fw.rampOutEnd, lp);
          storyEl.style.opacity = String(up * down);
        }
      }
    }

    // Debug HUD
    if (debugRef.current) {
      let activeLens = "";
      for (const seg of LENS_SEGMENTS) {
        if (p >= seg.globalStart && p <= seg.globalEnd) {
          activeLens = seg.lensName;
          break;
        }
      }
      debugRef.current.textContent = `progress: ${scrollProgress.toFixed(4)}\nraw: ${p.toFixed(4)}\nlens: ${activeLens}`;
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
      {LENS_SEGMENTS.map((seg, segIdx) => {
        const offset = CARD_OFFSETS[segIdx];
        return (
          <Fragment key={seg.lensName}>
            {/* Keyword + subtitle */}
            <div
              ref={(el) => { keywordRefs.current[segIdx] = el; }}
              className="absolute select-none pointer-events-none"
              style={{
                opacity: 0, left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                fontFamily: "var(--font-serif)",
                fontSize: `min(${POST_CURTAIN.startFontSizeVw}vw, ${KEYWORD_FONT_CAP.startMaxPx}px)`,
                fontWeight: 400, color: POST_CURTAIN.color, letterSpacing: "0.06em",
                textAlign: "center", zIndex: Z.keyword,
                willChange: "opacity, font-size, top, transform",
              }}>
              {LENS_DISPLAY[seg.lensName]}
              <div
                ref={(el) => { subtitleRefs.current[segIdx] = el; }}
                style={{
                  opacity: 0, fontSize: SUBTITLE.fontSize, fontFamily: "var(--font-serif)",
                  fontStyle: "italic", color: "var(--cream-muted)", fontWeight: 400,
                  letterSpacing: "0.01em", marginTop: "0.5em", whiteSpace: "nowrap",
                  willChange: "opacity",
                }}>
                {seg.subtitle}
              </div>
            </div>

            {/* Stories */}
            {seg.cards.map((cfg, i) => {
              const entry = getEntry(cfg.entryId);
              if (!entry) return null;
              return (
                <div
                  key={`story-${cfg.entryId}`}
                  ref={(el) => { storyRefs.current[offset + i] = el; }}
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

            {/* Cards: front + back */}
            {seg.cards.map((cfg, i) => (
              <div
                key={cfg.entryId}
                ref={(el) => { artifactRefs.current[offset + i] = el; }}
                className="absolute pointer-events-none"
                style={{
                  opacity: 0, left: `${cfg.fromX}%`, top: `${cfg.fromY}%`,
                  transform: `rotate(${cfg.fromRotation}deg)`,
                  width: `${cfg.widthPct}%`, zIndex: Z.cards + i, transformOrigin: "top left",
                }}>
                <div ref={(el) => { cardFrontRefs.current[offset + i] = el; }} style={{ willChange: "opacity" }}>
                  {renderChoreographyCard(cfg.entryId, {
                    boxShadow: cfg.brightness === "light" ? CARD_SHADOWS.light : CARD_SHADOWS.dark,
                  })}
                </div>
                <div
                  ref={(el) => { cardBackRefs.current[offset + i] = el; }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: CARD_SHELL_RADIUS,
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
          </Fragment>
        );
      })}

      <pre ref={debugRef} style={{
        position: "absolute", bottom: 12, right: 12, zIndex: Z.debug,
        background: "rgba(0,0,0,0.85)", color: "#0f0",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 11, lineHeight: 1.4, padding: "10px 14px",
        borderRadius: 6, border: "1px solid rgba(0,255,0,0.15)",
        pointerEvents: "none", whiteSpace: "pre", minWidth: 280,
      }} />
    </>
  );

  return { update, fullScreenJsx, contentJsx, recomputePositions };
}
