/**
 * Design token strings — single source of truth for CSS variable references
 * used in JS/TSX inline styles and component default prop values.
 *
 * SCOPE: Only inline style objects and component prop defaults.
 *        Tailwind bracket classes (e.g. text-[var(--gold)]) are a CSS-layer
 *        concern and are intentionally excluded.
 *
 * RULE: Never write "var(--gold)" as a raw string in component code.
 *       Always import and use TOKENS.gold instead.
 */
export const TOKENS = {
  // Brand
  gold: "var(--gold)",
  goldDim: "var(--gold-dim)",

  // Text
  cream: "var(--cream)",
  creamMuted: "var(--cream-muted)",
  /** Narrator in Act I chaos-to-order — brighter than cream-muted for dark bg readability */
  narratorBright: "#D4CBBA",
  textDim: "var(--text-dim)",
  textFaint: "var(--text-faint)",

  // Surfaces
  bg: "var(--bg)",
  bgElevated: "var(--bg-elevated)",
  bgSurface: "var(--bg-surface)",
  bgNav: "rgba(7,7,10,0.8)", // var(--bg) at 80% opacity for nav backdrop
  stroke: "var(--stroke)",

  // Fonts
  fontSerif: "var(--font-serif)",
  fontNarrator: "var(--font-narrator)",
  fontUi: "var(--font-ui)",

  // Act colors (match --act-* CSS variables)
  actRed: "var(--act-red)",
  /** Dimmed act-red for inline highlights — doesn't compete with gold */
  actRedDim: "#B04444",
  /** Bright act-red for hover states */
  actRedHot: "#F06060",
  actBlue: "var(--act-blue)",
  actGold: "var(--act-gold)",
  actGreen: "var(--act-green)",

  // Cursor
  cursorHighlight: "var(--cursor-highlight)",
  cursorShadow: "var(--cursor-shadow)",
} as const;

export type TokenValue = (typeof TOKENS)[keyof typeof TOKENS];
