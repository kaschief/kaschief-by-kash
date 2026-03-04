import { ACTIVE_SECTION_CONFIG } from "./active-section";
import { SECTION_IDS_ORDERED, type SectionId } from "@utilities";

export interface ObservedSectionSnapshot {
  ratioBySection: Partial<Record<SectionId, number>>;
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
  previousActiveSection?: SectionId | "";
}

/**
 * Resolves active section from IntersectionObserver ratios.
 *
 * Why:
 * - Avoids layout reflow from getBoundingClientRect calls during scroll.
 * - Keeps active section derivation deterministic and testable.
 * - Falls back to previous active section when IO reports a temporary gap.
 */
export function resolveObservedActiveSection(
  snapshot: ObservedSectionSnapshot,
): SectionId | "" {
  const {
    ratioBySection,
    scrollY,
    viewportHeight,
    documentHeight,
    previousActiveSection = "",
  } = snapshot;

  const nearBottom =
    scrollY + viewportHeight >=
    documentHeight - ACTIVE_SECTION_CONFIG.bottomOffsetPx;

  if (nearBottom) {
    return SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1];
  }

  let bestSection: SectionId | "" = "";
  let bestRatio = 0;

  for (const sectionId of SECTION_IDS_ORDERED) {
    const ratio = ratioBySection[sectionId] ?? 0;
    if (ratio <= bestRatio) continue;

    bestRatio = ratio;
    bestSection = sectionId;
  }

  if (bestSection) {
    return bestSection;
  }

  return previousActiveSection;
}
