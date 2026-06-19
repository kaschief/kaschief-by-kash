import { test } from "./fixtures/test";

test.describe("Act III leadership journey", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test("introduces the leadership act from data", async ({ actIII }) => {
    await actIII.expectSplashMatchesData();
  });

  test("renders every leadership scenario from data", async ({ actIII }) => {
    await actIII.open();
    await actIII.expectEveryLeadershipScenario();
  });

  test("renders every capability annotation and proof point from data", async ({
    actIII,
  }) => {
    await actIII.open();
    await actIII.expectEveryCapabilityAndProofPoint();
  });
});
