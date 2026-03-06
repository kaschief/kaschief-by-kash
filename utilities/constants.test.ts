import { describe, expect, it } from "vitest";
import { LAYOUT, Z_INDEX } from "./constants";

describe("Z_INDEX stacking order", () => {
  it("ensures navigation is always visible above overlays", () => {
    // User must always be able to navigate away from any overlay
    expect(Z_INDEX.nav).toBeGreaterThan(Z_INDEX.repoPanel);
    expect(Z_INDEX.nav).toBeGreaterThan(Z_INDEX.detailOverlay);
  });

  it("prevents repo panel from being hidden behind detail overlays", () => {
    // Repo panel opens ON TOP of the page — must beat general overlays
    expect(Z_INDEX.repoPanel).toBeGreaterThan(Z_INDEX.detailOverlay);
  });

  it("keeps page-level decorations below interactive layers", () => {
    // Scroll fade is decorative — must never block clicks on overlays or nav
    expect(Z_INDEX.scrollFade).toBeLessThan(Z_INDEX.detailOverlay);
    expect(Z_INDEX.scrollFade).toBeLessThan(Z_INDEX.nav);
  });

  it("keeps cursor above all content so it is never occluded", () => {
    const allOtherValues = Object.entries(Z_INDEX)
      .filter(([key]) => key !== "cursor")
      .map(([, value]) => value);
    for (const value of allOtherValues) {
      expect(Z_INDEX.cursor).toBeGreaterThan(value);
    }
  });

  it("has no duplicate z-index values (prevents ambiguous stacking)", () => {
    const values = Object.values(Z_INDEX);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("LAYOUT constants", () => {
  it("provides enough scroll offset for nav bar clearance", () => {
    // Nav bar is ~60-80px tall — offset must clear it
    expect(LAYOUT.navScrollOffset).toBeGreaterThanOrEqual(60);
    expect(LAYOUT.navScrollOffset).toBeLessThanOrEqual(120);
  });

  it("makes the snap-back zone shorter than the pin-down zone", () => {
    // Scrolling down should feel longer (main experience),
    // snapping back should be quick (escape hatch)
    expect(LAYOUT.pinUpVh).toBeLessThan(LAYOUT.pinDownVh);
  });
});
