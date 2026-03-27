"use client";

import { useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SCROLL_NAV,
  SECTION_IDS_ORDERED,
  type SectionId,
  DEFAULT_SCROLL_OFFSET,
  SECTION_SCROLL_OFFSET,
} from "@utilities";
import type Lenis from "lenis";
import { useLenis } from "./use-lenis";
import { useNavStore } from "./use-nav-store";

interface ScrollSectionOptions {
  updateHistory?: boolean;
  offset?: number;
}

const isSectionId = (value: string): value is SectionId =>
  SECTION_IDS_ORDERED.includes(value as SectionId);

export const NAVIGATION_SCROLL_EVENT = "portfolio:section-nav-scroll";

/* ── Internal constants (not tunable — structural or safety-related) ── */

/** Delay before endNavigation fires after scroll completes (ms). */
const END_NAV_DELAY_MS = 50;

/** Fallback timeout if onComplete never fires (ms). */
const SAFETY_FALLBACK_MS = 4000;

/** Fallback timeout for non-Lenis scroll (ms). */
const NATIVE_SCROLL_FALLBACK_MS = 2000;

/** Minimum pin/sticky zone size as fraction of viewport to consider. */
const MIN_ZONE_SIZE_VH = 0.3;

/** Minimum sticky element height as fraction of viewport to consider. */
const MIN_STICKY_HEIGHT_VH = 1.5;

/** Offset past pin zone edge to avoid landing exactly on the boundary (px). */
const PIN_EDGE_OFFSET_PX = 2;

/** Easing: fast start, smooth deceleration. */
const EASE_OUT_QUART = (t: number) => 1 - Math.pow(1 - t, 4);

/* ── Helpers ── */

/** Get absolute top position of an element by walking up the offset chain.
 *  Unlike getBoundingClientRect, this is not affected by sticky elements. */
function getAbsoluteTop(el: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = el;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

/** Clamp a distance-based duration between `min` and `max` seconds. */
function clampDuration(distance: number, divisor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, distance / divisor));
}

/** Smooth-scroll to `target` with easing, then call `onDone`. */
function smoothScroll(
  lenis: Lenis,
  target: number,
  duration: number,
  onDone: () => void,
): void {
  lenis.scrollTo(target, {
    duration,
    easing: EASE_OUT_QUART,
    lock: true,
    force: true,
    onComplete: () => setTimeout(onDone, END_NAV_DELAY_MS),
  });
}

/**
 * Fade out → instant jump → fade in + smooth slide to target.
 * Used for long-distance nav and scroll-to-top past pin zones.
 *
 * `slideTo` can be a number or a callback that returns a number.
 * When a callback is provided it runs after the jump, so the slide
 * target reflects post-jump layout (pin spacers may shift positions).
 */
function fadeJumpSlide(
  lenis: Lenis,
  jumpTo: number,
  slideTo: number | (() => number),
  slideDuration: number,
  onDone: () => void,
): void {
  const container = getScrollContainer();
  container.style.transition = `opacity ${SCROLL_NAV.fadeOutMs}ms ease-out`;
  container.style.opacity = "0";

  setTimeout(() => {
    // Hide completely during jump — prevents any intermediate scroll state from painting
    container.style.visibility = "hidden";
    lenis.scrollTo(jumpTo, { immediate: true, force: true });

    // Wait 3 frames for all scroll-driven animations to settle:
    //   Frame 1: scroll events fire, raw progress refs update
    //   Frame 2: RAF loops (e.g. lenses LERP) snap to new raw values
    //   Frame 3: DOM mutations from frame-2 updates are committed
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.style.visibility = "";
          container.style.transition = `opacity ${SCROLL_NAV.fadeInMs}ms ease-in`;
          container.style.opacity = "1";

          const resolvedTarget = typeof slideTo === "function" ? slideTo() : slideTo;

          lenis.scrollTo(resolvedTarget, {
            duration: slideDuration,
            easing: EASE_OUT_QUART,
            lock: true,
            force: true,
            onComplete: () => {
              container.style.transition = "";
              setTimeout(onDone, END_NAV_DELAY_MS);
            },
          });
        });
      });
    });
  }, SCROLL_NAV.fadeOutMs);
}

