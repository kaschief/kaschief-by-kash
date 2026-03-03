"use client";

import { TOKENS } from "@/lib/tokens";
import type { TakeoverNavigationProps } from "./takeover-navigation.types";

const SIDE_CONTROL_OFFSET = "max(24px, calc(50% - 560px))";

export function TakeoverNavigation({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  zIndex,
}: TakeoverNavigationProps) {
  if (!canGoPrev && !canGoNext) return null;

  return (
    <>
      <button
        type="button"
        aria-label={prevLabel}
        disabled={!canGoPrev}
        onClick={(e) => {
          e.stopPropagation();
          if (canGoPrev) onPrev();
        }}
        style={{
          position: "fixed",
          top: "50%",
          left: SIDE_CONTROL_OFFSET,
          transform: "translateY(-50%)",
          zIndex,
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${TOKENS.stroke}`,
          background: "color-mix(in srgb, var(--bg) 70%, transparent)",
          color: TOKENS.creamMuted,
          display: "grid",
          placeItems: "center",
          cursor: canGoPrev ? "pointer" : "not-allowed",
          opacity: canGoPrev ? 0.72 : 0.32,
        }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5">
          <path d="M10 3L5 8l5 5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={!canGoNext}
        onClick={(e) => {
          e.stopPropagation();
          if (canGoNext) onNext();
        }}
        style={{
          position: "fixed",
          top: "50%",
          right: SIDE_CONTROL_OFFSET,
          transform: "translateY(-50%)",
          zIndex,
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${TOKENS.stroke}`,
          background: "color-mix(in srgb, var(--bg) 70%, transparent)",
          color: TOKENS.creamMuted,
          display: "grid",
          placeItems: "center",
          cursor: canGoNext ? "pointer" : "not-allowed",
          opacity: canGoNext ? 0.72 : 0.32,
        }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </button>
    </>
  );
}
