/**
 * Single source of truth for every page section ID.
 *
 * Import SECTION_ID wherever an id= prop or href needs a section reference.
 * Import SECTION_IDS_ORDERED for scroll-based active detection (must stay
 * in top-to-bottom DOM order - the nav relies on this for correctness).
 */
export const SECTION_ID = {
  PORTRAIT: "portrait",
  PHILOSOPHY: "philosophy",
  ACT_NURSE: "act-nurse",
  ACT_ENGINEER: "act-engineer",
  ACT_LEADER: "act-leader",
  ACT_BUILDER: "act-builder",
  METHODS: "methods",
  CONTACT: "contact",
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

const {
  PORTRAIT,
  PHILOSOPHY,
  ACT_NURSE,
  ACT_ENGINEER,
  ACT_LEADER,
  ACT_BUILDER,
  CONTACT,
} = SECTION_ID;

/** DOM top-to-bottom order - must match page.tsx render order. */
export const SECTION_IDS_ORDERED: readonly SectionId[] = [
  PORTRAIT,
  PHILOSOPHY,
  ACT_NURSE,
  ACT_ENGINEER,
  ACT_LEADER,
  ACT_BUILDER,
  CONTACT,
];
