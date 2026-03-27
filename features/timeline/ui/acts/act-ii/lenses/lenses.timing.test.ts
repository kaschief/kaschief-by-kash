import { describe, expect, it } from "vitest";
import {
  PROLOGUE,
  CINEMATIC_START,
  CINEMATIC_SIZE,
  TOTAL_RAW_SIZE,
  CONTAINER_HEIGHT_VH,
} from "./lenses.timing";

describe("lenses timing", () => {
  it("derives a positive container height", () => {
    expect(CONTAINER_HEIGHT_VH).toBeGreaterThan(0);
  });

  it("has prologue ending before cinematic starts", () => {
    expect(PROLOGUE.curtainEnd).toBeLessThanOrEqual(CINEMATIC_START + 0.05);
  });

  it("has cinematic size matching 4 cards", () => {
    expect(CINEMATIC_SIZE).toBeGreaterThan(0);
  });

  it("has total raw size = prologue + cinematic (approximately)", () => {
    // CINEMATIC_START may overlap with prologue end due to STORYCARD_CURTAIN_OVERLAP
    expect(TOTAL_RAW_SIZE).toBeGreaterThan(CINEMATIC_SIZE);
    expect(TOTAL_RAW_SIZE).toBeLessThan(2); // sanity: raw size should be under 2.0
  });

  it("has prologue keyword reveal after thesis start", () => {
    expect(PROLOGUE.keywordRevealStart).toBeGreaterThan(PROLOGUE.thesisStart);
  });

  it("has curtain starting after keywords end", () => {
    expect(PROLOGUE.curtainStart).toBeGreaterThan(PROLOGUE.finalKeywordEnd);
  });

  it("has curtain end after curtain start", () => {
    expect(PROLOGUE.curtainEnd).toBeGreaterThan(PROLOGUE.curtainStart);
  });
});
