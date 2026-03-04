import { LAYOUT } from "./constants";
import { SECTION_ID, type SectionId } from "./sections";

const { navScrollOffset } = LAYOUT;
const { METHODS } = SECTION_ID;

/** Offset applied when scrolling to a section via nav click. */
export const DEFAULT_SCROLL_OFFSET = navScrollOffset;

/**
 * Per-section scroll offsets.
 * Methods uses a slightly smaller offset to keep the section header visible.
 */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {
  [METHODS]: 64,
};
