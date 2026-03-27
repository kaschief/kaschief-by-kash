# Architecture Audit — Execution Plan

Each phase is a discrete, testable refactor. Commit after each. Test after each.

---

## Completed

### Phase 1 — Font Loading (CQ-1) [DONE]
### Phase 2 — ESLint Setup (DX-1) [DONE]
### Phase 3 — Pre-commit Hooks (DX-2) [DONE]
### Phase 8 — Accessibility: Skip Navigation + Landmarks (A11Y-2, A11Y-3) [DONE]
### Phase 14 — Final Polish (CQ-4, CQ-5, DX-4, TS-2) [DONE]

---

## In Progress

### Phase 4 — Fix Dependency Direction (ARC-1)

**Impact:** Architectural integrity
**Risk:** Medium (file moves, import rewiring)

Move these out of `app/` into proper modules:

- `app/lab-artifacts/render-card.tsx` → `components/ui/render-card/` or into Act II
- `app/sankey-data.ts` → `data/sankey.ts`
- `app/lab-nav.tsx` → `components/layout/lab-nav.tsx`

Update all imports. Add rule to `check-architecture.mjs` disallowing `@app/` imports from `features/`.

**Test:** `pnpm check` passes. `pnpm dev` → navigate all acts, verify no broken imports. Lab pages still work.

---

## Open

### Phase 5 — Resolve Act II Legacy (ARC-3)

**Impact:** Naming clarity, dead code reduction
**Risk:** Medium

- Determine which pieces from `act-ii-legacy/` are still needed
- Extract those pieces into shared modules (e.g., `CommitEntry`, `WordDistillation`, `ScrambleText`)
- Update `legacy-engineer/page.tsx` to import from shared
- Remove `act-ii-legacy/` from the acts barrel export
- Clean up `features/timeline/public-api.ts`

**Test:** `/legacy-engineer` still renders. Main page timeline renders Act II (new). No `act-ii-legacy` in barrel.

---

### Phase 6 — Act II Subdirectory Organization (CQ-2)

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

### Phase 7 — Accessibility: prefers-reduced-motion (A11Y-1) [DONE]

- Used Framer Motion's built-in `useReducedMotion()` hook
- CSS: `@media (prefers-reduced-motion: reduce)` disables all keyframes + film grain
- Act II: scramble text skips animation, shows final text immediately
- Act I: ticker animation disabled when reduced motion preferred

---

### Phase 9 — TypeScript Strictness (TS-1) [DEFERRED]

- `noUncheckedIndexedAccess` surfaces 232 errors — dedicated session needed
- Documented as TODO in tsconfig.json

---

### Phase 10 — Act II Tests (TEST-1) [DONE]

- `math.test.ts` — smoothstep, lerp, clamp (edge cases, monotonicity)
- `act-ii.types.test.ts` — timing chain invariants (ascending order, bounds, beats)
- `lenses.timing.test.ts` — prologue→curtain→cinematic ordering
- 160 tests passing (28 new)

---

### Phase 11 — Performance Polish (PERF-1) [DONE]

- `will-change: transform` added to all sticky viewports (Act I + Act II)
- Film grain CSS guarded by prefers-reduced-motion (Phase 7)

---

### Phase 12 — Modern API Opportunities (MOD-2) [DONE]

- JSDoc comment on SectionTransition noting CSS `animation-timeline: scroll()` opportunity
- Full implementation deferred (Safari support limited)

---

### Phase 13 — ESLint Zero Warnings (LINT-1) [PARTIAL]

Current state: 0 errors, 44 warnings.
- `no-useless-assignment` promoted to error (fixes applied)
- `preserve-manual-memoization` turned off (no React Compiler)
- 4 rules kept at "warn" with TODO comments explaining required refactoring:
  - `react-hooks/refs` (~20) — ref reads during render
  - `react-hooks/set-state-in-effect` (~4) — setState in useEffect
  - `react-hooks/use-memo` (~2) — non-inline useMemo args
  - `react-hooks/immutability` (~2) — DOM mutation via refs
- `jsx-a11y` rules at warn (~9) — keyboard handlers needed

**Remaining:** Fix all 44 warnings and promote to error. Dedicated session.

---

## Known Bugs

### BUG-1: Nav scroll to Engineer lands below sticky pin point
- Navigating from hero/nav bar to Engineer section lands slightly below the sticky viewport's pin point
- User must scroll up to reach the title
- Does NOT happen on hard refresh to `/act-ii`
- Likely caused by `fadeJumpSlide` approach offset (120px) + post-jump recalculation of `slideTo` not accounting for the sticky state change
- Investigate: log the jump target vs actual landing position, compare with section element top

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
