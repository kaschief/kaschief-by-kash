"use client";

import { useCallback } from "react";
import { SECTION_IDS_ORDERED, type SectionId, DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET } from "@utilities";
interface ScrollSectionOptions {
  behavior?: ScrollBehavior;
  updateHistory?: boolean;
  offset?: number;
}

interface ScrollYOptions {
  behavior?: ScrollBehavior;
}

const isSectionId = (value: string): value is SectionId =>
  SECTION_IDS_ORDERED.includes(value as SectionId);

export const NAVIGATION_SCROLL_EVENT = "portfolio:section-nav-scroll";

export function useSectionScroll() {
  const scrollToY = useCallback((top: number, options: ScrollYOptions = {}) => {
    const { behavior = "auto" } = options;
    window.scrollTo({ top, behavior });
  }, []);

  const scrollToSection = useCallback(
    (sectionId: SectionId, options: ScrollSectionOptions = {}) => {
      const el = document.getElementById(sectionId);
      if (!el) return false;

      const {
        behavior = "smooth",
        updateHistory = true,
        offset = SECTION_SCROLL_OFFSET[sectionId] ?? DEFAULT_SCROLL_OFFSET,
      } = options;

      if (updateHistory) {
        history.pushState(null, "", `#${sectionId}`);
      }

      // Dispatch BEFORE measuring so listeners can adjust layout
      // (e.g. Methods collapses its 300vh container during pass-through).
      window.dispatchEvent(
        new CustomEvent(NAVIGATION_SCROLL_EVENT, {
          detail: { sectionId, behavior },
        }),
      );
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      scrollToY(top, { behavior });
      return true;
    },
    [scrollToY],
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
      const { behavior = "smooth", updateHistory = true } = options;
      if (updateHistory) {
        history.pushState(null, "", "/");
      }
      scrollToY(0, { behavior });
    },
    [scrollToY],
  );

  return { scrollToSection, scrollToHref, scrollToTop, scrollToY };
}
