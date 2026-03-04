"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

interface UsePreserveScrollAnchorOptions {
  enabled?: boolean;
  threshold?: number;
}

/**
 * Keeps the viewport visually anchored to a content block while keyed/animated
 * content inside that block is swapped.
 *
 * Why: tab/carousel transitions can change DOM height/flow and cause perceived
 * "page jumps" even when the user did not scroll.
 */
export function usePreserveScrollAnchor<T extends HTMLElement>(
  trigger: unknown,
  options: UsePreserveScrollAnchorOptions = {},
) {
  const { enabled = true, threshold = 1 } = options;
  const anchorRef = useRef<T>(null);
  const previousTopRef = useRef<number | null>(null);

  const captureAnchor = useCallback(() => {
    if (!enabled) return;

    previousTopRef.current =
      anchorRef.current?.getBoundingClientRect().top ?? null;
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;

    const previousTop = previousTopRef.current;
    if (previousTop === null) return;

    const frame = requestAnimationFrame(() => {
      const currentTop = anchorRef.current?.getBoundingClientRect().top;
      if (typeof currentTop === "number") {
        const delta = currentTop - previousTop;
        if (Math.abs(delta) > threshold) {
          window.scrollBy(0, delta);
        }
      }

      previousTopRef.current = null;
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, threshold, trigger]);

  return { anchorRef, captureAnchor } as const;
}
