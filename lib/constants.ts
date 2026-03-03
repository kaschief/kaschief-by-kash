/**
 * Layout and z-index constants — single source of truth for spacing and
 * stacking values used across the app.
 *
 * RULE: Never hardcode z-index numbers or layout magic numbers in components.
 *       Always import from here.
 */

/** Z-index stacking order (low → high). */
export const Z_INDEX = {
  scrollFade: 40,  // fixed top-fade overlay (below nav, above page content)
  nav:       100,  // navigation bar
  takeover:  800,  // full-screen skill/detail takeovers
  cursor:   9999,  // custom cursor (always on top)
} as const

/** Layout spacing and offset values shared across components. */
export const LAYOUT = {
  /** Height of the fixed scroll-exit fade overlay at the top of the viewport. */
  scrollFadeHeight: 160,

  /** Pixels to subtract when scrolling to a section via nav click. */
  navScrollOffset: 80,
} as const
