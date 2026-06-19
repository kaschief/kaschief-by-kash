import { expect, type Locator, type Page } from "@playwright/test";
import {
  CONTACT_CONTENT,
  PERSONAL,
  PHILOSOPHY,
  PORTRAIT_CONTENT,
} from "@data";
import { scrollLocatorIntoView, waitForAnimationFrames } from "../utils/scroll";

export class SiteContentPage {
  readonly portrait: Locator;
  readonly philosophy: Locator;
  readonly contact: Locator;

  constructor(readonly page: Page) {
    this.portrait = page.getByRole("region", { name: "Portrait" });
    this.philosophy = page.getByRole("region", { name: "Philosophy" });
    this.contact = page.getByRole("region", { name: "Contact" });
  }

  async expectPortraitMatchesData() {
    await this.openSection(this.portrait);

    await expect(
      this.portrait.getByRole("img", { name: PERSONAL.name }),
    ).toBeVisible();
    await this.expectAnyVisible(this.portrait.getByText(PERSONAL.location));
    for (const line of PORTRAIT_CONTENT.headline) {
      await this.expectAnyVisible(this.portrait.getByText(line));
    }
    for (const paragraph of PORTRAIT_CONTENT.bio) {
      await this.expectAnyVisible(this.portrait.getByText(paragraph));
    }
    for (const stat of PORTRAIT_CONTENT.stats) {
      await this.expectAnyVisible(this.portrait.getByText(stat.label));
    }
  }

  async expectPhilosophyMatchesData() {
    await this.openSection(this.philosophy);

    const quote = this.philosophy.locator("blockquote");
    await expect(quote).toBeVisible();
    const normalize = (value: string) => value.replace(/\s+/g, "");

    await expect
      .poll(() =>
        quote.evaluate((element) =>
          (element.textContent ?? "").replace(/\s+/g, ""),
        ),
      )
      .toContain(normalize(PHILOSOPHY.lines.join(" ")));
  }

  async expectContactMatchesData() {
    await this.openSection(this.contact);

    await this.expectAnyVisible(this.contact.getByText(PERSONAL.firstName));
    await this.expectAnyVisible(this.contact.getByText(PERSONAL.lastName));

    for (const paragraph of CONTACT_CONTENT.paragraphs) {
      await this.expectAnyVisible(this.contact.getByText(paragraph));
    }
    await this.expectAnyVisible(this.contact.getByText(CONTACT_CONTENT.coda));

    await this.expectVisibleLink(PERSONAL.email, `mailto:${PERSONAL.email}`);
    await this.expectVisibleLink("LinkedIn", PERSONAL.linkedin);
    await this.expectVisibleLink("GitHub", PERSONAL.github);
  }

  private async openSection(section: Locator) {
    await scrollLocatorIntoView(this.page, section, "center");
    await expect(section).toBeInViewport();
    await waitForAnimationFrames(this.page, 8);
  }

  private async expectVisibleLink(label: string, href: string) {
    const link = this.contact.getByRole("link", { name: label }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }

  private async expectAnyVisible(locator: Locator) {
    await expect
      .poll(() =>
        locator.evaluateAll((elements) =>
          elements.some((element) => {
            const style = getComputedStyle(element as HTMLElement);
            const rect = (element as HTMLElement).getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) > 0 &&
              rect.width > 0 &&
              rect.height > 0
            );
          }),
        ),
      )
      .toBe(true);
  }
}
