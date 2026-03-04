import { describe, expect, it } from "vitest";
import { SECTION_ID } from "@utilities";
import { resolveObservedActiveSection } from "./observed-section";

const { ACT_BUILDER, ACT_NURSE, CONTACT, METHODS } = SECTION_ID;

describe("resolveObservedActiveSection", () => {
  it("returns highest-ratio section", () => {
    expect(
      resolveObservedActiveSection({
        ratioBySection: {
          [ACT_NURSE]: 0.2,
          [ACT_BUILDER]: 0.6,
        },
        scrollY: 200,
        viewportHeight: 900,
        documentHeight: 4000,
      }),
    ).toBe(ACT_BUILDER);
  });

  it("falls back to previous section when no section intersects", () => {
    expect(
      resolveObservedActiveSection({
        ratioBySection: {},
        scrollY: 0,
        viewportHeight: 900,
        documentHeight: 4000,
        previousActiveSection: METHODS,
      }),
    ).toBe(METHODS);
  });

  it("returns empty string when no section intersects and no previous section exists", () => {
    expect(
      resolveObservedActiveSection({
        ratioBySection: {},
        scrollY: 0,
        viewportHeight: 900,
        documentHeight: 4000,
      }),
    ).toBe("");
  });

  it("pins to final section near page bottom", () => {
    expect(
      resolveObservedActiveSection({
        ratioBySection: {
          [ACT_NURSE]: 0.5,
        },
        scrollY: 3600,
        viewportHeight: 500,
        documentHeight: 4100,
      }),
    ).toBe(CONTACT);
  });
});
