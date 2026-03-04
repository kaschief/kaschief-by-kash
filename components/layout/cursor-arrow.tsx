"use client";

import { useRef, useEffect } from "react";
import { useCustomCursorEnabled } from "@hooks";
import { Z_INDEX, TOKENS } from "@utilities";

const { bg, cursorHighlight, cursorShadow, gold } = TOKENS;
const { cursor } = Z_INDEX;

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [tabindex]:not([tabindex="-1"])';

export function CursorArrow() {
  const outerRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabled = useCustomCursorEnabled();

  useEffect(() => {
    const root = document.documentElement;

    if (enabled) {
      root.dataset.customCursor = "on";
      return () => {
        delete root.dataset.customCursor;
      };
    }

    delete root.dataset.customCursor;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={outerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: cursor,
        willChange: "transform",
        transform: "translate(-100px, -100px)",
      }}>
      <div
        ref={opacityRef}
        style={{ opacity: 0, transition: "opacity 0.35s ease" }}>
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
                  style={{ stopColor: cursorHighlight }}
                />
                <stop offset="45%" style={{ stopColor: gold }} />
                <stop
                  offset="100%"
                  style={{ stopColor: cursorShadow }}
                />
              </linearGradient>
            </defs>
            <path
              d="M0 0 L0 28 L7 21 L12 30 L16 28 L11 19 L20 19 Z"
              fill="url(#cursorArrowGrad)"
              stroke={bg}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
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

        <div
          ref={ringRef}
          style={{
            display: "none",
            transform: "translate(-11px, -11px)",
          }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <defs>
              <radialGradient id="cursorRingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={gold} stopOpacity="0.18" />
                <stop offset="100%" stopColor={gold} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="11" cy="11" r="11" fill="url(#cursorRingGlow)" />
            <circle
              cx="11"
              cy="11"
              r="8.5"
              stroke={gold}
              strokeWidth="1.25"
              fill="none"
              strokeOpacity="0.9"
            />
            <circle
              cx="11"
              cy="11"
              r="1.5"
              fill={gold}
              fillOpacity="0.7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
