import { describe, expect, it } from "vitest";
import { SECTION_ID, TOKENS } from "@utilities";
import { resolveNavLinkColor } from "./nav-link-state";

const { ACT_NURSE, CONTACT, METHODS } = SECTION_ID;
const { actRed, creamMuted, gold, textDim } = TOKENS;

describe("resolveNavLinkColor", () => {
  it("returns active color for active role links", () => {
    expect(
      resolveNavLinkColor({
        activeSection: ACT_NURSE,
        hoveredSection: null,
        linkSection: ACT_NURSE,
        activeColor: actRed,
        idleColor: textDim,
      }),
    ).toBe(actRed);
  });

  it("returns active color for hovered desktop links", () => {
    expect(
      resolveNavLinkColor({
        activeSection: "",
        hoveredSection: METHODS,
        linkSection: METHODS,
        activeColor: gold,
        idleColor: textDim,
      }),
    ).toBe(gold);
  });

  it("keeps section links muted when inactive", () => {
    expect(
      resolveNavLinkColor({
        activeSection: CONTACT,
        hoveredSection: null,
        linkSection: METHODS,
        activeColor: gold,
        idleColor: creamMuted,
      }),
    ).toBe(creamMuted);
  });

  it("highlights Methods/Contact section links when active (mobile regression)", () => {
    expect(
      resolveNavLinkColor({
        activeSection: METHODS,
        linkSection: METHODS,
        activeColor: gold,
        idleColor: creamMuted,
      }),
    ).toBe(gold);

    expect(
      resolveNavLinkColor({
        activeSection: CONTACT,
        linkSection: CONTACT,
        activeColor: gold,
        idleColor: creamMuted,
      }),
    ).toBe(gold);
  });
});
