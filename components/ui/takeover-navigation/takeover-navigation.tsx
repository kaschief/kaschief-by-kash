"use client";

import { BP, TOKENS } from "@utilities";
import { useBreakpoint } from "@hooks";
import type { TakeoverNavigationProps } from "./takeover-navigation.types";
const { creamMuted, stroke } = TOKENS;

/**
 * Prev/next navigation buttons for all takeover overlays.
 *
 * Responsive behaviour is owned here via useBreakpoint — callers stay agnostic.
 *
 *   Mobile  (< sm / 640px) — pair at bottom-centre of screen
 *   sm+     (≥ 640px)      — one button on each side, vertically centred,
 *                            using max(24px, calc(50% - 560px)) offset
 */
export function TakeoverNavigation({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  zIndex,
}: TakeoverNavigationProps) {
  const isDesktop = useBreakpoint(BP.sm);

  if (!canGoPrev && !canGoNext) return null;

  const base = {
    zIndex,
    position: "fixed" as const,
    width: 38,
    height: 38,
    borderRadius: 999,
    border: `1px solid ${stroke}`,
    background: "color-mix(in srgb, var(--bg) 70%, transparent)",
    color: creamMuted,
    display: "grid",
    placeItems: "center",
  };

  const sideOffset = "max(24px, calc(50% - 560px))";

  const prevStyle = isDesktop
    ? { ...base, top: "50%", left: sideOffset, transform: "translateY(-50%)", cursor: canGoPrev ? "pointer" : "not-allowed", opacity: canGoPrev ? 0.72 : 0.32 }
    : { ...base, bottom: "2rem", left: "50%", transform: "translateX(calc(-100% - 0.5rem))", cursor: canGoPrev ? "pointer" : "not-allowed", opacity: canGoPrev ? 0.72 : 0.32 };

  const nextStyle = isDesktop
    ? { ...base, top: "50%", right: sideOffset, transform: "translateY(-50%)", cursor: canGoNext ? "pointer" : "not-allowed", opacity: canGoNext ? 0.72 : 0.32 }
    : { ...base, bottom: "2rem", left: "50%", transform: "translateX(0.5rem)", cursor: canGoNext ? "pointer" : "not-allowed", opacity: canGoNext ? 0.72 : 0.32 };

  return (
    <>
      <button
        type="button"
        aria-label={prevLabel}
        disabled={!canGoPrev}
        onClick={(e) => { e.stopPropagation(); if (canGoPrev) onPrev(); }}
        style={prevStyle}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3L5 8l5 5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={!canGoNext}
        onClick={(e) => { e.stopPropagation(); if (canGoNext) onNext(); }}
        style={nextStyle}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </button>
    </>
  );
}
