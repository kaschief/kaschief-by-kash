"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import { CONTENT } from "../engineer-candidate/engineer-data";
import { THESIS as EC_THESIS, CONTAINER_VH as EC_CONTAINER_VH } from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";

/* ── Config ── */

/** Total scroll container height in viewport units */
const CONTAINER_HEIGHT_VH = 500;

/**
 * EC's stagger/reveal values are calibrated to EC's ~1799vh container.
 * Scale them so the same physical scroll distance produces the same effect.
 */
const EC_TO_LOCAL_SCALE = EC_CONTAINER_VH / CONTAINER_HEIGHT_VH;

/* ── Scroll phase config ── */

/** Where thesis entrance begins (fraction of total scroll 0–1) */
const THESIS_PHASE_START = 0.0;

/** How much scroll the thesis entrance occupies (fraction of total scroll) */
const THESIS_PHASE_DURATION = 0.25;  // 0.25 × 500 = 125vh

/** Curtain config — controls the erasing wipe after thesis */
const CURTAIN = {
  pauseAfterWords: 0.03,   // pause after last word before curtain begins (fraction of progress)
  sweepDuration:   0.19,   // how long the curtain sweep takes (fraction of progress)
  accentColor:     "var(--gold, #C9A84C)",
} as const;

/** RAF smoothing — lower = more resistance/guided feeling */
const SMOOTH_LERP_FACTOR = 0.07;

/* ── Derived timing ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

/** Scroll progress where keyword reveals begin */
const KEYWORD_REVEAL_START = THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;

/** Gap between each keyword reveal, scaled from EC's coordinate space */
const KEYWORD_STAGGER = EC_THESIS.wordStagger * EC_TO_LOCAL_SCALE;

/** Duration of each keyword's fade-in, scaled from EC's coordinate space */
const KEYWORD_REVEAL_DURATION = EC_THESIS.wordRevealDur * EC_TO_LOCAL_SCALE;

/** Scroll progress where the final keyword ("patterns") finishes revealing */
const FINAL_KEYWORD_END = KEYWORD_REVEAL_START + (KEYWORD_COUNT - 1) * KEYWORD_STAGGER + KEYWORD_REVEAL_DURATION;

const SCROLL = {
  thesisStart:    THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  curtainStart:   FINAL_KEYWORD_END + CURTAIN.pauseAfterWords,
  curtainEnd:     FINAL_KEYWORD_END + CURTAIN.pauseAfterWords + CURTAIN.sweepDuration,
} as const;

/* ── Component ── */

export default function LabCurtainThesisPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const smoothedProgress = useRef(0);
  const rawScrollProgress = useRef(0);
  const animationFrameId = useRef(0);

  const update = useCallback((progress: number) => {
    /* ═══ Phase 1: Thesis entrance — identical to EC logic ═══ */

    if (thesisSentenceRef.current) {
      // Fade in (first 30% of thesis duration) — matches EC fadeInFrac
      const fadeInEnd = SCROLL.thesisStart + SCROLL.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeInProgress = smoothstep(SCROLL.thesisStart, fadeInEnd, progress);

      // Two-speed drift — fast approach, then slow until last word lands, then freeze
      const fastDrift = smoothstep(SCROLL.thesisStart, KEYWORD_REVEAL_START, progress);
      const slowDrift = smoothstep(KEYWORD_REVEAL_START, FINAL_KEYWORD_END, progress);
      const combinedDrift = fastDrift * EC_THESIS.driftFastWeight + slowDrift * EC_THESIS.driftSlowWeight;
      const verticalOffset = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, combinedDrift);

      // Blur clears during fade-in — matches EC initialBlur
      const entranceBlur = lerp(EC_THESIS.initialBlur, 0, fadeInProgress);

      thesisSentenceRef.current.style.opacity = String(fadeInProgress);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${verticalOffset}vh))`;
      thesisSentenceRef.current.style.filter = entranceBlur > 0.1 ? `blur(${entranceBlur}px)` : "none";

      // Sequential keyword reveal — EC values scaled for matching scroll distance
      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const keywordSpan = keywordSpanRefs.current[i];
        if (!keywordSpan) continue;
        const thisKeywordStart = KEYWORD_REVEAL_START + i * KEYWORD_STAGGER;
        const keywordRevealProgress = smoothstep(thisKeywordStart, thisKeywordStart + KEYWORD_REVEAL_DURATION, progress);
        keywordSpan.style.opacity = String(keywordRevealProgress);
        keywordSpan.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, keywordRevealProgress)}px)`;
        keywordSpan.style.display = "inline-block";
      }
    }

    /* ═══ Phase 3: Curtain — opaque overlay grows upward from bottom, erases content ═══ */

    if (curtainOverlayRef.current) {
      const curtainProgress = clamp(
        (progress - SCROLL.curtainStart) / (SCROLL.curtainEnd - SCROLL.curtainStart),
        0, 1,
      );
      curtainOverlayRef.current.style.height = `${curtainProgress * 100}%`;

      // Accent line visible only while curtain is in motion
      const curtainIsMoving = curtainProgress > 0 && curtainProgress < 1;
      if (curtainAccentLineRef.current) {
        curtainAccentLineRef.current.style.opacity = curtainIsMoving ? "0.7" : "0";
      }
      if (curtainGradientRef.current) {
        curtainGradientRef.current.style.opacity = curtainIsMoving ? "1" : "0";
      }
    }
  }, []);

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothedProgress.current +=
        (rawScrollProgress.current - smoothedProgress.current) * SMOOTH_LERP_FACTOR;
      update(smoothedProgress.current);
      animationFrameId.current = requestAnimationFrame(tick);
    };
    animationFrameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [update]);

  useMotionValueEvent(scrollYProgress, "change", (latestValue) => {
    rawScrollProgress.current = latestValue;
  });

  return (
    <>
      <LabNav />
      <div
        ref={scrollContainerRef}
        style={{ height: `${CONTAINER_HEIGHT_VH}vh`, background: "var(--bg, #07070A)" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">

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
            {thesisData.prefix}
            <span style={{ whiteSpace: "nowrap" }}>
            {thesisData.keywords.map((word, i) => (
              <span key={word}>
                <span
                  ref={(el) => { keywordSpanRefs.current[i] = el; }}
                  style={{
                    opacity: 0,
                    willChange: "opacity, transform",
                    marginRight: i < thesisData.keywords.length - 1 ? "0.3em" : undefined,
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
            {/* Top edge: accent line — the sweeping edge moving upward */}
            <div
              ref={curtainAccentLineRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: CURTAIN.accentColor,
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
        </div>
      </div>
    </>
  );
}
