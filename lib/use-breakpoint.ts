"use client";

import { useState, useEffect } from "react";
import { BP, type Breakpoint } from "./breakpoints";

/**
 * Returns true when the viewport is AT OR ABOVE the given breakpoint.
 *
 * Safe for SSR — always returns false on the server and on first render,
 * then updates synchronously once the component mounts.
 *
 * Usage:
 *   const isDesktop = useBreakpoint("lg"); // true when viewport >= 1024px
 */
export function useBreakpoint(bp: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BP[bp]}px)`);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [bp]);

  return matches;
}
