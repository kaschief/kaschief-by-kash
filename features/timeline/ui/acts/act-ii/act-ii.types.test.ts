import { describe, expect, it } from "vitest";
import {
  CONTAINER_VH,
  SCROLL_PHASES,
  PARTICLES_START,
  THESIS_START,
  CONVERGENCE_GATE,
  TITLE_START,
  TITLE_END,
  CONVERGENCE_START,
  CONVERGENCE_END,
  PARTICLES_END,
  CHROME_END,
} from "./act-ii.types";

describe("Act II timing chain", () => {
  it("derives a positive container height", () => {
    expect(CONTAINER_VH).toBeGreaterThan(0);
    expect(Number.isFinite(CONTAINER_VH)).toBe(true);
  });

  it("has all phases in ascending order", () => {
    expect(TITLE_START).toBeLessThan(TITLE_END);
    // Title and convergence intentionally overlap (convergenceToTitle < title duration)
    expect(CONVERGENCE_START).toBeLessThan(CONVERGENCE_END);
    expect(CONVERGENCE_END).toBeLessThanOrEqual(CONVERGENCE_GATE);
    expect(THESIS_START).toBeLessThan(PARTICLES_START);
    expect(PARTICLES_START).toBeLessThan(PARTICLES_END);
    expect(PARTICLES_END).toBeLessThanOrEqual(CHROME_END);
  });

  it("has no phase exceeding 1.0", () => {
    expect(CHROME_END).toBeLessThanOrEqual(1);
    expect(PARTICLES_END).toBeLessThanOrEqual(1);
    expect(CONVERGENCE_GATE).toBeLessThanOrEqual(1);
  });

  it("has thesis starting before particles", () => {
    expect(THESIS_START).toBeLessThan(PARTICLES_START);
  });

  it("has convergence gate after convergence end", () => {
    expect(CONVERGENCE_GATE).toBeGreaterThan(CONVERGENCE_END);
  });

  it("has SCROLL_PHASES object with all required keys", () => {
    expect(SCROLL_PHASES.TITLE).toBeDefined();
    expect(SCROLL_PHASES.CONVERGENCE).toBeDefined();
    expect(SCROLL_PHASES.CONVERGENCE_GATE).toBeDefined();
    expect(SCROLL_PHASES.PARTICLES).toBeDefined();
    expect(SCROLL_PHASES.BEATS).toBeDefined();
    expect(SCROLL_PHASES.CHROME_END).toBeDefined();
  });

  it("has at least one terminal beat", () => {
    expect(SCROLL_PHASES.BEATS.length).toBeGreaterThan(0);
  });

  it("has beats in ascending order", () => {
    for (let i = 1; i < SCROLL_PHASES.BEATS.length; i++) {
      expect(SCROLL_PHASES.BEATS[i]!.start).toBeGreaterThan(
        SCROLL_PHASES.BEATS[i - 1]!.start,
      );
    }
  });
});
