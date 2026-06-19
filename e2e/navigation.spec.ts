import { ROLE_NAV_LINKS, SECTION_NAV_LINKS } from "@data";
import { test } from "./fixtures/test";

const [whoAmI, methods, contact] = SECTION_NAV_LINKS;
const NAV_TARGETS = [whoAmI, ...ROLE_NAV_LINKS, methods, contact] as const;

test.describe("Primary navigation", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  for (const target of NAV_TARGETS) {
    test(`lands ${target.label} near its data-backed section top`, async ({
      navigation,
    }) => {
      await navigation.goTo(target.label, target.sectionId);
    });
  }
});
