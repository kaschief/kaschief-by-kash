# Act II Workstation — Development Plan

## Goal
Redesign Act II ("The Engineer") as a scroll-driven, dynamic experience like Act I. The workstation (`/forge-test-workstation`) is the active build. V0 (`/forge-test-v0`) is the frozen reference — DO NOT MODIFY.

## Key Principle
**V0 is the source of truth.** Every detail matters. Do not remove, simplify, or reimagine V0 content without explicit approval.

---

## File Structure

| File | What it is |
|------|-----------|
| `page.tsx` | Single-file workstation. V0's complete forge scroll + summary panel + particle explosion/funnel. Two `useScroll` hooks targeting two containers. |
| `forge-data.tsx` | All shared data: types, factories (fragments, embers, beats, whispers, principles), colors, logos, math helpers. |

## Page Layout (top to bottom)
```
ForgeNav (fixed)
Forge Container (1000vh)
  ├─ Sticky viewport (h-screen)
  │   └─ V0's complete scroll sequence (title, fragments, embers, thesis, beats, crystallize)
  └─ Summary Panel (normal flow, solid bg)
      └─ Scrolls up over sticky content (MUST be inside forge container, not a sibling)
Particle Container (800vh)
  └─ Sticky viewport (h-screen)
      └─ Canvas: Explosion → Fall → Funnel
```

---

## ForgeSequence Scroll Phases (0.00–1.00 over 1000vh) — APPROVED, LOCKED

| Scroll | Element |
|--------|---------|
| 0.00 | Title appears (ACT II / THE ENGINEER) — ScrambleWord + useInView |
| 0.03–0.09 | Title fades out |
| 0.03–0.36 | Forge fragments — drift, converge, heat, dissolve |
| 0.10–0.35 | Embers rising |
| 0.06–0.36 | Forge atmosphere (glow, inner glow, grid, vignette) |
| 0.20–0.30 | Seed words converge to center |
| 0.25–0.38 | Thesis (3 lines) |
| 0.32–0.92 | Narrative beats (4 companies) + whispers + beat glow |
| 0.88–1.00 | Crystallize (flash, line, principles) |

## ParticleSequence Scroll Phases (0.00–1.00 over 800vh) — IN PROGRESS

| Scroll | Element | Status |
|--------|---------|--------|
| 0.00–0.05 | Canvas fades in | Built, needs review |
| 0.05–0.15 | EXPLOSION — particles burst from center (50%, 50%) | Built, needs review |
| 0.15–0.30 | FALL — gravity + drift toward funnel entry | Built, needs review |
| 0.30–0.85 | FUNNEL — convergence through AMBOSS → Compado → CAPinside → DKB | Built, needs review |
| 0.82–0.92 | Fade out | Built, needs review |

## What Comes After? — NOT YET DESIGNED

---

## Routing
- `/forge-test` — Hub page
- `/forge-test-v0` — Frozen reference (DO NOT MODIFY)
- `/forge-test-ref-horizontal`, `ref-funnel`, `ref-particles` — References
- `/forge-test-workstation` — Active build

## Open Design Questions

1. **What comes after the funnel?**
2. **Explosion intensity** — Sharp burst vs. slow bloom?
3. **Funnel polish** — Labels, lines, density, wobble

## Decisions Log

| Date | Decision | Context |
|------|----------|---------|
| 2026-03-17 | V0 is source of truth — every detail matters | "You're not allowed to make variations to things I have already approved" |
| 2026-03-17 | Componentize workstation into ForgeSequence + SummaryPanel + ParticleSequence | User requested, then reverted — componentization broke summary panel positioning |
| 2026-03-17 | Reverted to single-file page.tsx + forge-data.tsx | Componentization moved summary panel outside forge container, breaking the scroll-up-over-sticky behavior |
| 2026-03-17 | Post-section summary panel must be preserved | Scrolls up to cover sticky content |
| 2026-03-17 | V0 must stay frozen | User: "don't change v0 so it remains frozen" |
| 2026-03-17 | Explosion at viewport center (50%, 50%) | Matches V0 convergence point |
| 2026-03-17 | Sequence: forge → thesis → beats → crystallize → summary panel → explosion → funnel | User approved |
| 2026-03-17 | Companies are environmental backdrop; skills/streams are the real flows | User's design intent |
