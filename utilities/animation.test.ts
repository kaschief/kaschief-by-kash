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
  it("keeps a single easing curve for app-level motion", () => {
    expect(EASE).toEqual([0.22, 1, 0.36, 1]);
    expect(CSS_EASE).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
  });

  it("defines stable named transition presets", () => {
    expect(TRANSITION.fast.duration).toBeLessThan(TRANSITION.base.duration);
    expect(TRANSITION.base.duration).toBeLessThan(TRANSITION.slow.duration);
    expect(TRANSITION.page.duration).toBeGreaterThan(TRANSITION.base.duration);
  });

  it("keeps glow and pulse ranges in sync", () => {
    expect(SCROLL_RANGE.glow).toHaveLength(4);
    expect(GLOW_OPACITY).toHaveLength(4);
    expect(PULSE_TRANSITION.repeat).toBe(Infinity);
  });
});
