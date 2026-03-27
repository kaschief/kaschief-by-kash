"use client";

import { useRef, useMemo } from "react";
import { smoothstep, lerp } from "./math";
import {
  fcExt,
  CC_EXT,
  LOGOS,
  createFragments,
  createEmbers,
  CONTENT,
} from "./engineer-data";
import {
  SEED,
  FRAGMENTS,
  EMBER,
  GRID,
  THESIS,
  EC_UI_CONFIG,
  PHASES,
  SCROLL_PHASES,
  CONVERGENCE_START,
  CONVERGENCE_END,
  EMBERS_START,
  EMBERS_END,
  GLOW_START,
  GLOW_END,
  SEED_FADE_IN_START,
  SEED_FADE_IN_END,
  SEED_DRIFT_START,
  SEED_DRIFT_END,
  SEED_CONVERGE_START,
  SEED_CONVERGE_END,
  SEED_HEAT_START,
  SEED_HEAT_END,
  SEED_SCALE_SHRINK_START,
  SEED_SCALE_SHRINK_END,
  FRAG_FADE_IN_START,
  FRAG_FADE_IN_END,
  THESIS_START,
  THESIS_END,
} from "./engineer-candidate.types";

/**
 * Convergence hook — owns fragment/ember/glow/grid/thesis
 * scroll animation and JSX. Called per-frame from the parent
 * scroll callback via `update()`.
 */
