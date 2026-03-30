import { describe, expect, it } from "vitest";
import { SECTION_ID, SECTION_IDS_ORDERED } from "./sections";

describe("section ids", () => {
  it("keeps SECTION_IDS_ORDERED as a subset of SECTION_ID with no duplicates", () => {
    const sectionValues = new Set(Object.values(SECTION_ID));

    expect(new Set(sectionValues).size).toBe(sectionValues.size);
    expect(new Set(SECTION_IDS_ORDERED).size).toBe(SECTION_IDS_ORDERED.length);
    for (const id of SECTION_IDS_ORDERED) {
      expect(sectionValues.has(id)).toBe(true);
    }
  });

  it("keeps contact as the final section for bottom-of-page activation", () => {
    const { CONTACT } = SECTION_ID;
    expect(SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1]).toBe(CONTACT);
  });
});
