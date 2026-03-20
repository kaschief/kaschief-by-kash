"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";

/* ── Data ── */

interface Chapter {
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  label: string;
  subs: { label: string; color: string }[];
}

const KEYWORDS = ["users", "gaps", "patterns"];

const CHAPTERS: Chapter[] = [
  {
    title: "Users",
    subtitle: "First",
    color: "#1a1a2e",
    accent: "#E05252",
    label: "01",
    subs: [
      { label: "Research", color: "#221a2e" },
      { label: "Empathy", color: "#2a1a28" },
      { label: "Feedback", color: "#1e1428" },
    ],
  },
  {
    title: "Gaps",
    subtitle: "Always",
    color: "#16213e",
    accent: "#5B9EC2",
    label: "02",
    subs: [
      { label: "Diagnosis", color: "#1a2a3e" },
      { label: "Root Cause", color: "#142838" },
      { label: "Signal", color: "#1e2e42" },
    ],
  },
  {
    title: "Patterns",
    subtitle: "Above All",
    color: "#0f3460",
    accent: "#C9A84C",
    label: "03",
    subs: [
      { label: "Systems", color: "#1a2e1a" },
      { label: "Structure", color: "#222e1e" },
      { label: "Scale", color: "#2a3422" },
    ],
  },
];

/* ── Quote segments: text between keywords + the keywords themselves ── */
// "Each of my past roles sharpened a different part of how I think about
//  users, structure, clarity, and scale."
const QUOTE_SEGMENTS: { text: string; isKeyword: boolean; keywordIndex?: number }[] = [
  { text: "Each of my past roles sharpened a different part of how I think about ", isKeyword: false },
  { text: "users", isKeyword: true, keywordIndex: 0 },
  { text: ", ", isKeyword: false },
  { text: "gaps", isKeyword: true, keywordIndex: 1 },
  { text: ", and ", isKeyword: false },
  { text: "patterns", isKeyword: true, keywordIndex: 2 },
  { text: ".", isKeyword: false },
];

/* ── Scroll phases ── */

const TOTAL_HEIGHT_VH = 12000;

// Phase 0: Quote (0 → 0.06)
const QUOTE_HOLD = 0.03;        // quote fully visible until here
const QUOTE_FADE_END = 0.065;   // surrounding text faded out, keywords remain
const KEYWORD_SPREAD_END = 0.09; // keywords spread to column positions
const KEYWORD_MORPH_END = 0.12;  // keywords fade as panels rise behind them

// Phase 1: Panels aligned as columns (from morph)
const ALIGN_END = 0.14;
const COMPRESS_START = 0.15;
const COMPRESS_END = 0.22;

// Phase 2: Chapters (0.24 → 0.92)
const CHAPTERS_START = 0.24;
const CHAPTERS_END = 0.92;
const CHAPTER_FRAC = (CHAPTERS_END - CHAPTERS_START) / CHAPTERS.length;

/* ── Helpers ── */

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/* ── Component ── */

