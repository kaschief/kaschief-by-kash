import { LAYOUT } from "./constants";
import { SECTION_ID, type SectionId } from "./sections";

const { navScrollOffset } = LAYOUT;
const { ACT_NURSE, ACT_ENGINEER_CANDIDATE, METHODS } = SECTION_ID;

/** Offset applied when scrolling to a section via nav click. */
export const DEFAULT_SCROLL_OFFSET = navScrollOffset;

/** Per-section scroll offsets. 0 = flush with viewport top. */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {
  [ACT_NURSE]: 0,
  [ACT_ENGINEER_CANDIDATE]: 0,
  [METHODS]: 0,
};
