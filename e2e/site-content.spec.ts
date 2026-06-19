import { test } from "./fixtures/test";

test.describe("Core site content", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test("renders the portrait section from data", async ({ siteContent }) => {
    await siteContent.expectPortraitMatchesData();
  });

  test("renders the philosophy quote from data", async ({ siteContent }) => {
    await siteContent.expectPhilosophyMatchesData();
  });

  test("renders contact copy and links from data", async ({ siteContent }) => {
    await siteContent.expectContactMatchesData();
  });
});
