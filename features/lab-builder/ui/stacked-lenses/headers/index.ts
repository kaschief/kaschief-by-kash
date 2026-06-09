/**
 * Five header treatments for the Stacked Lenses variant. Pick one by
 * aliasing it as `StageHeader` inside stacked-lenses.tsx. All accept the
 * same `StageHeaderProps` shape so the swap is a one-line change.
 *
 *   A — Monumental   : large Fraunces italic, name only
 *   B — Terminal     : monospace status bar, chart + lens tokens
 *   C — Margin note  : italic Alegreya, conversational ("looking at X")
 *   D — Filepath     : monospace source reference (indicators/x.pine)
 *   E — Wordmark     : weighted Syne wordmark on a thin accent rule
 */

export { HeaderMonumental } from "./header-monumental";
export { HeaderTerminal } from "./header-terminal";
export { HeaderMarginNote } from "./header-margin-note";
export { HeaderFilepath } from "./header-filepath";
export { HeaderWordmark } from "./header-wordmark";
export type { StageHeaderProps } from "./header.types";
