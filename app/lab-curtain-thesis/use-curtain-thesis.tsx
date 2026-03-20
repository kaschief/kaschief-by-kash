"use client";

import { useRef } from "react";
import { CONTENT } from "../engineer-candidate/engineer-data";
import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
  CURTAIN_THESIS,
  PREFIX_DISSOLVE,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";

/* ── Local config ── */

/** Total scroll container height in viewport units */
export const CONTAINER_HEIGHT_VH = 500;

/**
 * EC's stagger/reveal values are calibrated to EC's ~1799vh container.
 * Scale them so the same physical scroll distance produces the same effect.
 */
const EC_TO_LOCAL_SCALE = EC_CONTAINER_VH / CONTAINER_HEIGHT_VH;

/** Where thesis entrance begins (fraction of total scroll 0–1) */
const THESIS_PHASE_START = 0.0;

/** How much scroll the thesis entrance occupies (fraction of total scroll) */
const THESIS_PHASE_DURATION = 0.25; // 0.25 × 500 = 125vh

/** RAF smoothing — lower = more resistance/guided feeling */
export const SMOOTH_LERP_FACTOR = 0.07;

/* ── Derived timing ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

/** Scroll progress where keyword reveals begin */
const KEYWORD_REVEAL_START =
  THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;

/** Gap between each keyword reveal, scaled from EC's coordinate space */
const KEYWORD_STAGGER = EC_THESIS.wordStagger * EC_TO_LOCAL_SCALE;

/** Duration of each keyword's fade-in, scaled from EC's coordinate space */
const KEYWORD_REVEAL_DURATION = EC_THESIS.wordRevealDur * EC_TO_LOCAL_SCALE;

/** Scroll progress where the final keyword ("patterns") finishes revealing */
const FINAL_KEYWORD_END =
  KEYWORD_REVEAL_START +
  (KEYWORD_COUNT - 1) * KEYWORD_STAGGER +
  KEYWORD_REVEAL_DURATION;

const SCROLL = {
  thesisStart: THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  curtainStart: FINAL_KEYWORD_END + CURTAIN_THESIS.pauseAfterWords,
  curtainEnd:
    FINAL_KEYWORD_END +
    CURTAIN_THESIS.pauseAfterWords +
    CURTAIN_THESIS.sweepDuration,
} as const;

/* ── Hook ── */

/**
 * Curtain-thesis hook — owns thesis entrance, curtain sweep,
 * prefix dissolution, and post-curtain keyword reveal.
 * Called per-frame from the parent scroll callback via `update()`.
 *
 * Returns `{ update, jsx }` — same pattern as useConvergence.
 */