/**
 * Check if the scroll path from `from` to `to` crosses any active
 * ScrollTrigger pin zone or CSS sticky zone. Returns the far edge of
 * the last crossed zone, or null if none are in the way.
 *
 * Only triggers when the target is fully past the zone — if the target
 * is inside a zone, no skip is needed.
 */
function getPinSkipTarget(from: number, to: number): number | null {
  const goingDown = to > from;
  let candidate: number | null = null;

  const processZone = (pinStart: number, pinEnd: number) => {
    if (pinEnd - pinStart < window.innerHeight * MIN_ZONE_SIZE_VH) return;

    if (goingDown) {
      if (from < pinStart && to > pinEnd) {
        const skip = pinEnd + PIN_EDGE_OFFSET_PX;
        candidate = candidate === null ? skip : Math.max(candidate, skip);
      }
    } else {
      if (from > pinEnd && to < pinStart) {
        const skip = Math.max(0, pinStart - PIN_EDGE_OFFSET_PX);
        candidate = candidate === null ? skip : Math.min(candidate, skip);
      }
    }
  };

  for (const trigger of ScrollTrigger.getAll()) {
    if (!trigger.pin) continue;
    processZone(trigger.start, trigger.end);
  }

  document
    .querySelectorAll<HTMLElement>("[data-sticky-zone]")
    .forEach((parent) => {
      const parentRect = parent.getBoundingClientRect();
      if (parentRect.height < window.innerHeight * MIN_STICKY_HEIGHT_VH) return;
      const pinStart = parentRect.top + window.scrollY;
      processZone(pinStart, pinStart + parentRect.height);
    });

  return candidate;
}

/** Resolve the scroll container for fade transitions. */
function getScrollContainer(): HTMLElement {
  return document.getElementById("journey") ?? document.documentElement;
}

/* ── Hook ── */

