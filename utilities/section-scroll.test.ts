import { describe, expect, it } from "vitest";
import { LAYOUT } from "./constants";
import { SECTION_ID } from "./sections";
import { DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET } from "./section-scroll";

describe("section scroll offsets", () => {
  it("uses layout nav offset as global default", () => {
    expect(DEFAULT_SCROLL_OFFSET).toBe(LAYOUT.navScrollOffset);
  });

  it("defines section-specific overrides only where needed", () => {
    const { METHODS } = SECTION_ID;

    expect(SECTION_SCROLL_OFFSET[METHODS]).toBe(64);
  });
});
