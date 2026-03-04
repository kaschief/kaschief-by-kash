import { describe, expect, it } from "vitest";
import { SECTION_ID, SECTION_IDS_ORDERED } from "./sections";

describe("section ids", () => {
  it("keeps SECTION_IDS_ORDERED aligned with SECTION_ID values", () => {
    const sectionValues = Object.values(SECTION_ID);

    expect(new Set(sectionValues).size).toBe(sectionValues.length);
    expect(new Set(SECTION_IDS_ORDERED).size).toBe(SECTION_IDS_ORDERED.length);
    expect([...SECTION_IDS_ORDERED].sort()).toEqual([...sectionValues].sort());
  });

  it("keeps contact as the final section for bottom-of-page activation", () => {
    const { CONTACT } = SECTION_ID;
    expect(SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1]).toBe(CONTACT);
  });
});
