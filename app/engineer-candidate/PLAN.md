# Act II Workstation — Development Plan (Updated 2026-03-17)

## The Story Arc

Act II tells the story of an engineering career through scroll-driven phases. The throughline: a nurse's instinct for watching how people behave under pressure became the foundation for every engineering decision across four companies.

## Scroll Sequence (inside 2000vh sticky container)

### Phase 1: Title + Fragments (convergence progress 0.00–0.25)
- "ACT II / THE ENG1NEER" title with ScrambleWord animation
- Floating fragments: logos (real Simple Icons SVGs), code snippets (IDE-styled), seed words, phrases
- Fragments drift, converge, heat, dissolve — representing the ecosystem of tools/skills
- **Curtain reveal**: fragments only appear below the summary panel edge (per-fragment y-position check)
- Title MUST fade before summary panel arrives (~vhToP(100))

### Phase 2: Thesis (0.17–0.27)
- "Most engineers learn to build things."
- "Some learn to see them."
- "That second kind of engineer takes time to become."

### Phase 3: Particles → Funnel (0.26–0.47)
- Canvas particles explode from center
- Particles converge to exact SVG dot positions (svgToPixel mapping using getBoundingClientRect)
- Seamless handoff: canvas fades AS SVG dots appear (same positions, no black gap)
- SVG funnel: 9 stream ribbons (User Empathy, React, Vue, TypeScript, Performance, Testing, Architecture, Product Sense, Code Quality) flow through 4 company tiers
- Ribbons grow downward tier by tier (AMBOSS → Compado → CAPinside → DKB)
- Company names + periods appear as dashed lines with labels
- **Narrator glass panels** on the right — 4 panels (NOT company-labeled) contextualizing the journey:
  1. "It started with an instinct from the ward..."
  2. "The tools multiplied. Each one resharpened the instinct..."
  3. "The code stopped being the point. The codebase became a mirror..."
  4. "At scale, every stream thickened..."
- Gold diamond + "The Engineer I Became" at convergence point (white text)

### Phase 4: Particle Transition (0.47–0.50) — TO BUILD
- After convergence, particles burst from the convergence point
- Particles sweep the funnel off-screen (funnel fades as particles scatter)
- Transition into the terminal section

### Phase 5: Terminal Replay (0.50–0.84) — TO BUILD (replaces old beats)
- Full-screen terminal/IDE aesthetic (GitHub dark theme)
- Scroll-driven character-by-character typing
- 4 companies, each with:
  - Git log entry (commit hash, author, date, commit message about what you did)
  - Code diff (green added / red removed — showing actual code patterns)
  - Insight comment (// what you learned)
  - Terminal wipe between companies
- Content based on real work stories (from user's descriptions):
  - **AMBOSS**: Vanilla JS → React migration, A/B testing intro, broke production → testing discipline, nursing instinct in UX
  - **Compado**: Duplicated sites → component system, Lighthouse/lazy loading, chatbot, performance as product decision
  - **CAPinside**: TypeScript intro, no code review → process diagnosis, reading the team through the code
  - **DKB**: Zero tests → Playwright, monthly → weekly releases, feature flags, design system, promoted to EM

### Phase 6: Crystallize (0.84–0.94)
- Flash + horizontal line
- 4 principles fade in with blur-to-sharp animation
- Each principle has company color accent + serif text

### Phase 7: Summary/Narrator Panel (scrolls up over sticky)
- Narrator paragraph: nursing → engineering bridge
- "Before there was code, there was a ward..."
- "What follows is what that instinct became..."
- Solid background acts as curtain over sticky content

## Key Technical Decisions

### Scroll Phases Config (SCROLL_PHASES object)
- All phases derived from `CONTAINER_VH` using `vhToP()` function
- Prevents timing regressions when container height changes
- CONSTRAINT: summary panel arrives at ~vhToP(100) — title must end before this

### Fragment System
- Grid-based positioning (10×8 = 80 cells) with jitter for natural look
- Logos: real Simple Icons SVG paths at 24×24, rendered as path elements inside parent SVG
- Labels: `<text>` element inside the same SVG (y=31, fontSize 5) — can't overlap with logo
- Company logos: 44px, bigger and more prominent
- Every logo gets a label for clarity (non-technical viewers)

### Funnel
- SVG viewBox 1000×800, preserveAspectRatio xMidYMid meet
- 9 streams from sankey-data.ts (STREAMS, NODES)
- Ribbon gradients: 0.6/0.95 opacity (vivid, not washed)
- No company node dots on tier lines
- Convergence: gold diamond + white "The Engineer I Became" text

### Visual Rules
- NO white glow/haze — all glow elements permanently zeroed
- NO circular/oval vignettes — user hates visible shapes
- All colors must be VIVID/neon against dark background
- Seed word textShadow/boxShadow removed entirely
- Code snippets: IDE-styled (dark bg, left colored accent, no border)
- Command fragments: terminal-styled (>_ prompt)
- DKB accent = pink (#F472B6) for fragments, blue (#148DEA) for logo only
- CAPinside accent = cyan/teal (#06B6D4) for variety

## Target Role Context
- n8n Senior Product Builder (Berlin, remote-first)
- Act II should subtly resonate with: builder mindset, product instinct, technical fluency, AI curiosity, UX taste, data fluency, thrive in ambiguity, influence without authority
- The Sankey outputs (Product Instinct, System Design, Quality Engineering, Team Intelligence, Judgment) map to n8n's requirements
- The terminal replay section proves technical depth without being on-the-nose

## Reference Pages (standalone prototypes)
- `/forge-test-v15` — Particle Scribe (comet writes text)
- `/forge-test-v16` — Terminal Replay (git log + diffs) ← INTEGRATING THIS
- `/forge-test-v19` — Particle Forge (burst/freeze/drift/converge per company)
- `/forge-test-ref-horizontal` — Horizontal Sankey reference
- `/forge-test-ref-particles` — Particles reference

## Parked Ideas
- Faint watermark words behind fragments (skills/tools as background text)
- Logo links to official sites (in a static section, not during animation)
- Horizontal Sankey for per-job detail pages (zooming into one company)
- V15 Particle Scribe could be used for a different section
- V19 Particle Forge could replace the current convergence phase

## File Structure
| File | What it is |
|------|-----------|
| `page.tsx` | Single-file workstation with all scroll phases |
| `engineer-data.tsx` | Types, logo SVGs, fragment factories, beat data, colors |
| `PLAN.md` | This file — the living development plan |

## User Preferences (CRITICAL)
- No white, no circles, no oval shapes as design elements
- Vivid/neon colors, nothing dull or washed out
- Real logos from official sources (Simple Icons + brand media kits)
- Every logo must have a readable label
- No overlapping elements — grid-based positioning
- Code snippets must look like real IDE/terminal output
- Concise responses, no emojis
- Do NOT change desktop when fixing mobile (and vice versa)
- Do NOT auto-commit
- The word "Anthropic" → use "Claude" as the label
- DKB logo is blue, DKB fragments are pink
