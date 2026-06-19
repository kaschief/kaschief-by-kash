# Testing Strategy

This repo uses a layered testing strategy:

- Vitest covers pure data, model, constants, and transformation logic.
- Playwright covers user-visible behavior: navigation, scroll journeys, dialogs, responsive views, and keyboard interactions.
- App code exposes semantic contracts first, then `data-testid` only for animation-heavy surfaces that have no useful accessible role.

## Locator Policy

Use locators in this order:

1. `getByRole(..., { name })` for links, buttons, headings, regions, dialogs, and articles.
2. `getByText()` for non-interactive copy, scoped inside a page object section.
3. `getByTestId()` for sticky zones, animation layers, canvas/SVG-like surfaces, and other visual-only nodes.
4. CSS locators only inside page objects when the app intentionally exposes a structural test contract such as `data-active`.

Specs should not reach directly for Tailwind classes, inline style fragments, or `nth()` unless the order itself is the behavior under test.

## Playwright Shape

Shared E2E code lives under `e2e/`:

- `fixtures/test.ts` exports the project `test` and `expect`.
- `pages/*.page.ts` and `*.component.ts` own locators and high-level user actions.
- `utils/scroll.ts` owns scroll settling and sticky-zone progress helpers.

Specs should read as scenarios:

```ts
test("opens a company story dialog", async ({ home, actII }) => {
  await home.goto();
  await actII.openStoryDesk();
  await actII.openCompanyStory("DKB");
  await expect(actII.storyDialog()).toContainText("user sees");
});
```

## Fixtures

The custom fixture layer creates page objects per test and adds an automatic runtime-error check. Any uncaught page error or browser console error fails the test that caused it.

Keep fixtures test-scoped unless setup is genuinely expensive and safe to share. Each test must be able to run alone.

## Scroll And Animation

Scroll-driven sections are tested through page object methods such as `scrollToChaos()` rather than repeated `page.evaluate()` blocks in specs. For deterministic scroll assertions:

- use app constants where they define the product contract;
- wait for scroll settling or animation frames, not arbitrary multi-second sleeps;
- assert viewport behavior with `toBeInViewport()` when the user-visible placement matters.

## Running

```bash
pnpm test
pnpm test:e2e
pnpm test:e2e:desktop
pnpm test:e2e:mobile
pnpm check
```

Playwright builds the app and runs against `next start` on a dedicated test port, then executes desktop and mobile Chromium projects. On CI, failed tests retry with trace collection; locally, failures keep screenshots and videos for inspection.

## CI

GitHub Actions runs the same layers as local development:

```bash
pnpm -s check
pnpm -s test
pnpm -s test:e2e
```

`pnpm check` runs `next typegen` before `tsc`, so route types are generated in clean environments before TypeScript validation.

The workflow uploads `playwright-report/` after every run and `test-results/` on failures, so failed screenshots, videos, and traces are available from the workflow artifacts.
