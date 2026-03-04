"use client";

import { useEffect, useState } from "react";

/**
 * Generic media query hook.
 * Returns false on first render (SSR-safe), then syncs to the query value.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mq.addEventListener("change", handleChange);
    return () => {
      mq.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
