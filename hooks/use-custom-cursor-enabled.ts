"use client";

import { BREAKPOINTS } from "@utilities";
import { useBreakpoint } from "./use-breakpoint";
import { useMediaQuery } from "./use-media-query";

const FINE_POINTER_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const { md } = BREAKPOINTS;

/**
 * Enables custom cursor only for desktop-like pointer environments.
 */
export function useCustomCursorEnabled(): boolean {
  const isMdUp = useBreakpoint(md);
  const hasFinePointerHover = useMediaQuery(FINE_POINTER_HOVER_QUERY);

  return isMdUp && hasFinePointerHover;
}
