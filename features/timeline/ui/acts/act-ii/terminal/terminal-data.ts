/* ==================================================================
   Terminal replay — colors, data, line builder.
   Extracted from page.tsx for terminal-replay.tsx consumption.
   ================================================================== */

import { COMPANIES, COMPANY_ID, type CompanyId } from "@data";
import { COMPANY_ROLES, CONTENT } from "../act-ii.data";

/* ---- Terminal color palette (GitHub dark theme) ---- */
export const TERMINAL_COLORS = {
  background: "#0D1117",
  topBar: "#161B22",
  dotRed: "#FF5F57",
  dotYellow: "#FFBD2E",
  dotGreen: "#28C840",
  lineNumber: "#484f58",
  text: "#c9d1d9",
  keyword: "#79c0ff",
  addedForeground: "#7ee787",
  addedBackground: "rgba(46,160,67,0.15)",
  removedForeground: "#ff7b72",
  removedBackground: "rgba(248,81,73,0.1)",
  comment: "#8b949e",
  string: "#a5d6ff",
} as const;

/* ---- Company data for terminal replay ---- */
export interface CompanyBlock {
  companyId: CompanyId;
  authorEmail: string;
  commitType: string;
  commitMsg: string;
  commitBody: string;
  diff: { type: "add" | "remove" | "context"; text: string }[];
  insight: string[];
  promotion?: string; // e.g. "→ Promoted to Senior Engineer"
}

/** Canonical company lookup by id — used by buildLines() to derive identity fields */
const COMPANY_BY_ID = new Map(COMPANIES.map((c) => [c.id, c]));

export const TERM_COMPANIES: CompanyBlock[] = [
  {
    companyId: COMPANY_ID.AMBOSS,
    authorEmail: "kash@amboss.com",
    commitType: "feat",
    commitMsg: "migrate study flows from vanilla JS to React",
    commitBody:
      "Half a million medical students depending on this app.\nBrought nursing instinct to every user flow decision.",
    diff: [
      { type: "remove", text: "// guess what users want" },
      { type: "remove", text: "function showNext() { return random(); }" },
      { type: "add", text: "// A/B test what actually works" },
      { type: "add", text: "function showNext(variant: 'A' | 'B') {" },
      { type: "add", text: "  return trackAndServe(variant);" },
      { type: "add", text: "}" },
    ],
    insight: [
      "// What I learned:",
      "// The gap between 'works technically' and 'works for the person'",
      "// is where most products fail.",
    ],
  },
  {
    companyId: COMPANY_ID.COMPADO,
    authorEmail: "kash@compado.com",
    commitType: "fix",
    commitMsg: "replace duplicated sites with component system",
    commitBody:
      "12 white-label sites, each a copy-paste fork.\nBuilt a shared component library, cut deploy time 80%.",
    diff: [
      { type: "remove", text: "// site-a/header.tsx — copy #7 of 12" },
      {
        type: "remove",
        text: "export const Header = () => <div>Logo A</div>;",
      },
      { type: "remove", text: "// site-b/header.tsx — copy #8 of 12" },
      {
        type: "remove",
        text: "export const Header = () => <div>Logo B</div>;",
      },
      { type: "add", text: "// shared/header.tsx — single source of truth" },
      {
        type: "add",
        text: "export const Header = ({ brand }: Props) => (",
      },
      { type: "add", text: "  <div><Logo brand={brand} /></div>" },
      { type: "add", text: ");" },
    ],
    insight: [
      "// What I learned:",
      "// Duplication is debt with compound interest.",
      "// A component system pays dividends forever.",
    ],
    promotion: "✦ promoted to Senior Frontend Engineer",
  },
  {
    companyId: COMPANY_ID.CAPINSIDE,
    authorEmail: "kash@capinside.com",
    commitType: "feat",
    commitMsg: "introduce TypeScript + code review process",
    commitBody:
      "Legacy jQuery codebase, no types, no reviews.\nMigrated to TypeScript, established PR culture.",
    diff: [
      { type: "remove", text: "// @ts-nocheck" },
      { type: "remove", text: "function calcReturns(data) {" },
      {
        type: "remove",
        text: '  return data.map(d => d.val * 0.01); // "good enough"',
      },
      { type: "remove", text: "}" },
      {
        type: "add",
        text: "interface FundReturn { val: number; date: string; }",
      },
      {
        type: "add",
        text: "function calcReturns(data: FundReturn[]): number[] {",
      },
      { type: "add", text: "  return data.map(d => d.val / 100);" },
      { type: "add", text: "}" },
    ],
    insight: [
      "// What I learned:",
      "// Types don't slow you down — they stop you",
      "// from shipping the wrong thing fast.",
    ],
  },
  {
    companyId: COMPANY_ID.DKB,
    authorEmail: "kash@dkb.de",
    commitType: "feat",
    commitMsg: "add Playwright tests + feature flags + weekly releases",
    commitBody:
      "Germany's largest direct bank, zero frontend tests.\nIntroduced E2E coverage, feature flags, weekly ship cadence.",
    diff: [
      { type: "remove", text: '// "we test in production"' },
      { type: "remove", text: "// release: once a month, fingers crossed" },
      { type: "remove", text: "const isReady = true; // TODO: actually check" },
      { type: "add", text: "import { test, expect } from '@playwright/test';" },
      { type: "add", text: "" },
      {
        type: "add",
        text: "test('transfer flow completes', async ({ page }) => {",
      },
      { type: "add", text: "  await page.goto('/transfer');" },
      {
        type: "add",
        text: "  await expect(page.getByText('Confirmed')).toBeVisible();",
      },
      { type: "add", text: "});" },
    ],
    insight: [
      "// What I learned:",
      "// Confidence to ship weekly comes from tests,",
      "// not from courage.",
    ],
    promotion: "✦ promoted to Engineering Manager",
  },
];

