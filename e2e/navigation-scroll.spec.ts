import { test, expect, type Page } from "@playwright/test";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Must match LAYOUT.navScrollOffset in utilities/constants.ts */
const NAV_OFFSET = 80;

/** Acceptable px drift when asserting section positioning. */
const OFFSET_TOLERANCE = 20;

/** Nav link label → section id mapping (top-to-bottom DOM order). */
const NAV_SECTIONS = [
  { label: "Nurse", sectionId: "act-nurse" },
  { label: "Engineer", sectionId: "act-engineer" },
  { label: "Leader", sectionId: "act-leader" },
  { label: "Builder", sectionId: "act-builder" },
  { label: "Methods", sectionId: "methods" },
  { label: "Contact", sectionId: "contact" },
] as const;

/** Methods panel labels in order. Must match METHOD_GROUPS in data/methods.ts */
const METHOD_PANELS = [
  "How I think",
  "How I build",
  "How I lead",
  "How I ship",
  "What I know",
] as const;

const PANEL_COUNT = METHOD_PANELS.length;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Poll scrollY until it stays within ±2px for `stableMs`.
 * Returns the final settled scrollY.
 */
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

/** Scroll enough to make the fixed nav bar appear, then wait for it. */
async function ensureNavVisible(page: Page) {
  // The nav appears after scrolling past 75% of the viewport.
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  await expect(page.locator("nav")).toBeVisible({ timeout: 5_000 });
}

/** Click a nav link by its visible text label and wait for scroll to settle. */
async function clickNavLink(page: Page, label: string) {
  const link = page.locator(`nav a`, { hasText: new RegExp(`^${label}$`, "i") });
  await expect(link).toBeVisible({ timeout: 3_000 });
  await link.click();
  await waitForScrollSettle(page);
}

/** Return getBoundingClientRect().top for a section by its id. */
async function getSectionTop(page: Page, sectionId: string): Promise<number> {
  return page.evaluate(
    (id) => document.getElementById(id)?.getBoundingClientRect().top ?? NaN,
    sectionId,
  );
}

/**
 * For the Methods section, return an object with:
 *  - progress: the scroll-based progress value (0..1)
 *  - activePanelIndex: which panel is "active" (highest opacity)
 *  - visibleLabel: the h2 text of the most-visible panel
 */
async function getMethodsState(page: Page) {
  return page.evaluate(() => {
    const outer = document.querySelector<HTMLElement>(
      "#methods > div:first-child",
    );
    if (!outer) return { progress: -1, activePanelIndex: -1, visibleLabel: "" };

    const rect = outer.getBoundingClientRect();
    const scrollable = outer.offsetHeight - window.innerHeight;
    const methodsOffset = 80; // matches NAV_OFFSET
    const p =
      scrollable > 0
        ? Math.max(0, Math.min(1, -(rect.top - methodsOffset) / scrollable))
        : 0;

    // Find the panel with the highest opacity.
    const sticky = outer.querySelector<HTMLElement>('[style*="sticky"]');
    if (!sticky)
      return { progress: p, activePanelIndex: -1, visibleLabel: "" };

    // Panels are the absolutely-positioned children of the motion wrapper.
    const motionWrapper = sticky.children[1] as HTMLElement | undefined; // [0] is SectionGlow
    if (!motionWrapper)
      return { progress: p, activePanelIndex: -1, visibleLabel: "" };

    let maxOpacity = -1;
    let bestIndex = -1;
    let bestLabel = "";
    for (let i = 0; i < motionWrapper.children.length; i++) {
      const panel = motionWrapper.children[i] as HTMLElement;
      const opacity = parseFloat(getComputedStyle(panel).opacity);
      if (opacity > maxOpacity) {
        maxOpacity = opacity;
        bestIndex = i;
        const h2 = panel.querySelector("h2");
        bestLabel = h2?.textContent?.trim() ?? "";
      }
    }

    return {
      progress: p,
      activePanelIndex: bestIndex,
      visibleLabel: bestLabel,
    };
  });
}

/**
 * Record which desktop nav label owns the active dot over a short window.
 * The recorder deduplicates consecutive repeats.
 */