export function useSectionScroll() {
  const getLenis = useLenis();

  const scrollToSection = useCallback(
    (sectionId: SectionId, options: ScrollSectionOptions = {}) => {
      const el = document.getElementById(sectionId);
      if (!el) return false;

      // Prevent re-entrant calls while a navigation is already in flight
      if (useNavStore.getState().isNavigating) return false;

      const {
        updateHistory = true,
        offset = SECTION_SCROLL_OFFSET[sectionId] ?? DEFAULT_SCROLL_OFFSET,
      } = options;

      if (updateHistory) {
        history.pushState(null, "", `#${sectionId}`);
      }

      window.dispatchEvent(
        new CustomEvent(NAVIGATION_SCROLL_EVENT, {
          detail: { sectionId },
        }),
      );

      const { startNavigation, endNavigation } = useNavStore.getState();
      startNavigation(sectionId);

      const lenis = getLenis();
      if (!lenis) {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        setTimeout(() => endNavigation(), NATIVE_SCROLL_FALLBACK_MS);
        return true;
      }

      // Use offsetTop to get the static layout position — getBoundingClientRect
      // is affected by sticky elements shifting during scroll
      const sectionTop = getAbsoluteTop(el);
      const finalTarget = sectionTop - offset;
      const currentScroll = lenis.scroll;
      const distance = Math.abs(finalTarget - currentScroll);
      const skipTarget = getPinSkipTarget(currentScroll, finalTarget);
      const isLongJump =
        distance > window.innerHeight * SCROLL_NAV.longJumpThresholdVh ||
        skipTarget !== null;

      console.log(`[nav] ${sectionId} | from:${Math.round(currentScroll)} to:${Math.round(finalTarget)} dist:${Math.round(distance)} offset:${offset} longJump:${isLongJump} skip:${skipTarget !== null ? Math.round(skipTarget) : "none"}`);

      // For sections with offset: 0 (full-viewport sticky containers), the
      // scroll target must land a few pixels PAST the section top so that
      // scrollY > sectionTop, guaranteeing the sticky element is pinned.
      // Landing exactly on the boundary leaves the sticky unpinned due to
      // sub-pixel rounding or Lenis settling.
      const stickyOvershoot = offset === 0 ? PIN_EDGE_OFFSET_PX : 0;

      if (isLongJump) {
        const jumpTo = Math.max(0, finalTarget - SCROLL_NAV.approachPx);
        // Slide target is recalculated after the jump via callback — pin
        // spacers may shift element positions during the instant scroll.
        const slideTo = () => {
          const recalc = getAbsoluteTop(el) - offset + stickyOvershoot;
          console.log(`[nav] slideTo recalc: ${Math.round(recalc)} (jump landed at ${Math.round(window.scrollY)})`);
          return recalc;
        };

        fadeJumpSlide(lenis, jumpTo, slideTo, SCROLL_NAV.slideInDuration, endNavigation);
      } else {
        const adjustedTarget = finalTarget + stickyOvershoot;
        const duration = clampDuration(
          distance,
          SCROLL_NAV.shortScrollDivisor,
          SCROLL_NAV.shortScrollMinS,
          SCROLL_NAV.shortScrollMaxS,
        );
        smoothScroll(lenis, adjustedTarget, duration, endNavigation);
      }

      setTimeout(() => endNavigation(), SAFETY_FALLBACK_MS);
      return true;
    },
    [getLenis],
  );

  const scrollToHref = useCallback(
    (href: string, options: ScrollSectionOptions = {}) => {
      const id = href.replace("#", "");
      if (!isSectionId(id)) return false;
      return scrollToSection(id, options);
    },
    [scrollToSection],
  );

  const scrollToTop = useCallback(
    (options: Omit<ScrollSectionOptions, "offset"> = {}) => {
      const { updateHistory = true } = options;
      if (updateHistory) {
        history.pushState(null, "", "/");
      }

      window.dispatchEvent(
        new CustomEvent(NAVIGATION_SCROLL_EVENT, {
          detail: { sectionId: "portrait" },
        }),
      );

      const { startNavigation, endNavigation } = useNavStore.getState();
      startNavigation("portrait" as SectionId);

      const lenis = getLenis();
      if (!lenis) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => endNavigation(), NATIVE_SCROLL_FALLBACK_MS);
        return;
      }

      const currentScroll = lenis.scroll;
      const skipTarget = getPinSkipTarget(currentScroll, 0);

      if (skipTarget !== null) {
        const slideDuration = clampDuration(
          skipTarget,
          SCROLL_NAV.topScrollDivisor,
          SCROLL_NAV.topScrollMinS,
          SCROLL_NAV.topScrollMaxS,
        );
        fadeJumpSlide(lenis, skipTarget, 0, slideDuration, endNavigation);
      } else {
        const duration = clampDuration(
          currentScroll,
          SCROLL_NAV.topScrollDivisor,
          SCROLL_NAV.topScrollMinS,
          SCROLL_NAV.topScrollMaxS,
        );
        smoothScroll(lenis, 0, duration, endNavigation);
      }

      setTimeout(() => endNavigation(), SAFETY_FALLBACK_MS);
    },
    [getLenis],
  );

  const scrollToY = useCallback(
    (top: number, options: { behavior?: ScrollBehavior } = {}) => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(top, { immediate: options.behavior !== "smooth" });
      } else {
        window.scrollTo({ top, behavior: options.behavior ?? "auto" });
      }
    },
    [getLenis],
  );

  return { scrollToSection, scrollToHref, scrollToTop, scrollToY };
}
