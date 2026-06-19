import { expect, type Locator, type Page } from "@playwright/test";
import { ACT_II, REMAINING_ENTRIES, type LensEntry } from "@data";
import { scrollLocatorIntoView, waitForAnimationFrames } from "../utils/scroll";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ActIIPage {
  readonly section: Locator;
  readonly titleLayer: Locator;
  readonly lensesZone: Locator;
  readonly storyDesk: Locator;
  readonly storyCards: Locator;
  readonly sankeyZone: Locator;

  constructor(readonly page: Page) {
    this.section = page.getByRole("region", {
      name: /Act II.+Engineering career/i,
    });
    this.titleLayer = page.getByTestId("act-ii-title");
    this.lensesZone = page.getByTestId("act-ii-lenses-zone");
    this.storyDesk = page.getByRole("region", { name: "Act II story desk" });
    this.storyCards = page.getByTestId("act-ii-story-card");
    this.sankeyZone = page.getByTestId("act-ii-sankey-zone");
  }

  async openTitle() {
    await scrollLocatorIntoView(this.page, this.section);
    await waitForAnimationFrames(this.page, 30);
  }

  async expectTitleContent() {
    await expect(this.titleLayer.getByText(ACT_II.act)).toBeVisible();
    await expect(this.titleLayer.locator("h2")).toContainText(/ENG/i);
    await expect(this.titleLayer.getByText(ACT_II.splash)).toBeVisible();
  }

  async openStoryDesk() {
    await scrollLocatorIntoView(this.page, this.storyDesk, "center");
    await expect(this.storyDesk).toBeInViewport();
    await waitForAnimationFrames(this.page, 8);
  }

  async expectStoryDeskCards() {
    await expect(this.storyDesk.getByText("The rest are here if you want them."))
      .toBeVisible();
    await expect(this.storyCards).toHaveCount(REMAINING_ENTRIES.length);
  }

  cardForCompany(company: string) {
    return this.storyDesk.getByRole("button", {
      name: new RegExp(`^${escapeRegExp(company)}:`),
    });
  }

  storyCardFor(entry: LensEntry) {
    return this.storyDesk.getByRole("button", {
      name: new RegExp(
        `^${escapeRegExp(entry.company)}: ${escapeRegExp(entry.iStatement)}$`,
      ),
    });
  }

  storyDialog() {
    return this.page.getByRole("dialog", { name: /^Story:/ });
  }

  async openCompanyStory(company: string) {
    await this.cardForCompany(company).first().click();
    await expect(this.storyDialog()).toBeVisible();
  }

  async closeStoryDialogWithKeyboard() {
    const dialog = this.storyDialog();
    await expect(dialog).toBeVisible();
    await this.page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }

  async expectEveryRemainingStoryOpens() {
    await this.expectStoryDeskCards();

    for (const entry of REMAINING_ENTRIES) {
      await this.storyCardFor(entry).click();

      const dialog = this.storyDialog();
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(entry.question);
      await expect(dialog).toContainText(entry.story);
      await expect(dialog).toContainText(entry.iStatement);

      await this.closeStoryDialogWithKeyboard();
    }
  }
}
