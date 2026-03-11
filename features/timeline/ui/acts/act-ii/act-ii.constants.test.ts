import { describe, expect, it } from "vitest";
import {
  ACT_BLUE,
  actBlueRgba,
  COMMIT_TYPE_COLORS,
  CONTENT_MAX_W,
  ENTRY_STAGGER_DELAY,
  getStatColor,
  GLOW_PRIMARY,
  GLOW_SECONDARY,
  GRID_OPACITY_DESKTOP,
  GRID_OPACITY_MOBILE,
  NEGATIVE,
  PANEL_MAX_W,
  PROMOTED,
  SCAN_LINE_DURATION,
} from "./act-ii.constants";
import { ACT_II, COMPANIES } from "@data";

const COMPANY_COUNT = 4;
const EXPECTED_HASHES = ["a3f7b21", "8c2e4d9", "1f9a0c3", "5e7d2a1"] as const;
const EXPECTED_NAMES = ["AMBOSS", "Compado", "CAPinside", "DKB Code Factory"] as const;
const EXPECTED_INDUSTRIES = ["Med-Ed", "Marketing", "Fintech", "Banking"] as const;

describe("ACT_II data contract", () => {
  it("has required fields", () => {
    expect(ACT_II.act).toBeTruthy();
    expect(ACT_II.title).toBeTruthy();
    expect(ACT_II.color).toBeTruthy();
    expect(ACT_II.splash).toBeTruthy();
    expect(ACT_II.body).toBeTruthy();
  });

  it("color matches exported constant", () => {
    expect(ACT_II.color).toBe(ACT_BLUE);
  });
});

describe("COMPANIES data", () => {
  it("has exactly 4 companies", () => {
    expect(COMPANIES).toHaveLength(COMPANY_COUNT);
  });

  it("contains the expected companies in order", () => {
    expect(COMPANIES.map((c) => c.company)).toEqual([...EXPECTED_NAMES]);
  });

  it("has the expected hashes in order", () => {
    expect(COMPANIES.map((c) => c.hash)).toEqual([...EXPECTED_HASHES]);
  });

  it("has the expected industries in order", () => {
    expect(COMPANIES.map((c) => c.industry)).toEqual([...EXPECTED_INDUSTRIES]);
  });

  it.each(
    COMPANIES.map((c, i) => [c.company, c, i] as const),
  )("%s has all required fields", (_name, c) => {
    expect(c.hash).toBeTruthy();
    expect(c.company).toBeTruthy();
    expect(c.role).toBeTruthy();
    expect(c.location).toBeTruthy();
    expect(c.period).toBeTruthy();
    expect(c.commits).toHaveLength(4);
    expect(c.tags.length).toBeGreaterThanOrEqual(1);
  });

  it.each(
    COMPANIES.map((c) => [c.company, c] as const),
  )("%s — every commit has a type and message", (_name, c) => {
    for (const commit of c.commits) {
      expect(commit.type).toBeTruthy();
      expect(commit.msg).toBeTruthy();
    }
  });

  it.each(
    COMPANIES.map((c) => [c.company, c] as const),
  )("%s — repo has required fields", (_name, c) => {
    expect(c.repo).toBeDefined();
    expect(c.repo.org).toBeTruthy();
    expect(c.repo.name).toBeTruthy();
    expect(c.repo.description).toBeTruthy();
    expect(c.repo.readme.length).toBeGreaterThanOrEqual(1);
    expect(c.repo.impact.length).toBeGreaterThanOrEqual(1);
  });
});

describe("commit type colors", () => {
  it("covers all commit types used in COMPANIES", () => {
    const usedTypes = new Set(
      COMPANIES.flatMap((c) => c.commits.map((cm) => cm.type)),
    );
    for (const type of usedTypes) {
      expect(COMMIT_TYPE_COLORS).toHaveProperty(type);
    }
  });

  it("all color values are valid hex or CSS var references", () => {
    for (const color of Object.values(COMMIT_TYPE_COLORS)) {
      expect(color).toMatch(/^(#[0-9A-Fa-f]{6}|var\(--.+\))$/);
    }
  });
});

describe("actBlueRgba helper", () => {
  it("returns valid rgba string", () => {
    expect(actBlueRgba(0.5)).toMatch(/^rgba\(\d+,\d+,\d+,0\.5\)$/);
  });

  it("opacity 0 is transparent", () => {
    expect(actBlueRgba(0)).toContain(",0)");
  });

  it("opacity 1 is fully opaque", () => {
    expect(actBlueRgba(1)).toContain(",1)");
  });
});

describe("getStatColor helper", () => {
  it("returns green for + prefix", () => {
    expect(getStatColor("+42%")).toBe(PROMOTED);
  });

  it("returns green for → prefix", () => {
    expect(getStatColor("→ Senior")).toBe(PROMOTED);
  });

  it("returns red for - prefix", () => {
    expect(getStatColor("-15%")).toBe(NEGATIVE);
  });

  it("returns blue for neutral values", () => {
    expect(getStatColor("100%")).toBe(ACT_BLUE);
  });
});

describe("layout constants", () => {
  it("content width is wider than panel width", () => {
    expect(CONTENT_MAX_W).toBeGreaterThanOrEqual(PANEL_MAX_W);
  });

  it("grid opacity mobile is stronger than desktop", () => {
    expect(GRID_OPACITY_MOBILE).toBeGreaterThan(GRID_OPACITY_DESKTOP);
  });
});

describe("atmospheric glows", () => {
  it("primary glow is larger than secondary", () => {
    expect(GLOW_PRIMARY.size).toBeGreaterThan(GLOW_SECONDARY.size);
  });

  it("glow opacities are subtle (< 0.15)", () => {
    expect(GLOW_PRIMARY.opacity).toBeLessThan(0.15);
    expect(GLOW_SECONDARY.opacity).toBeLessThan(0.15);
  });
});

describe("animation timing", () => {
  it("scan line duration is reasonable (5–30s)", () => {
    expect(SCAN_LINE_DURATION).toBeGreaterThanOrEqual(5);
    expect(SCAN_LINE_DURATION).toBeLessThanOrEqual(30);
  });

  it("entry stagger delay is positive and under 1s", () => {
    expect(ENTRY_STAGGER_DELAY).toBeGreaterThan(0);
    expect(ENTRY_STAGGER_DELAY).toBeLessThan(1);
  });
});
