# App Architecture (2026)

## Goals
- Keep domain logic in feature modules with explicit public APIs.
- Keep `components/` for shared/presentational primitives only.
- Keep stateful business rules testable outside React rendering.
- Keep server orchestration separate from client interaction shells.

## Top-level layout
```text
app/                         # Next.js route entries (RSC-first)
components/                  # Shared primitives only
  layout/                    # Global shell primitives (cursor wrapper, etc.)
  motion/                    # Shared animation primitives/hooks/tokens
  ui/                        # Reusable visual building blocks
features/                    # Domain modules (feature slices)
  home/
    model/
    ui/
    page.server.tsx
    public-api.ts
  navigation/
    model/
    ui/
    public-api.ts
  hero/
  philosophy/
  timeline/
  methods/
  contact/
data/                        # Static content and typed datasets
hooks/                       # Cross-feature reusable hooks
utilities/                   # Cross-feature constants and pure utilities
docs/                        # Architecture and design notes
```

## Feature Module Contract
Each feature exposes only `public-api.ts`.

- Allowed: `import { Navigation } from "@features/navigation"`
- Not allowed: `import { Navigation } from "@features/navigation/ui/navigation.client"`

Why:
- Prevents tight coupling to internals.
- Enables internal refactors without changing consumers.
- Forces intentional API boundaries.

## Server/Client Separation
- Server entrypoints assemble view models and data seams.
- Client components focus on interaction and rendering.
- Loading states use `Suspense` with explicit fallback UI.

Current example:
- `app/page.tsx` -> `@features/home`
- `features/home/page.server.tsx` assembles model
- `features/home/ui/home-page.client.tsx` handles interactivity

## Testing Strategy
Focus tests on business logic and state transitions.

- `features/**/model/*.test.ts` for reducers/selectors/rules.
- Avoid over-indexing on brittle visual snapshot tests.
- Add UI integration tests only where behavior crosses feature boundaries.

Current covered logic:
- `features/navigation/model/active-section.test.ts`
- `features/navigation/model/navigation-machine.test.ts`

## Import Rules
Architecture checks enforce:
- No `@/...` imports.
- No deep alias imports (`@components/...`, `@data/...`, `@hooks/...`, `@utilities/...`).
- Feature imports only via `@features/<feature>` public API.
- No `components/sections` folder usage.
- No direct `matchMedia` in components (must use hooks).
- `useBreakpoint` must use breakpoint constants, not strings.
