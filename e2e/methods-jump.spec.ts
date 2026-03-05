import { test, expect, type Page } from "@playwright/test";

async function waitForScrollSettle(
  page: Page,
  { stableMs = 400, timeoutMs = 8_000 } = {},
): Promise<number> {
  const start = Date.now();
  let lastY = await page.evaluate(() => window.scrollY);
  let stableSince = Date.now();
  while (Date.now() - start < timeoutMs) {
    await page.waitForTimeout(60);
    const y = await page.evaluate(() => window.scrollY);
    if (Math.abs(y - lastY) > 2) {
      lastY = y;
      stableSince = Date.now();
    }
    if (Date.now() - stableSince >= stableMs) return y;
  }
  return lastY;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
});

test("Methods nav click lands at the section without scroll overshoot", async ({
  page,
}) => {
  // Make nav visible
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  await expect(page.locator("nav")).toBeVisible({ timeout: 5_000 });

  // Click Methods in nav
  const methodsLink = page.locator("nav a", { hasText: /^Methods$/i });
  await methodsLink.click();
  await waitForScrollSettle(page);

  // Section should be visible and near viewport top
  const sectionTop = await page.evaluate(() => {
    const section = document.getElementById("methods");
    return section ? section.getBoundingClientRect().top : null;
  });

  expect(sectionTop).not.toBeNull();
  // Should be within ~100px of viewport top (nav offset)
  expect(Math.abs(sectionTop!)).toBeLessThan(100);
});

test("Methods panel nav buttons switch panels without changing scrollY", async ({
  page,
}) => {
  // Navigate to Methods
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  await page.locator("nav a", { hasText: /^Methods$/i }).click();
  const afterMethodsY = await waitForScrollSettle(page);

  // Click "How I build" panel button
  await page.evaluate(() => {
    const btns = document.querySelectorAll<HTMLElement>("#methods button");
    for (const btn of btns) {
      if (
        btn.textContent?.trim() === "How I build" &&
        getComputedStyle(
          btn.closest('[style*="pointer-events"]') ?? btn,
        ).pointerEvents !== "none"
      ) {
        btn.click();
        return;
      }
    }
  });
  await page.waitForTimeout(600);

  const afterPanelY = await page.evaluate(() => window.scrollY);

  console.log(
    `After Methods nav: scrollY=${afterMethodsY}, after panel click: scrollY=${afterPanelY}`,
  );

  // With wheel hijack, panel clicks should NOT change scrollY
  expect(
    Math.abs(afterPanelY - afterMethodsY),
    "scrollY should not change when clicking panel nav buttons",
  ).toBeLessThan(10);
});

test("Nurse nav → Methods nav: Methods section lands correctly", async ({
  page,
}) => {
  // Make nav visible
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  await expect(page.locator("nav")).toBeVisible({ timeout: 5_000 });

  // Click Nurse first
  await page.locator("nav a", { hasText: /^Nurse$/i }).click();
  await waitForScrollSettle(page);

  // Click Methods
  await page.locator("nav a", { hasText: /^Methods$/i }).click();
  await waitForScrollSettle(page);

  // Section should be near viewport top
  const sectionTop = await page.evaluate(() => {
    const section = document.getElementById("methods");
    return section ? section.getBoundingClientRect().top : null;
  });

  expect(sectionTop).not.toBeNull();
  expect(Math.abs(sectionTop!)).toBeLessThan(100);
});
