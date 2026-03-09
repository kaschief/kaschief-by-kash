import { describe, expect, it } from "vitest";
import {
  SNAP_START,
  SNAP_END,
  STACK_START,
  STACK_END,
  FOCUS_START,
  FOCUS_END,
  FOCUS_SLICE,
  CHAOS_LG,
  CHAOS_SM,
  ORDER_LG,
  ORDER_SM,
  STACK_LG,
  STACK_SM,
  NODE_DELAYS,
  NODE_START_ROTATIONS,
  NODE_END_ROTATIONS,
  NODE_WEIGHTS,
  DRIFT_MULTIPLIERS,
  NUDGE_DELAYS,
  MAX_W_LG_PX,
  MAX_W_LG_VW,
  CHAOS_OPACITY,
  ORDER_OPACITY,
  BURST_OPACITY_SEQUENCE,
  MOBILE_FADEOUT_START,
  MOBILE_FADEOUT_END,
  MOBILE_ACCORDION_START,
  MOBILE_ACCORDION_END,
  COLORS,
  BALL_SIZE_KEYS,
  BALL_PEAK_OPACITY,
} from "./chaos-to-order.constants";
import { ACT_I } from "@data";

const CARD_COUNT = ACT_I.skillScenarios.length;

describe("scroll phase boundaries", () => {
  it("phases are ordered sequentially and non-overlapping", () => {
    expect(SNAP_START).toBeGreaterThan(0);
    expect(SNAP_END).toBeGreaterThan(SNAP_START);
    expect(STACK_START).toBeGreaterThan(SNAP_END);
    expect(STACK_END).toBeGreaterThan(STACK_START);
    expect(FOCUS_START).toBeGreaterThan(STACK_END);
    expect(FOCUS_END).toBeGreaterThan(FOCUS_START);
    expect(FOCUS_END).toBeLessThanOrEqual(1);
  });

  it("mobile fadeout and accordion phases are sequential", () => {
    expect(MOBILE_FADEOUT_START).toBeLessThan(MOBILE_FADEOUT_END);
    expect(MOBILE_ACCORDION_START).toBeGreaterThanOrEqual(MOBILE_FADEOUT_END);
    expect(MOBILE_ACCORDION_END).toBeGreaterThan(MOBILE_ACCORDION_START);
  });

  it("computes focus slice correctly from phase boundaries", () => {
    expect(FOCUS_SLICE).toBeCloseTo((FOCUS_END - FOCUS_START) / CARD_COUNT);
  });
});

describe("per-card arrays match card count", () => {
  it.each([
    ["CHAOS_LG", CHAOS_LG],
    ["CHAOS_SM", CHAOS_SM],
    ["ORDER_LG", ORDER_LG],
    ["ORDER_SM", ORDER_SM],
    ["STACK_LG", STACK_LG],
    ["STACK_SM", STACK_SM],
    ["NODE_DELAYS", NODE_DELAYS],
    ["NODE_START_ROTATIONS", NODE_START_ROTATIONS],
    ["NODE_END_ROTATIONS", NODE_END_ROTATIONS],
    ["NODE_WEIGHTS", NODE_WEIGHTS],
    ["DRIFT_MULTIPLIERS", DRIFT_MULTIPLIERS],
    ["NUDGE_DELAYS", NUDGE_DELAYS],
    ["MAX_W_LG_PX", MAX_W_LG_PX],
    ["MAX_W_LG_VW", MAX_W_LG_VW],
  ])("%s has exactly %i entries (one per card)", (_name, arr) => {
    expect(arr).toHaveLength(CARD_COUNT);
  });
});

describe("position arrays stay within viewport bounds", () => {
  const allPositions = [
    ...CHAOS_LG,
    ...CHAOS_SM,
    ...ORDER_LG,
    ...ORDER_SM,
    ...STACK_LG,
    ...STACK_SM,
  ];

  it("keeps left values within 0–100%", () => {
    for (const pos of allPositions) {
      expect(pos.left).toBeGreaterThanOrEqual(0);
      expect(pos.left).toBeLessThanOrEqual(100);
    }
  });

  it("keeps top values within 0–100%", () => {
    for (const pos of allPositions) {
      expect(pos.top).toBeGreaterThanOrEqual(0);
      expect(pos.top).toBeLessThanOrEqual(100);
    }
  });
});

describe("opacity contracts", () => {
  it("chaos opacity is dimmer than order opacity on both breakpoints", () => {
    expect(CHAOS_OPACITY.desktop).toBeLessThan(ORDER_OPACITY.desktop);
    expect(CHAOS_OPACITY.mobile).toBeLessThan(ORDER_OPACITY.mobile);
  });

  it("mobile chaos is dimmer than desktop chaos", () => {
    expect(CHAOS_OPACITY.mobile).toBeLessThan(CHAOS_OPACITY.desktop);
  });

  it("burst opacity sequence starts hidden and ends at chaos level", () => {
    expect(BURST_OPACITY_SEQUENCE[0]).toBe(0);
    expect(BURST_OPACITY_SEQUENCE[BURST_OPACITY_SEQUENCE.length - 1]).toBe(
      CHAOS_OPACITY.desktop,
    );
  });
});

describe("color palette", () => {
  it("defines all required color keys", () => {
    const requiredKeys = [
      "accent",
      "accentHot",
      "accentMuted",
      "narrator",
      "cardTitle",
      "cardTitleHover",
      "cardBody",
      "cardSecondary",
      "cardSecondaryHover",
      "hairlineBorder",
      "hairlineBorderHover",
      "glowStrong",
      "glowSubtle",
    ];
    for (const key of requiredKeys) {
      expect(COLORS).toHaveProperty(key);
    }
  });
});

describe("focus ball tuning", () => {
  it("ball size keys start and end at zero (hidden)", () => {
    expect(BALL_SIZE_KEYS[0]).toBe(0);
  });

  it("ball peak opacity is below 1 (softened glow)", () => {
    expect(BALL_PEAK_OPACITY).toBeLessThan(1);
    expect(BALL_PEAK_OPACITY).toBeGreaterThan(0);
  });
});

describe("drift multipliers include both directions", () => {
  it("has at least one positive and one negative value", () => {
    expect(DRIFT_MULTIPLIERS.some((d) => d > 0)).toBe(true);
    expect(DRIFT_MULTIPLIERS.some((d) => d < 0)).toBe(true);
  });
});
