"use client";

import { useRef, useMemo, type RefObject } from "react";
import { COMPANIES } from "@data";
import { smoothstep, lerp } from "./math";
import { fc, createPrinciples } from "./engineer-data";
import { CRYSTALLIZE, SCROLL_PHASES } from "./engineer-candidate.types";

interface CrystallizeOptions {
  isLgRef: RefObject<boolean>;
  /** Parent-owned flash overlay — crystallize resets it to opacity 0 */
  flashRef: RefObject<HTMLDivElement | null>;
}

/**
 * Crystallize animation — 4 principle cards fade in and settle.
 * Returns an update function (called per scroll frame) and JSX to render.
 */
export function useCrystallize({ isLgRef, flashRef }: CrystallizeOptions) {
  const principleEls = useRef<(HTMLDivElement | null)[]>([]);
  const crystLineEl = useRef<HTMLDivElement | null>(null);
  const principles = useMemo(createPrinciples, []);

  function update(progress: number) {
    const isDesktop = isLgRef.current;
    const phaseStart = SCROLL_PHASES.CRYSTALLIZE.start;
    const phaseEnd = SCROLL_PHASES.CRYSTALLIZE.end;
    const phaseDuration = phaseEnd - phaseStart;

    // Reset flash overlay from previous phase
    if (flashRef.current) flashRef.current.style.opacity = "0";

    // Horizontal divider line scales in
    if (crystLineEl.current) {
      const appear = smoothstep(
        phaseStart + phaseDuration * CRYSTALLIZE.lineAppearStart,
        phaseStart + phaseDuration * CRYSTALLIZE.lineAppearEnd,
        progress,
      );
      crystLineEl.current.style.opacity = String(appear * CRYSTALLIZE.lineOpacity);
      crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
    }

    // Principle cards fade in with stagger and settle into position
    principles.forEach((principle, i) => {
      const element = principleEls.current[i];
      if (!element) return;
      const stagger = i * phaseDuration * CRYSTALLIZE.staggerFrac;
      const fadeIn = smoothstep(
        phaseStart + phaseDuration * CRYSTALLIZE.fadeInStartFrac + stagger,
        phaseStart + phaseDuration * CRYSTALLIZE.fadeInEndFrac + stagger,
        progress,
      );
      const settle = smoothstep(
        phaseStart + phaseDuration * CRYSTALLIZE.settleStartFrac + stagger,
        phaseStart + phaseDuration * CRYSTALLIZE.settleEndFrac,
        progress,
      );
      const mobileYOffset = isDesktop
        ? principle.yOffset
        : (i - CRYSTALLIZE.mobileCenter) * CRYSTALLIZE.mobileSpacing;
      const y = lerp(mobileYOffset + CRYSTALLIZE.yOffset, mobileYOffset, settle);
      element.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      element.style.opacity = String(fadeIn);
      element.style.filter = `blur(${lerp(CRYSTALLIZE.initialBlur, 0, fadeIn)}px)`;
      element.style.maxWidth = isDesktop ? CRYSTALLIZE.maxWidthLg : CRYSTALLIZE.maxWidthSm;
    });
  }

  const jsx = (
    <>
      {/* Crystallize divider line */}
      <div
        ref={crystLineEl}
        aria-hidden
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: "30vw",
          height: "1px",
          background: "var(--gold-dim)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
      {/* Principle cards */}
      {principles.map((principle, i) => (
        <div
          key={`principle-${i}`}
          ref={(element) => {
            principleEls.current[i] = element;
          }}
          className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
          style={{
            opacity: 0,
            maxWidth: "44vw",
            willChange: "transform, opacity, filter",
          }}>
          <span
            className="font-sans uppercase tracking-widest block"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: fc(i, 0.45),
              marginBottom: "0.35rem",
            }}>
            {COMPANIES[i].company}
          </span>
          <span
            className="font-serif block"
            style={{
              fontSize: "clamp(0.9rem, 1.8vw, 1.3rem)",
              lineHeight: 1.55,
              color: "var(--cream)",
            }}>
            {principle.text}
          </span>
        </div>
      ))}
    </>
  );

  return { update, jsx };
}
