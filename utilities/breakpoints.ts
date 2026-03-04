/**
 * Breakpoint values in pixels - single source of truth.
 * Matches Tailwind's default scale (sm / md / lg / xl / 2xl).
 *
 * RULE: Use these for JS-driven logic (e.g. media-query hooks).
 *       For CSS/JSX, prefer Tailwind breakpoint prefixes (sm:, md:, lg:, xl:).
 */
export const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointName = keyof typeof BP;
export type BreakpointValue = (typeof BP)[BreakpointName];
