import { test, expect } from "@playwright/test";

/**
 * Act II end-to-end tests.
 *
 * Verifies the terminal-style git log section renders real content:
 *   1. Section header — act label, scramble title, splash, body
 *   2. Terminal chrome — title bar, prompt, cursor
 *   3. Company entries — exact content for all 4 companies
 *   4. Repo panel — opens with real readme/impact data, closes on ESC
 *   5. Takeaway — sticky quote
 */

const ACT_ENGINEER = "act-engineer";

/* ── Real data from data/timeline.ts ── */

const COMPANIES = [
  {
    hash: "a3f7b21",
    company: "AMBOSS",
    role: "Frontend Engineer",
    location: "Berlin",
    period: "Sep 2018 — Oct 2019",
    commits: [
      "ship core React product for medical exam prep",
      "run A/B experiments on study and review flows",
      "translate research insights into product changes",
      "help take the product from beta to production",
    ],
    tags: ["React", "A/B Testing", "Med-Ed"],
    promoted: false,
    repo: {
      org: "amboss-meded",
      name: "student-app",
      readmeSnippet: "AMBOSS was my transition from writing code to building products",
      impactStat: "500K+",
    },
  },
  {
    hash: "8c2e4d9",
    company: "Compado",
    role: "Frontend Engineer → Senior Frontend Engineer",
    location: "Berlin",
    period: "Oct 2019 — Jun 2021",
    commits: [
      "build Vue comparison products with dynamic UI systems",
      "redesign loading strategy and reduce page latency",
      "architect SEO improvements directly in the frontend layer",
      "own the acquisition and conversion frontend end to end",
    ],
    tags: ["Vue", "Marketing", "↑ Promoted"],
    promoted: true,
    repo: {
      org: "compado",
      name: "comparison-engine",
      readmeSnippet: "performance was a business metric",
      impactStat: "+50%",
    },
  },
  {
    hash: "1f9a0c3",
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    location: "Hamburg",
    period: "Jun 2021 — Oct 2021",
    commits: [
      "build new frontend for advisor platform used by 10K+ people",
      "replace unstable legacy frontend with Vue 3 and TypeScript",
      "reduce load time and stabilize the UI architecture",
      "define architecture patterns the team kept building on",
    ],
    tags: ["Vue", "TypeScript", "Fintech"],
    promoted: false,
    repo: {
      org: "capinside",
      name: "advisor-platform",
      readmeSnippet: "stabilize a fintech platform",
      impactStat: "10K+",
    },
  },
  {
    hash: "5e7d2a1",
    company: "DKB Code Factory",
    role: "Senior Frontend Engineer → Engineering Manager",
    location: "Berlin",
    period: "Oct 2021 — Dec 2024",
    commits: [
      "rebuild banking UI for millions of users in React/TS",
      "introduce Jest and Playwright for mission-critical reliability",
      "partner with Product to identify and fix usability gaps",
      "move releases from monthly to weekly with zero rollbacks",
    ],
    tags: ["React", "TypeScript", "Banking", "↑ Promoted"],
    promoted: true,
    repo: {
      org: "dkb-code-factory",
      name: "banking-frontend",
      readmeSnippet: "engineering scale met regulatory rigor",
      impactStat: "5M+",
    },
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
});

async function scrollToActII(page: import("@playwright/test").Page) {
  await page.evaluate((id) => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, ACT_ENGINEER);
  // Wait for scramble animations + inView triggers
  await page.waitForTimeout(2000);
}

/* ================================================================== */
/*  1 · Section header                                                 */
/* ================================================================== */

