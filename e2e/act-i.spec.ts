import { ACT_I } from "@data"
import { expect, test } from "./fixtures/test"

const TICKER_KEYWORDS = ["CCRN Certified", "Neuro ICU", "Triage"] as const

test.describe("Act I nursing journey", () => {
  test.beforeEach(async ({ home }) => {
    await home.goto()
  })

  test("renders the splash identity, medical signals, and ticker copy", async ({ actI }) => {
    await actI.openSplash()
    await actI.expectSplashIdentity()
    await actI.expectBpmCounterVisible()
    await actI.expectEcgRendered()
    await actI.expectTickerKeywords(TICKER_KEYWORDS)
    await expect(actI.splash.getByText(ACT_I.splash)).toBeInViewport()
  })

  test("keeps the chaos scene height aligned to the scroll contract", async ({ actI }) => {
    await actI.expectChaosHeightMatchesContract()
  })

  test("reveals the chaos cards and narrator when the user enters the scene", async ({ actI }) => {
    await actI.scrollToChaos()
    await actI.expectSkillCardsVisible()
    await actI.expectChaosNarrator()
  })

  test("renders every nursing skill scenario card from data", async ({ actI }) => {
    await actI.scrollToChaos()
    await actI.expectEverySkillScenarioCard()
  })

  test("transitions from chaos into ordered skills copy", async ({ actI }) => {
    await actI.scrollToOrder()
    await actI.expectOrderNarrator()
  })

  test("keeps the stack phase focused without showing the scroll prompt", async ({ actI }) => {
    await actI.scrollToStack()
    await actI.expectStackKeepsNarratorAndHidesScrollPrompt()
  })

  test("ends with the throughline quote pinned in the viewport", async ({ actI, page }) => {
    await actI.openThroughline()
    await actI.expectThroughline()

    await page.evaluate(() => window.scrollBy(0, 300))
    await actI.expectThroughline()
  })
})
