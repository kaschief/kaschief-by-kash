# Font Audit — Acts I & II

## Font Hierarchy (Current)

| Role | Font | Style | Color | Used for |
|------|------|-------|-------|----------|
| **Question** | `font-narrator` (Crimson Pro) | bold 700 (Act I) / semibold 600 (Act II) | `--cream` | "What do I do when...", "How do I handle..." |
| **I-statement** | `font-narrator` (Crimson Pro) | normal | `--gold` | "I collect the data...", "I make sure..." |
| **I-statement (overlay)** | `font-serif` (Playfair) | normal | `--gold` | Act II story desk overlay |
| **Story** | `font-sans` (Inter) | light 300 | `--cream-muted` | Narrative paragraphs, evidence text |
| **Title** | `font-sans` (Inter) | normal | `--cream-muted` | "Recognize the signal..." (Act I only) |
| **Chrome / Meta** | `font-ui` (Urbanist) | uppercase | `--cream-muted` | "AMBOSS · 2018-2019", "ACT I", labels |
| **Heading** | `font-sans` (Inter) | bold caps | `--cream` | "THE NURSE", "THE ENG1NEER" |
| **Splash intro** | `font-narrator` (Crimson Pro) | normal | `--cream-muted` | "Intensive care taught me...", "I have spent..." |
| **Bridge heading** | `font-narrator` (Crimson Pro) | normal | `--cream` | "Each project was different." |
| **Bridge narrator** | `font-narrator` (Crimson Pro) | normal | `--cream-muted` | "Every company had its own version..." |
| **Throughline** | `font-narrator` (Crimson Pro) | normal | `--cream` | "The ICU was not just..." |
| **Funnel climax** | `font-narrator` (Crimson Pro) | normal | `--cream` | "By DKB, the pattern was clear..." |

## Shared Style Objects (lenses.config.ts)

| Object | Font | Properties |
|--------|------|-----------|
| `STORY_STYLE` | Inter light | `font-sans`, weight 300, cream-muted, lineHeight 1.8 |
| `NARRATOR_STYLE` | Crimson Pro | `font-narrator`, cream-muted, lineHeight 1.8 |
| `I_STATEMENT_STYLE` | Playfair Display | `font-serif`, gold, lineHeight 1.4 |

## Shared Data Types

`SkillScenario` (timeline.ts) — unified fields across Acts I & II:

| Field | Role | Previously (Act I) | Previously (Act II) |
|-------|------|--------------------|---------------------|
| `question` | Question | `question` | `headline` |
| `iStatement` | I-statement | `capability` | `iStatement` |
| `story` | Story | `proof` | `story` |
| `accentText?` | Accent highlight | `accentText` | — |
| `title?` | Short summary | `title` | — |

## Tokens (utilities/tokens.ts)

| Token | Value | Used for |
|-------|-------|----------|
| `narratorBright` | `#D4CBBA` | Act I chaos/order narrator on dark bg |
| `actRedDim` | `#B04444` | Dimmed accent highlights in skill questions |
| `actRedHot` | `#F06060` | Hover state accent in skill questions |
| `fontNarrator` | `var(--font-narrator)` | Crimson Pro reference |

## CSS Variables

| Variable | Font | Defined in |
|----------|------|-----------|
| `--font-narrator` | Crimson Pro | globals.css theme block |
| `--font-sans` | Inter | globals.css theme block |
| `--font-serif` | Playfair Display | globals.css theme block |
| `--font-ui` | Urbanist | globals.css theme block |
