"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { HISTORY_EVENT, KEYBOARD_EVENT } from "@utilities";

const {
  KEY: { ESCAPE },
  TYPE: { KEY_DOWN },
} = KEYBOARD_EVENT;
const { POP_STATE } = HISTORY_EVENT;

/**
 * Shared behavior for full-screen takeover overlays.
 *
 * Why this is a hook module:
 * - Encapsulates lifecycle side effects (scroll lock, history, keyboard).
 * - Keeps UI components focused on rendering and content.
 */
export function useTakeover(onClose: () => void) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    history.pushState({ takeover: true }, "", location.href);
    const timeoutId = setTimeout(() => setVisible(true), 20);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE) {
        history.back();
      }
    };

    const handlePopState = () => onClose();

    document.addEventListener(KEY_DOWN, handleKeyDown);
    window.addEventListener(POP_STATE, handlePopState, {
      once: true,
    } as AddEventListenerOptions);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(timeoutId);
      document.removeEventListener(KEY_DOWN, handleKeyDown);
      window.removeEventListener(POP_STATE, handlePopState);
    };
  }, [onClose]);

  /** CSS transition helper for staggered entrance by delay (seconds). */
  const item = (delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 16}px)`,
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return { item };
}
