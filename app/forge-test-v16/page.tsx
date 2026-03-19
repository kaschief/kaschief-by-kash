"use client";

import { useRef, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { DevNav } from "../dev-nav";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Map `value` from [inMin,inMax] to [outMin,outMax], clamped. */
function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return lerp(outMin, outMax, t);
}

/* ------------------------------------------------------------------ */
/*  Colors                                                            */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#0D1117",
  topBar: "#161B22",
  dotRed: "#FF5F57",
  dotYellow: "#FFBD2E",
  dotGreen: "#28C840",
  lineNum: "#484f58",
  text: "#c9d1d9",
  keyword: "#79c0ff",
  addedFg: "#7ee787",
  addedBg: "rgba(46,160,67,0.15)",
  removedFg: "#ff7b72",
  removedBg: "rgba(248,81,73,0.1)",
  comment: "#8b949e",
  string: "#a5d6ff",
} as const;

/* ------------------------------------------------------------------ */
/*  Company data                                                      */
/* ------------------------------------------------------------------ */

interface CompanyBlock {
  hash: string;
  company: string;
  authorEmail: string;
  location: string;
  dates: string;
  commitType: string;
  commitMsg: string;
  commitBody: string;
  diff: { type: "add" | "remove" | "context"; text: string }[];
  insight: string[];
}