async function startNavHighlightRecorder(page: Page, durationMs = 3_000) {
  await page.evaluate((duration) => {
    const labels: string[] = [];
    let intervalId: number | null = null;

    const sample = () => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("nav a"));
      const active = links.find((link) => link.querySelector("span.rounded-full"));
      const label = active?.textContent?.trim() ?? "";
      if (label && labels[labels.length - 1] !== label) {
        labels.push(label);
      }
    };

    sample();
    intervalId = window.setInterval(sample, 20);

    window.setTimeout(() => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    }, duration);

    (window as typeof window & { __navHighlightLabels?: string[] }).__navHighlightLabels =
      labels;
  }, durationMs);
}

async function getRecordedNavHighlightLabels(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const data = (window as typeof window & { __navHighlightLabels?: string[] })
      .__navHighlightLabels;
    return Array.isArray(data) ? data : [];
  });
}

/* ------------------------------------------------------------------ */
/*  Setup: load page once per test                                     */
/* ------------------------------------------------------------------ */

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  // Give Framer Motion entrance animations time to finish.
  await page.waitForTimeout(800);
});

/* ================================================================== */
/*  Suite 1: Nav → Section scroll positioning                          */
/* ================================================================== */

test.describe("Suite 1: Nav click positions each section correctly", () => {
  for (const { label, sectionId } of NAV_SECTIONS) {
    test(`clicking "${label}" positions #${sectionId} at ~${NAV_OFFSET}px from top`, async ({
      page,
    }) => {
      await ensureNavVisible(page);
      await clickNavLink(page, label);

      const top = await getSectionTop(page, sectionId);
      expect(top).toBeGreaterThan(NAV_OFFSET - OFFSET_TOLERANCE);
      expect(top).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE);
    });
  }
});

/* ================================================================== */
/*  Suite 2: Cross-section transitions                                 */
/* ================================================================== */

test.describe("Suite 2: Cross-section transitions land correctly", () => {
  const transitions: [string, string, string][] = [
    // [from label, to label, to sectionId]
    ["Contact", "Methods", "methods"],
    ["Methods", "Contact", "contact"],
    ["Nurse", "Methods", "methods"],
    ["Methods", "Nurse", "act-nurse"],
    ["Builder", "Methods", "methods"],
    ["Nurse", "Contact", "contact"],
    ["Contact", "Nurse", "act-nurse"],
  ];

  for (const [from, to, toId] of transitions) {
    test(`${from} → ${to}: #${toId} at correct offset`, async ({ page }) => {
      await ensureNavVisible(page);

      // Navigate to "from" first.
      await clickNavLink(page, from);

      // Now navigate to "to".
      await clickNavLink(page, to);

      const top = await getSectionTop(page, toId);
      expect(top).toBeGreaterThan(NAV_OFFSET - OFFSET_TOLERANCE);
      expect(top).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE);
    });
  }
});

/* ================================================================== */
/*  Suite 2b: Nav highlight transition                                 */
/* ================================================================== */

test.describe("Suite 2b: Nav highlight moves directly to clicked item", () => {
  test("Nurse -> Leader does not pass through Engineer", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Nurse");

    await startNavHighlightRecorder(page, 3_200);
    await clickNavLink(page, "Leader");
    await page.waitForTimeout(300);

    const labels = await getRecordedNavHighlightLabels(page);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBe("Nurse");
    expect(labels[labels.length - 1]).toBe("Leader");

    const intermediate = labels.slice(1, -1);
    expect(
      intermediate,
      `Highlight should move directly Nurse -> Leader, but passed through: ${intermediate.join(", ")}`,
    ).toEqual([]);
  });

  test("Leader -> Contact does not pass through Methods", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Leader");

    await startNavHighlightRecorder(page, 3_200);
    await clickNavLink(page, "Contact");
    await page.waitForTimeout(300);

    const labels = await getRecordedNavHighlightLabels(page);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBe("Leader");
    expect(labels[labels.length - 1]).toBe("Contact");

    const intermediate = labels.slice(1, -1);
    expect(
      intermediate,
      `Highlight should move directly Leader -> Contact, but passed through: ${intermediate.join(", ")}`,
    ).toEqual([]);
  });

  test("Builder -> Nurse does not pass through intermediate acts", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Builder");

    await startNavHighlightRecorder(page, 3_200);
    await clickNavLink(page, "Nurse");
    await page.waitForTimeout(300);

    const labels = await getRecordedNavHighlightLabels(page);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBe("Builder");
    expect(labels[labels.length - 1]).toBe("Nurse");

    const intermediate = labels.slice(1, -1);
    expect(
      intermediate,
      `Highlight should move directly Builder -> Nurse, but passed through: ${intermediate.join(", ")}`,
    ).toEqual([]);
  });
});

