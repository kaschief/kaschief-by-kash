"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "./use-lenis";
import { usePinStore } from "./use-pin-store";

/**
 * Makes a CSS-sticky section collapse after its first scroll-through.
 *
 * Returns `{ ref, done, stickyClass }`:
 * - `ref` — attach to the outer scroll-runway div
 * - `done` — whether the sticky pass has completed
 * - `stickyClass` — `"sticky top-0"` or `"relative"` for the inner div
 * - `height` — full runway height or collapsed height
 *
 * @param key       Unique id for the pin store (e.g. "throughline")
 * @param fullHeight  Runway height on first pass (e.g. "200vh")
 */
export function useStickyOnce(key: string, fullHeight: string) {
  const ref = useRef<HTMLDivElement>(null);
  const getLenis = useLenis();
  const done = usePinStore((s) => !!s.completed[key]);
  const collapsedHeight =
    typeof window !== "undefined" && window.CSS?.supports?.("height", "100svh")
      ? "100svh"
      : "100vh";

  useEffect(() => {
    if (done) return;
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= window.innerHeight) {
        const lenis = getLenis();
        const scroll = lenis?.scroll ?? window.scrollY;
        const diff = el.offsetHeight - window.innerHeight;

        usePinStore.getState().markDone(key);
        el.style.height = collapsedHeight;

        if (lenis) {
          lenis.scrollTo(scroll - diff, { immediate: true });
        } else {
          window.scrollTo(0, scroll - diff);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [collapsedHeight, done, getLenis, key]);

  return {
    ref,
    done,
    height: done ? collapsedHeight : fullHeight,
    stickyClass: done ? "relative" : "sticky top-0",
  } as const;
}
