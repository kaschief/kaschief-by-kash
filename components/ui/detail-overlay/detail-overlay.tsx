"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { KEYBOARD_EVENT, TOKENS, Z_INDEX } from "@utilities";
import { DetailOverlayContent } from "../detail-overlay-content";
import { DetailOverlayNavigation } from "../detail-overlay-navigation";

const {
  KEY: { ARROW_LEFT, ARROW_RIGHT, ESCAPE },
  TYPE: { KEY_DOWN },
} = KEYBOARD_EVENT;
const { bg } = TOKENS;
const { detailOverlay } = Z_INDEX;

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

/** Unified full-screen detail overlay shell. */
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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeoutId = setTimeout(() => setVisible(true), 20);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE) {
        onCloseRef.current();
      }
    };

    document.addEventListener(KEY_DOWN, handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(timeoutId);
      document.removeEventListener(KEY_DOWN, handleKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!onPrev && !onNext) return;

    const handleArrow = (event: KeyboardEvent) => {
      if (event.key === ARROW_LEFT && canGoPrev && onPrev) {
        event.preventDefault();
        onPrev();
      }
      if (event.key === ARROW_RIGHT && canGoNext && onNext) {
        event.preventDefault();
        onNext();
      }
    };

    document.addEventListener(KEY_DOWN, handleArrow);
    return () => document.removeEventListener(KEY_DOWN, handleArrow);
  }, [canGoNext, canGoPrev, onNext, onPrev]);

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
        zIndex: detailOverlay,
        background: bg,
        overflowY: "auto",
      }}>
      <DetailOverlayNavigation
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev ?? (() => {})}
        onNext={onNext ?? (() => {})}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        zIndex={detailOverlay + 1}
      />

      <DetailOverlayContent onClick={(event) => event.stopPropagation()}>
        {children({ item })}
      </DetailOverlayContent>
    </div>
  );
}
