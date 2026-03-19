"use client";

import { useRef, useMemo, type RefObject } from "react";
import { COMPANIES } from "@data";
import { ss, lerp } from "./math";
import { fc, createPrinciples } from "./engineer-data";
import { CRYSTALLIZE, PH } from "./engineer-candidate.types";

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

  function update(p: number) {
    const lg = isLgRef.current;
    const cS = PH.CRYSTALLIZE.start;
    const cE = PH.CRYSTALLIZE.end;
    const cD = cE - cS;

    // Reset flash overlay from previous phase
    if (flashRef.current) flashRef.current.style.opacity = "0";

    // Horizontal divider line scales in
    if (crystLineEl.current) {
      const appear = ss(
        cS + cD * CRYSTALLIZE.lineAppearStart,
        cS + cD * CRYSTALLIZE.lineAppearEnd,
        p,
      );
      crystLineEl.current.style.opacity = String(appear * CRYSTALLIZE.lineOpacity);
      crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
    }

    // Principle cards fade in with stagger and settle into position
    principles.forEach((pr, i) => {
      const el = principleEls.current[i];
      if (!el) return;
      const stagger = i * cD * CRYSTALLIZE.staggerFrac;
      const fadeIn = ss(
        cS + cD * CRYSTALLIZE.fadeInStartFrac + stagger,
        cS + cD * CRYSTALLIZE.fadeInEndFrac + stagger,
        p,
      );
      const settle = ss(
        cS + cD * CRYSTALLIZE.settleStartFrac + stagger,
        cS + cD * CRYSTALLIZE.settleEndFrac,
        p,
      );
      const mobileYOffset = lg
        ? pr.yOffset
        : (i - CRYSTALLIZE.mobileCenter) * CRYSTALLIZE.mobileSpacing;
      const y = lerp(mobileYOffset + CRYSTALLIZE.yOffset, mobileYOffset, settle);
      el.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      el.style.opacity = String(fadeIn);
      el.style.filter = `blur(${lerp(CRYSTALLIZE.initialBlur, 0, fadeIn)}px)`;
      el.style.maxWidth = lg ? CRYSTALLIZE.maxWidthLg : CRYSTALLIZE.maxWidthSm;
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
      {principles.map((pr, i) => (
        <div
          key={`principle-${i}`}
          ref={(el) => {
            principleEls.current[i] = el;
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
            {pr.text}
          </span>
        </div>
      ))}
    </>
  );

  return { update, jsx };
}