export function useCurtainThesis() {
  /* ---- Refs ---- */
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);
  const postCurtainRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  /* ---- Scroll update ---- */
  function update(
    progress: number,
    viewportRef: React.RefObject<HTMLDivElement | null>,
  ) {
    /* ═══ Phase 1: Thesis entrance — identical to EC logic ═══ */

    if (thesisSentenceRef.current) {
      const fadeInEnd =
        SCROLL.thesisStart + SCROLL.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeInProgress = smoothstep(
        SCROLL.thesisStart,
        fadeInEnd,
        progress,
      );

      const fastDrift = smoothstep(
        SCROLL.thesisStart,
        KEYWORD_REVEAL_START,
        progress,
      );
      const slowDrift = smoothstep(
        KEYWORD_REVEAL_START,
        FINAL_KEYWORD_END,
        progress,
      );
      const combinedDrift =
        fastDrift * EC_THESIS.driftFastWeight +
        slowDrift * EC_THESIS.driftSlowWeight;
      const verticalOffset = lerp(
        EC_THESIS.yStartLg,
        EC_THESIS.yEndLg,
        combinedDrift,
      );

      const entranceBlur = lerp(EC_THESIS.initialBlur, 0, fadeInProgress);

      thesisSentenceRef.current.style.opacity = String(fadeInProgress);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${verticalOffset}vh))`;
      thesisSentenceRef.current.style.filter =
        entranceBlur > 0.1 ? `blur(${entranceBlur}px)` : "none";

      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const keywordSpan = keywordSpanRefs.current[i];
        if (!keywordSpan) continue;
        const thisKeywordStart = KEYWORD_REVEAL_START + i * KEYWORD_STAGGER;
        const keywordRevealProgress = smoothstep(
          thisKeywordStart,
          thisKeywordStart + KEYWORD_REVEAL_DURATION,
          progress,
        );
        keywordSpan.style.opacity = String(keywordRevealProgress);
        keywordSpan.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, keywordRevealProgress)}px)`;
        keywordSpan.style.display = "inline-block";
      }
    }

    /* ═══ Phase 2: Curtain — opaque overlay grows upward from bottom ═══ */

    if (curtainOverlayRef.current) {
      const curtainProgress = clamp(
        (progress - SCROLL.curtainStart) /
          (SCROLL.curtainEnd - SCROLL.curtainStart),
        0,
        1,
      );
      curtainOverlayRef.current.style.height = `${curtainProgress * 100}%`;

      const curtainIsMoving = curtainProgress > 0 && curtainProgress < 1;
      if (curtainAccentLineRef.current) {
        curtainAccentLineRef.current.style.opacity = curtainIsMoving
          ? "0.7"
          : "0";
      }
      if (curtainGradientRef.current) {
        curtainGradientRef.current.style.opacity = curtainIsMoving ? "1" : "0";
      }

      /* ═══ Phase 3: Prefix dissolution ═══ */

      if (
        prefixSpanRef.current &&
        viewportRef.current &&
        curtainProgress > 0
      ) {
        const viewportRect = viewportRef.current.getBoundingClientRect();
        const viewportHeight = viewportRect.height;
        const curtainLineY = viewportHeight * (1 - curtainProgress);
        const prefixRect = prefixSpanRef.current.getBoundingClientRect();
        const prefixBottomRelative = prefixRect.bottom - viewportRect.top;

        const lookaheadPx = viewportHeight * PREFIX_DISSOLVE.lookaheadFrac;
        const distanceFromLineToText = curtainLineY - prefixBottomRelative;

        if (distanceFromLineToText < lookaheadPx) {
          const dissolveAmount = clamp(
            1 - distanceFromLineToText / lookaheadPx,
            0,
            1,
          );
          const blurPx = dissolveAmount * PREFIX_DISSOLVE.fullBlurPx;
          const dimmedOpacity = lerp(
            1,
            PREFIX_DISSOLVE.minOpacity,
            dissolveAmount,
          );
          prefixSpanRef.current.style.filter =
            blurPx > 0.1 ? `blur(${blurPx}px)` : "none";
          prefixSpanRef.current.style.opacity = String(dimmedOpacity);
        } else {
          prefixSpanRef.current.style.filter = "none";
          prefixSpanRef.current.style.opacity = "1";
        }
      }

      /* ═══ Phase 4: Post-curtain — keyword appears center then drifts ═══ */

      if (postCurtainRef.current) {
        const appearStart = SCROLL.curtainEnd;
        const appearEnd = appearStart + POST_CURTAIN.appearDuration;
        const driftStart = appearEnd;
        const driftEnd = driftStart + POST_CURTAIN.driftDuration;

        const appearProgress = smoothstep(appearStart, appearEnd, progress);
        const driftProgress = smoothstep(driftStart, driftEnd, progress);

        postCurtainRef.current.style.opacity = String(appearProgress);

        const x = lerp(50, 0, driftProgress);
        const y = lerp(50, 0, driftProgress);
        postCurtainRef.current.style.left = `${lerp(50, POST_CURTAIN.endLeftPercent, driftProgress)}%`;
        postCurtainRef.current.style.top = `${lerp(50, POST_CURTAIN.endTopPercent, driftProgress)}%`;
        postCurtainRef.current.style.transform = `translate(-${x}%, -${y}%)`;

        const currentSize = lerp(
          POST_CURTAIN.startFontSizeVw,
          POST_CURTAIN.endFontSizeVw,
          driftProgress,
        );
        postCurtainRef.current.style.fontSize = `${currentSize}vw`;
      }

      // Debug HUD
      if (debugRef.current && viewportRef.current) {
        const viewportRect = viewportRef.current.getBoundingClientRect();
        const viewportHeight = viewportRect.height;
        const curtainLineY = Math.round(
          viewportHeight * (1 - curtainProgress),
        );
        const textRect =
          thesisSentenceRef.current?.getBoundingClientRect();
        const textTopRelative = textRect
          ? Math.round(textRect.top - viewportRect.top)
          : 0;
        const textBottomRelative = textRect
          ? Math.round(textRect.bottom - viewportRect.top)
          : 0;

        debugRef.current.textContent = [
          `scroll: ${(progress * 100).toFixed(1)}%`,
          `curtain: ${(curtainProgress * 100).toFixed(1)}%`,
          `line Y: ${curtainLineY}px from top`,
          `text top: ${textTopRelative}px`,
          `text bottom: ${textBottomRelative}px`,
          `gap: ${curtainLineY - textBottomRelative}px (line above text bottom)`,
        ].join("\n");
      }
    }
  }

  /* ---- JSX ---- */
  const jsx = (
    <>
      {/* Thesis sentence — renders identically to EC */}
      <div
        ref={thesisSentenceRef}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
          color: "var(--cream)",
          fontWeight: 400,
          maxWidth: EC_THESIS.maxWidthLg,
          lineHeight: 1.5,
          willChange: "transform, opacity, filter",
          zIndex: 1,
        }}>
        <span ref={prefixSpanRef} style={{ willChange: "filter, opacity" }}>
          {thesisData.prefix}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>
          {thesisData.keywords.map((word, i) => (
            <span key={word}>
              <span
                ref={(el) => {
                  keywordSpanRefs.current[i] = el;
                }}
                style={{
                  opacity: 0,
                  willChange: "opacity, transform",
                  marginRight:
                    i < thesisData.keywords.length - 1
                      ? "0.3em"
                      : undefined,
                }}>
                {i === thesisData.keywords.length - 1
                  ? `${thesisData.conjunction}${word}.`
                  : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>

      {/* Curtain overlay — anchored at bottom, grows upward to erase */}
      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "0%",
          zIndex: 2,
          background: "var(--bg, #07070A)",
          pointerEvents: "none",
        }}>
        {/* Top edge: accent line */}
        <div
          ref={curtainAccentLineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: CURTAIN_THESIS.accentColor,
            opacity: 0,
          }}
        />
        {/* Gradient above edge for soft transition */}
        <div
          ref={curtainGradientRef}
          style={{
            position: "absolute",
            top: -20,
            left: 0,
            right: 0,
            height: 20,
            background: `linear-gradient(to bottom, transparent, var(--bg, #07070A))`,
            opacity: 0,
          }}
        />
      </div>

      {/* Post-curtain keyword — appears center, drifts to position */}
      <div
        ref={postCurtainRef}
        className="absolute select-none pointer-events-none"
        style={{
          opacity: 0,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-serif)",
          fontSize: `${POST_CURTAIN.startFontSizeVw}vw`,
          fontWeight: 400,
          color: POST_CURTAIN.color,
          zIndex: 3,
          willChange: "opacity, transform, left, top, font-size",
        }}>
        users
      </div>

      {/* Debug HUD — remove after tuning */}
      <div
        ref={debugRef}
        style={{
          position: "absolute",
          top: 60,
          right: 16,
          zIndex: 10,
          fontFamily: "monospace",
          fontSize: 12,
          color: "var(--gold)",
          opacity: 0.8,
          whiteSpace: "pre",
          pointerEvents: "none",
          lineHeight: 1.6,
        }}
      />
    </>
  );

  return { update, jsx };
}