/* ---- Terminal line types ---- */
export interface TermLine {
  text: string;
  style:
    | "keyword"
    | "text"
    | "add"
    | "remove"
    | "comment"
    | "string"
    | "blank"
    | "promotion";
  phase: 1 | 2 | 3;
}

export function buildLines(co: CompanyBlock): TermLine[] {
  const canonical = COMPANY_BY_ID.get(co.companyId);
  const hash = canonical?.hash ?? "0000000";
  const company = canonical?.shortName ?? co.companyId;
  const role = COMPANY_ROLES[company] || "Frontend Engineer";
  const dates = canonical?.periodShort ?? "";

  const lines: TermLine[] = [];
  lines.push({
    text: `commit ${hash} (HEAD -> main)`,
    style: "keyword",
    phase: 1,
  });
  lines.push({
    text: `Author: Kash <${co.authorEmail}>`,
    style: "text",
    phase: 1,
  });
  lines.push({
    text: `Role:   ${role}`,
    style: "string",
    phase: 1,
  });
  lines.push({
    text: `Date:   ${dates}`,
    style: "text",
    phase: 1,
  });
  lines.push({
    text: `    ${co.commitType}: ${co.commitMsg}`,
    style: "keyword",
    phase: 1,
  });
  lines.push({ text: "", style: "blank", phase: 1 });
  for (const bodyLine of co.commitBody.split("\n")) {
    lines.push({ text: `    ${bodyLine}`, style: "text", phase: 1 });
  }
  lines.push({ text: "---", style: "text", phase: 2 });
  for (const d of co.diff) {
    const prefix = d.type === "add" ? "+ " : d.type === "remove" ? "- " : "  ";
    lines.push({
      text: `${prefix}${d.text}`,
      style: d.type === "add" ? "add" : d.type === "remove" ? "remove" : "text",
      phase: 2,
    });
  }
  lines.push({ text: "", style: "blank", phase: 2 });
  for (const c of co.insight) {
    lines.push({ text: c, style: "comment", phase: 3 });
  }
  if (co.promotion) {
    lines.push({ text: co.promotion, style: "promotion", phase: 3 });
  }
  return lines;
}

// Intentional: terminal section uses real monospace for code authenticity.
// The rest of the site avoids mono (--font-ui remapped to Urbanist).
export const TERMINAL_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Pre-build all company lines once (module-level). */
export const ALL_COMPANY_LINES = TERM_COMPANIES.map(buildLines);

/** Pre-compute char counts per phase for each company. */
export const CHAR_COUNTS = ALL_COMPANY_LINES.map((lines) => {
  let p1 = 0,
    p2 = 0,
    p3 = 0;
  for (const l of lines) {
    const len = l.text.length + 1;
    if (l.phase === 1) p1 += len;
    else if (l.phase === 2) p2 += len;
    else p3 += len;
  }
  return { p1, p2, p3, total: p1 + p2 + p3 };
});

/** Narrative text for right side (scene/action/shift per company). */
export const TERM_NARRATIVES = CONTENT.terminalNarratives;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
