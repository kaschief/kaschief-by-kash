import { expect, type Locator, type Page } from "@playwright/test";
import { getSectionTop, waitForScrollSettle } from "../utils/scroll";

export class NavigationComponent {
  readonly nav: Locator;

  constructor(readonly page: Page) {
    this.nav = page.getByRole("navigation");
  }

  link(label: string) {
    return this.nav.getByRole("link", { name: new RegExp(`^${label}$`, "i") });
  }

  async reveal() {
    await this.page.evaluate(() =>
      window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }),
    );
    await expect(this.nav).toBeVisible();
  }

  async goTo(label: string, sectionId: string) {
    await this.reveal();
    if (!(await this.link(label).isVisible())) {
      await this.nav.getByRole("button", { name: "Open menu" }).click();
      await expect(this.link(label)).toBeVisible();
    }
    await this.link(label).click();
    await waitForScrollSettle(this.page);
    await expect
      .poll(async () => {
        const top = await getSectionTop(this.page, sectionId);
        return top === null ? Number.POSITIVE_INFINITY : Math.abs(top);
      }, {
        message: `${label} section should settle near the viewport top`,
      })
      .toBeLessThan(100);
  }
}
