import { describe, expect, it } from "vitest";
import {
  CSS_EASE,
  EASE,
  GLOW_OPACITY,
  PULSE_TRANSITION,
  SCROLL_RANGE,
  TRANSITION,
} from "./animation";

describe("animation tokens", () => {
  it("uses a consistent easing curve across Framer Motion and CSS", () => {
    // EASE is a Framer Motion bezier array
    expect(EASE).toHaveLength(4);
    // CSS_EASE must encode the same control points
    for (const point of EASE) {
      expect(CSS_EASE).toContain(String(point));
    }
  });

  it("orders transition presets from fastest to slowest", () => {
    const durations = [
      TRANSITION.snap.duration,
      TRANSITION.fast.duration,
      TRANSITION.base.duration,
      TRANSITION.slow.duration,
      TRANSITION.page.duration,
    ];

    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeGreaterThanOrEqual(durations[i - 1]);
    }
  });

  it("keeps glow scroll range and opacity arrays paired", () => {
    expect(SCROLL_RANGE.glow).toHaveLength(GLOW_OPACITY.length);
    // Scroll range must be monotonically increasing (0 → 1)
    for (let i = 1; i < SCROLL_RANGE.glow.length; i++) {
      expect(SCROLL_RANGE.glow[i]).toBeGreaterThan(SCROLL_RANGE.glow[i - 1]);
    }
    // Glow should fade to zero at scroll boundaries
    expect(GLOW_OPACITY[0]).toBe(0);
    expect(GLOW_OPACITY[GLOW_OPACITY.length - 1]).toBe(0);
  });

  it("pulses infinitely for ambient animations", () => {
    expect(PULSE_TRANSITION.repeat).toBe(Infinity);
    expect(PULSE_TRANSITION.duration).toBeGreaterThan(0);
  });
});
