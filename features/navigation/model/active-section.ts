import { DEFAULT_SCROLL_OFFSET, SECTION_IDS_ORDERED, type SectionId } from "@utilities";

interface ActiveSectionConfig {
  /**
   * Bottom offset used to snap active state to the last section near page end.
   * Trade-off: avoids flicker on short final sections at the cost of slightly
   * earlier activation when close to the footer.
   */
  bottomOffsetPx: number;

  /**
   * Viewport ratio used as activation threshold for section tracking.
   * 0.4 means "active once the section reaches the top 40% of viewport".
   */
  activationViewportRatio: number;
}

export interface ActiveSectionSnapshot {
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
  sectionTopById: Readonly<Record<SectionId, number | null>>;
}

export const ACTIVE_SECTION_CONFIG = {
  bottomOffsetPx: DEFAULT_SCROLL_OFFSET,
  activationViewportRatio: 0.4,
} as const satisfies ActiveSectionConfig;

export const isSectionId = (value: string): value is SectionId =>
  SECTION_IDS_ORDERED.includes(value as SectionId);

/**
 * Pure section-resolution logic extracted from the UI component.
 *
 * Why: keeping this logic pure gives deterministic behavior and testability.
 * The component becomes an orchestration layer, not the place where business
 * decisions are encoded.
 */
export function resolveActiveSection(
  snapshot: ActiveSectionSnapshot,
  config: ActiveSectionConfig = ACTIVE_SECTION_CONFIG,
): SectionId | "" {
  const {
    scrollY,
    viewportHeight,
    documentHeight,
    sectionTopById,
  } = snapshot;

  const nearBottom =
    scrollY + viewportHeight >= documentHeight - config.bottomOffsetPx;

  if (nearBottom) {
    return SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1];
  }

  const activationThreshold = viewportHeight * config.activationViewportRatio;
  let current: SectionId | "" = "";

  for (const sectionId of SECTION_IDS_ORDERED) {
    const top = sectionTopById[sectionId];
    if (top !== null && top <= activationThreshold) {
      current = sectionId;
    }
  }

  return current;
}
