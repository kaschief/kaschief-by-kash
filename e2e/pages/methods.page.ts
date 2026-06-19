import { expect, type Locator, type Page } from "@playwright/test";
import { METHOD_GROUPS } from "@data";
import { waitForAnimationFrames, waitForScrollSettle } from "../utils/scroll";

export class MethodsPage {
  readonly section: Locator;

  constructor(readonly page: Page) {
    this.section = page.getByRole("region", { name: "Methods" });
  }

  activePanel() {
    return this.page.locator('[data-testid="methods-panel"][data-active="true"]');
  }

  async expectLandedNearTop() {
    await expect(this.section).toBeInViewport();
    await expect
      .poll(() =>
        this.section.evaluate((section) =>
          Math.abs(section.getBoundingClientRect().top),
        ),
      )
      .toBeLessThan(100);
  }

  async openPanel(label: string) {
    const desktopButton = this.section.getByRole("button", {
      name: `Show ${label}`,
    });
    const isDesktopPanelNavigation = await desktopButton.isVisible();

    if (isDesktopPanelNavigation) {
      await desktopButton.click();
    } else {
      await this.section.getByRole("button", { name: label }).click();
    }

    await waitForAnimationFrames(this.page, 8);
    if (isDesktopPanelNavigation) {
      await waitForScrollSettle(this.page, { stableMs: 500 });
      await expect(
        this.activePanel().filter({ hasText: label }).first(),
      ).toBeVisible();
    } else {
      await this.expectAnyVisible(this.section.getByText(label));
    }
  }

  async expectPanelGroupsAvailable() {
    for (const group of METHOD_GROUPS) {
      await this.openPanel(group.label);
      await this.expectAnyVisible(this.section.getByText(group.description));
    }
  }

  async expectEverySkillDetailAvailable() {
    for (const group of METHOD_GROUPS) {
      await this.openPanel(group.label);
      await this.expectAnyVisible(this.section.getByText(group.description));

      for (const skill of group.skills) {
        await expect(
          this.section.getByRole("button", { name: skill.label }),
        ).toBeVisible();
        await this.openSkill(skill.label, group.label);
        await expect(
          this.page.getByRole("dialog", {
            name: `Skill detail: ${skill.label}`,
          }),
        ).toContainText(skill.detail);
        await this.closeSkillDetail();
      }
    }
  }

  async openSkill(label: string, groupLabel?: string) {
    const candidate =
      groupLabel ? this.activePanel().filter({ hasText: groupLabel }).first() : null;
    const activePanel =
      candidate && (await candidate.count()) > 0 && (await candidate.isVisible())
        ? candidate
        : null;
    const scope = activePanel ?? this.section;

    await scope.getByRole("button", { name: label }).click();
    await expect(
      this.page.getByRole("dialog", { name: `Skill detail: ${label}` }),
    ).toBeVisible();
  }

  async closeSkillDetail() {
    const dialog = this.page.getByTestId("methods-skill-detail");
    await expect(dialog).toBeVisible();
    await this.page.getByRole("button", { name: "Close details" }).click();
    await expect(dialog).toBeHidden();
  }

  async scrollY() {
    return this.page.evaluate(() => window.scrollY);
  }

  async expectPanelChangeKeepsMethodsInView(label: string) {
    await this.openPanel(label);
    await waitForScrollSettle(this.page, { stableMs: 250 });
    await expect(this.section).toBeInViewport();
    await expect(this.activePanel()).toContainText(label);
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
