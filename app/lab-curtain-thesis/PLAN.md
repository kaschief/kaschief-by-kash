# Curtain Thesis — Interaction Plan

## Concept

The thesis sentence ("Each of my past roles sharpened a different part of how I think about *users*, *gaps*, and *patterns*.") transitions into the pillar sections via a curtain wipe that isolates the three keywords.

## Steps

### Step 1 — Static thesis render ✅
Render the thesis sentence matching engineer-candidate styling (serif, cream, centered, 60vw).

### Step 2 — Scroll-driven entrance ✅
Fade in from blur + upward drift + sequential keyword reveal ("users," → "gaps," → "and " → "patterns."). "and" is not italic. "patterns." appears slightly after "and".

### Step 3 — Curtain line (upward wipe)
- [ ] Add a horizontal line that moves **upward** on scroll
- [ ] Line starts below the text block, travels to above it
- [ ] Visual: thin horizontal rule, subtle glow or accent color
- [ ] As the line crosses text, words **above** the line dissolve (opacity → 0)
- [ ] Keywords ("users", "gaps", "patterns") do **not** dissolve — they remain visible
- [ ] Non-keyword text fades relative to the line's Y position (spatial wipe, not time-based)

### Step 4 — Keyword softening
- [ ] After non-keyword text is fully gone, the 3 keywords blur/soften
- [ ] CSS `filter: blur()` + slight opacity reduction
- [ ] They're still visible but defocused — a held breath before the next move

### Step 5 — Single keyword isolation ("Users")
- [ ] "gaps" and "patterns" fade out completely
- [ ] "Users" sharpens back to full clarity (blur → 0, opacity → 1)
- [ ] "Users" becomes the anchor/title for the next section
- [ ] This is the handoff point to whatever follows (pillar section, panel, etc.)

## Open Questions
- What comes after "Users" is isolated? (panel rise, section transition, etc.)
- Should the curtain line have a visual style (gold, white, gradient)?
- Should keywords reposition during the wipe or stay in their inline positions?

## Source of Truth
- Pillar words: `users`, `gaps`, `patterns` (unified across engineer-data.tsx, lab-pillars, lab-blinds)
- Thesis text: mirrors `CONTENT.thesis` from `app/engineer-candidate/engineer-data.tsx`
