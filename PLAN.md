# Plan: Option C Wheel Hijack for Methods + Portrait Section

## Task 1: Portrait Section (Between Hero and Philosophy)

### Approach
Add a cinematic portrait section with `kaschief.jpg` and intro text. Placed between Hero and Philosophy. Not a navigable section (no nav link, no `SECTION_ID`).

### Files to create

**`features/portrait/ui/portrait.tsx`** — Client component:
- Full-width section with cinematic framing
- Next.js `Image` component with `kaschief.jpg` (`/images/kaschief.jpg`)
- Subtle parallax on the image (scroll-driven y-transform)
- Intro text alongside/below the photo (brief tagline or paragraph)
- Uses existing motion primitives (`FadeUp`, `FadeIn`)
- Follows existing section patterns (CSS variables, page-gutter, etc.)

**`features/portrait/public-api.ts`** — Barrel export

### Files to modify

**`features/home/ui/home-page.client.tsx`** — Import and render `<Portrait />` between `<Hero />` and `<Philosophy />`

---

## Task 2: Option C — Wheel/Swipe Hijack for Methods (Desktop)

### Problem
Current approach uses a tall outer div (~280vh) with a sticky inner container. Scroll position within the tall div drives panel progress. This causes the **re-traversal problem** — scrolling back up requires traversing all the extra height again.

### Approach
Replace the tall-wrapper approach with **wheel event hijacking**. The section becomes a regular 100vh element. When it's in view, wheel events are intercepted and translated into horizontal panel transitions. Vertical scroll only resumes when the user scrolls past the last or first panel.

### Changes

**`features/methods/ui/methods.tsx`** — Major rewrite of desktop scroll logic:
- Remove the tall outer div (`height: 280vh`) and sticky container
- Section becomes a single `100vh` div (no extra page height)
- Add `wheel` event listener with `preventDefault()` when section is "capturing"
- Track internal panel index + accumulated wheel delta
- Snap to panels after wheel delta exceeds a threshold
- Entry: when section is fully in viewport and user scrolls down → start capturing wheel events
- Exit conditions:
  - On panel 0 + scroll up → release, let page scroll normally
  - On last panel + scroll down → release, let page scroll normally
- Coordinate with `NAVIGATION_SCROLL_EVENT` — skip capture during nav-initiated scrolls
- Mobile stays exactly the same (tab-based, untouched)

**`utilities/constants.ts`** — Remove `methodsPanelVh` (no longer needed, tall wrapper is gone)

**`e2e/methods-jump.spec.ts`** — Update tests: current tests assert scroll positions within the tall wrapper. With Option C there's no tall wrapper, so the test mechanics change (panel clicks no longer change `scrollY`, they change internal panel state).

**Nav integration** — Since the section no longer has extra height, `scrollToSection("methods")` is a regular scroll-to-element. The `NAVIGATION_SCROLL_EVENT` listener in Methods still works but simplifies: instead of hiding the sticky content during pass-through, it just needs to skip wheel capture during nav scroll.

### Key details for the wheel hijack
- Use `IntersectionObserver` to detect when Methods is fully in viewport (threshold ~0.95)
- Accumulate `event.deltaY` — when it exceeds a threshold (e.g. 80px), advance/retreat one panel
- `event.preventDefault()` stops the page from scrolling while capturing
- After releasing (scroll past boundaries), need a cooldown before re-capturing to prevent oscillation
- Touch events: listen for `touchstart`/`touchmove` to handle trackpad swipe on desktop

---

## Execution Order
1. Portrait section first (simpler, no breaking changes)
2. Methods Option C rewrite (more complex, touches scroll infrastructure)
3. Update e2e tests
4. Visual verification via preview
