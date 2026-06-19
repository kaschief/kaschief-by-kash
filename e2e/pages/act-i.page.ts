import { expect, type Locator, type Page } from "@playwright/test";
import { ACT_I } from "@data";
import {
  FOCUS_START,
  SCENE_HEIGHT_VH,
  SNAP_END,
  STACK_START,
} from "../../features/timeline/ui/acts/act-i-nurse/chaos-to-order.constants";
import {
  scrollLocatorIntoView,
  scrollStickyZoneToProgress,
  waitForAnimationFrames,
} from "../utils/scroll";

const SKILL_CARD_COUNT = ACT_I.skillScenarios.length;

export class ActIPage {
  readonly section: Locator;
  readonly splash: Locator;
  readonly chaosZone: Locator;
  readonly skillCards: Locator;
  readonly throughline: Locator;

  constructor(readonly page: Page) {
    this.section = page.getByRole("region", {
      name: /Act I.+Nursing career/i,
    });
    this.splash = page.getByRole("region", { name: "Act I splash" });
    this.chaosZone = page.getByTestId("act-i-chaos-zone");
    this.skillCards = page.getByTestId("act-i-skill-card");
    this.throughline = this.section.getByText(/operating system/i);
  }

  async openSplash() {
    await scrollLocatorIntoView(this.page, this.splash, "center");
    await expect(this.splash).toBeInViewport();
  }

  async expectSplashIdentity() {
    await expect(this.splash.getByText(/ACT I/i)).toBeInViewport();
    await expect(
      this.splash.getByRole("heading", { name: /THE NURSE/i }),
    ).toBeInViewport();
    await expect(this.splash.getByText(ACT_I.institution)).toBeInViewport();
    await expect(this.splash.getByText(ACT_I.period)).toBeInViewport();
  }

  async expectBpmCounterVisible() {
    await expect
      .poll(() =>
        this.page.getByTestId("act-i-bpm").evaluateAll((elements) =>
          elements.some((element) => {
            const style = getComputedStyle(element as HTMLElement);
            const rect = (element as HTMLElement).getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) > 0 &&
              rect.width > 0 &&
              rect.height > 0 &&
              element.textContent?.includes("BPM")
            );
          }),
        ),
      )
      .toBe(true);
  }

  async expectEcgRendered() {
    await expect
      .poll(() =>
        this.page
          .getByTestId("act-i-ecg")
          .locator("svg path")
          .count(),
      )
      .toBeGreaterThanOrEqual(2);
  }

  async expectTickerKeywords(keywords: readonly string[]) {
    const ticker = this.page.getByTestId("act-i-keyword-ticker");
    for (const keyword of keywords) {
      await expect(ticker.getByText(keyword).first()).toBeVisible();
    }
  }

  async expectChaosHeightMatchesContract() {
    await scrollLocatorIntoView(this.page, this.chaosZone);
    const geometry = await this.chaosZone.evaluate((element) => ({
      height: (element as HTMLElement).offsetHeight,
      viewportHeight: window.innerHeight,
    }));
    const expected = (SCENE_HEIGHT_VH / 100) * geometry.viewportHeight;
    expect(geometry.height).toBeGreaterThan(expected * 0.95);
    expect(geometry.height).toBeLessThan(expected * 1.05);
  }

  async scrollToChaos() {
    await scrollStickyZoneToProgress(this.page, this.chaosZone, 0.05);
    await waitForAnimationFrames(this.page, 20);
  }

  async scrollToOrder() {
    await scrollStickyZoneToProgress(
      this.page,
      this.chaosZone,
      (SNAP_END + STACK_START) / 2,
    );
  }

  async scrollToStack() {
    await scrollStickyZoneToProgress(
      this.page,
      this.chaosZone,
      (STACK_START + FOCUS_START) / 2,
    );
  }

  async expectSkillCardsVisible() {
    await expect(this.skillCards).toHaveCount(SKILL_CARD_COUNT);
    await expect
      .poll(() =>
        this.skillCards.evaluateAll((cards) =>
          cards.filter((card) => {
            const style = getComputedStyle(card as HTMLElement);
            const rect = (card as HTMLElement).getBoundingClientRect();
            return (
              Number(style.opacity) > 0.05 &&
              rect.bottom > 0 &&
              rect.top < window.innerHeight
            );
          }).length,
        ),
      )
      .toBeGreaterThanOrEqual(SKILL_CARD_COUNT);
  }

  async expectEverySkillScenarioCard() {
    await expect(this.skillCards).toHaveCount(SKILL_CARD_COUNT);

    for (const scenario of ACT_I.skillScenarios) {
      const card = this.section.getByRole("article", {
        name: scenario.question,
      });

      await expect(card).toBeVisible();
      if (scenario.accentText) {
        await expect(card).toContainText(scenario.accentText);
      }
      if (scenario.title) {
        await expect(card).toContainText(scenario.title);
      }
      await expect(card).toContainText(scenario.story);
    }
  }

  async expectChaosNarrator() {
    await this.expectAnyInViewport(
      this.section.getByText(
        "Every shift began in the middle of something: competing signals, incomplete information, all at once.",
      ),
    );
  }

  async expectOrderNarrator() {
    await this.expectAnyInViewport(this.section.getByText(/my skills/i));
    await this.expectAnyInViewport(this.section.getByText(/make order from it/i));
  }

  async expectStackKeepsNarratorAndHidesScrollPrompt() {
    await this.expectAnyInViewport(this.section.getByText(/my skills/i));
    await expect
      .poll(() =>
        this.chaosZone.evaluate((zone) => {
          for (const element of zone.querySelectorAll("span, p, div")) {
            const text = element.textContent?.toLowerCase() ?? "";
            const style = getComputedStyle(element as HTMLElement);
            if (text.includes("scroll") && style.opacity !== "0") return false;
          }
          return true;
        }),
      )
      .toBe(true);
  }

  async openThroughline() {
    await this.page.evaluate(() => {
      document
        .getElementById("act-i-throughline")
        ?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await waitForAnimationFrames(this.page, 3);
  }

  async expectThroughline() {
    await expect(this.throughline).toBeInViewport();
  }

  private async expectAnyInViewport(locator: Locator) {
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
              rect.bottom > 0 &&
              rect.top < window.innerHeight
            );
          }),
        ),
      )
      .toBe(true);
  }
}
