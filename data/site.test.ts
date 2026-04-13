import { describe, expect, it } from "vitest";
import {
  PERSONAL,
  PHILOSOPHY,
  ROLE_NAV_LINKS,
  ROLES,
  SECTION_NAV_LINKS,
} from "./site";
import { SECTION_ID, SECTION_IDS_ORDERED } from "@utilities";

describe("site data contracts", () => {
  it("uses valid section ids in nav links", () => {
    const sectionSet = new Set(SECTION_IDS_ORDERED);
    const allLinks = [...ROLE_NAV_LINKS, ...SECTION_NAV_LINKS];

    for (const link of allLinks) {
      expect(
        sectionSet.has(link.sectionId as (typeof SECTION_IDS_ORDERED)[number]),
      ).toBe(true);
    }
  });

  it("keeps role section ids unique", () => {
    const sectionIds = ROLES.map(({ sectionId }) => sectionId);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it("includes all nav roles plus Builder in ROLES", () => {
    expect(ROLE_NAV_LINKS.length).toBeGreaterThan(0);
    expect(SECTION_NAV_LINKS.length).toBeGreaterThan(0);
    // ROLES includes Builder (lab-only) beyond what's in nav
    expect(ROLES.length).toBe(ROLE_NAV_LINKS.length + 1);
    for (const navRole of ROLE_NAV_LINKS) {
      expect(ROLES).toContainEqual(navRole);
    }
  });

  it("keeps personal/contact fields populated", () => {
    const { email, github, linkedin, location, name, phone } = PERSONAL;

    expect(name.length).toBeGreaterThan(0);
    expect(email.includes("@")).toBe(true);
    expect(phone.length).toBeGreaterThan(0);
    expect(location.length).toBeGreaterThan(0);
    expect(linkedin.startsWith("https://")).toBe(true);
    expect(github.startsWith("https://")).toBe(true);
  });

  it("pins philosophy section mapping to SECTION_ID", () => {
    const { PHILOSOPHY: PHILOSOPHY_SECTION } = SECTION_ID;
    expect(PHILOSOPHY.sectionId).toBe(PHILOSOPHY_SECTION);
  });
});
