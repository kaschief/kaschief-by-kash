import { describe, expect, it } from "vitest";
import { LAYOUT } from "./constants";
import { DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET } from "./section-scroll";

describe("section scroll offsets", () => {
  it("uses layout nav offset as global default", () => {
    expect(DEFAULT_SCROLL_OFFSET).toBe(LAYOUT.navScrollOffset);
  });

  it("defines section-specific overrides only where needed", () => {
    expect(Object.keys(SECTION_SCROLL_OFFSET)).toHaveLength(1);
  });
});
