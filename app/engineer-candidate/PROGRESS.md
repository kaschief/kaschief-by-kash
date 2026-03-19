# Engineer Candidate — Progress Tracker

> Living document. Updated as work is completed.
> Last updated: 2026-03-19

## Principal Engineer Audit

Source: 24 issues across 3 files (page.tsx, engineer-data.tsx, forge-sankey-data.ts).

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

### P2 — Medium (5/7 done, 2 in progress)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| P2.1 | 2800-line component — extract sub-components | In progress | See "Component Extraction" below |
| P2.2 | Mobile carousel 200-line IIFE → component | Pending | Part of P2.1 extraction |
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

## Component Extraction (P2.1)

Goal: Break 2800-line page.tsx into focused modules.

| Step | File | Status | Lines moved |
|------|------|--------|-------------|
| 1 | `engineer-candidate.types.ts` | Done | ~250 (config objects + timing chain) |
| 2 | `terminal-data.ts` | Done | ~265 (TC, TERM_COMPANIES, buildLines, escapeHtml) |
| 3 | `use-crystallize.tsx` | Done | ~120 (principle cards animation + JSX) |
| 4 | `use-terminal-replay.tsx` | Pending | Terminal typing + narrative scroll callback + JSX |
| 5 | `use-forge-fragments.tsx` | Pending | Fragment drift/converge/fade + embers + grid + JSX |
| 6 | `use-particle-funnel.tsx` | Pending | Canvas particles + SVG funnel + ribbons + JSX |
| 7 | Clean up page.tsx | Pending | Thin orchestrator wiring hooks together |

---

## Other Changes (non-audit)

| Change | Status |
|--------|--------|
| Rename forge-test-workstation → engineer-candidate | Done |
| Fix "ENGINEER-CANDIDATE" label leaking into main site body | Done |
| Fix thesis keyword spacing (missing spaces between spans) | Done |
| Rename TC → TERMINAL_COLORS, fg/bg → foreground/background | Done |
| Anchor scroll alignment for engineer-candidate section | Done (self-resolved) |
| ForgeNav hidden when embedded on main site (only shows on standalone route) | Done |

---

## File Structure (current)

```
app/engineer-candidate/
  page.tsx                    — main orchestrator (still large, shrinking)
  engineer-candidate.types.ts — config objects + derived timing chain + PH map
  engineer-data.tsx           — fragment/ember/principle factories, logos, colors
  terminal-data.ts            — terminal colors, company blocks, line builder
  math.ts                     — shared lerp, smoothstep, remap, clamp
  use-crystallize.tsx         — principle cards animation hook
  PLAN.md                     — scroll phase architecture + decisions
  PROGRESS.md                 — this file
```

## What's Next

1. Finish Steps 6–7 of component extraction
2. Commit all changes
3. Consider: inline integration into main site (replace Act II)

---

## Cleanup Backlog (outside engineer-candidate)

| File | Issue | Status |
|------|-------|--------|
| `hooks/use-section-scroll.ts` | Magic numbers: `0.3` (pin zone threshold), `2` (skip offset), `window.innerHeight * 2` (long jump), `0.8` (near-target fraction), `3500` (speed divisor), `1.2`/`0.5` (duration bounds), `4000ms` (safety timeout) | Pending |
