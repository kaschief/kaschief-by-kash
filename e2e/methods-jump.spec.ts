import { expect, test } from "./fixtures/test";

test.describe("Methods navigation and panel behavior", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test("Methods nav click lands at the section without scroll overshoot", async ({
    methods,
    navigation,
  }) => {
    await navigation.goTo("Methods", "methods");
    await methods.expectLandedNearTop();
  });

  test("Nurse nav then Methods nav still lands Methods correctly", async ({
    methods,
    navigation,
  }) => {
    await navigation.goTo("Nurse", "act-nurse");
    await navigation.goTo("Methods", "methods");
    await methods.expectLandedNearTop();
  });

  test("panel controls switch content while keeping Methods in view", async ({
    methods,
    navigation,
  }) => {
    await navigation.goTo("Methods", "methods");
    await methods.expectPanelChangeKeepsMethodsInView("How I build");
    await expect(methods.section.getByRole("button", { name: "React" }))
      .toBeVisible();
  });

  test("skill detail overlay opens, names the dialog, and closes", async ({
    methods,
    navigation,
  }) => {
    await navigation.goTo("Methods", "methods");
    await methods.openPanel("How I build");
    await methods.openSkill("Playwright");
    await expect(
      methods.page.getByRole("dialog", { name: "Skill detail: Playwright" }),
    ).toContainText("Built DKB's E2E infrastructure from scratch");
    await methods.closeSkillDetail();
  });

  test("every Methods skill exposes its data-backed detail overlay", async ({
    methods,
    navigation,
  }) => {
    await navigation.goTo("Methods", "methods");
    await methods.expectEverySkillDetailAvailable();
  });
});
