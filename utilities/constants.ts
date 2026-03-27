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
  cursor: 100000, // custom cursor (always on top — must exceed all overlays including story desk at 10001)
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

/** Tunable scroll navigation transition config. */
export const SCROLL_NAV = {
  /** Viewports of distance before switching to fade-jump-slide transition. */
  longJumpThresholdVh: 2,

  /** Pixels above target to land before the smooth slide-in. */
  approachPx: 120,

  /** Fade-out duration before the instant jump (ms). */
  fadeOutMs: 100,

  /** Fade-in duration during the smooth slide-in (ms). */
  fadeInMs: 150,

  /** Duration of the smooth slide-in after landing (seconds). */
  slideInDuration: 0.3,

  /** Short-distance scroll: min duration (seconds). */
  shortScrollMinS: 0.4,

  /** Short-distance scroll: max duration (seconds). */
  shortScrollMaxS: 1.0,

  /** Short-distance scroll: px-per-second divisor for duration calc. */
  shortScrollDivisor: 2000,

  /** Scroll-to-top: min duration (seconds). */
  topScrollMinS: 0.5,

  /** Scroll-to-top: max duration (seconds). */
  topScrollMaxS: 1.2,

  /** Scroll-to-top: px-per-second divisor for duration calc. */
  topScrollDivisor: 3500,
} as const;
