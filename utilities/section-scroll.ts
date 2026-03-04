import { LAYOUT, SECTION_ID, type SectionId } from "@utilities";
const { navScrollOffset } = LAYOUT;
const { METHODS } = SECTION_ID;

/** Offset applied when scrolling to a section via nav click. */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {
  [METHODS]: 0, // sticky container must align to viewport top
};

export const DEFAULT_SCROLL_OFFSET = navScrollOffset;
