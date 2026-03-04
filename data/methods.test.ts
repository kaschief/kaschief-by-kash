import { describe, expect, it } from "vitest";
import { METHOD_GROUPS } from "./methods";

describe("methods data contracts", () => {
  it("keeps group ids unique and non-empty", () => {
    const ids = METHOD_GROUPS.map(({ id }) => id);

    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every group with at least one skill and unique skill ids", () => {
    const skillIds: string[] = [];

    for (const group of METHOD_GROUPS) {
      expect(group.skills.length).toBeGreaterThan(0);
      skillIds.push(...group.skills.map(({ id }) => id));
    }

    expect(new Set(skillIds).size).toBe(skillIds.length);
  });
});
