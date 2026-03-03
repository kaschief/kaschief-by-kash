# App Architecture

## Goals
- Keep feature code grouped by domain, not by file type.
- Make imports predictable and short via barrel files.
- Keep shared primitives (`ui`, `motion`) separate from page sections.

## Top-level layout
```
app/                      # Next.js app router entrypoints
components/
  layout/                 # Site shell components (navigation, cursor)
  sections/               # Page sections grouped by domain
    hero/
    philosophy/
    timeline/
      acts/
      trading-system/
    methods/
    contact/
  ui/                     # Reusable view primitives
  motion/                 # Shared animation primitives/hooks/tokens
data/                     # Static content/config datasets
lib/                      # Cross-domain constants and utilities
docs/                     # Documentation
```

## Conventions
- Each feature folder should expose `index.ts` as its public API.
- Keep component, types, and local helpers in the same feature folder.
- Avoid pass-through wrappers that only re-export nested files.
- Use absolute imports (`@/...`) for cross-domain references.
- Use relative imports for files within the same feature folder.

## Timeline domain
- `sections/timeline/timeline.tsx` composes the journey.
- `sections/timeline/acts/*` contains each career act.
- `sections/timeline/trading-system/*` contains the trading showcase.
- `act-ii` is intentionally flat:
  - `act-ii.tsx`
  - `job-row.tsx`
  - `job-takeover.tsx`
  - `act-ii.types.ts`
  - `index.ts`