export default function LabBlindsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Quote refs
  const quoteContainerEl = useRef<HTMLDivElement>(null);
  const quoteFadeEls = useRef<(HTMLSpanElement | null)[]>([]);   // non-keyword spans
  const keywordInlineEls = useRef<(HTMLSpanElement | null)[]>([]); // inline (fade with text)
  const keywordFloatEls = useRef<(HTMLDivElement | null)[]>([]);   // floating copies (fly + grow)
  const goldCircleEl = useRef<HTMLDivElement>(null);

  // Panel refs
  const blindEls = useRef<(HTMLDivElement | null)[]>([]);
  const whiteRevealEl = useRef<HTMLDivElement>(null);
  const chapterTypoEls = useRef<(HTMLDivElement | null)[]>([]);
  const chapterCounterEls = useRef<(HTMLDivElement | null)[]>([]);
  const subEls = useRef<(HTMLDivElement | null)[]>([]);

  // Store keyword initial positions (measured once)
  const keywordOrigins = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const measured = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef(0);

  // Measure keyword positions on mount and place floating copies
  useEffect(() => {
    const measure = () => {
      const origins: { x: number; y: number; w: number; h: number }[] = [];
      keywordInlineEls.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        origins.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });

        // Position floating copy exactly over inline keyword
        const floater = keywordFloatEls.current[i];
        if (floater) {
          floater.style.left = `${rect.left}px`;
          floater.style.top = `${rect.top}px`;
          floater.style.width = `${rect.width}px`;
          floater.style.height = `${rect.height}px`;
        }
      });
      if (origins.length === KEYWORDS.length) {
        keywordOrigins.current = origins;
        measured.current = true;
      }
    };
    if (document.fonts) {
      document.fonts.ready.then(() => requestAnimationFrame(measure));
    } else {
      requestAnimationFrame(measure);
    }
  }, []);

  const update = useCallback((progress: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const colW = vw / CHAPTERS.length;
    const rightW = vw * 0.38;
    const rightX = vw - rightW;

    /* ═══ PHASE 0: Quote → keyword isolation → spread → morph ═══ */

    // Gold circle fade out
    if (goldCircleEl.current) {
      goldCircleEl.current.style.opacity = String(
        1 - smoothstep(QUOTE_HOLD, QUOTE_FADE_END, progress)
      );
    }

    // Fade out non-keyword text + inline keywords together
    const fadeT = smoothstep(QUOTE_HOLD, QUOTE_FADE_END, progress);
    quoteFadeEls.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = String(1 - fadeT);
    });
    // Inline keywords also fade (the floating copies take over)
    keywordInlineEls.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = String(1 - fadeT);
    });

    // Floating keyword copies: fly to column centers, scale up huge, then dissolve into panels
    if (measured.current) {
      keywordFloatEls.current.forEach((el, i) => {
        if (!el) return;
        const origin = keywordOrigins.current[i];
        if (!origin) return;

        // Show floating copies as quote starts fading
        const appearT = smoothstep(QUOTE_HOLD * 0.5, QUOTE_HOLD, progress);

        // Target: center of column i, vertically centered
        const targetX = i * colW + colW / 2 - origin.w / 2;
        const targetY = vh / 2 - origin.h / 2;

        // Spread: fly from inline position to column center
        const spreadT = smoothstep(QUOTE_HOLD, KEYWORD_SPREAD_END, progress);
        const x = lerp(origin.x, targetX, spreadT);
        const y = lerp(origin.y, targetY, spreadT);

        // Scale: grow from inline size to massive
        const scale = lerp(1, 4, spreadT);

        // Morph: grow even more + fade as panels rise behind
        const morphT = smoothstep(KEYWORD_SPREAD_END, KEYWORD_MORPH_END, progress);
        const morphScale = lerp(4, 8, morphT);
        const finalScale = progress > KEYWORD_SPREAD_END ? morphScale : scale;
        const opacity = progress > KEYWORD_SPREAD_END
          ? lerp(1, 0, morphT)
          : appearT;

        // Color shift: cream → chapter accent during morph
        const ch = CHAPTERS[i];
        el.style.color = morphT > 0 ? ch.accent : "var(--cream, #F0E6D0)";

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = `scale(${finalScale})`;
        el.style.opacity = String(opacity);
      });
    }

    // Hide entire quote container once morphed
    if (quoteContainerEl.current) {
      if (progress > KEYWORD_MORPH_END + 0.01) {
        quoteContainerEl.current.style.visibility = "hidden";
      } else {
        quoteContainerEl.current.style.visibility = "visible";
      }
    }

    /* ═══ PHASE 1: Panels rise from keyword positions ═══ */

    CHAPTERS.forEach((_, i) => {
      const el = blindEls.current[i];
      if (!el) return;

      // Panel appears during morph phase, rises from bottom
      const panelFadeIn = smoothstep(KEYWORD_SPREAD_END, KEYWORD_MORPH_END, progress);
      const alignT = smoothstep(KEYWORD_MORPH_END, ALIGN_END, progress);

      // Rise from below to fill column
      const entryY = lerp(vh * 0.3, 0, clamp(panelFadeIn + alignT, 0, 1));
      let panelY = entryY;
      let panelX = i * colW;
      let panelW = colW + 2; // +2 kills gaps
      let opacity = panelFadeIn;

      // Z-index: panel 0 on top during entry
      el.style.zIndex = String(15 + (CHAPTERS.length - 1 - i));

      /* ═══ Compression: columns → right 38% ═══ */

      if (progress > COMPRESS_START) {
        panelY = 0;

        const compStagger = [0.2, 0.12, 0.04, 0];
        const panelCompT = smoothstep(
          COMPRESS_START + compStagger[i] * (COMPRESS_END - COMPRESS_START),
          COMPRESS_END,
          progress
        );

        panelX = lerp(i * colW, rightX, panelCompT);
        panelW = lerp(colW + 2, rightW, panelCompT);
        opacity = 1;
      }

      /* ═══ PHASE 2: Abacus — slide through focal point ═══ */

      if (progress > CHAPTERS_START) {
        const chStart = CHAPTERS_START + i * CHAPTER_FRAC;
        const chEnd = chStart + CHAPTER_FRAC;
        const enterEnd = chStart + CHAPTER_FRAC * 0.12;
        const exitStart = chEnd - CHAPTER_FRAC * 0.2;

        if (i === 0) {
          if (progress > exitStart) {
            const exitT = smoothstep(exitStart, chEnd, progress);
            panelX = lerp(rightX, -rightW, exitT);
            opacity = lerp(1, 0, exitT);
          } else if (progress >= CHAPTERS_START) {
            panelX = rightX;
            panelW = rightW;
            opacity = 1;
          }
        } else {
          if (progress < chStart) {
            panelX = vw + 20;
            opacity = 0;
          } else if (progress < exitStart) {
            const enterT = smoothstep(chStart, enterEnd, progress);
            panelX = lerp(vw, rightX, enterT);
            panelW = rightW;
            opacity = enterT;
          } else if (progress < chEnd && i < CHAPTERS.length - 1) {
            const exitT = smoothstep(exitStart, chEnd, progress);
            panelX = lerp(rightX, -rightW, exitT);
            panelW = rightW;
            opacity = lerp(1, 0, exitT);
          } else if (progress >= chEnd && i < CHAPTERS.length - 1) {
            opacity = 0;
          } else {
            panelX = rightX;
            panelW = rightW;
            opacity = 1;
          }
        }

        el.style.zIndex = String(15 + i);
      }

      el.style.transform = `translate(${panelX}px, ${panelY}px)`;
      el.style.width = `${panelW}px`;
      el.style.height = `${vh}px`;
      el.style.opacity = String(opacity);
    });

    /* ═══ White reveal ═══ */

    if (whiteRevealEl.current) {
      const revealT = smoothstep(COMPRESS_START, COMPRESS_END, progress);
      whiteRevealEl.current.style.width = `${lerp(0, vw * 0.62, revealT)}px`;
      whiteRevealEl.current.style.opacity = String(
        smoothstep(COMPRESS_START, COMPRESS_START + 0.03, progress)
      );
    }

    /* ═══ Per-chapter typography + sub-panels ═══ */

    CHAPTERS.forEach((ch, ci) => {
      const chStart = CHAPTERS_START + ci * CHAPTER_FRAC;
      const chEnd = chStart + CHAPTER_FRAC;
      const typoIn = chStart + CHAPTER_FRAC * 0.02;
      const typoOut = chEnd - CHAPTER_FRAC * 0.18;

      for (let li = 0; li < 2; li++) {
        const el = chapterTypoEls.current[ci * 2 + li];
        if (!el) continue;

        const lineStart = typoIn + li * 0.012;
        const lineEnd = lineStart + 0.03;
        const fadeIn = smoothstep(lineStart, lineEnd, progress);
        const fadeOut = ci < CHAPTERS.length - 1
          ? 1 - smoothstep(typoOut, typoOut + 0.025, progress)
          : 1;
        const slideY = lerp(50, 0, fadeIn);

        el.style.opacity = String(fadeIn * fadeOut);
        el.style.transform = `translateY(${slideY}px)`;
      }

      const counterEl = chapterCounterEls.current[ci];
      if (counterEl) {
        const cIn = smoothstep(typoIn + 0.025, typoIn + 0.05, progress);
        const cOut = ci < CHAPTERS.length - 1
          ? 1 - smoothstep(typoOut, typoOut + 0.025, progress)
          : 1;
        counterEl.style.opacity = String(cIn * cOut);
      }

      const subsStart = chStart + CHAPTER_FRAC * 0.18;
      const subFrac = CHAPTER_FRAC * 0.17;
      const subGap = CHAPTER_FRAC * 0.02;

      ch.subs.forEach((_, si) => {
        const el = subEls.current[ci * 3 + si];
        if (!el) return;

        const subStart = subsStart + si * (subFrac + subGap);
        const subEnd = subStart + subFrac;
        const takeoverT = smoothstep(subStart, subEnd, progress);
        const slideY = lerp(vh, 0, takeoverT);
        let subOpacity = progress > subStart ? 1 : 0;
        let subX = 0;

        const exitStart = chEnd - CHAPTER_FRAC * 0.2;
        if (progress > exitStart && ci < CHAPTERS.length - 1) {
          const exitT = smoothstep(exitStart, chEnd, progress);
          subX = lerp(0, -vw * 0.25, exitT);
          subOpacity = progress > subStart ? lerp(1, 0, exitT) : 0;
        }

        el.style.transform = `translate(${subX}px, ${slideY}px)`;
        el.style.opacity = String(subOpacity);
        el.style.zIndex = String(20 + ci * 3 + si);
      });
    });
  }, []);

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothProgress.current +=
        (targetProgress.current - smoothProgress.current) * 0.06;
      update(smoothProgress.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [update]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetProgress.current = v;
  });

  /* ── Track which segments are keywords vs filler for refs ── */
  let fadeIdx = 0;
  let kwIdx = 0;

  return (
    <>
      <LabNav />
      <div
        ref={containerRef}
        style={{ height: `${TOTAL_HEIGHT_VH}vh`, background: "#000" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* ═══ Quote overlay ═══ */}
          <div
            ref={quoteContainerEl}
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 50, pointerEvents: "none" }}>

            {/* Gold circle */}
            <div
              ref={goldCircleEl}
              className="absolute"
              style={{
                width: "clamp(1.2rem, 2vw, 1.6rem)",
                height: "clamp(1.2rem, 2vw, 1.6rem)",
                borderRadius: "50%",
                border: "1.5px solid var(--gold, #C9A84C)",
                left: "clamp(2rem, 5vw, 5rem)",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            {/* Quote text */}
            <p
              className="font-serif"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
                lineHeight: 1.5,
                color: "var(--cream, #F0E6D0)",
                maxWidth: "clamp(20rem, 50vw, 36rem)",
                textAlign: "center",
              }}>
              {QUOTE_SEGMENTS.map((seg, segIdx) => {
                if (seg.isKeyword) {
                  const ki = kwIdx++;
                  return (
                    <span
                      key={segIdx}
                      ref={(el) => { keywordInlineEls.current[ki] = el; }}
                      style={{
                        display: "inline",
                        willChange: "opacity",
                        color: "var(--cream, #F0E6D0)",
                        fontStyle: "italic",
                      }}>
                      {seg.text}
                    </span>
                  );
                } else {
                  const fi = fadeIdx++;
                  return (
                    <span
                      key={segIdx}
                      ref={(el) => { quoteFadeEls.current[fi] = el; }}
                      style={{
                        display: "inline",
                        willChange: "opacity",
                      }}>
                      {seg.text}
                    </span>
                  );
                }
              })}
            </p>
          </div>

          {/* ═══ Floating keyword copies (fly + grow + morph) ═══ */}
          {KEYWORDS.map((word, i) => (
            <div
              key={`kw-float-${i}`}
              ref={(el) => { keywordFloatEls.current[i] = el; }}
              className="font-serif"
              style={{
                position: "absolute",
                opacity: 0,
                willChange: "transform, opacity, left, top",
                zIndex: 55,
                pointerEvents: "none",
                fontStyle: "italic",
                fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
                lineHeight: 1.5,
                color: "var(--cream, #F0E6D0)",
                transformOrigin: "center center",
                whiteSpace: "nowrap",
              }}>
              {word}
            </div>
          ))}

          {/* ═══ White reveal area ═══ */}
          <div
            ref={whiteRevealEl}
            className="absolute top-0 left-0 h-full"
            style={{
              background: "#f5f3ee",
              width: 0,
              opacity: 0,
              zIndex: 5,
            }}
          />

          {/* ═══ Per-chapter typography ═══ */}
          {CHAPTERS.map((ch, ci) => (
            <div
              key={`typo-${ci}`}
              className="absolute top-0 left-0 h-full flex flex-col justify-center"
              style={{
                width: "58%",
                zIndex: 10,
                pointerEvents: "none",
                paddingLeft: "clamp(2rem, 5vw, 5rem)",
                paddingRight: "clamp(1rem, 3vw, 3rem)",
              }}>
              <div
                ref={(el) => { chapterTypoEls.current[ci * 2] = el; }}
                style={{ opacity: 0, willChange: "transform, opacity" }}>
                <h2
                  className="font-sans"
                  style={{
                    fontSize: "clamp(3rem, 8vw, 7rem)",
                    lineHeight: 0.95,
                    color: "#0a0a0a",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}>
                  {ch.title}
                </h2>
              </div>
              <div
                ref={(el) => { chapterTypoEls.current[ci * 2 + 1] = el; }}
                style={{
                  opacity: 0,
                  willChange: "transform, opacity",
                  marginTop: "clamp(0.25rem, 1vw, 0.5rem)",
                }}>
                <h2
                  className="font-sans"
                  style={{
                    fontSize: "clamp(3rem, 8vw, 7rem)",
                    lineHeight: 0.95,
                    color: ch.accent,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}>
                  {ch.subtitle}
                </h2>
              </div>
              <div
                ref={(el) => { chapterCounterEls.current[ci] = el; }}
                className="font-sans"
                style={{
                  opacity: 0,
                  marginTop: "clamp(2rem, 4vw, 4rem)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                }}>
                <span style={{
                  fontSize: "clamp(0.8rem, 1.1vw, 1rem)",
                  color: ch.accent,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {ch.label}
                </span>
                <span style={{
                  width: "2.5rem",
                  height: "1px",
                  background: "#ccc",
                  display: "block",
                }} />
                <span style={{
                  fontSize: "clamp(0.65rem, 0.9vw, 0.75rem)",
                  color: "#999",
                  letterSpacing: "0.04em",
                }}>
                  {ci + 1} / {CHAPTERS.length}
                </span>
              </div>
            </div>
          ))}

          {/* ═══ Hero panels (4 blinds) ═══ */}
          {CHAPTERS.map((ch, i) => (
            <div
              key={`blind-${i}`}
              ref={(el) => { blindEls.current[i] = el; }}
              className="absolute top-0 left-0 overflow-hidden"
              style={{
                opacity: 0,
                willChange: "transform, opacity, width",
                zIndex: 15,
                background: ch.color,
              }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-sans select-none"
                  style={{
                    fontSize: "clamp(4rem, 10vw, 8rem)",
                    color: `${ch.accent}15`,
                    fontWeight: 200,
                    letterSpacing: "-0.05em",
                  }}>
                  {ch.label}
                </span>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: "40%",
                  background: `linear-gradient(to top, ${ch.color}, transparent)`,
                }}
              />
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "15%",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)",
                }}
              />
            </div>
          ))}

          {/* ═══ Sub-panel takeovers ═══ */}
          {CHAPTERS.map((ch, ci) =>
            ch.subs.map((sub, si) => (
              <div
                key={`sub-${ci}-${si}`}
                ref={(el) => { subEls.current[ci * 3 + si] = el; }}
                className="absolute top-0 overflow-hidden"
                style={{
                  right: 0,
                  width: "38%",
                  height: "100%",
                  opacity: 0,
                  willChange: "transform",
                  background: sub.color,
                  pointerEvents: "none",
                }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-sans select-none"
                    style={{
                      fontSize: "clamp(0.7rem, 1vw, 0.85rem)",
                      color: "rgba(255,255,255,0.12)",
                      fontWeight: 400,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}>
                    {sub.label}
                  </span>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: "40%",
                    background: `linear-gradient(to top, ${sub.color}, transparent)`,
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
