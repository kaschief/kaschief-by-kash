"use client";

import { useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SECTION_IDS_ORDERED,
  type SectionId,
  DEFAULT_SCROLL_OFFSET,
  SECTION_SCROLL_OFFSET,
} from "@utilities";
import { useLenis } from "./use-lenis";
import { useNavStore } from "./use-nav-store";

interface ScrollSectionOptions {
  updateHistory?: boolean;
  offset?: number;
}

const isSectionId = (value: string): value is SectionId =>
  SECTION_IDS_ORDERED.includes(value as SectionId);

export const NAVIGATION_SCROLL_EVENT = "portfolio:section-nav-scroll";

/**
 * Check if the scroll path from `from` to `to` crosses any active
 * ScrollTrigger pin zone. Returns the far edge of the last pin crossed,
 * or null if no pins are in the way.
 */
function getPinSkipTarget(from: number, to: number): number | null {
  const goingDown = to > from;
  let candidate: number | null = null;

  for (const trigger of ScrollTrigger.getAll()) {
    if (!trigger.pin) continue;

    const pinStart = trigger.start;
    const pinEnd = trigger.end;

    // Only care about pins that add significant scroll distance
    if (pinEnd - pinStart < window.innerHeight * 0.3) continue;

    if (goingDown) {
      // Going down: if we start before pin ends and target is past pin end
      if (from < pinEnd && to >= pinStart) {
        const skip = pinEnd + 2;
        candidate = candidate === null ? skip : Math.max(candidate, skip);
      }
    } else {
      // Going up: if we start after pin starts and target is before pin start
      if (from > pinStart && to <= pinEnd) {
        const skip = Math.max(0, pinStart - 2);
        candidate = candidate === null ? skip : Math.min(candidate, skip);
      }
    }
  }

  return candidate;
}

export function useSectionScroll() {
  const getLenis = useLenis();

  const scrollToSection = useCallback(
    (sectionId: SectionId, options: ScrollSectionOptions = {}) => {
      const el = document.getElementById(sectionId);
      if (!el) return false;

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
        setTimeout(() => endNavigation(), 2000);
        return true;
      }

      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      const finalTarget = sectionTop - offset;
      const currentScroll = lenis.scroll;

      // Check if we need to skip past any pin zones
      const skipTarget = getPinSkipTarget(currentScroll, finalTarget);

      const finish = () => {
        const finishEasing = (t: number) => 1 - Math.pow(1 - t, 3);
        // Recalculate after potential instant jump (element position may shift)
        const updatedTop = el.getBoundingClientRect().top + window.scrollY;
        const updatedTarget = updatedTop - offset;
        const remainingDist = Math.abs(updatedTarget - lenis.scroll);
        const duration = Math.min(2.2, Math.max(0.8, remainingDist / 1800));

        lenis.scrollTo(updatedTarget, {
          duration,
          easing: finishEasing,
          lock: true,
          force: true,
          onComplete: () => {
            setTimeout(() => endNavigation(), 50);
          },
        });
      };

      // Easing: fast start, smooth deceleration
      const easing = (t: number) => 1 - Math.pow(1 - t, 3);

      if (skipTarget !== null) {
        // Phase 1: instant jump past the pin zone
        lenis.scrollTo(skipTarget, {
          immediate: true,
          force: true,
        });
        // Phase 2: smooth scroll to final target (after a frame for layout)
        requestAnimationFrame(() => finish());
      } else {
        // No pins in the way — smooth scroll directly
        const distance = Math.abs(finalTarget - currentScroll);
        const duration = Math.min(2.2, Math.max(0.8, distance / 1800));

        lenis.scrollTo(finalTarget, {
          duration,
          easing,
          lock: true,
          force: true,
          onComplete: () => {
            setTimeout(() => endNavigation(), 50);
          },
        });
      }

      // Safety fallback
      setTimeout(() => endNavigation(), 4000);

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

      const { startNavigation, endNavigation } = useNavStore.getState();
      startNavigation("portrait" as SectionId);

      const lenis = getLenis();
      if (!lenis) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => endNavigation(), 2000);
        return;
      }

      const currentScroll = lenis.scroll;
      const skipTarget = getPinSkipTarget(currentScroll, 0);

      const topEasing = (t: number) => 1 - Math.pow(1 - t, 3);

      if (skipTarget !== null) {
        // Instant jump past pins, then smooth to top
        lenis.scrollTo(skipTarget, {
          immediate: true,
          force: true,
        });
        requestAnimationFrame(() => {
          const remaining = lenis.scroll;
          const duration = Math.min(2.2, Math.max(0.8, remaining / 1800));
          lenis.scrollTo(0, {
            duration,
            easing: topEasing,
            lock: true,
            force: true,
            onComplete: () => {
              setTimeout(() => endNavigation(), 50);
            },
          });
        });
      } else {
        const distance = Math.abs(currentScroll);
        const duration = Math.min(2.2, Math.max(0.8, distance / 1800));
        lenis.scrollTo(0, {
          duration,
          easing: topEasing,
          lock: true,
          force: true,
          onComplete: () => {
            setTimeout(() => endNavigation(), 50);
          },
        });
      }

      setTimeout(() => endNavigation(), 4000);
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
