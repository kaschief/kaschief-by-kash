/**
 * Layout and z-index constants — single source of truth for spacing and
 * stacking values used across the app.
 *
 * RULE: Never hardcode z-index numbers or layout magic numbers in components.
 *       Always import from here.
 */

/** Z-index stacking order (low → high). */
export const Z_INDEX = {
  scrollFade: 40, // fixed top-fade overlay (below nav, above page content)
  detailOverlay: 800, // full-screen detail overlays
  repoPanel: 900, // repo panel overlay (above detail overlays, below nav)
  nav: 950, // navigation bar (always visible above overlays)
  cursor: 9999, // custom cursor (always on top)
} as const;

/** Layout spacing and offset values shared across components. */
export const LAYOUT = {
  /** Height of the fixed scroll-exit fade overlay at the top of the viewport. */
  scrollFadeHeight: 160,

  /** Pixels to subtract when scrolling to a section via nav click. */
  navScrollOffset: 80,

  /** Pin duration as a fraction of viewport height, per direction. */
  pinDownVh: 0.8,
  pinUpVh: 0.2,
} as const;
