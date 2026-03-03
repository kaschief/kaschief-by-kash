"use client";

import { useRef, useEffect } from "react";
import { Z_INDEX } from "@/lib/constants";
import { TOKENS } from "@/lib/tokens";

/*
  Custom cursor — two visual states, zero React re-renders (direct DOM only).

  Normal:  metallic gold arrow, hotspot at tip (0, 0)
  Pointer: glowing gold ring, centered on cursor via translate(-11, -11)
           — the modern premium approach (circle rings are used by Apple,
             Figma, and most luxury/portfolio sites; looks far cleaner than
             trying to draw a hand at cursor scale)

  Outer div:  translate only, NO opacity transition = instant position tracking
  Opacity wrapper: opacity transition only = smooth fade on enter/exit
  Inner divs: toggled display none/block on mouseover

  Exit fade: opacity wrapper transitions 0.35s ease when cursor leaves window
  Enter fade: same wrapper fades back in on re-entry
*/

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [tabindex]:not([tabindex="-1"])';

export function CursorArrow() {
  const outerRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const opacity = opacityRef.current;
    const arrow = arrowRef.current;
    const ring = ringRef.current;
    if (!outer || !opacity || !arrow || !ring) return;

    let shown = false;
    let isPointer = false;

    const handleMove = (e: MouseEvent) => {
      outer.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (!shown) {
        opacity.style.opacity = "1";
        shown = true;
      }
    };

    const handleOver = (e: MouseEvent) => {
      const next = !!(e.target as Element).closest(INTERACTIVE_SELECTOR);
      if (next === isPointer) return;
      isPointer = next;
      arrow.style.display = isPointer ? "none" : "block";
      ring.style.display = isPointer ? "block" : "none";
    };

    const handleLeave = () => {
      opacity.style.opacity = "0";
    };
    const handleEnter = () => {
      if (shown) opacity.style.opacity = "1";
    };

    document.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, []);

  return (
    /* Outer: position only — no transition so tracking is instant */
    <div
      ref={outerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: Z_INDEX.cursor,
        willChange: "transform",
        transform: "translate(-100px, -100px)",
      }}>
      {/* Opacity wrapper: fade transition isolated from position */}
      <div
        ref={opacityRef}
        style={{ opacity: 0, transition: "opacity 0.35s ease" }}>
        {/* ── Arrow (default) ────────────────────────────────────── */}
        <div ref={arrowRef}>
          <svg width="21" height="31" viewBox="0 0 21 31" fill="none">
            <defs>
              <linearGradient
                id="cursorArrowGrad"
                x1="0"
                y1="0"
                x2="21"
                y2="31"
                gradientUnits="userSpaceOnUse">
                <stop
                  offset="0%"
                  style={{ stopColor: TOKENS.cursorHighlight }}
                />
                <stop offset="45%" style={{ stopColor: TOKENS.gold }} />
                <stop
                  offset="100%"
                  style={{ stopColor: TOKENS.cursorShadow }}
                />
              </linearGradient>
            </defs>
            <path
              d="M0 0 L0 28 L7 21 L12 30 L16 28 L11 19 L20 19 Z"
              fill="url(#cursorArrowGrad)"
              stroke={TOKENS.bg}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Specular highlight */}
            <path
              d="M1 2 L1 13 L5 9"
              stroke="rgba(255,245,200,0.45)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* ── Pointer ring (over interactive elements) ────────────── */}
        {/*
          Centered on cursor via translate(-11, -11).
          A glowing gold ring — the standard modern premium cursor pattern.
          Outer ring: thin gold stroke
          Inner fill:  very subtle gold tint
          Glow:        radial gradient blur effect via second larger circle
        */}
        <div
          ref={ringRef}
          style={{
            display: "none",
            transform: "translate(-11px, -11px)",
          }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <defs>
              <radialGradient id="cursorRingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={TOKENS.gold} stopOpacity="0.18" />
                <stop offset="100%" stopColor={TOKENS.gold} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Outer glow fill */}
            <circle cx="11" cy="11" r="11" fill="url(#cursorRingGlow)" />
            {/* Main ring */}
            <circle
              cx="11"
              cy="11"
              r="8.5"
              stroke={TOKENS.gold}
              strokeWidth="1.25"
              fill="none"
              strokeOpacity="0.9"
            />
            {/* Inner dot */}
            <circle
              cx="11"
              cy="11"
              r="1.5"
              fill={TOKENS.gold}
              fillOpacity="0.7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
