"use client";

import type { CSSProperties } from "react";
import { useBreakpoint } from "@hooks";
import { BP, TOKENS } from "@utilities";
import type { DetailOverlayNavigationProps } from "./detail-overlay-navigation.types";

const { creamMuted, stroke } = TOKENS;

// ─── Icon primitives ──────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

// ─── Shared style constants ───────────────────────────────────────────────────

const BUTTON_BASE = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: `1px solid ${stroke}`,
  background: "color-mix(in srgb, var(--bg) 70%, transparent)",
  color: creamMuted,
  display: "grid",
  placeItems: "center",
} as const satisfies CSSProperties;

/** Right offset so the close button aligns with the overlay content edge. */
const CONTENT_OFFSET = "max(1rem, calc((100vw - 1024px) / 2 + 1rem))";

/** Left/right offset for desktop side-rail prev/next buttons. */
const RAIL_OFFSET = "max(1rem, calc(50% - 560px))";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Shared navigation controls for detail overlays.
 *
 * Mobile  — pill dock at bottom-center: [prev] [close] [next] (thumb-friendly)
 * Desktop — close anchored at content edge (top-right); prev/next on side rails
 */
export function DetailOverlayNavigation({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  zIndex,
}: DetailOverlayNavigationProps) {
  const isDesktop = useBreakpoint(BP.sm);
  const hasDirectionalNav = canGoPrev || canGoNext;

  const buttonStyle = { ...BUTTON_BASE, zIndex } satisfies CSSProperties;

  const closeButton = (
    <button
      type="button"
      aria-label="Close details"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      style={buttonStyle}>
      <CloseIcon />
    </button>
  );

  if (!isDesktop) {
    return (
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 8,
          borderRadius: 999,
          border: `1px solid ${stroke}`,
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          backdropFilter: "blur(12px)",
          zIndex,
        }}>
        {hasDirectionalNav ? (
          <button
            type="button"
            aria-label={prevLabel}
            disabled={!canGoPrev}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoPrev) onPrev();
            }}
            style={{
              ...buttonStyle,
              opacity: canGoPrev ? 0.85 : 0.35,
              cursor: canGoPrev ? "pointer" : "not-allowed",
            }}>
            <PrevIcon />
          </button>
        ) : null}

        {closeButton}

        {hasDirectionalNav ? (
          <button
            type="button"
            aria-label={nextLabel}
            disabled={!canGoNext}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoNext) onNext();
            }}
            style={{
              ...buttonStyle,
              opacity: canGoNext ? 0.85 : 0.35,
              cursor: canGoNext ? "pointer" : "not-allowed",
            }}>
            <NextIcon />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "clamp(0.75rem, 3vh, 1.5rem)",
          right: CONTENT_OFFSET,
          zIndex,
        }}>
        {closeButton}
      </div>

      {hasDirectionalNav ? (
        <>
          <button
            type="button"
            aria-label={prevLabel}
            disabled={!canGoPrev}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoPrev) onPrev();
            }}
            style={{
              ...buttonStyle,
              position: "fixed",
              top: "50%",
              left: RAIL_OFFSET,
              transform: "translateY(-50%)",
              opacity: canGoPrev ? 0.72 : 0.32,
              cursor: canGoPrev ? "pointer" : "not-allowed",
            }}>
            <PrevIcon />
          </button>

          <button
            type="button"
            aria-label={nextLabel}
            disabled={!canGoNext}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoNext) onNext();
            }}
            style={{
              ...buttonStyle,
              position: "fixed",
              top: "50%",
              right: RAIL_OFFSET,
              transform: "translateY(-50%)",
              opacity: canGoNext ? 0.72 : 0.32,
              cursor: canGoNext ? "pointer" : "not-allowed",
            }}>
            <NextIcon />
          </button>
        </>
      ) : null}
    </>
  );
}
