"use client";

/**
 * Lenses scroll choreography hook — prologue + crossfade highlights.
 *
 * Global scrollYProgress (0–1) → raw progress via TOTAL_RAW_SIZE.
 * Prologue: thesis sentence → keyword stagger → curtain sweep.
 * Cinematic: 4 highlight cards in crossfade (left card / right text layout).
 *
 * The Shore desk section is a separate React component in page.tsx.
 */

import { useRef } from "react";
import { CONTENT } from "./act-ii.data";
import {
  THESIS as EC_THESIS,
  PREFIX_DISSOLVE,
} from "./act-ii.types";
import { smoothstep, lerp, clamp } from "./math";
import { renderCard } from "./render-card";
import { HIGHLIGHT_ENTRIES } from "./card-config";
import {
  STORYCARD_SCROLL_SPAN,
  CURTAIN_EDGE,
  Z,
  BLUR_THRESHOLD,
  COMPANY_LABEL,
  CARD_ZOOM,
} from "./lenses.config";
import {
  PROLOGUE,
  CINEMATIC_START,
  TOTAL_RAW_SIZE,
  CONTAINER_HEIGHT_VH,
} from "./lenses.timing";

export { CONTAINER_HEIGHT_VH };
export { SMOOTH_LERP_FACTOR } from "./lenses.config";

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;
const H = HIGHLIGHT_ENTRIES.length;

/* ── Easing (GSAP power1 equivalents) ── */

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
function easeInQuad(t: number): number {
  return t * t;
}
function ep(
  v: number,
  s: number,
  e: number,
  ease: (t: number) => number,
): number {
  return ease(clamp((v - s) / (e - s), 0, 1));
}

/* ── Crossfade timing (EC word-distillation ratios) ── */

const CF = {
  cardIn: 0,
  cardDone: 0.26,
  iIn: 0.34,
  iDone: 0.5,
  storyIn: 0.5,
  storyDone: 0.62,
  driftEnd: 0.78,
  fadeS: 0.78,
  fadeE: 1.0,
} as const;

/* ── Crossfade Y offsets (px) matching EC ── */

const CFY = {
  card: { from: 65, rest: 4, drift: -4, exit: -22 },
  iStmt: { from: 40, rest: 0, drift: -2, exit: 16 },
  story: { from: 30, rest: 0, drift: -2, exit: 16 },
} as const;

/* ── Hook ── */

