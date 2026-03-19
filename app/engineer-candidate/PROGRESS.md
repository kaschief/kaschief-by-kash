# Engineer Candidate — Progress Tracker

> Living document. Updated as work is completed.
> Last updated: 2026-03-19

## Principal Engineer Audit

Source: 24 issues across 3 files (page.tsx, engineer-data.tsx, sankey-data.ts).

### P0 — Critical (3/3 done)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| P0.1 | Duplicate lerp/smoothstep (3 copies) | Done | Created `math.ts` — single source of truth |
| P0.2 | scrollHintEl ref never rendered | Done | Removed dead code |
| P0.3 | Canvas rAF runs unconditionally | Done | Already gated by progress bounds |

### P1 — High (7/7 done)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| P1.1 | Company color array duplicated 4x | Done | `COMPANY_COLORS` derived from `CC` in engineer-data.tsx |
| P1.2 | DKB role conflict | Done | Consistent "Engineering Manager" via `COMPANY_ROLES` |
| P1.3 | ~77 inline magic numbers | Done | Config objects: PHASES, SEED, FRAG, THESIS, PARTICLE, FUNNEL, etc. |
| P1.4 | isSmRef unused | Done | Removed |
| P1.5 | Unused exports (srand, BEATS, BeatData, WhisperData) | Done | Removed from engineer-data.tsx |
| P1.6 | "company" fragment type dead code | Done | Removed from union + switch |
| P1.7 | Terminal HTML string concat | Done | escapeHtml already existed |

### P2 — Medium (7/7 done)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| P2.1 | 2800-line component — extract sub-components | Done | 6 modules extracted, page.tsx is 415 lines |
| P2.2 | Mobile carousel 200-line IIFE → component | Done | Extracted into use-terminal-replay.tsx |
| P2.3 | remap duplicates lerp+smoothstep | Done | They're different (linear vs smooth) |
| P2.4 | Narrator position fractions unnamed | Done | `FUNNEL.narratorTopFracs` |
| P2.5 | Missing data-role="period" element | Done | Removed dead code path |
| P2.6 | Canvas DPR comment | Done | Comment exists |
| P2.7 | Stale scroll range comments | Done | None remain |

### P3 — Low (7/7 done)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| P3.1 | _ci parameter unused | Done | Documented with comment |
| P3.2 | srand name misleading | Done | Removed (alias for hashToUnit) |
| P3.3 | CC/CC_EXT overlap | Done | CC is base, CC_EXT extends it |
| P3.4 | CONTAINER_VH vs comment mismatch | Done | Consistent (2000) |
| P3.5 | Hardcoded #C0B8A0 | Done | Removed |
| P3.6 | MONO font stack intent comment | Done | Comment exists |
| P3.7 | as const on CSS string values | Done | Kept for type safety |

---

## Component Extraction (P2.1) — Complete

Goal: Break 2800-line page.tsx into focused modules. Result: 415 lines.

| Step | File | Lines | What it owns |
|------|------|-------|--------------|
| 1 | `engineer-candidate.types.ts` | ~250 | Config objects (PHASES, SEED, FRAG, etc.) + derived timing chain + SCROLL_PHASES map |
| 2 | `terminal-data.ts` | ~265 | TERMINAL_COLORS, TERM_COMPANIES, buildLines, escapeHtml |
| 3 | `use-crystallize.tsx` | ~120 | Principle cards fade-in/settle animation + JSX |
| 4 | `use-terminal-replay.tsx` | ~350 | Code typing, narrative reveal, mobile carousel + JSX |
| 5 | `use-convergence.tsx` | ~280 | Fragment drift/converge/fade, embers, grid, thesis + JSX |
| 6 | `use-particle-funnel.tsx` | ~550 | Canvas particles, SVG funnel, ribbons, narrator panels + JSX |
| 7 | page.tsx cleanup | — | Removed stale comments, cleaned imports, thin orchestrator |

## Variable Rename Pass — Complete

