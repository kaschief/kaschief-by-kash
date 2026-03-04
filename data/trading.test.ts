import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_COLORS, INDICATORS, PROGRESSION } from "./trading";

describe("trading data contracts", () => {
  it("keeps category color mapping complete", () => {
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual([...CATEGORIES].sort());
  });

  it("keeps indicators in declared categories", () => {
    const categorySet = new Set(CATEGORIES);

    for (const indicator of INDICATORS) {
      const { category, color } = indicator;
      const typedCategory = category as (typeof CATEGORIES)[number];
      expect(categorySet.has(typedCategory)).toBe(true);
      expect(color).toBe(CATEGORY_COLORS[typedCategory]);
    }
  });

  it("keeps progression steps ordered", () => {
    expect(PROGRESSION.map(({ step }) => step)).toEqual(["01", "02", "03", "04"]);
  });
});
