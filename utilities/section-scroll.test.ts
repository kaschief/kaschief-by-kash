import { describe, expect, it } from "vitest";
import { LAYOUT } from "./constants";
import { SECTION_ID } from "./sections";
import { DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET } from "./section-scroll";

const { ACT_NURSE, METHODS } = SECTION_ID;

describe("section scroll offsets", () => {
  it("uses layout nav offset as global default", () => {
    expect(DEFAULT_SCROLL_OFFSET).toBe(LAYOUT.navScrollOffset);
  });

  it("defines section-specific overrides only where needed", () => {
    expect(Object.keys(SECTION_SCROLL_OFFSET)).toHaveLength(2);
  });

  it("scrolls full-viewport sections flush with viewport top", () => {
    expect(SECTION_SCROLL_OFFSET[ACT_NURSE]).toBe(0);
    expect(SECTION_SCROLL_OFFSET[METHODS]).toBe(0);
  });

  it("only overrides sections that are defined in SECTION_ID", () => {
    const validIds = new Set(Object.values(SECTION_ID));
    for (const key of Object.keys(SECTION_SCROLL_OFFSET)) {
      expect(validIds.has(key as typeof SECTION_ID[keyof typeof SECTION_ID])).toBe(true);
    }
  });
});
