import { describe, expect, it } from "vitest";
import { SECTION_ID, SECTION_IDS_ORDERED, type SectionId } from "@utilities";
import { resolveActiveSection } from "./active-section";

const {
  ACT_ENGINEER,
  ACT_LEADER,
  ACT_NURSE,
  CONTACT,
  METHODS,
  PHILOSOPHY,
} = SECTION_ID;

function createSectionTopById(
  overrides: Partial<Record<SectionId, number | null>> = {},
): Record<SectionId, number | null> {
  const base = SECTION_IDS_ORDERED.reduce<Record<SectionId, number | null>>(
    (acc, sectionId) => {
      acc[sectionId] = null;
      return acc;
    },
    {} as Record<SectionId, number | null>,
  );

  return {
    ...base,
    ...overrides,
  };
}

describe("resolveActiveSection", () => {
  it("activates the last section when near the bottom", () => {
    const sectionTopById = createSectionTopById({
      [PHILOSOPHY]: -200,
      [ACT_NURSE]: -100,
      [ACT_ENGINEER]: 50,
      [ACT_LEADER]: 100,
      [METHODS]: 400,
      [CONTACT]: 600,
    });

    const result = resolveActiveSection({
      scrollY: 4800,
      viewportHeight: 900,
      documentHeight: 5600,
      sectionTopById,
    });

    expect(result).toBe(CONTACT);
  });

  it("returns the latest section above activation threshold", () => {
    const sectionTopById = createSectionTopById({
      [PHILOSOPHY]: 120,
      [ACT_NURSE]: 300,
      [ACT_ENGINEER]: 430,
      [ACT_LEADER]: 800,
      [METHODS]: 1700,
      [CONTACT]: 2200,
    });

    const result = resolveActiveSection({
      scrollY: 600,
      viewportHeight: 1000,
      documentHeight: 6000,
      sectionTopById,
    });

    expect(result).toBe(ACT_NURSE);
  });

  it("returns empty when no section has reached threshold", () => {
    const sectionTopById = createSectionTopById({
      [PHILOSOPHY]: 900,
      [ACT_NURSE]: 1200,
      [ACT_ENGINEER]: 1600,
      [ACT_LEADER]: 2000,
      [METHODS]: 3200,
      [CONTACT]: 3800,
    });

    const result = resolveActiveSection({
      scrollY: 0,
      viewportHeight: 1000,
      documentHeight: 6000,
      sectionTopById,
    });

    expect(result).toBe("");
  });
});
