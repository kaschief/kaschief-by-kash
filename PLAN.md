---
name: Lenses Scroll Plan
description: Living plan for the multi-lens scroll build — pillar-by-pillar story reveals with artifact cards, focus cycling, and I-statement morphs
type: project
---

# Lenses — Scroll Sequence Plan

## Concept
A scroll-driven narrative where the thesis sentence dissolves, a curtain wipes the screen, and then **lens sections** reveal career stories through scattered artifact cards. Each lens (Users, Gaps, Patterns) follows the same choreography with different content.

## Architecture
- **Page**: `app/lab-lenses/page.tsx` (thin orchestrator — scroll container, RAF loop)
- **Hook**: `app/lab-lenses/use-lenses.tsx` (all phases, returns `{ update, jsx }`)
- **Types**: `app/lab-lenses/lenses.types.ts` (LensSegment, FocusWindow, PrologueTiming)
- **Timing**: `app/lab-lenses/lenses.timing.ts` (buildTimeline, LENS_SEGMENTS, auto-derived CONTAINER_HEIGHT_VH)
- **Config**: `app/lab-lenses/lenses.config.ts` (shared timing/visual constants)
- **Cards**: `app/lab-lenses/card-config.tsx` (per-lens CardConfig arrays)
- **Shared cards**: `app/lab-artifacts/artifact-cards.tsx` (JiraCard, SentryCard, SlackCard + more)
- **Container**: auto-sized from timeline, RAF smoothing (SMOOTH_LERP_FACTOR = 0.07)

---

## Scroll Sequence

### Phase 1: Thesis Entrance (scroll 0.00–0.25) — BUILT
Thesis sentence fades in, keywords reveal with stagger.
- Imports EC_THESIS values for exact fidelity
- Vertical drift: fast during prefix, slow during keywords
- Keywords: gold color, drop-in animation

### Phase 2: Curtain Sweep (scroll ~0.28–0.47) — BUILT
Opaque overlay grows upward from bottom, erasing the thesis.
- Accent line at curtain leading edge
- Gradient feather above the line
- Timing derived from CURTAIN_THESIS config

### Phase 3: Prefix Dissolution (during Phase 2) — BUILT
Prefix text blurs/dims as curtain approaches from below.
- Viewport-relative lookahead (PREFIX_DISSOLVE.lookaheadFrac)
- Only affects prefix span, not keywords

### Phase 4: Post-Curtain "users" Word — BUILT
"users" appears big and centered after curtain completes.
- Starts at 50%/50%, font-size POST_CURTAIN.startFontSizeVw
- Shrinks slightly as cards arrive (→ endFontSizeVw)

### Phase 5: Artifact Shuffle-In — BUILT
3 cards slide from off-screen edges to scattered positions.
- Jira from left, Sentry from right, Slack from bottom
- Smoothstep per card with stagger
- Surface glow layer for grounding

### Phase 6: "users" Scrolls to Top — BUILT
As scroll continues, "users" moves from center to top-center.
- Gradual rise (duration 0.12) concurrent with focus cycle
- Subtitle fades out as rise begins
- CENTER_CLEARANCE zone (15% x, 14% y) keeps cards away from keyword

### Phase 7a: Focus Nudge + Dim — BUILT (tuning)
Per-card smooth bell curve (no discrete index = no popping).
- Rise, dimming, and first nudge all start at same scroll moment
- Each card dims AFTER its own spotlight ends (sequential)
- Nudge is subtle: 1.5% x, 1% y, scale 1.02
- rampIn/rampOut: 0.06 each for gentle drift

### Phase 7b: Story Text — TODO
**Story text** appears in blank space near the focused card.
- Fades in during card's spotlight window
- Positioned in available space (opposite side of card from center)
- Fades out as spotlight ends

### Phase 7c: Card Morph — TODO
During/after spotlight, artifact UI crossfades to I-statement quote card.
- Morph happens per-card during its spotlight
- By cycle end, ALL cards display their I-statements

### Phase 8: End State — TODO
All 3 cards in scattered positions, each now showing its I-statement.
The pillar is "resolved." Brief hold.

### Phase 9+: Next Pillar — FUTURE
Repeat Phases 4–8 for each remaining pillar:
- **Structure** — new word, new cards, new stories, new I-statements
- **Clarity** — same pattern
- **Scale** — same pattern

Each pillar needs: keyword, 3-4 artifacts, 3-4 stories, 3-4 I-statements.

---

## Build Order (Incremental)

| Step | What | Status |
|------|------|--------|
| **S1** | Phase 6: "users" scrolls from center → top label | DONE |
| **S2** | Phase 7a: First card focus — nudge + dim others | DONE (tuning) |
| **S3** | Phase 7b: Story text appears in blank space | **NEXT** |
| **S4** | Phase 7c: Card morph — artifact → I-statement crossfade | TODO |
| **S5** | Phase 7d: Cycle through all 3 cards | TODO |
| **S6** | Phase 8: End state hold | TODO |
| **S7** | Refactor: extract pillar config so pattern is reusable | TODO |
| **S8** | Phase 9: Second pillar ("structure") with new content | TODO |

---

## Content Needed Per Pillar

```
{
  keyword: "users",
  cards: [
    { type: "jira", component: JiraCard, story: "...", iStatement: "..." },
    { type: "sentry", component: SentryCard, story: "...", iStatement: "..." },
    { type: "slack", component: SlackCard, story: "...", iStatement: "..." },
  ]
}
```

### Users Pillar (in progress)
- **Jira card**: MED-2847 mobile image bug
  - Story: "I ask what phone, what browser. Older iOS, Safari..."
  - I-statement: "I care as much about how we find problems as how we fix them."
- **Sentry card**: TypeError href null
  - Story: TBD
  - I-statement: TBD
- **Slack card**: Transfer page missing recipient
  - Story: TBD
  - I-statement: TBD

### Structure / Clarity / Scale Pillars
- Cards and stories TBD

---

## Decisions Log

| Date | Decision |
|------|----------|
| 2026-03-20 | "users" stays centered as anchor, cards scatter around it (Poly.app style) |
| 2026-03-20 | Cards use viewport-responsive widths: max(Npx, Nvw) |
| 2026-03-20 | Focus cycle + card morph are combined (not separate phases) |
| 2026-03-20 | Subtitle "What people actually experience." to be removed when cards arrive |
| 2026-03-20 | Removed lab-blinds, lab-focus, lab-curtain, lab-forge from registry and filesystem |
| 2026-03-20 | Pattern repeats per pillar: Users → Structure → Clarity → Scale |
| 2026-03-20 | CENTER_CLEARANCE zone: 15% x, 14% y — cards must not intrude this buffer |
| 2026-03-20 | Card widths use max(Npx, Nvw) — no upper cap, cards grow on big screens |
| 2026-03-20 | Focus cycle starts concurrent with keyword rise — not after |
| 2026-03-20 | Per-card bell curve focus (no discrete index) to prevent nudge popping |
| 2026-03-20 | All transitions must be gradual — no sudden pops, snaps, or jarring changes |