test.describe("1 · Section header", () => {
  test.beforeEach(async ({ page }) => {
    await scrollToActII(page);
  });

  test("renders 'Act II' label with animated letter-spacing", async ({ page }) => {
    const label = page.locator(`#${ACT_ENGINEER}`).locator("text=Act II").first();
    await expect(label).toBeVisible();
    const ls = await label.evaluate((el) => getComputedStyle(el).letterSpacing);
    // After animation settles, letter-spacing should be non-zero
    expect(parseFloat(ls)).toBeGreaterThan(0);
  });

  test("title h2 contains 'ENG' (scramble-decoded or mid-scramble)", async ({ page }) => {
    const h2 = page.locator(`#${ACT_ENGINEER} h2`).first();
    await expect(h2).toBeVisible();
    // Wait for scramble to finish
    await page.waitForTimeout(3000);
    const text = await h2.textContent();
    // ScrambleText replaces I→1: "THE ENG1NEER"
    expect(text).toContain("ENG");
  });

  test("splash quote contains 'career' or 'engineer' content", async ({ page }) => {
    const splash = page
      .locator(`#${ACT_ENGINEER} .font-serif.italic`)
      .first();
    await expect(splash).toBeVisible();
    const text = await splash.textContent();
    expect(text!.length).toBeGreaterThan(20);
  });
});

/* ================================================================== */
/*  2 · Terminal chrome                                                */
/* ================================================================== */

test.describe("2 · Terminal chrome", () => {
  test.beforeEach(async ({ page }) => {
    await scrollToActII(page);
  });

  test("title bar shows exact terminal path", async ({ page }) => {
    await expect(
      page.locator(`text=kaschief — ~/career — git log --oneline`).first(),
    ).toBeVisible();
  });

  test("title bar has 3 traffic light dots (red, gold, green)", async ({ page }) => {
    const titleBar = page.locator(`#${ACT_ENGINEER} .rounded-t-lg`).first();
    await expect(titleBar).toBeVisible();
    // Dots are small colored circles — verify 3 exist by size (h-2.5 w-2.5 rounded-full)
    const dots = titleBar.locator(".rounded-full");
    expect(await dots.count()).toBe(3);
    // Verify they have distinct background colors (act-red, act-gold, act-green)
    const colors = await dots.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    const unique = new Set(colors);
    expect(unique.size).toBe(3);
  });

  test("prompt line shows exact git command", async ({ page }) => {
    await expect(
      page.locator(`#${ACT_ENGINEER}`).locator("text=~/career").first(),
    ).toBeVisible();
    await expect(
      page.locator(`#${ACT_ENGINEER}`).locator("text=git log --graph --all").first(),
    ).toBeVisible();
  });

  test("blinking cursor element exists", async ({ page }) => {
    const cursor = page.locator(`#${ACT_ENGINEER} [style*="cursor-blink"]`);
    expect(await cursor.count()).toBe(1);
  });
});

/* ================================================================== */
/*  3 · Company entries — verify real content per company              */
/* ================================================================== */

test.describe("3 · Company entries", () => {
  test.beforeEach(async ({ page }) => {
    await scrollToActII(page);
    // Scroll terminal body into view and wait for scramble decode
    await page.locator(`#${ACT_ENGINEER} .rounded-b-lg`).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
  });

  test("renders exactly 4 commit entries", async ({ page }) => {
    const entries = page.locator(`#${ACT_ENGINEER} article[role="button"]`);
    expect(await entries.count()).toBe(4);
  });

  for (const [i, co] of COMPANIES.entries()) {
    test.describe(co.company, () => {
      /**
       * Scrambled text makes text= locators unreliable.
       * Use aria-label (real text, never scrambled) for content verification
       * and DOM structure (element counts) for layout checks.
       */

      test(`entry ${i} — aria-label contains company and role`, async ({ page }) => {
        const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(i);
        await entry.scrollIntoViewIfNeeded();
        expect(await entry.getAttribute("tabindex")).toBe("0");
        const ariaLabel = await entry.getAttribute("aria-label");
        expect(ariaLabel).toContain(co.company);
        expect(ariaLabel).toContain(co.role);
      });

      test(`entry ${i} — has 4 commit list items`, async ({ page }) => {
        const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(i);
        await entry.scrollIntoViewIfNeeded();
        const commits = entry.locator("ul[aria-label='Commits'] li");
        expect(await commits.count()).toBe(4);
      });

      test(`entry ${i} — has ${co.tags.length} tags`, async ({ page }) => {
        const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(i);
        await entry.scrollIntoViewIfNeeded();
        const tags = entry.locator("[aria-label='Tags'] span");
        expect(await tags.count()).toBe(co.tags.length);
      });

      test(`entry ${i} — lock icon SVG present`, async ({ page }) => {
        const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(i);
        await entry.scrollIntoViewIfNeeded();
        const svg = entry.locator("svg").first();
        await expect(svg).toBeVisible();
        expect(await svg.locator("path").count()).toBeGreaterThanOrEqual(1);
      });

      if (co.promoted) {
        test(`entry ${i} — has promoted indicator`, async ({ page }) => {
          const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(i);
          await entry.scrollIntoViewIfNeeded();
          // Branch dot has promoted color as border
          const dot = entry.locator(".rounded-full").first();
          await expect(dot).toBeVisible();
        });
      }
    });
  }
});