export function useLenses() {
  // Prologue refs
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Curtain (single element, prologue only now)
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);

  // Crossfade card refs (flat, 4 highlight cards)
  const artifactRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const storyRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const iStmtRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const companyRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const headlineWrapRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const headlineWordRefs = useRef<(HTMLSpanElement | null)[][]>(
    Array.from({ length: H }, () => []),
  );

  // Progress pills
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const pillBgRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));
  const pillFillRefs = useRef<(HTMLDivElement | null)[]>(new Array(H).fill(null));

  /* ── Update ── */

  function update(
    scrollProgress: number,
    viewportRef: React.RefObject<HTMLDivElement | null>,
  ) {
    const p = scrollProgress * TOTAL_RAW_SIZE;

    /* ═══ Prologue ═══ */

    if (thesisSentenceRef.current) {
      if (p > PROLOGUE.curtainEnd) {
        thesisSentenceRef.current.style.opacity = "0";
      } else {
        const P = PROLOGUE;
        const fadeInEnd =
          P.thesisStart + P.thesisDuration * EC_THESIS.fadeInFrac;
        const fadeIn = smoothstep(P.thesisStart, fadeInEnd, p);
        const fastDrift = smoothstep(P.thesisStart, P.keywordRevealStart, p);
        const slowDrift = smoothstep(
          P.keywordRevealStart,
          P.finalKeywordEnd,
          p,
        );
        const drift =
          fastDrift * EC_THESIS.driftFastWeight +
          slowDrift * EC_THESIS.driftSlowWeight;
        const vOff = lerp(EC_THESIS.yStartLg, EC_THESIS.yEndLg, drift);
        const blur = lerp(EC_THESIS.initialBlur, 0, fadeIn);

        thesisSentenceRef.current.style.opacity = String(fadeIn);
        thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${vOff}vh))`;
        thesisSentenceRef.current.style.filter =
          blur > BLUR_THRESHOLD ? `blur(${blur}px)` : "none";

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
          const cp = clamp(
            (p - P.curtainStart) / (P.curtainEnd - P.curtainStart),
            0,
            1,
          );
          if (cp > 0) {
            const vr = viewportRef.current.getBoundingClientRect();
            const dist =
              vr.height * (1 - cp) -
              (prefixSpanRef.current.getBoundingClientRect().bottom - vr.top);
            const la = vr.height * PREFIX_DISSOLVE.lookaheadFrac;
            if (dist < la) {
              const d = clamp(1 - dist / la, 0, 1);
              prefixSpanRef.current.style.filter =
                d * PREFIX_DISSOLVE.fullBlurPx > BLUR_THRESHOLD
                  ? `blur(${d * PREFIX_DISSOLVE.fullBlurPx}px)`
                  : "none";
              prefixSpanRef.current.style.opacity = String(
                lerp(1, PREFIX_DISSOLVE.minOpacity, d),
              );
            } else {
              prefixSpanRef.current.style.filter = "none";
              prefixSpanRef.current.style.opacity = "1";
            }
          }
        }
      }
    }

    /* ═══ Curtain — prologue only ═══ */

    if (curtainOverlayRef.current) {
      let curtainP: number;
      if (p < PROLOGUE.curtainStart) {
        curtainP = 0;
      } else if (p < PROLOGUE.curtainEnd) {
        curtainP = clamp(
          (p - PROLOGUE.curtainStart) /
            (PROLOGUE.curtainEnd - PROLOGUE.curtainStart),
          0,
          1,
        );
      } else {
        // After curtain: stays at 100% as background for crossfade
        curtainP = 1;
      }

      curtainOverlayRef.current.style.height = `${curtainP * 100}%`;
      const moving = curtainP > 0 && curtainP < 1;
      if (curtainAccentLineRef.current)
        curtainAccentLineRef.current.style.opacity = moving
          ? String(CURTAIN_EDGE.movingOpacity)
          : "0";
      if (curtainGradientRef.current)
        curtainGradientRef.current.style.opacity = moving ? "1" : "0";
    }

    /* ═══ Crossfade highlight cards ═══ */

    const cfStart = CINEMATIC_START;
    const span = STORYCARD_SCROLL_SPAN;

    // Show/hide pill container — only visible during crossfade
    if (pillContainerRef.current) {
      const inCrossfade = p >= cfStart && p <= cfStart + H * span + 0.02;
      const pillFadeIn = ep(p, cfStart, cfStart + 0.02, easeOutQuad);
      const pillFadeOut = ep(p, cfStart + H * span - 0.02, cfStart + H * span + 0.02, easeInQuad);
      const pillOp = inCrossfade ? pillFadeIn * (1 - pillFadeOut) : 0;
      pillContainerRef.current.style.opacity = String(pillOp);
      pillContainerRef.current.style.visibility = pillOp > 0.01 ? "visible" : "hidden";
    }

    for (let i = 0; i < H; i++) {
      const L = clamp((p - cfStart - i * span) / span, -0.05, 1.05);
      const last = i === H - 1;

      // Container fade — last card holds (no fade out)
      const fadeIn = ep(L, CF.cardIn, CF.cardDone, easeOutQuad);
      const fadeOut = last ? 0 : ep(L, CF.fadeS, CF.fadeE, easeInQuad);
      const itemOp = fadeIn * (1 - fadeOut);

      const el = artifactRefs.current[i];
      if (el) {
        el.style.opacity = String(itemOp);
        el.style.visibility = itemOp > 0.005 ? "visible" : "hidden";
      }

      // Headline wrapper: gentle upward drift
      const hlWrap = headlineWrapRefs.current[i];
      if (hlWrap) {
        const hlDrift = ep(L, 0.1, CF.driftEnd, (t) => t);
        const hlExitY = last ? 0 : ep(L, CF.fadeS, CF.fadeE, easeInQuad) * -12;
        hlWrap.style.transform = `translateY(${hlDrift * -8 + hlExitY}px)`;
      }

      // Headline word-by-word reveal
      const words = headlineWordRefs.current[i];
      if (words && words.length > 0) {
        const hlStart = -0.03;
        const hlEnd = 0.35;
        const hlRange = hlEnd - hlStart;
        const hlProgress = clamp((L - hlStart) / hlRange, 0, 1);
        const currentFloat = hlProgress * words.length;

        for (let w = 0; w < words.length; w++) {
          const word = words[w];
          if (!word) continue;
          const diff = currentFloat - w;

          if (diff < 0) {
            word.style.opacity = "0";
            word.style.transform = "scale(1)";
            word.style.color = "var(--cream)";
          } else if (diff < 1) {
            word.style.opacity = String(diff * (1 - fadeOut));
            word.style.transform = `scale(${1 + 0.02 * (1 - diff)})`;
            word.style.color = diff < 0.5 ? "var(--gold)" : "var(--cream)";
          } else {
            word.style.opacity = String(1 - fadeOut);
            word.style.transform = "scale(1)";
            word.style.color = "var(--cream)";
          }
        }
      }

      // Card inner: parallax Y
      const cardInner = cardFrontRefs.current[i];
      if (cardInner) {
        const entry = ep(L, CF.cardIn, CF.cardDone, easeOutQuad);
        const drift = ep(L, CF.cardDone, CF.driftEnd, (t) => t);
        const exitP = last ? 0 : ep(L, CF.fadeS, CF.fadeE, easeInQuad);
        const y =
          lerp(CFY.card.from, CFY.card.rest, entry) +
          drift * CFY.card.drift +
          exitP * CFY.card.exit;
        cardInner.style.transform = `translateY(${y}px)`;
      }

      // Company label
      const comp = companyRefs.current[i];
      if (comp) comp.style.opacity = String(COMPANY_LABEL.visible);

      // I-statement: descends from above
      const iStmt = iStmtRefs.current[i];
      if (iStmt) {
        const entry = ep(L, CF.iIn, CF.iDone, easeOutQuad);
        const drift = ep(L, CF.iDone, CF.driftEnd, (t) => t);
        const exitP = last ? 0 : ep(L, CF.fadeS, CF.fadeE, easeInQuad);
        const y =
          lerp(CFY.iStmt.from, CFY.iStmt.rest, entry) +
          drift * CFY.iStmt.drift +
          exitP * CFY.iStmt.exit;
        iStmt.style.transform = `translateY(${y}px)`;
        iStmt.style.opacity = String(entry * (1 - fadeOut));
      }

      // Story: rises from below
      const storyEl = storyRefs.current[i];
      if (storyEl) {
        const entry = ep(L, CF.storyIn, CF.storyDone, easeOutQuad);
        const drift = ep(L, CF.storyDone, CF.driftEnd, (t) => t);
        const exitP = last ? 0 : ep(L, CF.fadeS, CF.fadeE, easeInQuad);
        const y =
          lerp(CFY.story.from, CFY.story.rest, entry) +
          drift * CFY.story.drift +
          exitP * CFY.story.exit;
        storyEl.style.transform = `translateY(${y}px)`;
        storyEl.style.opacity = String(entry * (1 - fadeOut));
      }
    }

    // Progress pills
    const pillP = clamp((p - cfStart) / (H * span), 0, 1);
    const active = clamp(Math.floor(pillP * H), 0, H - 1);
    for (let i = 0; i < H; i++) {
      const bg = pillBgRefs.current[i];
      const fill = pillFillRefs.current[i];
      if (!bg || !fill) continue;
      if (i < active) {
        bg.style.width = "8px"; bg.style.borderRadius = "999px";
        fill.style.width = "100%"; fill.style.opacity = "0.6";
        fill.style.background = "var(--gold-dim)";
      } else if (i === active) {
        bg.style.width = "28px"; bg.style.borderRadius = "4px";
        const localP = (pillP * H) - i;
        fill.style.width = `${clamp(localP * 100, 0, 100)}%`;
        fill.style.opacity = "1";
        fill.style.background = "var(--gold-dim)";
      } else {
        bg.style.width = "8px"; bg.style.borderRadius = "999px";
        fill.style.width = "0%"; fill.style.opacity = "0.3";
      }
    }

  }

  /* ── JSX ── */

  const fullScreenJsx = (
    <>
      {/* Thesis sentence */}
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
          zIndex: Z.thesis,
        }}>
        <span ref={prefixSpanRef} style={{ willChange: "filter, opacity" }}>
          {thesisData.prefix}
        </span>
        <span>
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
                    i < thesisData.keywords.length - 1 ? "0.3em" : undefined,
                }}>
                {i === thesisData.keywords.length - 1
                  ? `${thesisData.conjunction}${word}.`
                  : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>

      {/* Curtain overlay */}
      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "0%",
          zIndex: Z.curtain,
          background: "var(--bg, #07070A)",
          pointerEvents: "none",
        }}>
        <div
          ref={curtainAccentLineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: CURTAIN_EDGE.accentLineHeight,
            background: "var(--gold, #C9A84C)",
            opacity: 0,
          }}
        />
        <div
          ref={curtainGradientRef}
          style={{
            position: "absolute",
            top: -CURTAIN_EDGE.gradientOvershoot,
            left: 0,
            right: 0,
            height: CURTAIN_EDGE.gradientOvershoot,
            background: `linear-gradient(to bottom, transparent, var(--bg, #07070A))`,
            opacity: 0,
          }}
        />
      </div>
    </>
  );

  const contentJsx = (
    <>
      <style>{`
        .card-zoom-wrap { zoom: ${CARD_ZOOM.tablet}; }
        @media (min-width: 1024px) { .card-zoom-wrap { zoom: ${CARD_ZOOM.desktop}; } }
      `}</style>
      {/* Crossfade highlight cards */}
      {HIGHLIGHT_ENTRIES.map((entry, i) => {
        return (
          <div
            key={entry.id}
            ref={(el) => {
              artifactRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center px-4 sm:px-8 pointer-events-none"
            style={{
              opacity: 0,
              visibility: "hidden",
              zIndex: Z.cards,
            }}>
            {/* Desktop/tablet: side by side */}
            <div
              className="hidden sm:flex w-full mx-auto items-center gap-6 lg:gap-14"
              style={{ maxWidth: 1100 }}>
              {/* Left: card — zoom scales on tablet */}
              <div className="sm:w-[38%] lg:w-[42%]">
                <div
                  ref={(el) => {
                    cardFrontRefs.current[i] = el;
                  }}
                  className="card-zoom-wrap"
                  style={{ willChange: "transform" }}>
                  {renderCard(entry, {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                  })}
                  <div
                    ref={(el) => {
                      companyRefs.current[i] = el;
                    }}
                    className="font-ui mt-4 text-center"
                    style={{
                      opacity: COMPANY_LABEL.visible,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: COMPANY_LABEL.color,
                    }}>
                    {entry.company} &middot; {entry.years}
                  </div>
                </div>
              </div>
              {/* Right: headline + i-statement + story */}
              <div
                className="relative sm:w-[55%] lg:w-[50%]"
                style={{ paddingTop: 48 }}>
                {/* Headline */}
                <div
                  ref={(el) => {
                    headlineWrapRefs.current[i] = el;
                  }}
                  className="absolute left-0 right-0"
                  style={{
                    top: 0,
                    lineHeight: 1.6,
                    willChange: "transform",
                  }}>
                  {entry.headline.split(" ").map((word, w) => (
                    <span
                      key={w}
                      ref={(el) => {
                        if (!headlineWordRefs.current[i])
                          headlineWordRefs.current[i] = [];
                        headlineWordRefs.current[i][w] = el;
                      }}
                      className="font-narrator"
                      style={{
                        opacity: 0,
                        display: "inline-block",
                        marginRight: "0.3em",
                        fontSize: "clamp(0.82rem, 1.4vw, 1.2rem)",
                        fontStyle: "italic",
                        color: "var(--cream)",
                        transition: "color 0.15s ease",
                        willChange: "opacity, color",
                      }}>
                      {word}
                    </span>
                  ))}
                </div>
                {/* I-statement */}
                <div
                  ref={(el) => {
                    iStmtRefs.current[i] = el;
                  }}
                  style={{
                    opacity: 0,
                    willChange: "transform, opacity",
                  }}>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "clamp(0.95rem, 1.8vw, 1.5rem)",
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                      color: "var(--gold)",
                      fontWeight: 400,
                    }}>
                    {entry.iStatement}
                  </div>
                </div>
                {/* Story */}
                <div
                  ref={(el) => {
                    storyRefs.current[i] = el;
                  }}
                  style={{
                    opacity: 0,
                    marginTop: 24,
                    willChange: "transform, opacity",
                    fontFamily: "var(--font-narrator)",
                    fontStyle: "italic",
                    fontSize: "clamp(0.72rem, 0.95vw, 0.88rem)",
                    lineHeight: 1.75,
                    color: "var(--text-dim)",
                  }}>
                  {entry.story}
                </div>
              </div>
            </div>

            {/* Phone: stacked centered */}
            <div className="flex sm:hidden flex-col items-center w-full mx-auto" style={{ maxWidth: 240 }}>
              <div
                ref={undefined}
                style={{ width: "100%", willChange: "transform" }}>
                {renderCard(entry, {
                  boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                })}
              </div>
              <div
                className="font-ui mt-3 text-center"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: COMPANY_LABEL.color,
                  opacity: COMPANY_LABEL.visible,
                }}>
                {entry.company} &middot; {entry.years}
              </div>
              <div
                className="mt-4 text-center"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(1rem, 4vw, 1.3rem)",
                  lineHeight: 1.4,
                  color: "var(--gold)",
                }}>
                {entry.iStatement}
              </div>
              <div
                className="mt-3 text-center"
                style={{
                  fontFamily: "var(--font-narrator)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.75rem, 3vw, 0.85rem)",
                  lineHeight: 1.7,
                  color: "var(--text-dim)",
                }}>
                {entry.story}
              </div>
            </div>
          </div>
        );
      })}

      {/* Progress pills — hidden during prologue/curtain, visible during crossfade */}
      <div
        ref={pillContainerRef}
        className="absolute left-1/2 flex items-center gap-2 pointer-events-none"
        style={{ bottom: "4%", transform: "translateX(-50%)", zIndex: Z.keyword, opacity: 0, visibility: "hidden" }}>
        {HIGHLIGHT_ENTRIES.map((entry, i) => (
          <div
            key={entry.id}
            ref={(el) => { pillBgRefs.current[i] = el; }}
            style={{
              width: 8, height: 8, borderRadius: 999,
              background: "var(--stroke)", overflow: "hidden",
              transition: "width 0.3s ease, border-radius 0.3s ease",
            }}>
            <div
              ref={(el) => { pillFillRefs.current[i] = el; }}
              style={{
                width: "0%", height: "100%",
                background: "var(--gold-dim)", borderRadius: "inherit",
                transition: "opacity 0.3s ease",
              }}
            />
          </div>
        ))}
      </div>

    </>
  );

  return { update, fullScreenJsx, contentJsx };
}
