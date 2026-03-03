/**
 * Single source of truth for every page section ID.
 *
 * Import SECTION_ID wherever an id= prop or href needs a section reference.
 * Import SECTION_IDS_ORDERED for scroll-based active detection (must stay
 * in top-to-bottom DOM order — the nav relies on this for correctness).
 */
import { LAYOUT } from "@/lib/constants";

export const SECTION_ID = {
  PHILOSOPHY: "philosophy",
  ACT_NURSE: "act-nurse",
  ACT_ENGINEER: "act-engineer",
  ACT_LEADER: "act-leader",
  ACT_BUILDER: "act-builder",
  METHODS: "methods",
  CONTACT: "contact",
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

/** DOM top-to-bottom order — must match page.tsx render order. */
export const SECTION_IDS_ORDERED: readonly SectionId[] = [
  SECTION_ID.PHILOSOPHY,
  SECTION_ID.ACT_NURSE,
  SECTION_ID.ACT_ENGINEER,
  SECTION_ID.ACT_LEADER,
  SECTION_ID.ACT_BUILDER,
  SECTION_ID.METHODS,
  SECTION_ID.CONTACT,
];

/** Offset applied when scrolling to a section via nav click. */
export const SECTION_SCROLL_OFFSET: Partial<Record<SectionId, number>> = {
  [SECTION_ID.METHODS]: 0, // sticky container must align to viewport top
};

export const DEFAULT_SCROLL_OFFSET = LAYOUT.navScrollOffset;
