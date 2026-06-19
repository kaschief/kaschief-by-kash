import type { Locator, Page } from "@playwright/test";

export async function waitForAnimationFrames(page: Page, frames = 2) {
  await page.evaluate(
    (frameCount) =>
      new Promise<void>((resolve) => {
        let remaining = frameCount;
        const tick = () => {
          remaining -= 1;
          if (remaining <= 0) {
            resolve();
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    frames,
  );
}

export async function waitForScrollSettle(
  page: Page,
  { stableMs = 350, timeoutMs = 8_000 } = {},
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

export async function scrollLocatorIntoView(
  page: Page,
  locator: Locator,
  block: ScrollLogicalPosition = "start",
) {
  await locator.evaluate((element, scrollBlock) => {
    element.scrollIntoView({ block: scrollBlock, behavior: "instant" });
  }, block);
  await waitForAnimationFrames(page, 3);
}

export async function scrollStickyZoneToProgress(
  page: Page,
  zone: Locator,
  progress: number,
) {
  const geometry = await zone.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    return {
      top: window.scrollY + htmlElement.getBoundingClientRect().top,
      height: htmlElement.offsetHeight,
    };
  });

  await page.evaluate(
    ({ top, height, targetProgress }) => {
      window.scrollTo({
        top: top + height * targetProgress,
        behavior: "instant",
      });
    },
    { ...geometry, targetProgress: progress },
  );
  await waitForAnimationFrames(page, 4);
}

export async function getSectionTop(page: Page, sectionId: string) {
  return page.evaluate((id) => {
    const section = document.getElementById(id);
    return section ? section.getBoundingClientRect().top : null;
  }, sectionId);
}
