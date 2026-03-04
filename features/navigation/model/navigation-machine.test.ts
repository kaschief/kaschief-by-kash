import { describe, expect, it } from "vitest";
import { SECTION_ID } from "@utilities";
import {
  INITIAL_NAVIGATION_STATE,
  navigationReducer,
} from "./navigation-machine";

const { ACT_ENGINEER, ACT_NURSE } = SECTION_ID;

describe("navigationReducer", () => {
  it("switches nav to visible on scroll and updates active section", () => {
    const next = navigationReducer(INITIAL_NAVIGATION_STATE, {
      type: "SCROLLED",
      payload: {
        nowMs: 1000,
        isVisible: true,
        activeSection: ACT_NURSE,
      },
    });

    expect(next.kind).toBe("visible");
    expect(next.activeSection).toBe(ACT_NURSE);
  });

  it("keeps prior active section while suppression is active", () => {
    const suppressed = navigationReducer(INITIAL_NAVIGATION_STATE, {
      type: "SUPPRESS_SCROLL",
      payload: { untilMs: 2500 },
    });

    const withManualActive = navigationReducer(suppressed, {
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: ACT_NURSE },
    });

    const scrolled = navigationReducer(withManualActive, {
      type: "SCROLLED",
      payload: {
        nowMs: 2000,
        isVisible: true,
        activeSection: ACT_ENGINEER,
      },
    });

    expect(scrolled.activeSection).toBe(ACT_NURSE);
  });

  it("clears suppression automatically after timeout point", () => {
    const suppressed = navigationReducer(INITIAL_NAVIGATION_STATE, {
      type: "SUPPRESS_SCROLL",
      payload: { untilMs: 2500 },
    });

    const withManualActive = navigationReducer(suppressed, {
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: ACT_NURSE },
    });

    const scrolledAfterTimeout = navigationReducer(withManualActive, {
      type: "SCROLLED",
      payload: {
        nowMs: 2600,
        isVisible: true,
        activeSection: ACT_ENGINEER,
      },
    });

    expect(scrolledAfterTimeout.activeSection).toBe(ACT_ENGINEER);
    expect(scrolledAfterTimeout.suppression.kind).toBe("idle");
  });

  it("toggles mobile menu state as a discriminated union", () => {
    const opened = navigationReducer(INITIAL_NAVIGATION_STATE, {
      type: "TOGGLE_MOBILE_MENU",
    });

    const closed = navigationReducer(opened, {
      type: "TOGGLE_MOBILE_MENU",
    });

    expect(opened.mobileMenu.kind).toBe("open");
    expect(closed.mobileMenu.kind).toBe("closed");
  });
});