const COMPANIES: CompanyBlock[] = [
  {
    hash: "a3f7e2d",
    company: "AMBOSS",
    authorEmail: "kash@amboss.com",
    location: "Berlin",
    dates: "2018-2019",
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
    hash: "b8c4f19",
    company: "Compado",
    authorEmail: "kash@compado.com",
    location: "Berlin",
    dates: "2019-2021",
    commitType: "fix",
    commitMsg: "replace duplicated sites with component system",
    commitBody:
      "12 white-label sites, each a copy-paste fork.\nBuilt a shared component library, cut deploy time 80%.",
    diff: [
      { type: "remove", text: "// site-a/header.tsx — copy #7 of 12" },
      { type: "remove", text: "export const Header = () => <div>Logo A</div>;" },
      { type: "remove", text: "// site-b/header.tsx — copy #8 of 12" },
      { type: "remove", text: "export const Header = () => <div>Logo B</div>;" },
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
  },
  {
    hash: "c2e6a03",
    company: "CAPinside",
    authorEmail: "kash@capinside.com",
    location: "Hamburg",
    dates: "2021-2023",
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
      { type: "add", text: "interface FundReturn { val: number; date: string; }" },
      { type: "add", text: "function calcReturns(data: FundReturn[]): number[] {" },
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
    hash: "d9f1b77",
    company: "DKB",
    authorEmail: "kash@dkb.de",
    location: "Berlin",
    dates: "2023-2024",
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
  },
];

/* ------------------------------------------------------------------ */
/*  Build flat lines from company data                                */
/* ------------------------------------------------------------------ */

interface TermLine {
  text: string;
  style: "keyword" | "text" | "add" | "remove" | "comment" | "string" | "blank";
  /** Which phase this line belongs to: 1=git log, 2=diff, 3=comment */
  phase: 1 | 2 | 3;
}

function buildLines(co: CompanyBlock): TermLine[] {
  const lines: TermLine[] = [];

  // Phase 1 — git log
  lines.push({ text: `commit ${co.hash} (HEAD -> main)`, style: "keyword", phase: 1 });
  lines.push({ text: `Author: Kash <${co.authorEmail}>`, style: "text", phase: 1 });
  lines.push({ text: `Date:   ${co.location}, ${co.dates}`, style: "text", phase: 1 });
  lines.push({ text: "", style: "blank", phase: 1 });
  lines.push({
    text: `    ${co.commitType}: ${co.commitMsg}`,
    style: "keyword",
    phase: 1,
  });
  lines.push({ text: "", style: "blank", phase: 1 });
  for (const bodyLine of co.commitBody.split("\n")) {
    lines.push({ text: `    ${bodyLine}`, style: "text", phase: 1 });
  }
  lines.push({ text: "", style: "blank", phase: 1 });

  // Phase 2 — diff
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

  // Phase 3 — insight comment
  for (const c of co.insight) {
    lines.push({ text: c, style: "comment", phase: 3 });
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function ForgeV16() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  /** Pre-build all company lines once. */
  const allCompanyLines = useRef(COMPANIES.map(buildLines)).current;

  /** Flatten each company's lines into a single string so we can count chars per phase. */
  const charCounts = useRef(
    allCompanyLines.map((lines) => {
      let p1 = 0,
        p2 = 0,
        p3 = 0;
      for (const l of lines) {
        // +1 for the newline at end of each line
        const len = l.text.length + 1;
        if (l.phase === 1) p1 += len;
        else if (l.phase === 2) p2 += len;
        else p3 += len;
      }
      return { p1, p2, p3, total: p1 + p2 + p3 };
    }),
  ).current;

  const { scrollYProgress } = useScroll({ target: scrollRef });

  /* ---- Render one frame ---- */
  const render = useCallback(
    (progress: number) => {
      const el = contentRef.current;
      const wipe = wipeRef.current;
      if (!el || !wipe) return;

      const companyIdx = Math.min(
        Math.floor(progress * COMPANIES.length),
        COMPANIES.length - 1,
      );
      const companyProgress =
        (progress - companyIdx / COMPANIES.length) * COMPANIES.length;

      // Phase boundaries within a company
      const P1_END = 0.4;
      const P2_END = 0.7;
      const P3_END = 0.9;

      // Wipe effect between companies (phase 4: 0.9–1.0)
      const wipeProgress = smoothstep(P3_END, 1.0, companyProgress);
      wipe.style.opacity = wipeProgress > 0 && wipeProgress < 1 ? "1" : "0";
      wipe.style.transform = `translateY(${(1 - wipeProgress) * 100}%)`;

      if (wipeProgress >= 0.99) {
        el.innerHTML = "";
        return;
      }

      const lines = allCompanyLines[companyIdx];
      const cc = charCounts[companyIdx];

      // How many chars to reveal
      let charsToShow = 0;
      if (companyProgress <= P1_END) {
        // Phase 1: type the git log
        charsToShow = Math.floor(remap(companyProgress, 0, P1_END, 0, cc.p1));
      } else if (companyProgress <= P2_END) {
        // Phase 2: type the diff
        charsToShow =
          cc.p1 + Math.floor(remap(companyProgress, P1_END, P2_END, 0, cc.p2));
      } else if (companyProgress <= P3_END) {
        // Phase 3: type the insight
        charsToShow =
          cc.p1 +
          cc.p2 +
          Math.floor(remap(companyProgress, P2_END, P3_END, 0, cc.p3));
      } else {
        charsToShow = cc.total;
      }

      // Build HTML
      let html = "";
      let charsSoFar = 0;
      let lineNum = 1;
      let cursorPlaced = false;

      for (const line of lines) {
        const lineLen = line.text.length + 1; // +1 for newline
        if (charsSoFar >= charsToShow) break;

        const visibleChars = Math.min(line.text.length, charsToShow - charsSoFar);
        const visibleText = escapeHtml(line.text.slice(0, visibleChars));
        const isPartial = visibleChars < line.text.length;

        // Line number
        const numStr = `<span style="color:${C.lineNum};user-select:none;display:inline-block;width:3ch;text-align:right;margin-right:1.5ch;">${lineNum}</span>`;

        // Style the content
        let fg: string = C.text;
        let bg: string = "transparent";
        let italic = false;
        switch (line.style) {
          case "keyword":
            fg = C.keyword;
            break;
          case "add":
            fg = C.addedFg;
            bg = C.addedBg;
            break;
          case "remove":
            fg = C.removedFg;
            bg = C.removedBg;
            break;
          case "comment":
            fg = C.comment;
            italic = true;
            break;
          case "string":
            fg = C.string;
            break;
        }

        const cursor =
          isPartial && !cursorPlaced
            ? `<span style="color:${C.text};animation:blink 1s step-end infinite;">█</span>`
            : "";
        if (isPartial) cursorPlaced = true;

        html += `<div style="background:${bg};min-height:1.5em;line-height:1.5;padding:0 1ch;${italic ? "font-style:italic;" : ""}">${numStr}<span style="color:${fg};">${visibleText}</span>${cursor}</div>`;

        charsSoFar += lineLen;
        lineNum++;
      }

      // If we revealed everything and cursor not yet placed, add blinking cursor at end
      if (!cursorPlaced && charsToShow >= cc.total) {
        // cursor at very end — no-op, all done
      } else if (!cursorPlaced) {
        html += `<div style="min-height:1.5em;line-height:1.5;padding:0 1ch;"><span style="color:${C.lineNum};user-select:none;display:inline-block;width:3ch;text-align:right;margin-right:1.5ch;">${lineNum}</span><span style="color:${C.text};animation:blink 1s step-end infinite;">█</span></div>`;
      }

      el.innerHTML = html;
    },
    [allCompanyLines, charCounts],
  );

  useMotionValueEvent(scrollYProgress, "change", render);

  return (
    <div ref={scrollRef} style={{ height: "1200vh", position: "relative" }}>
      <DevNav />

      {/* Blink keyframes */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          fontFamily: MONO,
          fontSize: "14px",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: C.topBar,
            height: 38,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
            flexShrink: 0,
            borderBottom: "1px solid #30363d",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: C.dotRed,
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: C.dotYellow,
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: C.dotGreen,
            }}
          />
          <span
            style={{
              marginLeft: 12,
              color: C.lineNum,
              fontSize: 13,
            }}
          >
            ~/career — zsh
          </span>
        </div>

        {/* Terminal content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            padding: "16px 8px",
          }}
        >
          <pre
            ref={contentRef}
            style={{
              margin: 0,
              fontFamily: MONO,
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />

          {/* Hidden cursor ref for potential future use */}
          <span ref={cursorRef} style={{ display: "none" }} />

          {/* Wipe overlay */}
          <div
            ref={wipeRef}
            style={{
              position: "absolute",
              inset: 0,
              background: C.bg,
              opacity: 0,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