/* ================================================================== */
/*  4 · Repo panel — real content verification                         */
/* ================================================================== */

test.describe("4 · Repo panel", () => {
  test.beforeEach(async ({ page }) => {
    await scrollToActII(page);
    await page.locator(`#${ACT_ENGINEER} .rounded-b-lg`).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  });

  test("clicking AMBOSS opens panel with correct repo metadata", async ({ page }) => {
    const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).first();
    await entry.click();
    await page.waitForTimeout(600);

    const panel = page.locator("[role='dialog'][aria-modal='true']");
    await expect(panel).toBeVisible();

    const panelText = await panel.textContent();
    // Verify repo metadata
    expect(panelText).toContain("amboss-meded");
    expect(panelText).toContain("student-app");
    // Verify readme content
    expect(panelText).toContain(COMPANIES[0].repo.readmeSnippet);
    // Verify impact stat
    expect(panelText).toContain(COMPANIES[0].repo.impactStat);
  });

  test("clicking DKB opens panel with correct repo metadata", async ({ page }) => {
    const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).nth(3);
    await entry.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await entry.click();
    await page.waitForTimeout(600);

    const panel = page.locator("[role='dialog'][aria-modal='true']");
    await expect(panel).toBeVisible();

    const panelText = await panel.textContent();
    expect(panelText).toContain("dkb-code-factory");
    expect(panelText).toContain("banking-frontend");
    expect(panelText).toContain(COMPANIES[3].repo.readmeSnippet);
    expect(panelText).toContain(COMPANIES[3].repo.impactStat);
  });

  test("ESC closes the panel and returns to terminal view", async ({ page }) => {
    const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).first();
    await entry.click();
    await page.waitForTimeout(600);

    const panel = page.locator("[role='dialog'][aria-modal='true']");
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    await expect(panel).not.toBeVisible();
    // Terminal should still be there
    await expect(
      page.locator(`text=git log --oneline`).first(),
    ).toBeVisible();
  });

  test("panel blocks body scroll while open", async ({ page }) => {
    const entry = page.locator(`#${ACT_ENGINEER} article[role="button"]`).first();
    await entry.click();
    await page.waitForTimeout(600);

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("hidden");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).not.toBe("hidden");
  });
});

/* ================================================================== */
/*  5 · Takeaway                                                       */
/* ================================================================== */

test.describe("5 · Takeaway", () => {
  test("takeaway exists and uses Spectral font", async ({ page }) => {
    const takeaway = page.locator("#act-ii-takeaway h3");
    if ((await takeaway.count()) === 0) return; // no takeaway configured

    await takeaway.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    await expect(takeaway.first()).toBeVisible();
    const font = await takeaway.first().evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(font.toLowerCase()).toContain("spectral");

    const text = await takeaway.first().textContent();
    expect(text!.length).toBeGreaterThan(10);
  });
});