/* ================================================================== */
/*  Suite 2b-scroll: Smooth scroll does not stall at Methods            */
/* ================================================================== */

test.describe("Suite 2b-scroll: Smooth scroll does not stall at Methods", () => {
  test("Nurse -> Contact scroll does not reverse or stall in Methods region", async ({
    page,
  }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Nurse");

    // Get the Methods section boundaries.
    const methodsBounds = await page.evaluate(() => {
      const el = document.getElementById("methods");
      if (!el) return null;
      return {
        top: window.scrollY + el.getBoundingClientRect().top,
        bottom:
          window.scrollY +
          el.getBoundingClientRect().top +
          el.offsetHeight,
      };
    });
    expect(methodsBounds).not.toBeNull();

    // Install a scroll position recorder before clicking Contact.
    await page.evaluate(() => {
      const positions: { y: number; t: number }[] = [];
      const start = performance.now();
      const handler = () => {
        positions.push({ y: window.scrollY, t: performance.now() - start });
      };
      window.addEventListener("scroll", handler, { passive: true });
      (window as any).__scrollTrace = positions;
      (window as any).__scrollTraceCleanup = () =>
        window.removeEventListener("scroll", handler);
    });

    // Click Contact (don't use clickNavLink — we need the raw scroll).
    const link = page.locator("nav a", { hasText: /^Contact$/i });
    await link.click();
    await waitForScrollSettle(page, { stableMs: 600 });

    // Retrieve and clean up.
    const trace = await page.evaluate(() => {
      const data = (window as any).__scrollTrace as
        | { y: number; t: number }[]
        | undefined;
      const cleanup = (window as any).__scrollTraceCleanup;
      if (cleanup) cleanup();
      return Array.isArray(data) ? data : [];
    });

    expect(trace.length).toBeGreaterThan(0);

    // 1. Check for scroll reversals (direction should be monotonically down).
    let reversals = 0;
    for (let i = 2; i < trace.length; i++) {
      const dy = trace[i].y - trace[i - 1].y;
      const dyPrev = trace[i - 1].y - trace[i - 2].y;
      // A reversal is when the scroll was going down and suddenly goes up
      // by more than a trivial amount (>5px rules out sub-pixel jitter).
      if (dyPrev > 5 && dy < -5) {
        reversals++;
      }
    }
    expect(
      reversals,
      `Scroll reversed direction ${reversals} time(s) — likely Methods snap interference`,
    ).toBe(0);

    // 2. Check that scroll didn't stall in the Methods region.
    // A "stall" = scrollY stays within the Methods region for > 500ms.
    const methodsTop = methodsBounds!.top;
    const methodsBottom = methodsBounds!.bottom;
    let methodsEntryTime: number | null = null;
    let maxMethodsDwell = 0;

    for (const { y, t } of trace) {
      const inMethods = y >= methodsTop - 200 && y <= methodsBottom + 200;
      if (inMethods) {
        if (methodsEntryTime === null) methodsEntryTime = t;
        maxMethodsDwell = t - methodsEntryTime;
      } else {
        methodsEntryTime = null;
      }
    }

    // Methods is ~300vh, so the scroll passes through it. But it should not
    // STALL there. Allow generous time for the scroll animation to traverse
    // but fail if it dwells for over 2 seconds (indicates snap interference).
    expect(
      maxMethodsDwell,
      `Scroll stalled in Methods region for ${Math.round(maxMethodsDwell)}ms`,
    ).toBeLessThan(2000);

    // 3. Final position: Contact should be at the correct offset.
    const contactTop = await getSectionTop(page, "contact");
    expect(contactTop).toBeGreaterThan(NAV_OFFSET - OFFSET_TOLERANCE);
    expect(contactTop).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE);
  });
});

