"use client";

import type { BreakpointValue } from "@utilities";
import { useMediaQuery } from "./use-media-query";

/**
 * Returns true when the viewport is AT OR ABOVE the given min-width.
 *
 * Usage:
 *   const isDesktop = useBreakpoint(lg);
 */
export function useBreakpoint(minWidth: BreakpointValue): boolean {
  return useMediaQuery(`(min-width: ${minWidth}px)`);
}
