"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";

/* ── Thesis data (mirrors engineer-candidate/engineer-data.tsx) ── */

const THESIS_TEXT = {
  prefix: "Each of my past roles sharpened a different part of how I think, about ",
  keywords: ["users", "gaps", "patterns"] as readonly string[],
  conjunction: "and\u00A0",
};

/* ── Scroll phases (fraction of total scroll) ── */

const TOTAL_HEIGHT_VH = 3000;

// Phase 1: Thesis fade in + drift + word reveals (0 → 0.4)
const THESIS_START = 0.0;
const THESIS_FADE_IN_END = 0.12;       // container fades in + deblurs
const WORD_REVEAL_START = 0.14;         // keywords begin revealing sequentially
const WORD_STAGGER = 0.04;             // gap between each keyword reveal
const WORD_REVEAL_DUR = 0.03;          // each keyword's fade-in duration
const THESIS_SETTLE = 0.30;            // thesis fully settled (drift stops)

// Drift
const DRIFT_Y_START = 6;               // vh below center at start
const DRIFT_Y_END = -2;                // vh above center at settle
const INITIAL_BLUR = 6;                // px blur at start

/* ── Helpers ── */

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ── Component ── */

export default function LabCurtainThesisPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const thesisEl = useRef<HTMLDivElement>(null);
  const keywordEls = useRef<(HTMLSpanElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef(0);

  const update = useCallback((progress: number) => {
    /* ── Thesis container: fade in + deblur + drift upward ── */
    if (thesisEl.current) {
      const fadeIn = smoothstep(THESIS_START, THESIS_FADE_IN_END, progress);
      const drift = smoothstep(THESIS_START, THESIS_SETTLE, progress);
      const y = lerp(DRIFT_Y_START, DRIFT_Y_END, drift);
      const blur = lerp(INITIAL_BLUR, 0, fadeIn);

      thesisEl.current.style.opacity = String(fadeIn);
      thesisEl.current.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      thesisEl.current.style.filter = blur > 0.1 ? `blur(${blur}px)` : "none";
    }

    /* ── Sequential keyword reveal: each drops in with translateY ── */
    const kwCount = THESIS_TEXT.keywords.length;
    for (let i = 0; i < kwCount; i++) {
      const el = keywordEls.current[i];
      if (!el) continue;

      const wordStart = WORD_REVEAL_START + i * WORD_STAGGER;
      const wordEnd = wordStart + WORD_REVEAL_DUR;
      const wordT = smoothstep(wordStart, wordEnd, progress);

      el.style.opacity = String(wordT);
      el.style.transform = `translateY(${lerp(12, 0, wordT)}px)`;
    }

    // Last keyword's word part ("patterns.") — slightly delayed after its "and"
    const lastWordEl = keywordEls.current[kwCount + kwCount - 1];
    if (lastWordEl) {
      const andStart = WORD_REVEAL_START + (kwCount - 1) * WORD_STAGGER;
      const patternStart = andStart + WORD_STAGGER * 0.5; // half-stagger delay
      const patternEnd = patternStart + WORD_REVEAL_DUR;
      const patternT = smoothstep(patternStart, patternEnd, progress);

      lastWordEl.style.opacity = String(patternT);
      lastWordEl.style.transform = `translateY(${lerp(12, 0, patternT)}px)`;
    }
  }, []);

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothProgress.current +=
        (targetProgress.current - smoothProgress.current) * 0.07;
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
        style={{ height: `${TOTAL_HEIGHT_VH}vh`, background: "var(--bg, #07070A)" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Thesis sentence */}
          <div
            ref={thesisEl}
            className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
            style={{
              opacity: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
              color: "var(--cream, #F0E6D0)",
              fontWeight: 400,
              maxWidth: "60vw",
              lineHeight: 1.5,
              willChange: "transform, opacity, filter",
            }}>
            {THESIS_TEXT.prefix}
            {THESIS_TEXT.keywords.map((word, i) => {
              const isLast = i === THESIS_TEXT.keywords.length - 1;
              if (isLast) {
                // "and" + "patterns." — conjunction appears with keyword but word is slightly delayed
                return (
                  <span key={word} style={{ display: "inline" }}>
                    <span
                      ref={(el) => { keywordEls.current[i] = el; }}
                      style={{
                        opacity: 0,
                        willChange: "opacity, transform",
                        display: "inline-block",
                      }}>
                      {THESIS_TEXT.conjunction}
                    </span>
                    <span
                      ref={(el) => { keywordEls.current[i + THESIS_TEXT.keywords.length] = el; }}
                      style={{
                        opacity: 0,
                        willChange: "opacity, transform",
                        display: "inline-block",
                        fontStyle: "italic",
                      }}>
                      {`${word}.`}
                    </span>
                  </span>
                );
              }
              return (
                <span
                  key={word}
                  ref={(el) => { keywordEls.current[i] = el; }}
                  style={{
                    opacity: 0,
                    willChange: "opacity, transform",
                    display: "inline-block",
                  }}>
                  <span style={{ fontStyle: "italic" }}>{`${word},`}</span>
                  {"\u00A0"}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
