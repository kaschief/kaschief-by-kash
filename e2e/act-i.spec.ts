import { test, expect, type Page } from "@playwright/test";

/**
 * Act I end-to-end tests.
 *
 * Tests follow the user's scroll journey through Act I from top to bottom:
 *   1. Splash  — act label, title, BPM, ECG, location, ticker, splash quote
 *   2. Chaos   — burst animation, scattered cards, chaos narrator
 *   3. Order   — snap to grid, "my skills" narrator
 *   4. Stack   — left-aligned list, scroll indicator dismissed
 *   5. Throughline — sticky full-screen quote
 *
 * Visibility assertions use `toBeInViewport()` to confirm elements are
 * actually on screen — not just rendered somewhere in the DOM.
 */

/* ------------------------------------------------------------------ */
/*  Constants — mirrors source of truth in app code                    */
/* ------------------------------------------------------------------ */

const ACT_NURSE = "act-nurse";
const SCENE_HEIGHT_VH = 800;

/** Scroll phase boundaries (chaos-to-order.constants.ts) */
const SNAP_END = 0.42;
const STACK_START = 0.65;
const FOCUS_START = 0.88;

/** Narrator copy */
const NARRATOR_CHAOS =
  "Every shift began in the middle of something: competing signals, incomplete information, all at once.";

/** Skill card count from data/timeline.ts */
const SKILL_COUNT = 6;

/** Sample ticker keywords (splash.tsx) */
const TICKER_KEYWORDS = ["CCRN Certified", "Neuro ICU", "Triage"] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function getSceneGeometry(page: Page) {
  return page.evaluate((id) => {
    const section = document.getElementById(id);
    if (!section) return null;
    const scene = section.querySelector<HTMLElement>("[data-sticky-zone]");
    if (!scene) return null;
    return {
      sceneTop: window.scrollY + scene.getBoundingClientRect().top,
      sceneHeight: scene.offsetHeight,
    };
  }, ACT_NURSE);
}

async function scrollToProgress(page: Page, progress: number) {
  const geo = await getSceneGeometry(page);
  if (!geo) throw new Error("Scene element not found");
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    geo.sceneTop + geo.sceneHeight * progress,
  );
  await page.waitForTimeout(250);
}

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
});

/* ================================================================== */
/*  1 · Splash                                                         */
/* ================================================================== */

test.describe("1 · Splash", () => {
  test.beforeEach(async ({ page }) => {
    // Scroll the centered splash content into the viewport middle.
    // The splash is the first child of #act-nurse, a min-h-screen flex container.
    await page.evaluate((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      // First child is the splash scene div
      const splash = section.firstElementChild as HTMLElement;
      if (!splash) return;
      splash.scrollIntoView({ block: "center" });
    }, ACT_NURSE);
    await page.waitForTimeout(1500);
  });

  test("act label, title, and period are in viewport", async ({ page }) => {
    const s = page.locator(`#${ACT_NURSE}`);
    await expect(s.locator("text=Act I").first()).toBeInViewport();
    // Title is "The Nurse" uppercased and split into words: "THE" + "NURSE"
    await expect(s.locator("text=THE").first()).toBeInViewport();
    await expect(s.locator("text=NURSE").first()).toBeInViewport();
    await expect(s.locator("text=2012").first()).toBeInViewport();
  });

  test("splash quote uses Spectral (narrator) font and is in viewport", async ({
    page,
  }) => {
    const quote = page.locator(`#${ACT_NURSE} p[style*='italic']`).first();
    await expect(quote).toBeInViewport();
    const font = await quote.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain("spectral");
  });

  test("BPM counter is in viewport", async ({ page }) => {
    await expect(
      page.locator(`#${ACT_NURSE}`).locator("text=BPM").first(),
    ).toBeInViewport();
  });

  test("location row shows NYU Langone in viewport", async ({ page }) => {
    await expect(
      page.locator(`#${ACT_NURSE}`).locator("text=NYU Langone").first(),
    ).toBeInViewport();
  });

  test("ECG waveform SVG paths are rendered", async ({ page }) => {
    const paths = page.locator(`#${ACT_NURSE} svg path`);
    expect(await paths.count()).toBeGreaterThanOrEqual(2);
  });

  test("keyword ticker is rendered and animated", async ({ page }) => {
    const s = page.locator(`#${ACT_NURSE}`);

    // Ticker keywords exist in the DOM
    for (const kw of TICKER_KEYWORDS) {
      await expect(s.locator(`text=${kw}`).first()).toBeVisible();
    }

    // Ticker row has scroll-ticker animation
    const animated = await s.evaluate((el) => {
      const row = el.querySelector("[class*='flex'][class*='w-max']");
      return row
        ? (row as HTMLElement).style.animation.includes("scroll-ticker")
        : false;
    });
    expect(animated).toBe(true);
  });
});

/* ================================================================== */
/*  2 · Chaos phase — burst + scattered cards + chaos narrator         */
/* ================================================================== */