All cryptic variables renamed across all hooks:
- `ss` → `smoothstep` (alias removed from math.ts)
- `p` → `progress`, `lg` → `isDesktop`, `vh` → `viewportHeight`
- `f` → `fragment`, `el` → `element`, `rot` → `rotation`
- `x/y` → `translateX/translateY`, `dX/dY` → `driftedX/driftedY`
- `cS/cE/cD` → `phaseStart/phaseEnd/phaseDuration`
- `pr` → `principle`, `cc` → `charCounts`, `co` → `company`
- `narP` → `narrativeProgress`, `si` → `streamIndex`, etc.
- `PH` → `SCROLL_PHASES`, `PP` → `PARTICLE_PHASES`
- `FV_W/FV_H` → `FUNNEL_VIEWBOX_WIDTH/FUNNEL_VIEWBOX_HEIGHT`
- `F_TIER_Y` → `FUNNEL_TIER_POSITIONS`, `F_CENTER_X` → `FUNNEL_CENTER_X`
- `F_SEGMENTS` → `FUNNEL_SEGMENTS`, `F_POSITIONS` → `FUNNEL_POSITIONS`, `F_TOP_POSITIONS` → `FUNNEL_TOP_POSITIONS`
- `P1_END/P2_END/P3_END` → `TYPING_PHASE_1_END/TYPING_PHASE_2_END/TYPING_PHASE_3_END`
- `NAR_START/NAR_END` → `NARRATIVE_START/NARRATIVE_END`

---

## Other Changes (non-audit)

| Change | Status |
|--------|--------|
| Rename forge-test-workstation → engineer-candidate | Done |
| Fix "ENGINEER-CANDIDATE" label leaking into main site body | Done |
| Fix thesis keyword spacing (missing spaces between spans) | Done |
| Rename TC → TERMINAL_COLORS, fg/bg → foreground/background | Done |
| Anchor scroll alignment for engineer-candidate section | Done |
| ForgeNav hidden when embedded on main site (standalone only) | Done |

---

## File Structure

```
app/engineer-candidate/
  page.tsx                      — orchestrator (415 lines): wires hooks, scroll progress, JSX layout
  engineer-candidate.types.ts   — config objects + derived timing chain + PH phase map
  engineer-data.tsx             — fragment/ember/principle factories, logos, colors, content
  terminal-data.ts              — terminal colors, company blocks, line builder, escapeHtml
  math.ts                       — shared smoothstep, lerp, remap, clamp
  use-convergence.tsx           — fragment drift/converge, embers, grid, thesis word reveals
  use-particle-funnel.tsx       — canvas particles, SVG funnel, ribbons, narrator panels
  use-terminal-replay.tsx       — code typing replay, narrative reveal, mobile carousel
  use-crystallize.tsx           — principle cards fade-in and settle
  PLAN.md                       — scroll phase architecture + decisions
  PROGRESS.md                   — this file
```

---

## Cleanup Backlog (outside engineer-candidate)

| File | Issue | Priority |
|------|-------|----------|
| `hooks/use-section-scroll.ts` | Flash of intermediate content when scrolling to engineer-candidate from distant sections. `getPinSkipTarget` needs smarter handling of 2000vh sticky zones. | High |
| `hooks/use-section-scroll.ts` | Landing position inconsistent depending on scroll direction (e.g. Engineer→Nurse vs WhoAmI→Nurse lands 60px apart). Layout shift from nav height changes during scroll. | High |
| `hooks/use-section-scroll.ts` | Soft scroll-in feel lost — some jumps are too instant, no gentle approach animation. Need consistent gentle landing across all nav clicks. | High |
| `hooks/use-section-scroll.ts` | Hardcoded px values (80px nav offset) don't scale with viewport. Should measure actual nav element height from DOM. | Medium |
| `hooks/use-section-scroll.ts` | Magic numbers throughout (2000ms timeouts, 3500 rate, 4 easing exponent, etc.) — need SCROLL_CONFIG object. | Medium |
| `page.tsx` → `hooks/use-scramble.ts` | Extract `useScramble` + `ScrambleWord` into shared hook (generic reusable text effect) | Medium |
