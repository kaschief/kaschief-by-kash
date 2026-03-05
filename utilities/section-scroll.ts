import { LAYOUT } from "./constants";
import type { SectionId } from "./sections";

const { navScrollOffset } = LAYOUT;

/** Offset applied when scrolling to a section via nav click. */
export const DEFAULT_SCROLL_OFFSET = navScrollOffset;

/** Per-section scroll offsets (empty unless a section needs explicit override). */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {};
