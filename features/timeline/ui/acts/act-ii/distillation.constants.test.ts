import { describe, expect, it } from "vitest";
import { COMPANIES } from "@data";
import {
  BG_HEX,
  COMPANY_COUNT,
  CREAM_HEX,
  DISSOLVE,
  DISTILLATION_DURATION,
  ENTRY_CONTRACT,
  ESSENCE_BLOOM,
  FILLER_WORDS,
  NAME_DRAIN,
  REPLAY_SPEED,
  ROLE_FADE,
  SCROLL_SPREAD_THRESHOLD,
  SPREAD_THRESHOLD,
  STOP_WORDS,
  TEXT_FAINT_HEX,
  TIER_RANGES,
  WORD_DISSOLVE_SPAN,
  wordJitter,
} from "./distillation.constants";

describe("word classification sets", () => {
  it("STOP_WORDS and FILLER_WORDS are disjoint", () => {
    for (const word of STOP_WORDS) {
      expect(FILLER_WORDS.has(word)).toBe(false);
    }
  });

  it("STOP_WORDS contains common English stop words", () => {
    for (const w of ["the", "a", "and", "or", "to", "in"]) {
      expect(STOP_WORDS.has(w)).toBe(true);
    }
  });

  it("FILLER_WORDS contains generic action/tech words", () => {
    for (const w of ["build", "create", "platform", "team"]) {
      expect(FILLER_WORDS.has(w)).toBe(true);
    }
  });
});

describe("TIER_RANGES", () => {
  it("covers tiers 1, 2, 3", () => {
    expect(TIER_RANGES).toHaveProperty("1");
    expect(TIER_RANGES).toHaveProperty("2");
    expect(TIER_RANGES).toHaveProperty("3");
  });

  it("ranges are ordered (tier 1 starts earliest, tier 3 latest)", () => {
    expect(TIER_RANGES[1][0]).toBeLessThan(TIER_RANGES[2][0]);
    expect(TIER_RANGES[2][0]).toBeLessThan(TIER_RANGES[3][0]);
  });

  it("all ranges are within [0, 1]", () => {
    for (const tier of [1, 2, 3] as const) {
      expect(TIER_RANGES[tier][0]).toBeGreaterThanOrEqual(0);
      expect(TIER_RANGES[tier][1]).toBeLessThanOrEqual(1);
      expect(TIER_RANGES[tier][0]).toBeLessThan(TIER_RANGES[tier][1]);
    }
  });
});

describe("wordJitter", () => {
  it("returns values in [0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const j = wordJitter(i, 65 + (i % 26));
      expect(j).toBeGreaterThanOrEqual(0);
      expect(j).toBeLessThan(1);
    }
  });

  it("is deterministic", () => {
    expect(wordJitter(5, 72)).toBe(wordJitter(5, 72));
  });

  it("varies with different inputs", () => {
    const a = wordJitter(0, 65);
    const b = wordJitter(1, 66);
    expect(a).not.toBe(b);
  });
});

describe("DISSOLVE phases", () => {
  it("has one entry per company", () => {
    expect(DISSOLVE).toHaveLength(COMPANIES.length);
    expect(COMPANY_COUNT).toBe(COMPANIES.length);
  });

  it("phases are ordered by start time", () => {
    for (let i = 1; i < DISSOLVE.length; i++) {
      expect(DISSOLVE[i].start).toBeGreaterThan(DISSOLVE[i - 1].start);
    }
  });

  it("each phase has start < end", () => {
    for (const phase of DISSOLVE) {
      expect(phase.start).toBeLessThan(phase.end);
    }
  });

  it("all phases are within [0, 1]", () => {
    for (const phase of DISSOLVE) {
      expect(phase.start).toBeGreaterThanOrEqual(0);
      expect(phase.end).toBeLessThanOrEqual(1);
    }
  });

  it("phases overlap (cinematic, not sequential)", () => {
    for (let i = 1; i < DISSOLVE.length; i++) {
      expect(DISSOLVE[i].start).toBeLessThan(DISSOLVE[i - 1].end);
    }
  });
});

describe("timing constants", () => {
  it("DISTILLATION_DURATION is reasonable (5–20s)", () => {
    expect(DISTILLATION_DURATION).toBeGreaterThanOrEqual(5);
    expect(DISTILLATION_DURATION).toBeLessThanOrEqual(20);
  });

  it("REPLAY_SPEED is faster but not instant", () => {
    expect(REPLAY_SPEED).toBeGreaterThan(0.3);
    expect(REPLAY_SPEED).toBeLessThan(1);
  });

  it("SPREAD_THRESHOLD fires after all dissolves end", () => {
    const lastEnd = DISSOLVE[DISSOLVE.length - 1].end;
    expect(SPREAD_THRESHOLD).toBeGreaterThan(lastEnd);
  });

  it("SCROLL_SPREAD_THRESHOLD is within valid scroll range", () => {
    expect(SCROLL_SPREAD_THRESHOLD).toBeGreaterThan(0);
    expect(SCROLL_SPREAD_THRESHOLD).toBeLessThan(1);
  });

  it("WORD_DISSOLVE_SPAN is positive and small", () => {
    expect(WORD_DISSOLVE_SPAN).toBeGreaterThan(0);
    expect(WORD_DISSOLVE_SPAN).toBeLessThan(0.3);
  });
});

describe("color hex constants", () => {
  it("all are valid hex colors", () => {
    for (const hex of [CREAM_HEX, TEXT_FAINT_HEX, BG_HEX]) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("local dissolve thresholds", () => {
  it("NAME_DRAIN is ordered ascending", () => {
    for (let i = 1; i < NAME_DRAIN.length; i++) {
      expect(NAME_DRAIN[i]).toBeGreaterThan(NAME_DRAIN[i - 1]);
    }
  });

  it("ROLE_FADE start < end", () => {
    expect(ROLE_FADE[0]).toBeLessThan(ROLE_FADE[1]);
  });

  it("ESSENCE_BLOOM ranges are valid", () => {
    expect(ESSENCE_BLOOM.opacity[0]).toBeLessThan(ESSENCE_BLOOM.opacity[2]);
    expect(ESSENCE_BLOOM.blur[0]).toBeLessThan(ESSENCE_BLOOM.blur[1]);
    expect(ESSENCE_BLOOM.y[0]).toBeLessThan(ESSENCE_BLOOM.y[1]);
    expect(ESSENCE_BLOOM.scale[0]).toBeLessThan(ESSENCE_BLOOM.scale[1]);
  });

  it("ENTRY_CONTRACT start < end", () => {
    expect(ENTRY_CONTRACT[0]).toBeLessThan(ENTRY_CONTRACT[1]);
  });

  it("all thresholds are within [0, 1]", () => {
    for (const v of [...NAME_DRAIN, ...ROLE_FADE, ...ESSENCE_BLOOM.opacity, ...ENTRY_CONTRACT]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
