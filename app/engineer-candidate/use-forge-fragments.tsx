"use client";

import { useRef, useMemo } from "react";
import { ss, lerp } from "./math";
import {
  fcExt,
  CC_EXT,
  LOGOS,
  createFragments,
  createEmbers,
  CONTENT,
} from "./engineer-data";
import {
  SEED, FRAGMENTS, EMBER, GRID, THESIS, CHROME, PHASES,
  PH,
  FORGE_START, FORGE_END,
  EMBERS_START, EMBERS_END, GLOW_START, GLOW_END,
  SEED_FADE_IN_START, SEED_FADE_IN_END,
  SEED_DRIFT_START, SEED_DRIFT_END,
  SEED_CONVERGE_START, SEED_CONVERGE_END,
  SEED_HEAT_START, SEED_HEAT_END,
  SEED_SCALE_SHRINK_START, SEED_SCALE_SHRINK_END,
  FRAG_FADE_IN_START, FRAG_FADE_IN_END,
  THESIS_START, THESIS_END,
} from "./engineer-candidate.types";

/**
 * Forge Fragments hook — owns fragment/ember/glow/grid/thesis
 * scroll animation and JSX. Called per-frame from the parent
 * scroll callback via `update()`.
 */
export function useForgeFragments() {
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
    p: number,
    lg: boolean,
    curtainTop: number,
    vh: number,
  ) {
    const CURTAIN_FADE = CHROME.curtainFadePx;

    /* ---- Fragments ---- */
    if (p < PH.FORGE_GATE) {
      fragments.forEach((f, i) => {
        const el = fragmentEls.current[i];
        if (!el) return;
        if (f.isSeed) {
          const fadeIn = ss(SEED_FADE_IN_START, SEED_FADE_IN_END, p);
          const drift = ss(SEED_DRIFT_START, SEED_DRIFT_END, p),
            converge = ss(SEED_CONVERGE_START, SEED_CONVERGE_END, p),
            heat = ss(SEED_HEAT_START, SEED_HEAT_END, p);
          const dX = f.x0 + f.dx * drift,
            dY = f.y0 + f.dy * drift;
          const x = lerp(dX, 0, converge),
            y = lerp(dY, 0, converge);
          const rot = lerp(f.rot, 0, converge);
          const scale =
            lerp(1, SEED.heatMaxScale, heat) *
            lerp(1, SEED.shrinkMinScale, ss(SEED_SCALE_SHRINK_START, SEED_SCALE_SHRINK_END, p));
          const fragScreenY = vh * 0.5 + (y * vh) / 100;
          const curtainReveal =
            curtainTop >= vh
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          const [cr, cg, cb] = CC_EXT[f.companyIdx % CC_EXT.length];
          el.style.color = `rgb(${cr},${cg},${cb})`;
          // Fade out during convergence (no gold blur/dissolve)
          const fadeOut =
            1 -
            ss(
              SEED_CONVERGE_START,
              SEED_CONVERGE_START + SEED.fadeoutDuration,
              p,
            );
          const initialBlur = lerp(
            1,
            0,
            ss(SEED_FADE_IN_START, SEED_FADE_IN_START + SEED.initialBlurDur, p),
          );
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg) scale(${scale})`;
          el.style.opacity = String(fadeIn * fadeOut * curtainReveal);
          el.style.filter = `blur(${initialBlur}px)`;
        } else {
          const fadeIn = ss(FRAG_FADE_IN_START, FRAG_FADE_IN_END, p),
            fadeOut = 1 - ss(f.dissolveStart * FRAGMENTS.dissolveSpeed, f.dissolveEnd * FRAGMENTS.dissolveSpeed, p);
          const drift = ss(FORGE_START + FRAGMENTS.driftInset, FORGE_END - FRAGMENTS.driftInset, p),
            dissolve = ss(f.dissolveStart * FRAGMENTS.dissolveSpeed, f.dissolveEnd * FRAGMENTS.dissolveSpeed, p);
          const x = f.x0 + f.dx * drift,
            y = f.y0 + f.dy * drift,
            rot = f.rot * (1 + drift * FRAGMENTS.rotDriftFactor);
          let baseAlpha: number;
          switch (f.type) {
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
          const fragScreenY = vh * 0.5 + (y * vh) / 100;
          const curtainReveal =
            curtainTop >= vh
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg)`;
          el.style.opacity = String(
            fadeIn * fadeOut * baseAlpha * curtainReveal,
          );
          el.style.filter = `blur(${lerp(0, SEED.maxDissolveBlur, dissolve)}px)`;
        }
      });
    } else {
      fragments.forEach((_, i) => {
        const el = fragmentEls.current[i];
        if (el) el.style.opacity = "0";
      });
    }

    /* ---- Embers ---- */
    embers.forEach((e, i) => {
      const el = emberEls.current[i];
      if (!el) return;
      const heat = ss(EMBERS_START + e.delay, EMBERS_START + EMBER.heatDuration, p),
        cool = ss(EMBERS_END - EMBER.coolLead, EMBERS_END, p),
        active = heat * (1 - cool);
      const rise = ss(EMBERS_START + EMBER.riseDelay + e.delay, EMBERS_END, p);
      el.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      el.style.opacity = String(active * (EMBER.baseOpacity + Math.sin(p * EMBER.flickerFreq + i) * EMBER.flickerAmp));
    });

    /* ---- Forge atmosphere — disabled, no visible glows ---- */
    if (glowEl.current) glowEl.current.style.opacity = "0";
    if (innerGlowEl.current) innerGlowEl.current.style.opacity = "0";
    if (gridEl.current) {
      const appear = ss(GLOW_START, GLOW_START + GRID.appearDuration, p),
        fade = 1 - ss(GLOW_END - GRID.fadeLead, GLOW_END, p);
      gridEl.current.style.opacity = String(appear * fade * GRID.maxOpacity);
    }

    /* ---- Thesis ---- */
    if (thesisEls.current[0]) {
      const thesisFadeInEnd = THESIS_START + PHASES.thesis * THESIS.fadeInFrac;
      const thesisFadeOutStart = THESIS_END - PHASES.thesis * THESIS.fadeOutFrac;
      const fadeIn = ss(THESIS_START, thesisFadeInEnd, p),
        fadeOut = 1 - ss(thesisFadeOutStart, THESIS_END, p);
      // Two-speed drift: fast approach before words, near-still during reveals
      const wordRevealZone = THESIS_START + PHASES.thesis * THESIS.wordZoneFrac;
      const driftFast = ss(THESIS_START, wordRevealZone, p);
      const driftSlow = ss(wordRevealZone, THESIS_END, p);
      const drift = driftFast * THESIS.driftFastWeight + driftSlow * THESIS.driftSlowWeight;
      const yStart = lg ? THESIS.yStartLg : THESIS.yStartSm;
      const yEnd = lg ? THESIS.yEndLg : THESIS.yEndSm;
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(yStart, yEnd, drift)}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(THESIS.initialBlur, 0, fadeIn)}px)`;
      thesisEls.current[0].style.maxWidth = lg ? THESIS.maxWidthLg : THESIS.maxWidthSm;

      // Sequential word reveal: each word drops in with translateY
      const WORD_THRESHOLDS = Array.from({ length: THESIS.wordCount }, (_, i) =>
        wordRevealZone + i * THESIS.wordStagger,
      );
      for (let wordIdx = 0; wordIdx < THESIS.wordCount; wordIdx++) {
        const wordEl = thesisWordRefs.current[wordIdx];
        if (!wordEl) continue;
        const wordProgress = ss(
          WORD_THRESHOLDS[wordIdx],
          WORD_THRESHOLDS[wordIdx] + THESIS.wordRevealDur,
          p,
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
          ref={(el) => {
            emberEls.current[i] = el;
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

      {/* Forge fragments — scale down on mobile for less clutter */}
      {fragments.map((f, i) => {
        const setRef = (el: HTMLElement | null) => {
          fragmentEls.current[i] = el;
        };
        const base =
          "absolute left-1/2 top-1/2 select-none pointer-events-none";
        switch (f.type) {
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
                  border: `1px solid ${fcExt(f.companyIdx, 0.25)}`,
                  fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  color: fcExt(f.companyIdx, 0.95),
                  letterSpacing: "0.02em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: "rgba(198,120,221,0.9)" }}>
                  {f.code.match(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                  )?.[0] ?? ""}
                </span>
                <span style={{ color: fcExt(f.companyIdx, 0.85) }}>
                  {f.code.replace(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                    "",
                  )}
                </span>
              </div>
            );
          case "logo":
            return (
              <div
                key={`logo-${f.logoKey}-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} `}
                style={{
                  opacity: 0,
                  willChange: "transform, opacity, filter",
                }}>
                <svg
                  viewBox={f.label ? "0 0 24 36" : "0 0 24 24"}
                  fill="none"
                  style={{
                    overflow: "visible",
                    width: `calc(${f.logoSize}px * var(--frag-scale))`,
                    height: `calc(${f.label ? f.logoSize * 1.5 : f.logoSize}px * var(--frag-scale))`,
                  }}>
                  {LOGOS[f.logoKey]}
                  {f.label && (
                    <text
                      x="12"
                      y="31"
                      textAnchor="middle"
                      fill="var(--cream-muted)"
                      fontSize="5"
                      fontFamily="var(--font-sans)"
                      letterSpacing="0.06em"
                      style={{ textTransform: "uppercase" }}>
                      {f.label}
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
                  border: `1px solid ${fcExt(f.companyIdx, 0.2)}`,
                  fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.01em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: fcExt(f.companyIdx, 0.85) }}>$ </span>
                <span style={{ color: fcExt(f.companyIdx, 0.7) }}>
                  {f.cmd}
                </span>
              </div>
            );
          default:
            return (
              <span
                key={`${f.type}-${f.text}-${i}`}
                ref={setRef as (el: HTMLSpanElement | null) => void}
                aria-hidden
                className={`${base} whitespace-nowrap font-sans `}
                style={{
                  fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                  fontWeight: f.weight,
                  color: fcExt(f.companyIdx, 0.95),
                  opacity: 0,
                  letterSpacing:
                    f.type === "tag"
                      ? "0.06em"
                      : f.type === "seed"
                        ? "0.04em"
                        : "0.02em",
                  willChange: "transform, opacity, filter",
                  ...(f.type === "tag"
                    ? {
                        padding: "2px 8px",
                        borderRadius: "3px",
                        border: `1px solid ${fcExt(f.companyIdx, 0.2)}`,
                        background: fcExt(f.companyIdx, 0.05),
                      }
                    : {}),
                }}>
                {f.text}
              </span>
            );
        }
      })}

      {/* Thesis — keywords highlight sequentially on scroll */}
      <div
        ref={(el) => {
          thesisEls.current[0] = el;
        }}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
          color: "var(--cream)",
          fontWeight: 400,
          maxWidth: "60vw",
          lineHeight: 1.5,
          willChange: "transform, opacity, filter",
        }}>
        {CONTENT.thesis.prefix}
        {CONTENT.thesis.keywords.map((word, wordIdx) => (
          <span key={word}>
            <span
              ref={(el) => { thesisWordRefs.current[wordIdx] = el; }}
              style={{ opacity: 0, willChange: "opacity, transform", marginRight: wordIdx < CONTENT.thesis.keywords.length - 1 ? "0.3em" : undefined }}>
              {wordIdx === CONTENT.thesis.keywords.length - 1
                ? `${CONTENT.thesis.conjunction}${word}.`
                : `${word},`}
            </span>
          </span>
        ))}
      </div>
    </>
  );

  return { update, jsx };
}
