"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import { CONTENT } from "../engineer-candidate/engineer-data";
import { THESIS as EC_THESIS, CONTAINER_VH as EC_CONTAINER_VH } from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";

/* ── Config ── */

const CONTAINER_VH = 800;

/**
 * EC's stagger/reveal values are calibrated to EC's ~1799vh container.
 * Scale them so the same physical scroll distance produces the same effect.
 */
const PROGRESS_SCALE = EC_CONTAINER_VH / CONTAINER_VH;

/**
 * Scroll phases as fractions of 0–1.
 * Thesis phase mirrors EC exactly (same config object).
 * Curtain phase is new — begins after thesis words have landed.
 */
const SCROLL = {
  // Thesis: ~200vh of scroll (matches EC's 200vh thesis distance)
  thesisStart:    0.0,
  thesisDuration: 0.25,   // 0.25 × 800 = 200vh
  // Curtain begins shortly after thesis words land
  curtainStart:   0.28,
  curtainEnd:     0.47,
} as const;

const CURTAIN_ACCENT = "var(--gold, #C9A84C)";

/** RAF smoothing factor */
const LERP_FACTOR = 0.07;

/* ── Derived ── */

const thesis = CONTENT.thesis;
const KW_COUNT = thesis.keywords.length;

/* ── Component ── */

export default function LabCurtainThesisPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const thesisEl = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef(0);

  const update = useCallback((progress: number) => {
    /* ═══ Thesis — identical to EC logic ═══ */

    if (thesisEl.current) {
      const T_START = SCROLL.thesisStart;
      const T_DUR = SCROLL.thesisDuration;
      const T_END = T_START + T_DUR;

      // Fade in (first 30% of thesis duration) — matches EC fadeInFrac
      const fadeInEnd = T_START + T_DUR * EC_THESIS.fadeInFrac;
      const fadeIn = smoothstep(T_START, fadeInEnd, progress);

      // No fade out — thesis holds until curtain erases it
      const opacity = fadeIn;

      // Two-speed drift — matches EC driftFastWeight/driftSlowWeight
      const wordRevealZone = T_START + T_DUR * EC_THESIS.wordZoneFrac;
      const driftFast = smoothstep(T_START, wordRevealZone, progress);
      const driftSlow = smoothstep(wordRevealZone, T_END, progress);
      const drift = driftFast * EC_THESIS.driftFastWeight + driftSlow * EC_THESIS.driftSlowWeight;
      const y = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, drift);

      // Blur clears during fade-in — matches EC initialBlur
      const blur = lerp(EC_THESIS.initialBlur, 0, fadeIn);

      thesisEl.current.style.opacity = String(opacity);
      thesisEl.current.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      thesisEl.current.style.filter = blur > 0.1 ? `blur(${blur}px)` : "none";

      // Sequential word reveal — EC values scaled by PROGRESS_SCALE for matching scroll distance
      const scaledStagger = EC_THESIS.wordStagger * PROGRESS_SCALE;
      const scaledRevealDur = EC_THESIS.wordRevealDur * PROGRESS_SCALE;
      for (let i = 0; i < KW_COUNT; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const wordStart = wordRevealZone + i * scaledStagger;
        const wordT = smoothstep(wordStart, wordStart + scaledRevealDur, progress);
        el.style.opacity = String(wordT);
        el.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, wordT)}px)`;
        el.style.display = "inline-block";
      }
    }

    /* ═══ Curtain — opaque overlay grows upward from bottom, erases content ═══ */

    if (curtainRef.current) {
      const curtainT = clamp(
        (progress - SCROLL.curtainStart) / (SCROLL.curtainEnd - SCROLL.curtainStart),
        0, 1,
      );
      curtainRef.current.style.height = `${curtainT * 100}%`;

      // Accent line visible only while curtain is in motion
      const lineVisible = curtainT > 0 && curtainT < 1;
      if (accentRef.current) {
        accentRef.current.style.opacity = lineVisible ? "0.7" : "0";
      }
      if (gradientRef.current) {
        gradientRef.current.style.opacity = lineVisible ? "1" : "0";
      }
    }
  }, []);

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothProgress.current +=
        (targetProgress.current - smoothProgress.current) * LERP_FACTOR;
      update(smoothProgress.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [update]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetProgress.current = v;
  });

  return (
    <>
      <LabNav />
      <div
        ref={containerRef}
        style={{ height: `${CONTAINER_VH}vh`, background: "var(--bg, #07070A)" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Thesis sentence — renders identically to EC */}
          <div
            ref={thesisEl}
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
            {thesis.prefix}
            <span style={{ whiteSpace: "nowrap" }}>
            {thesis.keywords.map((word, i) => (
              <span key={word}>
                <span
                  ref={(el) => { wordRefs.current[i] = el; }}
                  style={{
                    opacity: 0,
                    willChange: "opacity, transform",
                    marginRight: i < thesis.keywords.length - 1 ? "0.3em" : undefined,
                  }}>
                  {i === thesis.keywords.length - 1
                    ? `${thesis.conjunction}${word}.`
                    : `${word},`}
                </span>
              </span>
            ))}
            </span>
          </div>

          {/* Curtain overlay — anchored at bottom, grows upward to erase */}
          <div
            ref={curtainRef}
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
              ref={accentRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: CURTAIN_ACCENT,
                opacity: 0,
              }}
            />
            {/* Gradient above edge for soft transition */}
            <div
              ref={gradientRef}
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
