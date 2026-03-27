# Architecture Audit — Execution Plan

Each phase is a discrete, testable refactor. Commit after each. Test after each.

---

## Phase 1 — Font Loading (CQ-1)

**Impact:** LCP/FCP, bundle size
**Risk:** Low

- Create route group `app/(lab)/` for all lab routes
- Move 32 experimental fonts from root `layout.tsx` to `app/(lab)/layout.tsx`
- Root layout keeps only: Inter, Playfair Display, Urbanist, Crimson Pro
- Move lab routes into `app/(lab)/`: lab, lab-sankey, lab-particles, lab-lenses, lab-pillars, lab-wordtype, legacy-engineer, act-ii (standalone)

**Test:** Load production page → DevTools Network → verify only 4 font families requested. Load a lab page → verify experimental fonts load there.

---

## Phase 2 — ESLint Setup (DX-1)

**Impact:** Code quality foundation
**Risk:** Low (may surface lint errors to fix)

- Add `eslint.config.mjs` (flat config)
- Rules: `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- Integrate with existing Prettier (eslint-config-prettier)
- Fix any auto-fixable issues
- Add to `predev` script alongside `check:rules`

**Test:** `pnpm lint` runs clean. Intentionally break an exhaustive-deps rule → verify it catches it.

---

## Phase 3 — Pre-commit Hooks (DX-2)

**Impact:** Quality gate
**Risk:** Low

- Add Husky + lint-staged
- Pre-commit runs: `tsc --noEmit`, `pnpm check:rules`, `eslint` on staged files
- Verify it blocks a bad commit

**Test:** Stage a file with a type error → commit should fail. Stage a clean file → commit should pass.

---

## Phase 4 — Fix Dependency Direction (ARC-1)

**Impact:** Architectural integrity
**Risk:** Medium (file moves, import rewiring)

Move these out of `app/` into proper modules:

- `app/lab-artifacts/render-card.tsx` → `components/ui/render-card/` or into Act II
- `app/sankey-data.ts` → `data/sankey.ts`
- `app/lab-nav.tsx` → `components/layout/lab-nav.tsx`

Update all imports. Add rule to `check-architecture.mjs` disallowing `@app/` imports from `features/`.

**Test:** `pnpm check` passes. `pnpm dev` → navigate all acts, verify no broken imports. Lab pages still work.

---

## Phase 5 — Resolve Act II Legacy (ARC-3)

**Impact:** Naming clarity, dead code reduction
**Risk:** Medium

- Determine which pieces from `act-ii-legacy/` are still needed
- Extract those pieces into shared modules (e.g., `CommitEntry`, `WordDistillation`, `ScrambleText`)
- Update `legacy-engineer/page.tsx` to import from shared
- Remove `act-ii-legacy/` from the acts barrel export
- Clean up `features/timeline/public-api.ts`

**Test:** `/legacy-engineer` still renders. Main page timeline renders Act II (new). No `act-ii-legacy` in barrel.

---

## Phase 6 — Act II Subdirectory Organization (CQ-2)

**Impact:** Maintainability, interview readability
**Risk:** Low (internal restructure, no behavior change)

Reorganize `features/timeline/ui/acts/act-ii/`:

```
act-ii/
  index.ts
  act-ii.tsx              (orchestrator)
  act-ii.constants.ts     (runtime constants, extracted from act-ii.types.ts)
  act-ii.types.ts         (types only)
  act-ii.data.tsx          (content)
  convergence/
    use-convergence.tsx
  particles/
    use-particle-funnel.tsx
  terminal/
    use-terminal-replay.tsx
    terminal-data.ts
  lenses/
    use-lenses.tsx
    lenses.config.ts
    lenses.timing.ts
    lenses.types.ts
    card-config.tsx
    story-desk.tsx
  math.ts