/* ================================================================== */
/*  Suite 2c: Mobile nav shows highlight before closing                 */
/* ================================================================== */

test.describe("Suite 2c: Mobile nav highlight visible before menu closes", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("tapping Builder while on Nurse highlights Builder before menu closes", async ({
    page,
  }) => {
    await ensureNavVisible(page);

    const hamburger = page.locator("nav button[aria-label]");

    // Open mobile menu and tap Nurse.
    await hamburger.click();
    const nurseLink = page.locator("nav a", { hasText: /^Nurse$/i }).last();
    await expect(nurseLink).toBeVisible({ timeout: 5_000 });
    await nurseLink.click();
    await waitForScrollSettle(page);

    // Re-open mobile menu.
    await hamburger.click();
    const builderLink = page.locator("nav a", { hasText: /^Builder$/i }).last();
    await expect(builderLink).toBeVisible({ timeout: 5_000 });

    // Record Builder link color before tap.
    const colorBefore = await builderLink.evaluate(
      (el) => getComputedStyle(el).color,
    );

    await builderLink.click();

    // Wait for React to render active state, but less than the 200ms close delay.
    await page.waitForTimeout(80);

    const menuStillVisible = await builderLink.isVisible();
    expect(menuStillVisible, "Mobile menu should still be open").toBe(true);

    const colorAfter = await builderLink.evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(
      colorAfter,
      "Builder link color should change to active color before menu closes",
    ).not.toBe(colorBefore);
  });
});

/* ================================================================== */
/*  Suite 3: Methods panel nav — position stability (Bug 1)            */
/* ================================================================== */

test.describe("Suite 3: Methods panel clicks do not cause position drift", () => {
  test("clicking panels lands at correct progress without drift", async ({
    page,
  }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Methods");

    // Record baseline scrollY for panel 0.
    const baselineY = await page.evaluate(() => window.scrollY);
    const state0 = await getMethodsState(page);
    expect(state0.visibleLabel).toBe("How I think");
    expect(state0.progress).toBeLessThan(0.05);

    // Click each panel in order and verify progress + visible label.
    for (let i = 1; i < PANEL_COUNT; i++) {
      const panelLabel = METHOD_PANELS[i];

      // Use page.evaluate to click the correct button, since overlapping
      // panels have duplicate buttons with pointerEvents: "none".
      await page.evaluate((label) => {
        const btns = document.querySelectorAll<HTMLElement>("#methods button");
        for (const btn of btns) {
          if (
            btn.textContent?.trim() === label &&
            getComputedStyle(btn.closest('[style*="pointer-events"]') ?? btn)
              .pointerEvents !== "none"
          ) {
            btn.click();
            return;
          }
        }
      }, panelLabel);
      await waitForScrollSettle(page);

      const state = await getMethodsState(page);
      const expectedProgress = i / (PANEL_COUNT - 1);
      expect(state.progress).toBeGreaterThan(expectedProgress - 0.15);
      expect(state.progress).toBeLessThan(expectedProgress + 0.15);
      expect(state.visibleLabel).toBe(panelLabel);
    }

    // Click back to panel 0 and verify scrollY returns to baseline (no drift).
    const btn0 = page.locator("#methods button", {
      hasText: new RegExp(`^${METHOD_PANELS[0]}$`),
    });
    await btn0.first().click();
    await waitForScrollSettle(page);

    const returnY = await page.evaluate(() => window.scrollY);
    expect(Math.abs(returnY - baselineY)).toBeLessThan(15);

    const stateReturn = await getMethodsState(page);
    expect(stateReturn.visibleLabel).toBe("How I think");
    expect(stateReturn.progress).toBeLessThan(0.05);
  });

  test("repeated panel 0 click from panel 0 does not shift position", async ({
    page,
  }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Methods");
    const y1 = await page.evaluate(() => window.scrollY);

    // Click "How I think" (already active panel) — should be a no-op.
    const btn = page.locator("#methods button", {
      hasText: /^How I think$/,
    });
    await btn.first().click();
    await waitForScrollSettle(page);

    const y2 = await page.evaluate(() => window.scrollY);
    expect(Math.abs(y2 - y1)).toBeLessThan(10);
  });
});

