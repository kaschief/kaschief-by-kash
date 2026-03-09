import { ACT_II } from "@data";

/* ── Data ── */

export const { act, title, color: COLOR, splash, body } = ACT_II;

/* ── Colors ── */

export const SECTION_BG = "#06060A";
export const SITE_BG = "#0A0A0F";
export const PANEL_BORDER = "#1A1A24";
export const PANEL_HEADER_BG = "#0E0E16";
export const TERMINAL_BG = "#08080C";
export const TERMINAL_TITLE_BG = "#111118";
export const PROMOTED_COLOR = "#5EBB73";

export const COMMIT_TYPE_COLORS: Record<string, string> = {
  feat: "#5B9EC2",
  fix: "#E05252",
  perf: "#5EBB73",
  refactor: "#C9A84C",
  test: "#9B8FCE",
  docs: "#8B9DC3",
  ship: "#C9A84C",
  chore: "#8A8478",
  collab: "#7A8B6E",
};

/* ── Helpers ── */

export function getStatColor(stat: string): string {
  if (stat.startsWith("+") || stat.startsWith("\u2192")) return PROMOTED_COLOR;
  if (stat.startsWith("-")) return "#E05252";
  return COLOR;
}
