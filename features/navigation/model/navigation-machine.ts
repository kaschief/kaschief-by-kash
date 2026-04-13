/**
 * Navigation timing constants.
 *
 * Kept in its own module to preserve the import path used
 * by the navigation component and public API.
 */
export const NAVIGATION_TIMING = {
  /** Nav bar appears after scrolling past this fraction of viewport height. */
  navVisibleViewportRatio: 0.75,
} as const;
