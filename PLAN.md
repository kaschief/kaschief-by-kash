# Plan: Comprehensive Playwright E2E Tests for Navigation & Scroll

## Setup

1. **Install Playwright** — `pnpm add -D @playwright/test` + `pnpm exec playwright install chromium`
2. **Create `playwright.config.ts`** — desktop viewport (1280x720), base URL `http://localhost:3000`, `webServer` config to auto-start the dev server
3. **Add scripts** to `package.json`: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`

## Test File: `e2e/navigation-scroll.spec.ts`

### Shared Helpers

- `waitForNavVisible(page)` — scroll past hero to make nav appear, wait for `nav` element
- `clickNavLink(page, label)` — click a nav link by text, wait for scroll to settle
- `waitForScrollSettle(page, timeout?)` — poll `window.scrollY` until stable for 500ms
- `getSectionRect(page, sectionId)` — returns `getBoundingClientRect()` for a `#sectionId` element
- `getMethodsProgress(page)` — evaluates the current Methods scroll progress `p` from the DOM
- `getVisibleMethodsPanel(page)` — returns which panel label is currently visible (opacity > 0.5)
- Constants: `NAV_OFFSET = 80`, `OFFSET_TOLERANCE = 15` (px)

### Test Suite 1: Nav → Section Scroll Positioning (6 tests)

For each nav-reachable section (`act-nurse`, `act-engineer`, `act-leader`, `act-builder`, `methods`, `contact`):
- Scroll past hero so nav is visible
- Click the nav link
- Wait for scroll to settle
- Assert: `section.getBoundingClientRect().top` is within `NAV_OFFSET ± OFFSET_TOLERANCE`

### Test Suite 2: Cross-Section Navigation (key transitions)

Test the specific transitions that are most likely to break:
- **Contact → Methods**: Assert Methods lands at correct offset, no intermediate panel flicker
- **Methods → Contact**: Assert Contact lands at correct offset
- **Act-Nurse → Methods**: Assert correct offset
- **Methods → Act-Nurse**: Assert correct offset (scrolling backwards past Methods)
- **Act-Builder → Methods**: Adjacent section transition

### Test Suite 3: Methods Panel Navigation (Bug 1 — position stability)

- Navigate to Methods via nav
- Record the `scrollY` after settle (this is "panel 0 position")
- Click panel nav button "How I build" (panel 1)
- Wait for scroll to settle
- Assert: `panelProgress` is close to 1.0 (within 0.15)
- Assert: visible panel label changed to "How I build"
- Click "How I think" (panel 0) again
- Wait for settle
- Assert: `scrollY` is within ±10px of the original "panel 0 position" — **no drift**
- Repeat for panels 2, 3, 4 — each should land at `panelProgress ≈ index`

### Test Suite 4: Methods No-Replay on Nav Transition (Bug 2)

- Navigate to Contact first
- Set up a **MutationObserver or scroll listener** that records which Methods panels become visible (opacity > 0.5) during the transition
- Click Methods nav link
- Wait for settle
- Assert: only panel 0 was visible at the end — intermediate panels (1, 2, 3, 4) were **never** the active panel during transit
- This is the core "no replay / no cycling" test

### Test Suite 5: Methods Panel Snap Consistency

- Manually scroll the page to land between two Methods panels (e.g., progress ~0.3)
- Wait for snap to settle
- Assert: snap landed at the nearest integer panel (`panelProgress ≈ 0` or `≈ 1`)
- Assert: `section.getBoundingClientRect().top` is consistent with `outerTop - offset + panel * panelScrollHeight`

### Test Suite 6: Hash Navigation

- Load page with `/#methods` — assert Methods section is at correct offset
- Load page with `/#contact` — assert Contact section is at correct offset
- Navigate to Methods, then Contact — press browser back — assert returns to Methods at correct offset

## Files Created

```
playwright.config.ts
e2e/
  navigation-scroll.spec.ts
```

## No Changes To

- Existing source code (no test IDs needed — tests use `#sectionId` and nav link text)
- Existing vitest setup