export function useConvergence() {
  /* ---- Refs ---- */
  const fragmentEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glowEl = useRef<HTMLDivElement>(null);
  const innerGlowEl = useRef<HTMLDivElement>(null);
  const gridEl = useRef<HTMLDivElement>(null);

  /* ---- Data ---- */
  const fragments = useMemo(createFragments, []);
  const embers = useMemo(createEmbers, []);

  /* ---- Scroll update ---- */
  function update(
    progress: number,
    isDesktop: boolean,
    curtainTop: number,
    viewportHeight: number,
    /** When true, thesis sentence is hidden — lenses prologue replaces it */
    skipThesis = false,
  ) {
    const CURTAIN_FADE = EC_UI_CONFIG.curtainFadePx;

    /* ---- Fragments ---- */
    if (progress < SCROLL_PHASES.CONVERGENCE_GATE) {
      fragments.forEach((fragment, i) => {
        const element = fragmentEls.current[i];
        if (!element) return;
        if (fragment.isSeed) {
          const fadeIn = smoothstep(
            SEED_FADE_IN_START,
            SEED_FADE_IN_END,
            progress,
          );
          const drift = smoothstep(SEED_DRIFT_START, SEED_DRIFT_END, progress),
            converge = smoothstep(
              SEED_CONVERGE_START,
              SEED_CONVERGE_END,
              progress,
            ),
            heat = smoothstep(SEED_HEAT_START, SEED_HEAT_END, progress);
          const driftedX = fragment.x0 + fragment.dx * drift,
            driftedY = fragment.y0 + fragment.dy * drift;
          const translateX = lerp(driftedX, 0, converge),
            translateY = lerp(driftedY, 0, converge);
          const rotation = lerp(fragment.rot, 0, converge);
          const scale =
            lerp(1, SEED.heatMaxScale, heat) *
            lerp(
              1,
              SEED.shrinkMinScale,
              smoothstep(
                SEED_SCALE_SHRINK_START,
                SEED_SCALE_SHRINK_END,
                progress,
              ),
            );
          const fragScreenY =
            viewportHeight * 0.5 + (translateY * viewportHeight) / 100;
          const curtainReveal =
            curtainTop >= viewportHeight
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          const [cr, cg, cb] = CC_EXT[fragment.companyIdx % CC_EXT.length];
          element.style.color = `rgb(${cr},${cg},${cb})`;
          // Fade out during convergence (no gold blur/dissolve)
          const fadeOut =
            1 -
            smoothstep(
              SEED_CONVERGE_START,
              SEED_CONVERGE_START + SEED.fadeoutDuration,
              progress,
            );
          const initialBlur = lerp(
            1,
            0,
            smoothstep(
              SEED_FADE_IN_START,
              SEED_FADE_IN_START + SEED.initialBlurDur,
              progress,
            ),
          );
          element.style.transform = `translate(calc(-50% + ${translateX}vw), calc(-50% + ${translateY}vh)) rotate(${rotation}deg) scale(${scale})`;
          element.style.opacity = String(fadeIn * fadeOut * curtainReveal);
          element.style.filter = `blur(${initialBlur}px)`;
        } else {
          const fadeIn = smoothstep(
              FRAG_FADE_IN_START,
              FRAG_FADE_IN_END,
              progress,
            ),
            fadeOut =
              1 -
              smoothstep(
                fragment.dissolveStart * FRAGMENTS.dissolveSpeed,
                fragment.dissolveEnd * FRAGMENTS.dissolveSpeed,
                progress,
              );
          const drift = smoothstep(
              CONVERGENCE_START + FRAGMENTS.driftInset,
              CONVERGENCE_END - FRAGMENTS.driftInset,
              progress,
            ),
            dissolve = smoothstep(
              fragment.dissolveStart * FRAGMENTS.dissolveSpeed,
              fragment.dissolveEnd * FRAGMENTS.dissolveSpeed,
              progress,
            );
          const translateX = fragment.x0 + fragment.dx * drift,
            translateY = fragment.y0 + fragment.dy * drift,
            rotation = fragment.rot * (1 + drift * FRAGMENTS.rotDriftFactor);
          let baseAlpha: number;
          switch (fragment.type) {
            case "code":
            case "command":
              baseAlpha = FRAGMENTS.alphaCode;
              break;
            case "logo":
              baseAlpha = FRAGMENTS.alphaLogo;
              break;
            default:
              baseAlpha = FRAGMENTS.alphaDefault;
          }
          const fragScreenY =
            viewportHeight * 0.5 + (translateY * viewportHeight) / 100;
          const curtainReveal =
            curtainTop >= viewportHeight
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          element.style.transform = `translate(calc(-50% + ${translateX}vw), calc(-50% + ${translateY}vh)) rotate(${rotation}deg)`;
          element.style.opacity = String(
            fadeIn * fadeOut * baseAlpha * curtainReveal,
          );
          element.style.filter = `blur(${lerp(0, SEED.maxDissolveBlur, dissolve)}px)`;
        }
      });
    } else {
      fragments.forEach((_, i) => {
        const element = fragmentEls.current[i];
        if (element) element.style.opacity = "0";
      });
    }

    /* ---- Embers ---- */
    embers.forEach((e, i) => {
      const element = emberEls.current[i];
      if (!element) return;
      const heat = smoothstep(
          EMBERS_START + e.delay,
          EMBERS_START + EMBER.heatDuration,
          progress,
        ),
        cool = smoothstep(EMBERS_END - EMBER.coolLead, EMBERS_END, progress),
        active = heat * (1 - cool);
      const rise = smoothstep(
        EMBERS_START + EMBER.riseDelay + e.delay,
        EMBERS_END,
        progress,
      );
      element.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      element.style.opacity = String(
        active *
          (EMBER.baseOpacity +
            Math.sin(progress * EMBER.flickerFreq + i) * EMBER.flickerAmp),
      );
    });

    /* ---- Convergence atmosphere — disabled, no visible glows ---- */
    if (glowEl.current) glowEl.current.style.opacity = "0";
    if (innerGlowEl.current) innerGlowEl.current.style.opacity = "0";
    if (gridEl.current) {
      const appear = smoothstep(
          GLOW_START,
          GLOW_START + GRID.appearDuration,
          progress,
        ),
        fade = 1 - smoothstep(GLOW_END - GRID.fadeLead, GLOW_END, progress);
      gridEl.current.style.opacity = String(appear * fade * GRID.maxOpacity);
    }

    /* ---- Thesis ---- */
    if (skipThesis) {
      if (thesisEls.current[0]) thesisEls.current[0].style.opacity = "0";
    } else if (thesisEls.current[0]) {
      const thesisFadeInEnd = THESIS_START + PHASES.thesis * THESIS.fadeInFrac;
      const thesisFadeOutStart =
        THESIS_END - PHASES.thesis * THESIS.fadeOutFrac;
      const fadeIn = smoothstep(THESIS_START, thesisFadeInEnd, progress),
        fadeOut = 1 - smoothstep(thesisFadeOutStart, THESIS_END, progress);
      // Two-speed drift: fast approach before words, near-still during reveals
      const wordRevealZone = THESIS_START + PHASES.thesis * THESIS.wordZoneFrac;
      const driftFast = smoothstep(THESIS_START, wordRevealZone, progress);
      const driftSlow = smoothstep(wordRevealZone, THESIS_END, progress);
      const drift =
        driftFast * THESIS.driftFastWeight + driftSlow * THESIS.driftSlowWeight;
      const yStart = isDesktop ? THESIS.yStartLg : THESIS.yStartSm;
      const yEnd = isDesktop ? THESIS.yEndLg : THESIS.yEndSm;
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(yStart, yEnd, drift)}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(THESIS.initialBlur, 0, fadeIn)}px)`;
      thesisEls.current[0].style.maxWidth = isDesktop
        ? THESIS.maxWidthLg
        : THESIS.maxWidthSm;

      // Sequential word reveal: each word drops in with translateY
      const WORD_THRESHOLDS = Array.from(
        { length: THESIS.wordCount },
        (_, i) => wordRevealZone + i * THESIS.wordStagger,
      );
      for (let wordIdx = 0; wordIdx < THESIS.wordCount; wordIdx++) {
        const wordEl = thesisWordRefs.current[wordIdx];
        if (!wordEl) continue;
        const wordProgress = smoothstep(
          WORD_THRESHOLDS[wordIdx],
          WORD_THRESHOLDS[wordIdx] + THESIS.wordRevealDur,
          progress,
        );
        wordEl.style.opacity = String(wordProgress);
        wordEl.style.transform = `translateY(${lerp(THESIS.wordDropPx, 0, wordProgress)}px)`;
        wordEl.style.display = "inline-block";
      }
    }
  }

  /* ---- JSX ---- */
  const jsx = (
    <>
      {/* Atmosphere — dot grid */}
      <div
        ref={gridEl}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow elements — no visible shape, just ambient color wash */}
      <div
        ref={glowEl}
        aria-hidden
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(91,158,194,0.04) 0%, transparent 70%)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={innerGlowEl}
        aria-hidden
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />

      {/* Embers */}
      {embers.map((e, i) => (
        <div
          key={`ember-${i}`}
          ref={(element) => {
            emberEls.current[i] = element;
          }}
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: e.size,
            height: e.size,
            background:
              "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 70%, transparent 100%)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Convergence fragments — scale down on mobile for less clutter */}
      {fragments.map((fragment, i) => {
        const setRef = (element: HTMLElement | null) => {
          fragmentEls.current[i] = element;
        };
        const base =
          "absolute left-1/2 top-1/2 select-none pointer-events-none";
        switch (fragment.type) {
          case "code":
            return (
              <div
                key={`code-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} whitespace-nowrap`}
                style={{
                  opacity: 0,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "rgba(14,14,20,0.85)",
                  border: `1px solid ${fcExt(fragment.companyIdx, 0.25)}`,
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  color: fcExt(fragment.companyIdx, 0.95),
                  letterSpacing: "0.02em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: "rgba(198,120,221,0.9)" }}>
                  {fragment.code.match(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                  )?.[0] ?? ""}
                </span>
                <span style={{ color: fcExt(fragment.companyIdx, 0.85) }}>
                  {fragment.code.replace(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                    "",
                  )}
                </span>
              </div>
            );
          case "logo":
            return (
              <div
                key={`logo-${fragment.logoKey}-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} `}
                style={{
                  opacity: 0,
                  willChange: "transform, opacity, filter",
                }}>
                <svg
                  viewBox={fragment.label ? "0 0 24 36" : "0 0 24 24"}
                  fill="none"
                  style={{
                    overflow: "visible",
                    width: `calc(${fragment.logoSize}px * var(--frag-scale))`,
                    height: `calc(${fragment.label ? fragment.logoSize * 1.5 : fragment.logoSize}px * var(--frag-scale))`,
                  }}>
                  {LOGOS[fragment.logoKey]}
                  {fragment.label && (
                    <text
                      x="12"
                      y="31"
                      textAnchor="middle"
                      fill="var(--cream-muted)"
                      fontSize="5"
                      fontFamily="var(--font-sans)"
                      letterSpacing="0.06em"
                      style={{ textTransform: "uppercase" }}>
                      {fragment.label}
                    </text>
                  )}
                </svg>
              </div>
            );
          case "command":
            return (
              <div
                key={`cmd-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} whitespace-nowrap `}
                style={{
                  opacity: 0,
                  padding: "5px 10px",
                  borderRadius: "4px",
                  background: "rgba(7,7,10,0.9)",
                  border: `1px solid ${fcExt(fragment.companyIdx, 0.2)}`,
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.01em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: fcExt(fragment.companyIdx, 0.85) }}>
                  ${" "}
                </span>
                <span style={{ color: fcExt(fragment.companyIdx, 0.7) }}>
                  {fragment.cmd}
                </span>
              </div>
            );
          default:
            return (
              <span
                key={`${fragment.type}-${fragment.text}-${i}`}
                ref={setRef as (element: HTMLSpanElement | null) => void}
                aria-hidden
                className={`${base} whitespace-nowrap font-sans `}
                style={{
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontWeight: fragment.weight,
                  color: fcExt(fragment.companyIdx, 0.95),
                  opacity: 0,
                  letterSpacing:
                    fragment.type === "tag"
                      ? "0.06em"
                      : fragment.type === "seed"
                        ? "0.04em"
                        : "0.02em",
                  willChange: "transform, opacity, filter",
                  ...(fragment.type === "tag"
                    ? {
                        padding: "2px 8px",
                        borderRadius: "3px",
                        border: `1px solid ${fcExt(fragment.companyIdx, 0.2)}`,
                        background: fcExt(fragment.companyIdx, 0.05),
                      }
                    : {}),
                }}>
                {fragment.text}
              </span>
            );
        }
      })}

      {/* Thesis — keywords highlight sequentially on scroll */}
      <div
        ref={(element) => {
          thesisEls.current[0] = element;
        }}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
          color: "var(--cream)",
          fontWeight: 400,
          maxWidth: THESIS.maxWidthLg,
          lineHeight: 1.5,
          willChange: "transform, opacity, filter",
        }}>
        {CONTENT.thesis.prefix}
        <span style={{ whiteSpace: "nowrap" }}>
          {CONTENT.thesis.keywords.map((word, wordIdx) => (
            <span key={word}>
              <span
                ref={(element) => {
                  thesisWordRefs.current[wordIdx] = element;
                }}
                style={{
                  opacity: 0,
                  willChange: "opacity, transform",
                  marginRight:
                    wordIdx < CONTENT.thesis.keywords.length - 1
                      ? "0.3em"
                      : undefined,
                }}>
                {wordIdx === CONTENT.thesis.keywords.length - 1
                  ? `${CONTENT.thesis.conjunction}${word}.`
                  : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>
    </>
  );

  return { update, jsx };
}
