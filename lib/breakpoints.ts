/**
 * Breakpoint values in pixels — single source of truth.
 * Matches Tailwind's default scale (sm / md / lg / xl / 2xl).
 *
 * RULE: Use these for JS-driven logic (e.g. window.matchMedia, useMediaQuery).
 *       For CSS/JSX, prefer Tailwind breakpoint prefixes (sm:, md:, lg:, xl:).
 *       For shared layout rules that can't be expressed in Tailwind (e.g. complex
 *       CSS functions), use the global classes defined in globals.css.
 */
export const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BP;
