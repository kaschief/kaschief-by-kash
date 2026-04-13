import { LAYOUT } from "./constants"
import { SECTION_ID, type SectionId } from "./sections"

const { navScrollOffset } = LAYOUT
const { ACT_NURSE, ACT_ENGINEER, ACT_LEADER, CONTACT } = SECTION_ID

/** Offset applied when scrolling to a section via nav click. */
export const DEFAULT_SCROLL_OFFSET = navScrollOffset

/**
 * Per-section scroll offsets.
 *
 * Positive offset = land above the section top (e.g. account for fixed nav).
 * Negative offset = land below the section top (e.g. skip past visual overhang).
 * 0 = flush with viewport top (full-viewport sticky sections).
 */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {
  [ACT_NURSE]: 0,
  [ACT_ENGINEER]: 0,
  [ACT_LEADER]: 0,
  [CONTACT]: 0,
}
