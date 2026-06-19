import { expect, type Locator, type Page } from "@playwright/test";
import { waitForAnimationFrames } from "../utils/scroll";

export class HomePage {
  readonly main: Locator;

  constructor(readonly page: Page) {
    this.main = page.locator("#main-content");
  }

  async goto() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(this.main).toBeVisible();
    await waitForAnimationFrames(this.page, 3);
  }
}