```

**Test:** All pages render. `pnpm check` passes. No behavior changes.

---

## Phase 7 — Accessibility: prefers-reduced-motion (A11Y-1)

**Impact:** Accessibility compliance, interview signal
**Risk:** Medium (touches many animation codepaths)

- Create `useReducedMotion()` hook (or use Framer Motion's built-in)
- Thread through component tree:
  - Disable parallax/scroll-linked opacity in `SectionTransition`
  - Skip scramble text → show final text immediately
  - Disable canvas particle animation → show static SVG funnel
  - Reduce/disable Lenis smooth scroll override
  - Disable film grain CSS animation
- Add `@media (prefers-reduced-motion: reduce)` to CSS keyframes

**Test:** macOS → System Preferences → Accessibility → Reduce Motion. Reload site → verify no scroll-linked animation, no parallax, static text. Content still readable and navigable.

---

## Phase 8 — Accessibility: Skip Navigation + Landmarks (A11Y-2, A11Y-3)

**Impact:** Keyboard navigation, screen reader UX
**Risk:** Low

- Add skip-to-content link in `layout.tsx` (visually hidden until focused)
- Add `role` and `aria-label` to Act II sections
- Add keyboard handlers to interactive Act II elements (story desk cards)
- Verify tab order through the page

**Test:** Tab from top of page → skip link appears → Enter → jumps to content. Screen reader announces section names.

---

## Phase 9 — TypeScript Strictness (TS-1)

**Impact:** Type safety
**Risk:** Medium (may surface many indexed-access errors)

- Enable `noUncheckedIndexedAccess: true` in tsconfig
- Fix all errors with proper bounds checks or documented assertions
- Fix remaining implicit `any` types in `use-particle-funnel.tsx`

**Test:** `pnpm check` passes with zero errors.

---

## Phase 10 — Act II Tests (TEST-1)

**Impact:** Test coverage for most complex module
**Risk:** Low

Priority test targets:

1. `act-ii.constants.ts` (once extracted) — verify timing chain: no phase overlaps, no gaps, CONTAINER_VH derived correctly
2. `math.ts` — `smoothstep`, `lerp`, `clamp` pure function tests
3. Lenses timing — `CINEMATIC_START`, `TOTAL_RAW_SIZE`, `PROLOGUE` derivation
4. Data contracts — `CONTENT` has all required fields, `COMPANY_ROLES` array length matches expected

**Test:** `pnpm test` → all new tests pass. Coverage for act-ii/ goes from 0% to meaningful.

---

## Phase 11 — Performance Polish (PERF-1, PERF-3, PERF-4)

**Impact:** Runtime performance, interview talking points
**Risk:** Low

- Add `will-change: transform` to animated elements (sticky viewports, parallax wrappers)
- Dynamic import GSAP/ScrollTrigger in hooks that use them
- Add `prefers-reduced-motion` guard to film grain CSS
- Consider documenting OffscreenCanvas decision for canvas particles

**Test:** Lighthouse performance score. DevTools Performance tab → verify no layout thrashing during scroll.

---

## Phase 12 — Modern API Opportunities (MOD-1, MOD-2)

**Impact:** Interview talking points, future-proofing
**Risk:** Low (progressive enhancement)

- Replace simple `SectionTransition` fade-in with CSS `animation-timeline: scroll()`
- Document GSAP vs Framer Motion decision in a brief ADR
- Consider View Transitions API for lab route navigation

**Test:** Remove JS-driven fade on `SectionTransition` → verify CSS scroll-driven animation works in Chrome. Fallback gracefully in Safari.

---

## Phase 13 — Final Polish (CQ-4, CQ-5, DX-4, TS-2)

**Impact:** Professional finish
**Risk:** Minimal

- Fix `package.json` name: `"my-project"` → `"kaschief-by-kash"`
- Remove `console.log` from e2e test
- Expand `.prettierrc` with explicit settings
- Replace `font-mono` class usage with `font-ui` where semantic
- Final sweep for stale comments, TODO items, dead imports

**Test:** Full site walkthrough on desktop + mobile. All routes render. All tests pass. Lint clean.

---

## Completion Criteria

All phases done when:

- `pnpm check` — zero errors
- `pnpm lint` — zero errors
- `pnpm test` — all tests pass
- Lighthouse Performance ≥ 90, Accessibility ≥ 95
- `prefers-reduced-motion` fully honored
- No `@app/` imports from `features/`
- Act II organized into subdirectories with tests
- Only 4 fonts loaded on production pages
