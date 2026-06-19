import { expect, test } from "./fixtures/test";

test.describe("Act II engineering journey", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test("introduces the engineering act with title and splash copy", async ({
    actII,
  }) => {
    await actII.openTitle();
    await actII.expectTitleContent();
  });

  test("renders the story desk with the remaining engineering artifacts", async ({
    actII,
  }) => {
    await actII.openStoryDesk();
    await actII.expectStoryDeskCards();
  });

  test("opens every remaining engineering story from data", async ({ actII }) => {
    await actII.openStoryDesk();
    await actII.expectEveryRemainingStoryOpens();
  });

  test("opens a company story dialog and closes it with Escape", async ({
    actII,
  }) => {
    await actII.openStoryDesk();
    await actII.openCompanyStory("DKB");

    const dialog = actII.storyDialog();
    await expect(dialog).toContainText(
      "I think about what the user sees before I think about whether the code is correct.",
    );

    await actII.closeStoryDialogWithKeyboard();
  });
});