test.describe("2 · Chaos phase", () => {
  test("scene container has ~800vh scroll height", async ({ page }) => {
    await page.locator(`#${ACT_NURSE}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const geo = await getSceneGeometry(page);
    expect(geo).not.toBeNull();
    const vh = await page.evaluate(() => window.innerHeight);
    const expected = (SCENE_HEIGHT_VH / 100) * vh;
    expect(geo!.sceneHeight).toBeGreaterThan(expected * 0.95);
    expect(geo!.sceneHeight).toBeLessThan(expected * 1.05);
  });

  test("skill cards burst into viewport after entering section", async ({ page }) => {
    await scrollToProgress(page, 0.05);
    await page.waitForTimeout(1500);

    // Count absolutely-positioned children that are visible AND in viewport
    const visible = await page.evaluate(
      ({ id, vpH }) => {
        const sticky = document.querySelector(`#${id} [data-sticky-zone] > .sticky`);
        if (!sticky) return 0;
        return Array.from(sticky.children).filter((el) => {
          const s = getComputedStyle(el as HTMLElement);
          if (s.position !== "absolute" || parseFloat(s.opacity) <= 0.05) return false;
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.bottom > 0 && rect.top < vpH;
        }).length;
      },
      { id: ACT_NURSE, vpH: page.viewportSize()!.height },
    );

    expect(visible).toBeGreaterThanOrEqual(SKILL_COUNT);
  });

  test("chaos narrator is in viewport and uses Spectral font", async ({ page }) => {
    await scrollToProgress(page, 0.15);
    await page.waitForTimeout(500);

    const narrator = page
      .locator(`#${ACT_NURSE}`)
      .locator(`text=${NARRATOR_CHAOS}`)
      .first();
    await expect(narrator).toBeInViewport({ timeout: 3_000 });

    const font = await narrator.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain("spectral");
  });
});

/* ================================================================== */
/*  3 · Order phase — snap to grid + "my skills" narrator              */
/* ================================================================== */

test.describe("3 · Order phase", () => {
  test("'my skills' narrator text is in viewport after snap", async ({ page }) => {
    await scrollToProgress(page, (SNAP_END + STACK_START) / 2);
    await page.waitForTimeout(500);

    await expect(
      page.locator(`#${ACT_NURSE}`).locator("text=my skills").first(),
    ).toBeInViewport({ timeout: 3_000 });
  });

  test("order narrator sentence is in viewport", async ({ page }) => {
    await scrollToProgress(page, (SNAP_END + STACK_START) / 2);
    await page.waitForTimeout(500);

    await expect(
      page.locator(`#${ACT_NURSE}`).locator("text=make order from it").first(),
    ).toBeInViewport({ timeout: 3_000 });
  });
});

/* ================================================================== */
/*  4 · Stack / Focus phase                                            */
/* ================================================================== */

test.describe("4 · Stack / Focus phase", () => {
  test("'my skills' lingers while watermarks are visible in stack phase", async ({
    page,
  }) => {
    // Stack is settled, watermarks are showing, "my skills" should still linger
    await scrollToProgress(page, (STACK_START + FOCUS_START) / 2);
    await page.waitForTimeout(500);

    await expect(
      page.locator(`#${ACT_NURSE}`).locator("text=my skills").first(),
    ).toBeInViewport({ timeout: 3_000 });
  });

  test("scroll indicator is not visible in stack phase", async ({ page }) => {
    await scrollToProgress(page, STACK_START + 0.05);
    await page.waitForTimeout(500);

    const hasScrollText = await page
      .locator(`#${ACT_NURSE} [data-sticky-zone]`)
      .first()
      .evaluate((el) => {
        for (const c of el.querySelectorAll("span, p, div")) {
          const t = (c as HTMLElement).textContent?.toLowerCase() ?? "";
          if (
            t.includes("scroll") &&
            getComputedStyle(c as HTMLElement).opacity !== "0"
          ) {
            return true;
          }
        }
        return false;
      });

    expect(hasScrollText).toBe(false);
  });
});

/* ================================================================== */
/*  5 · Throughline — sticky full-screen quote closing Act I           */
/* ================================================================== */

test.describe("5 · Throughline", () => {
  test.beforeEach(async ({ page }) => {
    // Scroll to the throughline's sticky zone (last data-sticky-zone in Act I)
    await page.evaluate((id) => {
      const zones = document.querySelectorAll(`#${id} [data-sticky-zone]`);
      const zone = zones[zones.length - 1];
      if (!zone) return;
      zone.scrollIntoView({ block: "start" });
    }, ACT_NURSE);
    await page.waitForTimeout(800);
  });

  test("throughline quote is in viewport and uses Spectral font", async ({
    page,
  }) => {
    const h3 = page.locator(`#${ACT_NURSE} h3`).first();
    await expect(h3).toBeInViewport({ timeout: 5_000 });

    const font = await h3.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain("spectral");
  });

  test("throughline contains expected text", async ({ page }) => {
    const h3 = page.locator(`#${ACT_NURSE} h3`).first();
    await expect(h3).toBeInViewport({ timeout: 5_000 });
    const text = await h3.textContent();
    expect(text).toContain("operating system");
  });

  test("throughline stays in viewport while scrolling its sticky zone", async ({
    page,
  }) => {
    const h3 = page.locator(`#${ACT_NURSE} h3`).first();
    await expect(h3).toBeInViewport({ timeout: 5_000 });

    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);

    await expect(h3).toBeInViewport();
  });
});
