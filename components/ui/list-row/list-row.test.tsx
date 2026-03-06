import { describe, expect, it } from "vitest";
import {
  LIST_ROW_ARROW_STYLE,
  LIST_ROW_DENSITY,
  LIST_ROW_TONE,
} from "./list-row";

describe("ListRow design tokens", () => {
  it("offers exactly three arrow variants", () => {
    const variants = Object.values(LIST_ROW_ARROW_STYLE).sort();
    expect(variants).toEqual(["chevron", "external", "line"]);
  });

  it("offers exactly three density levels", () => {
    const densities = Object.values(LIST_ROW_DENSITY).sort();
    expect(densities).toEqual(["compact", "default", "spacious"]);
  });

  it("offers exactly two tone levels", () => {
    const tones = Object.values(LIST_ROW_TONE).sort();
    expect(tones).toEqual(["default", "muted"]);
  });

  it("uses unique values across all density options", () => {
    const values = Object.values(LIST_ROW_DENSITY);
    expect(new Set(values).size).toBe(values.length);
  });

  it("uses unique values across all arrow style options", () => {
    const values = Object.values(LIST_ROW_ARROW_STYLE);
    expect(new Set(values).size).toBe(values.length);
  });
});
