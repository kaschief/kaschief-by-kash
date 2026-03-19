# Act II Engineer Candidate — Development Plan

## The Story Arc

Act II tells the story of an engineering career through scroll-driven phases. The throughline: a nurse's instinct for watching how people behave under pressure became the foundation for every engineering decision across four companies.

## Scroll Sequence (inside 1840vh sticky container)

### Phase 1: Title + Fragments (progress 0.005–0.037)
- "ACT II / THE ENG1NEER" title with ScrambleWord animation
- Floating fragments: logos (Simple Icons SVGs), code snippets (IDE-styled), seed words, phrases
- Fragments drift, converge, heat, dissolve
- **Curtain reveal**: fragments only appear below the summary panel edge
- Title fades before summary panel arrives

### Phase 2: Convergence (0.030–0.210)
- Seed keywords pull toward center, heat up, dissolve
- Embers (tiny rising sparks) accompany the convergence
- Faint dot grid atmosphere behind fragments
- Non-seed fragment pills (code, logos, CLI commands) dissolve with stagger

### Phase 3: Thesis (0.170–0.270)
- "Each of my past roles..." sentence fades in
- Sequential word reveals: product, systems, people, scale
- Crossfades in as seeds converge and fade

### Phase 4: Particles → Funnel (0.270–0.410)
- Canvas particles explode from center
- Particles converge to exact SVG dot positions
- Seamless handoff: canvas fades AS SVG dots appear (same positions)
- SVG funnel: 9 stream ribbons flow through 4 company tiers (AMBOSS → Compado → CAPinside → DKB)
- Company names + periods appear as dashed lines with labels
- **Narrator glass panels** on the right — 4 panels contextualizing the journey
- Gold diamond + "The Engineer I Became" at convergence point

### Phase 5: Mid Narrator (~0.56–0.60)
- "Let me show you where I've been" transition text
- Brief pause between funnel and terminal

### Phase 6: Terminal Replay (~0.60–0.94)
- Full-screen terminal/IDE aesthetic (GitHub dark theme)
- Scroll-driven character-by-character typing
- 4 companies, each with:
  - Git log entry (commit hash, author, date, commit message)
  - Code diff (green added / red removed)
  - Narrative reveal (scene → action → shift)
  - Terminal wipe between companies

### Summary/Narrator Panel (scrolls up over sticky)
- Narrator paragraph: nursing → engineering bridge
- Solid background acts as curtain over sticky content

## Architecture

### Scroll Phases (single source of truth)
- All timing lives in `engineer-candidate.types.ts`
- `PHASES` object defines durations as fractions of total scroll (0–1)
- Derived timing chain computes start/end for every phase automatically
- Adding/removing a phase: update `PHASES` + chain → everything shifts
- `CONTAINER_VH` controls total scroll distance (currently 1840vh)

### File Structure
| File | Purpose |
|------|---------|
| `page.tsx` | Orchestrator — scroll listener, phase delegation, JSX layout |
| `engineer-candidate.types.ts` | All timing constants + derived scroll chain |
| `engineer-data.tsx` | Content: logos, fragments, beat data, colors |
| `use-convergence.tsx` | Movement 1: fragments + seeds + thesis + particles + funnel |
| `use-terminal-replay.tsx` | Movement 2: terminal typing + narrative per company |
| `use-particle-funnel.tsx` | Particle canvas + SVG funnel sub-system |
| `math.ts` | smoothstep, lerp utilities |
| `terminal-data.ts` | Terminal content (git logs, diffs, narratives) |

## Key Technical Decisions
- Grid-based fragment positioning (10×8 cells with jitter)
- Logos: real Simple Icons SVG paths at 24×24
- SVG viewBox 1000×800, preserveAspectRatio xMidYMid meet
- Canvas → SVG crossfade for particle-to-funnel transition
- All phases derived from `PHASES` config — no hardcoded scroll positions

## Visual Rules
- NO white glow/haze — all glow elements permanently zeroed
- NO circular/oval vignettes
- All colors vivid/neon against dark background
- DKB accent = pink (#F472B6) for fragments, blue (#148DEA) for logo only
- CAPinside accent = cyan/teal (#06B6D4)

## Lab Prototypes
- `/lab-sankey` — Horizontal Sankey reference
- `/lab-particles` — Particles reference
- `/lab-forge` — Forge scroll prototype
- `/lab-wordtype` — Word-typing scroll prototype
- `/lab-curtain` — Curtain reveal scroll prototype
- `/lab-focus` — Focus scroll prototype (latest)
