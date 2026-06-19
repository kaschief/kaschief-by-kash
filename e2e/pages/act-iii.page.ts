import { expect, type Locator, type Page } from "@playwright/test";
import { ACT_III_LEADER } from "@data";
import { scrollLocatorIntoView, waitForAnimationFrames } from "../utils/scroll";

export class ActIIIPage {
  readonly section: Locator;

  constructor(readonly page: Page) {
    this.section = page.getByRole("region", {
      name: /Act III.+Leadership career/i,
    });
  }

  async open() {
    await scrollLocatorIntoView(this.page, this.section);
    await expect(this.section).toBeInViewport();
    await waitForAnimationFrames(this.page, 8);
  }

  async expectSplashMatchesData() {
    await this.open();

    await this.expectTextVisible(ACT_III_LEADER.institution);
    await this.expectTextVisible(ACT_III_LEADER.location);
    await this.expectTextVisible(ACT_III_LEADER.period);
    await this.expectTextVisible(ACT_III_LEADER.subhead);
    for (const word of ACT_III_LEADER.headline.split(" ")) {
      await this.expectTextVisible(word);
    }
  }

  async expectEveryLeadershipScenario() {
    for (const scenario of ACT_III_LEADER.scenarios) {
      await this.expectTextVisible(scenario.id);
      await this.expectTextVisible(scenario.situation);
      await this.expectTextVisible(scenario.response);
    }
  }

  async expectEveryCapabilityAndProofPoint() {
    for (const annotation of ACT_III_LEADER.annotations) {
      await this.expectTextVisible(annotation.label);
      await this.expectTextVisible(annotation.text);
    }
    for (const proof of ACT_III_LEADER.proof) {
      await this.expectTextVisible(proof);
    }
    await this.expectTextVisible(ACT_III_LEADER.closing);
  }

  private async expectTextVisible(text: string) {
    const target = this.section.getByText(text, { exact: true }).first();
    await scrollLocatorIntoView(this.page, target, "center");
    await waitForAnimationFrames(this.page, 8);
    await expect(target).toBeVisible();
  }
}
