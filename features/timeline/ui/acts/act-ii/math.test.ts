import { describe, expect, it } from "vitest";
import { smoothstep, lerp, clamp } from "./math";

describe("math utilities", () => {
  describe("clamp", () => {
    it("returns min when value is below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("returns max when value is above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("handles edge values exactly", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe("lerp", () => {
    it("returns start at t=0", () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it("returns end at t=1", () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });

    it("returns midpoint at t=0.5", () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it("extrapolates beyond 0-1 range", () => {
      expect(lerp(0, 10, 2)).toBe(20);
      expect(lerp(0, 10, -1)).toBe(-10);
    });
  });

  describe("smoothstep", () => {
    it("returns 0 below edge0", () => {
      expect(smoothstep(0.2, 0.8, 0)).toBe(0);
      expect(smoothstep(0.2, 0.8, 0.1)).toBe(0);
    });

    it("returns 1 above edge1", () => {
      expect(smoothstep(0.2, 0.8, 1)).toBe(1);
      expect(smoothstep(0.2, 0.8, 0.9)).toBe(1);
    });

    it("returns 0.5 at midpoint", () => {
      expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    });

    it("has smooth derivative at edges (not linear)", () => {
      const nearStart = smoothstep(0, 1, 0.01);
      const nearEnd = smoothstep(0, 1, 0.99);
      // Smoothstep curves slowly near edges
      expect(nearStart).toBeLessThan(0.01);
      expect(nearEnd).toBeGreaterThan(0.99);
    });

    it("is monotonically increasing", () => {
      const values = Array.from({ length: 11 }, (_, i) =>
        smoothstep(0, 1, i / 10),
      );
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]!);
      }
    });
  });
});
