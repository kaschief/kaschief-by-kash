"use client";

import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { KEYBOARD_EVENT, TOKENS, Z_INDEX } from "@utilities";
import { TakeoverNavigation } from "../takeover-navigation";
import { TakeoverContent } from "../takeover-content";

const {
  KEY: { ESCAPE, ARROW_LEFT, ARROW_RIGHT },
  TYPE: { KEY_DOWN },
} = KEYBOARD_EVENT;
const { bg } = TOKENS;
const { takeover } = Z_INDEX;

export interface DetailOverlayProps {
  /** Render prop receives `item(delay)` for staggered entrance animations. */
  children: (helpers: { item: (delay: number) => CSSProperties }) => ReactNode;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

/**
 * Unified full-screen detail overlay.
 *
 * Consolidates all overlay behavior in one place:
 * - Scroll lock on mount / restore on unmount
 * - Escape key → close
 * - Arrow keys → prev / next navigation (when provided)
 * - X close button (always top-right)
 * - Optional prev / next buttons (sides on desktop, bottom on mobile)
 * - Click on backdrop → close; click on content → no-op
 */
export function DetailOverlay({
  children,
  onClose,
  onPrev,
  onNext,
  canGoPrev = false,
  canGoNext = false,
  prevLabel = "Previous",
  nextLabel = "Next",
}: DetailOverlayProps) {
  const [visible, setVisible] = useState(false);

  // Refs keep callbacks fresh without re-triggering mount effect
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  // Scroll lock + entrance animation + Escape key (mount / unmount only)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => setVisible(true), 20);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === ESCAPE) onCloseRef.current();
    };
    document.addEventListener(KEY_DOWN, handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(t);
      document.removeEventListener(KEY_DOWN, handleEscape);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Arrow key navigation — re-attaches when nav state changes
  useEffect(() => {
    if (!onPrev && !onNext) return;

    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === ARROW_LEFT && canGoPrev && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === ARROW_RIGHT && canGoNext && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener(KEY_DOWN, handleArrow);
    return () => document.removeEventListener(KEY_DOWN, handleArrow);
  }, [canGoPrev, canGoNext, onPrev, onNext]);

  /** Staggered entrance animation helper passed to children. */
  const item = (delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 16}px)`,
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: takeover,
        background: bg,
        overflowY: "auto",
      }}>
      <TakeoverNavigation
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev ?? (() => {})}
        onNext={onNext ?? (() => {})}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        zIndex={takeover + 1}
      />
      <TakeoverContent onClick={(e) => e.stopPropagation()}>
        {children({ item })}
      </TakeoverContent>
    </div>
  );
}