/* ================================================================== */
/*  Suite 4: Methods no-replay on nav transition (Bug 2)               */
/* ================================================================== */

test.describe("Suite 4: Contact → Methods does not cycle through panels", () => {
  test("only panel 0 is active after Contact → Methods", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Contact");

    // Install a scroll observer BEFORE clicking Methods.
    // It records every activePanelIndex seen during the scroll.
    await page.evaluate(() => {
      const seen = new Set<number>();
      (window as any).__panelsSeen = seen;

      const observer = () => {
        const outer = document.querySelector<HTMLElement>(
          "#methods > div:first-child",
        );
        if (!outer) return;
        const sticky = outer.querySelector<HTMLElement>('[style*="sticky"]');
        if (!sticky) return;
        const motionWrapper = sticky.children[1] as HTMLElement | undefined;
        if (!motionWrapper) return;

        let maxOpacity = -1;
        let bestIndex = -1;
        for (let i = 0; i < motionWrapper.children.length; i++) {
          const panel = motionWrapper.children[i] as HTMLElement;
          const opacity = parseFloat(getComputedStyle(panel).opacity);
          if (opacity > maxOpacity) {
            maxOpacity = opacity;
            bestIndex = i;
          }
        }
        if (bestIndex >= 0 && maxOpacity > 0.5) {
          seen.add(bestIndex);
        }
      };

      (window as any).__panelObserverCleanup = () => {
        window.removeEventListener("scroll", observer);
      };
      window.addEventListener("scroll", observer, { passive: true });
    });

    // Now navigate to Methods.
    await clickNavLink(page, "Methods");

    // Retrieve which panels were seen as active during the transition.
    const panelsSeen = await page.evaluate(() =>
      Array.from((window as any).__panelsSeen as Set<number>),
    );

    // Clean up.
    await page.evaluate(() => {
      const cleanup = (window as any).__panelObserverCleanup;
      if (cleanup) cleanup();
    });

    // Panel 0 should be the only one active at the end.
    // During the scroll, intermediate panels should NOT have become active.
    const state = await getMethodsState(page);
    expect(state.visibleLabel).toBe("How I think");
    expect(state.activePanelIndex).toBe(0);

    // The seen set should ideally only contain panel 0.
    // At worst, it might briefly flash the last-seen panel, but
    // panels 1-3 should NEVER have appeared as the active panel.
    const unexpectedPanels = panelsSeen.filter((i) => i !== 0 && i !== PANEL_COUNT - 1);
    expect(
      unexpectedPanels,
      `Intermediate panels ${unexpectedPanels} should not have become active during Contact → Methods scroll`,
    ).toEqual([]);
  });

  test("Nurse → Methods does not cycle through panels", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Nurse");

    // Install observer.
    await page.evaluate(() => {
      const seen = new Set<number>();
      (window as any).__panelsSeen = seen;
      const observer = () => {
        const outer = document.querySelector<HTMLElement>(
          "#methods > div:first-child",
        );
        if (!outer) return;
        const sticky = outer.querySelector<HTMLElement>('[style*="sticky"]');
        if (!sticky) return;
        const motionWrapper = sticky.children[1] as HTMLElement | undefined;
        if (!motionWrapper) return;
        let maxOpacity = -1;
        let bestIndex = -1;
        for (let i = 0; i < motionWrapper.children.length; i++) {
          const panel = motionWrapper.children[i] as HTMLElement;
          const opacity = parseFloat(getComputedStyle(panel).opacity);
          if (opacity > maxOpacity) {
            maxOpacity = opacity;
            bestIndex = i;
          }
        }
        if (bestIndex >= 0 && maxOpacity > 0.5) {
          seen.add(bestIndex);
        }
      };
      (window as any).__panelObserverCleanup = () =>
        window.removeEventListener("scroll", observer);
      window.addEventListener("scroll", observer, { passive: true });
    });

    await clickNavLink(page, "Methods");

    const panelsSeen = await page.evaluate(() =>
      Array.from((window as any).__panelsSeen as Set<number>),
    );
    await page.evaluate(() => {
      const cleanup = (window as any).__panelObserverCleanup;
      if (cleanup) cleanup();
    });

    const state = await getMethodsState(page);
    expect(state.visibleLabel).toBe("How I think");

    // Only panel 0 should have been seen (Nurse is above Methods,
    // scroll goes downward — shouldn't pass through panels at all).
    const unexpectedPanels = panelsSeen.filter((i) => i !== 0);
    expect(
      unexpectedPanels,
      `Panels ${unexpectedPanels} should not have appeared during Nurse → Methods`,
    ).toEqual([]);
  });
});

/* ================================================================== */
/*  Suite 5: Methods snap consistency                                   */
/* ================================================================== */

test.describe("Suite 5: Methods snap settles at exact panel positions", () => {
  test("manual scroll between panels snaps to nearest panel", async ({
    page,
  }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Methods");

    // Scroll to a position ~30% between panel 0 and panel 1.
    const scrollInfo = await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "#methods > div:first-child",
      );
      if (!outer) return null;
      const scrollable = outer.offsetHeight - window.innerHeight;
      const panelScrollH = scrollable / 4; // 5 panels → 4 intervals
      // Target: 30% into the first interval → should snap to panel 0.
      const targetY =
        window.scrollY + outer.getBoundingClientRect().top - 80 + panelScrollH * 0.3;
      window.scrollTo({ top: targetY, behavior: "instant" });
      return { targetY, scrollable, panelScrollH };
    });

    expect(scrollInfo).not.toBeNull();

    // Wait for the snap timeout (150ms) + settle.
    await waitForScrollSettle(page, { stableMs: 600 });

    const state = await getMethodsState(page);
    // 0.3 is closer to 0 than to 1, so it should snap to panel 0.
    expect(state.activePanelIndex).toBe(0);
    expect(state.progress).toBeLessThan(0.15);
  });

  test("manual scroll past midpoint snaps to next panel", async ({ page }) => {
    await ensureNavVisible(page);
    await clickNavLink(page, "Methods");

    await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "#methods > div:first-child",
      );
      if (!outer) return;
      const scrollable = outer.offsetHeight - window.innerHeight;
      const panelScrollH = scrollable / 4;
      // Target: 65% into the first interval → should snap to panel 1.
      const targetY =
        window.scrollY + outer.getBoundingClientRect().top - 80 + panelScrollH * 0.65;
      window.scrollTo({ top: targetY, behavior: "instant" });
    });

    await waitForScrollSettle(page, { stableMs: 600 });

    const state = await getMethodsState(page);
    // 0.65 of the first interval maps to p ≈ 0.163 → closest panel = 1.
    expect(state.activePanelIndex).toBe(1);
    expect(state.visibleLabel).toBe("How I build");
  });
});

/* ================================================================== */
/*  Suite 6: Hash navigation                                           */
/* ================================================================== */

test.describe("Suite 6: Hash-based navigation", () => {
  test("loading /#methods positions Methods correctly", async ({ page }) => {
    await page.goto("/#methods", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await waitForScrollSettle(page);

    const top = await getSectionTop(page, "methods");
    expect(top).toBeGreaterThan(NAV_OFFSET - OFFSET_TOLERANCE);
    expect(top).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE);
  });

  test("loading /#contact positions Contact on screen", async ({ page }) => {
    await page.goto("/#contact", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await waitForScrollSettle(page);

    // Contact is the last section — it may not reach exactly NAV_OFFSET
    // because there isn't enough content below. Accept that it's visible
    // and near the top of the viewport.
    const top = await getSectionTop(page, "contact");
    expect(top).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE);
    expect(top).toBeGreaterThan(-100);
  });

  test("browser back from Contact → Methods returns to Methods", async ({
    page,
  }) => {
    await ensureNavVisible(page);

    // Navigate Methods → Contact (creates history entries).
    await clickNavLink(page, "Methods");
    await clickNavLink(page, "Contact");

    // Press browser back — popstate fires async, give it time.
    await page.goBack();
    await page.waitForTimeout(500);
    await waitForScrollSettle(page, { stableMs: 800 });

    const top = await getSectionTop(page, "methods");
    // popstate + smooth scroll — accept that Methods is near the viewport top.
    expect(top).toBeGreaterThan(-50);
    expect(top).toBeLessThan(NAV_OFFSET + OFFSET_TOLERANCE * 2);
  });
});
