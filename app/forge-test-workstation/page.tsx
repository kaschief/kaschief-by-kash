"use client";

/**
 * ForgeWorkstation — Single-file workstation build.
 *
 * Structure:
 *   Container (1000vh)
 *     └─ Sticky viewport (V0's complete scroll: forge + thesis + beats + crystallize)
 *     └─ Summary panel (inside container, scrolls up over sticky — exactly like V0)
 *   ParticleSection (800vh)
 *     └─ Sticky viewport (explosion + fall + funnel)
 */

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import { COMPANIES, ACT_II } from "@data";
import {
  STREAMS,
  NODES,
  smoothstep,
  lerp as lerpFn,
} from "../forge-sankey-data";
import { ForgeNav } from "../forge-nav";
import {
  ss,
  lerp,
  fc,
  fcExt,
  CC_EXT,
  ACT_BLUE,
  LOGOS,
  createFragments,
  createEmbers,
  createPrinciples,
  phaseLabel,
  srand,
} from "./forge-data";
import { BREAKPOINTS } from "@utilities";

/* ================================================================== */
/*  Breakpoint refs (no-re-render, matches Act I pattern)              */
/* ================================================================== */

function useBreakpointRefs() {
  const isLg = useRef(false);
  const isSm = useRef(false);
  useEffect(() => {
    const mqLg = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    const mqSm = window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`);
    isLg.current = mqLg.matches;
    isSm.current = mqSm.matches;
    const lgH = (e: MediaQueryListEvent) => { isLg.current = e.matches; };
    const smH = (e: MediaQueryListEvent) => { isSm.current = e.matches; };
    mqLg.addEventListener("change", lgH);
    mqSm.addEventListener("change", smH);
    return () => {
      mqLg.removeEventListener("change", lgH);
      mqSm.removeEventListener("change", smH);
    };
  }, []);
  return { isLg, isSm };
}

/* ================================================================== */
/*  Terminal replay — colors, data, line builder (from V16)            */
/* ================================================================== */

const TC = {
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
  promotion?: string; // e.g. "→ Promoted to Senior Engineer"
}

const TERM_COMPANIES: CompanyBlock[] = [
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
    hash: "d9f1b77",
    company: "DKB",
    authorEmail: "kash@dkb.de",
    location: "Berlin",
    dates: "2021-2024",
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

interface TermLine {
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

function buildLines(co: CompanyBlock): TermLine[] {
  const lines: TermLine[] = [];
  lines.push({
    text: `commit ${co.hash} (HEAD -> main)`,
    style: "keyword",
    phase: 1,
  });
  const roles: Record<string, string> = {
    AMBOSS: "Frontend Engineer",
    Compado: "Senior Frontend Engineer",
    CAPinside: "Senior Frontend Engineer",
    DKB: "Engineering Manager",
  };
  lines.push({
    text: `Author: Kash <${co.authorEmail}>`,
    style: "text",
    phase: 1,
  });
  lines.push({
    text: `Role:   ${roles[co.company] || "Frontend Engineer"}`,
    style: "string",
    phase: 1,
  });
  lines.push({
    text: `Date:   ${co.dates}`,
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
  // Promotion banner — appears last, special yellow styling
  if (co.promotion) {
    lines.push({ text: co.promotion, style: "promotion", phase: 3 });
  }
  return lines;
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Pre-build all company lines once (module-level). */
const ALL_COMPANY_LINES = TERM_COMPANIES.map(buildLines);

/** Pre-compute char counts per phase for each company. */
const CHAR_COUNTS = ALL_COMPANY_LINES.map((lines) => {
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

// Narrative text for right side (V15 style reveal)
const TERM_NARRATIVES = [
  {
    scene:
      "Half a million medical students. I came from the ward \u2014 I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
    action:
      "Migrated vanilla JS to React. Introduced A/B testing. Broke production once \u2014 learned testing discipline.",
    shift:
      "The gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail.",
  },
  {
    scene:
      "Sites were replicas of each other. Every change meant touching six copies. Visitors arrived from search with zero loyalty.",
    action:
      "Rebuilt as swappable components. Attacked load times: Lighthouse, lazy loading, CSS compression. Built first chatbot interface.",
    shift: "Every millisecond is a user who stays or leaves.",
  },
  {
    scene:
      "Ten thousand financial advisors on a fragile platform. Nobody reviewed code. Tests were sparse. TypeScript was new to me.",
    action:
      "Started seeing the codebase as a record of how the team communicated. Every shortcut was a frozen habit.",
    shift: "You can\u2019t fix code without fixing process.",
  },
  {
    scene:
      "Germany\u2019s largest direct bank. Five million users. Monthly releases. Zero automated tests when I arrived.",
    action:
      "Introduced Playwright. Monthly to weekly releases. Feature flags. Found myself in the product room shaping what got built.",
    shift: "Confidence to ship weekly comes from tests, not from courage.",
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Map value from [inMin,inMax] to [outMin,outMax], clamped. */
function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

/* ================================================================== */
/*  V0: ScrambleText                                                   */
/* ================================================================== */

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function useScramble(
  text: string,
  active: boolean,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) return;
    const resolved = new Array(text.length).fill(false);
    const cycles = new Array(text.length).fill(0);
    const iv = setInterval(() => {
      let done = true;
      const next = text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        const startDelay = i * staggerMs;
        const elapsed = cycles[i] * intervalMs;
        if (elapsed < startDelay) {
          cycles[i]++;
          done = false;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        }
        if (resolved[i]) return ch;
        cycles[i]++;
        if (cycles[i] - Math.floor(startDelay / intervalMs) >= cyclesPerChar) {
          resolved[i] = true;
          return ch;
        }
        done = false;
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      });
      setDisplay(next.join(""));
      if (done) clearInterval(iv);
    }, intervalMs);
    return () => clearInterval(iv);
  }, [active, text, staggerMs, cyclesPerChar, intervalMs]);
  return display;
}

function ScrambleWord({ text, active }: { text: string; active: boolean }) {
  const display = useScramble(text, active, 70, 6, 70);
  return <>{display}</>;
}

/* ================================================================== */
/*  Particle types + funnel paths                                      */
/* ================================================================== */

interface Particle {
  streamIdx: number;
  angle: number;
  radius: number;
  size: number;
  color: string;
}

const PARTICLES_PER_STREAM = 12;

/* ================================================================== */
/*  Funnel layout (from funnel page, adapted for workstation)          */
/* ================================================================== */

const FV_W = 1000,
  FV_H = 800;
const F_TIER_Y = [80, 250, 400, 550, 700] as const;
const F_CONVERGE_Y = 760;
const F_TIER_SPREAD = [400, 300, 200, 120, 60] as const;
const F_CENTER_X = 500;
const F_UNIT_W = 4;

interface FTierPos {
  x: number;
  y: number;
  w: number;
}

function computeFunnelPositions(): Map<string, FTierPos[]> {
  const result = new Map<string, FTierPos[]>();
  const sorted = [...STREAMS];
  const topSpread = F_TIER_SPREAD[0];
  const topStep = (topSpread * 2) / (sorted.length - 1);
  for (let si = 0; si < sorted.length; si++) {
    const stream = sorted[si];
    const positions: FTierPos[] = [];
    const w = stream.width * F_UNIT_W;
    const topX = F_CENTER_X - topSpread + si * topStep;
    positions.push({ x: topX, y: F_TIER_Y[0], w });
    let prevX = topX;
    for (let ni = 0; ni < NODES.length; ni++) {
      const tierIdx = ni + 1;
      const spread = F_TIER_SPREAD[tierIdx];
      const passesThrough = stream.path.includes(ni);
      const passingStreams = sorted.filter((s) => s.path.includes(ni));
      const passingIndex = passingStreams.indexOf(stream);
      let x: number;
      if (passesThrough) {
        const passingStep =
          passingStreams.length > 1
            ? (spread * 2) / (passingStreams.length - 1)
            : 0;
        x = F_CENTER_X - spread + passingIndex * passingStep;
      } else {
        x = lerpFn(prevX, F_CENTER_X, 0.35);
        const maxDist = spread * 1.4;
        if (Math.abs(x - F_CENTER_X) > maxDist)
          x = F_CENTER_X + Math.sign(x - F_CENTER_X) * maxDist;
      }
      positions.push({ x, y: F_TIER_Y[tierIdx], w });
      prevX = x;
    }
    result.set(stream.id, positions);
  }
  return result;
}

const F_POSITIONS = computeFunnelPositions();

// Pre-compute top-tier positions for each stream (targets for canvas particles)
const F_TOP_POSITIONS = STREAMS.map((s) => F_POSITIONS.get(s.id)![0]);

/** Map SVG viewBox coord to pixel coord using actual SVG bounding rect */
function svgToPixel(
  sx: number,
  sy: number,
  svgRect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  const scale = Math.min(svgRect.width / FV_W, svgRect.height / FV_H);
  const renderedW = FV_W * scale,
    renderedH = FV_H * scale;
  const offX = svgRect.left + (svgRect.width - renderedW) / 2;
  const offY = svgRect.top + (svgRect.height - renderedH) / 2;
  return { px: offX + sx * scale, py: offY + sy * scale };
}

interface FSegment {
  streamId: string;
  color: string;
  fromTier: number;
  toTier: number;
  path: string;
  opacityEnd: number;
}

function buildFunnelSegments(): FSegment[] {
  const segments: FSegment[] = [];
  for (const stream of STREAMS) {
    const positions = F_POSITIONS.get(stream.id)!;
    for (let i = 0; i < positions.length - 1; i++) {
      const p1 = positions[i],
        p2 = positions[i + 1];
      const my = (p1.y + p2.y) / 2;
      const path = [
        `M ${p1.x - p1.w / 2} ${p1.y}`,
        `C ${p1.x - p1.w / 2} ${my}, ${p2.x - p2.w / 2} ${my}, ${p2.x - p2.w / 2} ${p2.y}`,
        `L ${p2.x + p2.w / 2} ${p2.y}`,
        `C ${p2.x + p2.w / 2} ${my}, ${p1.x + p1.w / 2} ${my}, ${p1.x + p1.w / 2} ${p1.y}`,
        `Z`,
      ].join(" ");
      segments.push({
        streamId: stream.id,
        color: stream.color,
        fromTier: i,
        toTier: i + 1,
        path,
        opacityEnd: 0.4 + (i + 1) * 0.1,
      });
    }
  }
  return segments;
}

const F_SEGMENTS = buildFunnelSegments();

// Narrator panels — 4 glass cards that accompany the funnel, NOT company-labeled
const FUNNEL_NARRATOR = [
  "It started with an instinct from the ward — watching how people actually behave under pressure, not how you imagine they will. That instinct found its first codebase.",
  "The tools multiplied. Each one resharpened the instinct. Vue for speed. React for structure. Lighthouse for the milliseconds that separate staying from leaving.",
  "Somewhere along the way, the code stopped being the point. The codebase became a mirror — reflecting how teams communicate, where habits calcify, what nobody dares to touch.",
  "At scale, every stream thickened. Testing, architecture, design systems, product partnership. The question shifted from what to build to what to protect.",
];

/* ================================================================== */
/*  Scroll phases — single source of truth                             */
/*                                                                     */
/*  CONSTRAINT: summary panel is in normal flow after the sticky       */
/*  (100vh). It arrives on screen at SUMMARY_ARRIVAL progress.         */
/*  Title MUST be fully hidden before that point.                      */
/* ================================================================== */

const CONTAINER_VH = 2000;
/** Progress value at which N viewport-heights have been scrolled */
const vhToP = (scrollVh: number) => scrollVh / (CONTAINER_VH - 100);

/** Summary panel arrives ~100vh into the scroll */
// Summary panel arrives at ~vhToP(100) ≈ 0.053. Title MUST end before this.

const PH = {
  // Title: must end BEFORE summary arrives
  TITLE: { start: vhToP(10), end: vhToP(70) }, // ~0.005–0.037

  // Forge fragments
  FORGE: { start: vhToP(60), end: vhToP(400) }, // ~0.03–0.21
  FORGE_GATE: vhToP(475), // fragments off at ~0.25

  // Embers
  EMBERS: { start: vhToP(130), end: vhToP(460) },

  // Forge atmosphere (glow, grid)
  GLOW: { start: vhToP(80), end: vhToP(480) },

  // Thesis
  THESIS: { start: vhToP(320), end: vhToP(510) }, // ~0.17–0.27

  // Particles → Funnel
  PARTICLES: { start: vhToP(490), end: vhToP(870) }, // ~0.26–0.46
  CANVAS_OUT: { start: vhToP(620), end: vhToP(680) }, // ~0.33–0.36
  SVG_IN: { start: vhToP(620), end: vhToP(660) },
  DOTS_IN: { start: vhToP(620), end: vhToP(680) },
  LABELS_IN: { start: vhToP(585), end: vhToP(660) },
  RIBBON_TIERS: [
    { start: vhToP(620), end: vhToP(680) }, // → AMBOSS
    { start: vhToP(680), end: vhToP(740) }, // → Compado
    { start: vhToP(740), end: vhToP(800) }, // → CAPinside
    { start: vhToP(800), end: vhToP(840) }, // → DKB
  ],
  CONVERGE_PT: { start: vhToP(800), end: vhToP(870) },
  FUNNEL_OUT: { start: vhToP(840), end: vhToP(900) },
  CAPTION_TIERS: [
    { start: vhToP(620), end: vhToP(700) },
    { start: vhToP(700), end: vhToP(760) },
    { start: vhToP(760), end: vhToP(820) },
    { start: vhToP(820), end: vhToP(880) },
  ],

  // Beats (scene → action → shift per company)
  BEATS: [
    { start: vhToP(950), end: vhToP(1120) }, // AMBOSS
    { start: vhToP(1120), end: vhToP(1290) }, // Compado
    { start: vhToP(1290), end: vhToP(1460) }, // CAPinside
    { start: vhToP(1460), end: vhToP(1630) }, // DKB
  ],

  // Crystallize
  CRYSTALLIZE: { start: vhToP(1670), end: vhToP(1860) },

  // Chrome
  CHROME_END: vhToP(1750),
};

// Canvas particle local phases (0–1 within PARTICLES range)
const PP = {
  CANVAS_IN: [0.0, 0.05] as const,
  EXPLODE: [0.05, 0.2] as const,
  CONVERGE: [0.2, 0.45] as const,
  FADE_OUT: [0.4, 0.55] as const,
};

function initParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let si = 0; si < STREAMS.length; si++) {
    for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
      const seed = si * 100 + i;
      const baseAngle = (si / STREAMS.length) * Math.PI * 2;
      particles.push({
        streamIdx: si,
        angle: baseAngle + (srand(seed + 10) - 0.5) * 1.4,
        radius: 0.12 + srand(seed + 11) * 0.28,
        size: 2 + srand(seed + 1) * 2.5,
        color: STREAMS[si].color,
      });
    }
  }
  return particles;
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ForgeWorkstation() {
  const { isLg, isSm: isSmRef } = useBreakpointRefs();
  // isSmRef used in fragments, funnel camera-track, crystallize
  void isSmRef;

  /* ---- V0 refs ---- */
  const forgeStickyRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);
  const forgeContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInViewRef = useRef<HTMLDivElement>(null);
  const fragmentEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisEls = useRef<(HTMLDivElement | null)[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termContentRef = useRef<HTMLPreElement>(null);
  const termWipeRef = useRef<HTMLDivElement>(null);
  const termNarrativeRef = useRef<HTMLDivElement>(null);
  const termLastStateRef = useRef({ company: -1, chars: -1 });
  const midNarratorRef = useRef<HTMLDivElement>(null);
  const termProgressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const termProgressWrapRef = useRef<HTMLDivElement>(null);
  const principleEls = useRef<(HTMLDivElement | null)[]>([]);
  const glowEl = useRef<HTMLDivElement>(null);
  const innerGlowEl = useRef<HTMLDivElement>(null);
  const flashEl = useRef<HTMLDivElement>(null);
  const gridEl = useRef<HTMLDivElement>(null);
  const vignetteEl = useRef<HTMLDivElement>(null);
  const beatGlowEl = useRef<HTMLDivElement>(null);
  const crystLineEl = useRef<HTMLDivElement>(null);
  const scrollHintEl = useRef<HTMLDivElement>(null);
  const progressBarEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLDivElement>(null);

  /* ---- Particle refs ---- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleProgressRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const particlesRef = useRef<Particle[]>(initParticles());
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  /* ---- Funnel SVG refs ---- */
  const funnelSvgWrapRef = useRef<HTMLDivElement>(null);
  const funnelSvgRef = useRef<SVGSVGElement>(null);
  const svgRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const funnelDotRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelSegmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const funnelStreamLabelRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelConvergeRef = useRef<SVGGElement | null>(null);
  const funnelBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const funnelNarratorRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Mobile camera-track refs
  const cameraTrackRef = useRef<HTMLDivElement>(null);
  const cameraNodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cameraSkillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const mobileCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ---- Data ---- */
  const fragments = useMemo(createFragments, []);
  const principles = useMemo(createPrinciples, []);
  const embers = useMemo(createEmbers, []);

  /* ---- Title scramble ---- */
  const titleInView = useInView(titleInViewRef, { once: true, amount: 0.5 });
  const [titleActive, setTitleActive] = useState(false);
  useEffect(() => {
    if (titleInView) setTitleActive(true);
  }, [titleInView]);

  /* ---- Forge scroll (V0 — 1000vh) ---- */
  const { scrollYProgress: forgeProgress } = useScroll({
    target: forgeContainerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(forgeProgress, "change", (p) => {
    /* ---- Curtain edge: where the summary panel top is on screen ---- */
    let curtainTop = window.innerHeight; // default: off-screen (no curtain)
    if (summaryPanelRef.current) {
      const st = summaryPanelRef.current.getBoundingClientRect().top;
      if (st < window.innerHeight) curtainTop = Math.max(0, st);
    }

    /* ---- Chrome ---- */
    if (scrollHintEl.current)
      scrollHintEl.current.style.opacity = String(1 - ss(0, PH.TITLE.start, p));
    if (progressBarEl.current)
      progressBarEl.current.style.width = `${p * 100}%`;
    if (phaseEl.current) {
      phaseEl.current.textContent = phaseLabel(p);
      phaseEl.current.style.opacity = String(
        p > PH.TITLE.start && p < PH.CHROME_END ? 0.3 : 0,
      );
    }

    /* ---- Title fade: slow scroll fade + fast erase when panel arrives ---- */
    if (titleRef.current) {
      // Slow fade over a wide scroll range
      const slowFade = 1 - ss(PH.TITLE.start, PH.TITLE.end * 3, p);
      // Fast erase when panel is on-screen — same curtainReveal as fragments
      const curtainFade = curtainTop >= window.innerHeight
        ? 1
        : Math.max(0, (curtainTop - window.innerHeight * 0.3) / (window.innerHeight * 0.2));
      titleRef.current.style.opacity = String(Math.min(slowFade, curtainFade));
    }

    /* ============================================================== */
    /*  MOVEMENT 1: THE FORGE                                          */
    /*  Uses PH.FORGE for boundaries, PH.FORGE_GATE for cutoff        */
    /* ============================================================== */
    const vh = window.innerHeight;
    const CURTAIN_FADE = 80;

    if (p < PH.FORGE_GATE) {
      fragments.forEach((f, i) => {
        const el = fragmentEls.current[i];
        if (!el) return;
        if (f.isSeed) {
          const fadeIn = ss(0.03, 0.08, p);
          const drift = ss(0.05, 0.15, p),
            converge = ss(0.14, 0.21, p),
            heat = ss(0.1, 0.18, p);
          const dX = f.x0 + f.dx * drift,
            dY = f.y0 + f.dy * drift;
          const x = lerp(dX, 0, converge),
            y = lerp(dY, 0, converge);
          const rot = lerp(f.rot, 0, converge);
          const scale = lerp(1, 1.3, heat) * lerp(1, 0.5, ss(0.19, 0.23, p));
          const fragScreenY = vh * 0.5 + (y * vh) / 100;
          const curtainReveal =
            curtainTop >= vh
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          const goldT = ss(0.7, 1, converge);
          const [cr, cg, cb] = CC_EXT[f.companyIdx % CC_EXT.length];
          const cm = goldT * goldT;
          el.style.color = `rgb(${Math.round(lerp(cr, 201, cm))},${Math.round(lerp(cg, 168, cm))},${Math.round(lerp(cb, 76, cm))})`;
          const dissolve = ss(0.17, 0.19, p);
          const dissolveBlur = lerp(0, 12, dissolve);
          const dissolveAlpha = lerp(1, 0.1, dissolve);
          const baseBlur = lerp(lerp(1, 0, ss(0.03, 0.07, p)), 3, goldT);
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg) scale(${scale})`;
          el.style.opacity = String(fadeIn * dissolveAlpha * curtainReveal);
          el.style.filter = `blur(${baseBlur + dissolveBlur}px)`;
        } else {
          const fadeIn = ss(0.02, 0.08, p),
            fadeOut = 1 - ss(f.dissolveStart * 0.7, f.dissolveEnd * 0.7, p);
          const drift = ss(0.04, 0.19, p),
            dissolve = ss(f.dissolveStart * 0.7, f.dissolveEnd * 0.7, p);
          const x = f.x0 + f.dx * drift,
            y = f.y0 + f.dy * drift,
            rot = f.rot * (1 + drift * 0.3);
          let baseAlpha: number;
          switch (f.type) {
            case "company":
              baseAlpha = 1.0;
              break;
            case "code":
            case "command":
              baseAlpha = 0.75;
              break;
            case "logo":
              baseAlpha = 0.85;
              break;
            default:
              baseAlpha = 0.75;
          }
          const fragScreenY = vh * 0.5 + (y * vh) / 100;
          const curtainReveal =
            curtainTop >= vh
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg)`;
          el.style.opacity = String(
            fadeIn * fadeOut * baseAlpha * curtainReveal,
          );
          el.style.filter = `blur(${lerp(0, 12, dissolve)}px)`;
        }
      });
    } else {
      fragments.forEach((_, i) => {
        const el = fragmentEls.current[i];
        if (el) el.style.opacity = "0";
      });
    }

    /* ---- Embers ---- */
    embers.forEach((e, i) => {
      const el = emberEls.current[i];
      if (!el) return;
      const heat = ss(0.07 + e.delay, 0.15, p),
        cool = ss(0.19, 0.24, p),
        active = heat * (1 - cool);
      const rise = ss(0.08 + e.delay, 0.21, p);
      el.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      el.style.opacity = String(active * (0.4 + Math.sin(p * 80 + i) * 0.3));
    });

    /* ---- Forge atmosphere — disabled, no visible glows ---- */
    if (glowEl.current) glowEl.current.style.opacity = "0";
    if (innerGlowEl.current) innerGlowEl.current.style.opacity = "0";
    if (gridEl.current) {
      const appear = ss(0.02, 0.06, p),
        fade = 1 - ss(0.18, 0.24, p);
      gridEl.current.style.opacity = String(appear * fade * 0.05);
    }

    /* ---- Thesis (0.17 — 0.27) ---- */
    // Mobile: wider y-spacing + maxWidth to prevent overlap with wrapped text
    const lg = isLg.current;
    if (thesisEls.current[0]) {
      const fadeIn = ss(0.17, 0.2, p),
        fadeOut = 1 - ss(0.24, 0.27, p);
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(lg ? 2 : -6, lg ? -5 : -12, ss(0.17, 0.27, p))}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
      thesisEls.current[0].style.maxWidth = lg ? "60vw" : "85vw";
    }
    if (thesisEls.current[1]) {
      const fadeIn = ss(0.19, 0.22, p),
        fadeOut = 1 - ss(0.24, 0.27, p);
      thesisEls.current[1].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[1].style.transform = `translate(-50%, calc(-50% + ${lerp(lg ? 12 : 10, lg ? 6 : 4, ss(0.19, 0.27, p))}vh))`;
      thesisEls.current[1].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
      thesisEls.current[1].style.maxWidth = lg ? "60vw" : "85vw";
    }
    if (thesisEls.current[2]) {
      const fadeIn = ss(0.21, 0.24, p),
        fadeOut = 1 - ss(0.25, 0.27, p);
      thesisEls.current[2].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[2].style.transform = `translate(-50%, calc(-50% + ${lerp(lg ? 22 : 26, lg ? 17 : 22, ss(0.21, 0.27, p))}vh))`;
      thesisEls.current[2].style.filter = `blur(${lerp(4, 0, fadeIn)}px)`;
      thesisEls.current[2].style.maxWidth = lg ? "40vw" : "80vw";
    }

    /* ============================================================== */
    /*  PARTICLES → DOTS → RIBBONS (0.26 — 0.47)                      */
    /*  V7 approach: canvas particles converge to SVG dot positions,   */
    /*  SVG dots appear as canvas fades, ribbons grow from dots.       */
    /*                                                                 */
    /*  0.26–0.28: canvas particles appear + explode from center       */
    /*  0.28–0.32: particles converge to SVG top-tier dot positions    */
    /*  0.30–0.34: canvas fades out, SVG dots appear (handoff)         */
    /*  0.31–0.35: stream labels fade in                               */
    /*  0.33–0.44: ribbons grow tier by tier                           */
    /*  0.42–0.46: convergence point appears                           */
    /*  0.44–0.47: everything fades out                                */
    /* ============================================================== */
    {
      // Canvas particles: full range → local 0–1
      const PART_START = PH.PARTICLES.start,
        PART_END = PH.PARTICLES.end;
      const pt = Math.max(
        0,
        Math.min(1, (p - PART_START) / (PART_END - PART_START)),
      );
      particleProgressRef.current = pt;

      // Canvas + SVG overlap at same positions for seamless handoff (like V7)
      // Canvas fades out AS SVG dots fade in — no black gap
      if (canvasWrapRef.current) {
        const canvasIn = ss(0.26, 0.27, p);
        const canvasOut = 1 - ss(0.33, 0.36, p);
        canvasWrapRef.current.style.opacity = String(canvasIn * canvasOut);
      }

      // SVG funnel wrapper: appears as canvas starts fading (simultaneous crossfade)
      if (funnelSvgWrapRef.current) {
        const svgIn = ss(0.33, 0.35, p);
        const svgOut = 1 - ss(0.45, 0.47, p);
        funnelSvgWrapRef.current.style.opacity = String(svgIn * svgOut);
      }

      // SVG dots: appear as canvas particles arrive at same positions
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelDotRefs.current[si];
        if (!el) continue;
        const stagger = si * 0.003;
        const dotIn = ss(0.33 + stagger, 0.36 + stagger, p);
        const dotOut = 1 - ss(0.45, 0.47, p);
        const ribbonStart = ss(0.36, 0.4, p);
        const scale = lerpFn(2, 1, ribbonStart);
        const glowR = lerpFn(6, 3, ribbonStart);
        el.style.opacity = String(dotIn * dotOut);
        el.style.transform = `scale(${dotIn > 0 ? scale : 0})`;
        const blur = el.querySelector("feGaussianBlur");
        if (blur) blur.setAttribute("stdDeviation", String(glowR));
      }

      // Stream labels — appear at 0.30–0.33, tighter stagger
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelStreamLabelRefs.current[si];
        if (!el) continue;
        const stagger = si * 0.002;
        const labelIn = ss(0.30 + stagger, 0.32 + stagger, p);
        const labelOut = 1 - ss(0.45, 0.47, p);
        el.style.opacity = String(labelIn * labelOut);
        el.style.transform = `translateY(${lerpFn(-10, 0, labelIn)}px)`;
      }

      // Ribbon segments grow tier by tier from 0.33–0.44
      const TIER_THRESHOLDS = [
        [0.33, 0.36], // top spread → AMBOSS
        [0.36, 0.39], // AMBOSS → Compado
        [0.39, 0.42], // Compado → CAPinside
        [0.42, 0.44], // CAPinside → DKB
      ];
      for (let i = 0; i < F_SEGMENTS.length; i++) {
        const el = funnelSegmentRefs.current[i];
        if (!el) continue;
        const seg = F_SEGMENTS[i];
        const threshIdx = Math.min(seg.toTier - 1, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const t = ss(threshStart, threshEnd, p);
        const fadeOut = 1 - ss(0.45, 0.47, p);
        el.style.opacity = String(lerpFn(0, seg.opacityEnd, t) * fadeOut);
        const scaleY = lerpFn(0, 1, t);
        el.style.transformOrigin = `${F_CENTER_X}px ${F_TIER_Y[seg.fromTier]}px`;
        el.style.transform = `scaleY(${scaleY})`;
      }

      // Company nodes — appear just before ribbons reach their tier (late in the threshold)
      for (let ni = 0; ni < NODES.length; ni++) {
        const el = funnelNodeRefs.current[ni];
        if (!el) continue;
        const threshIdx = Math.min(ni, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const nodeT = ss(
          lerpFn(threshStart, threshEnd, 0.7),
          threshEnd,
          p,
        );
        const fadeOut = 1 - ss(0.45, 0.47, p);
        el.style.opacity = String(nodeT * fadeOut);
        el.style.transform = `translateY(${lerpFn(8, 0, nodeT)}px)`;
      }

      // Convergence point — appears after ribbons complete
      if (funnelConvergeRef.current) {
        const ct = ss(0.42, 0.44, p);
        const fadeOut = 1 - ss(0.45, 0.47, p);
        funnelConvergeRef.current.style.opacity = String(ct * fadeOut);
        if (funnelBlurRef.current) {
          funnelBlurRef.current.setAttribute(
            "stdDeviation",
            String(lerpFn(0, 12, ct)),
          );
        }
      }

      // Narrator glass panels — positioned right, slide down with tiers
      const NAR_THRESHOLDS = [
        [0.35, 0.38],
        [0.38, 0.41],
        [0.41, 0.44],
        [0.44, 0.46],
      ];
      for (let ni = 0; ni < FUNNEL_NARRATOR.length; ni++) {
        const el = funnelNarratorRefs.current[ni];
        if (!el) continue;
        const [ts, te] = NAR_THRESHOLDS[ni];
        const fadeIn = ss(ts, lerpFn(ts, te, 0.15), p);
        const fadeOut = 1 - ss(lerpFn(ts, te, 0.85), te, p);
        el.style.opacity = String(fadeIn * fadeOut * 0.75);
        el.style.transform = `translateY(${lerpFn(12, 0, fadeIn)}px)`;
      }

      /* ---- Mobile camera-track (phone only) ---- */
      if (!lg) {
        // Camera track wrapper: same timing as SVG funnel
        if (cameraTrackRef.current) {
          const trackIn = ss(0.28, 0.31, p);
          const trackOut = 1 - ss(0.475, 0.49, p);
          cameraTrackRef.current.style.opacity = String(trackIn * trackOut);
        }
        // (track line removed — content alone carries the convergence)
        // Skills accumulate progressively — staggered by first company tier
        const SKILL_TIERS = [0.30, 0.35, 0.39, 0.43]; // matching company tiers
        for (let si = 0; si < STREAMS.length; si++) {
          const el = cameraSkillRefs.current[si];
          if (!el) continue;
          const firstTier = STREAMS[si].path[0];
          const stagger = si * 0.005;
          const tierStart = SKILL_TIERS[firstTier] + stagger;
          const fadeIn = ss(tierStart, tierStart + 0.02, p);
          const fadeOut = 1 - ss(0.46, 0.48, p);
          const fromLeft = si % 2 === 0;
          const slideX = lerpFn(fromLeft ? -40 : 40, 0, fadeIn);
          const scale = lerpFn(0.8, 1, fadeIn);
          el.style.opacity = String(Math.max(0, fadeIn * fadeOut));
          el.style.transform = `translateX(${slideX}px) scale(${scale})`;
        }
        // Convergence diamond — appears after most skills are in
        const convEl = cameraNodeRefs.current[0];
        if (convEl) {
          const convIn = ss(0.44, 0.46, p);
          const convOut = 1 - ss(0.47, 0.48, p);
          convEl.style.opacity = String(convIn * convOut);
        }
      }
    }

    /* ---- Mid narrator: "Let me show you what I've done" ---- */
    if (midNarratorRef.current) {
      // Tight: funnel gone at 0.46, narrator immediately, terminal at 0.505
      const midStart = 0.465,
        midEnd = 0.5;
      const midIn = ss(midStart, midStart + 0.005, p);
      const midOut = 1 - ss(midEnd - 0.005, midEnd, p);
      midNarratorRef.current.style.opacity = String(midIn * midOut);
      midNarratorRef.current.style.transform = `translateY(${lerp(10, 0, midIn)}px)`;
    }

    /* ============================================================== */
    /*  MOVEMENT 2: TERMINAL REPLAY (replaces beats)                   */
    /* ============================================================== */
    {
      const termEl = terminalRef.current;
      const termContent = termContentRef.current;
      const termWipe = termWipeRef.current;

        // Terminal + mobile carousel timing (shared scroll phase)
        const termStart = PH.BEATS[0].start;
        const termEnd = PH.BEATS[3].end;
        const termIn = ss(termStart, termStart + 0.01, p);
        const termOut = 1 - ss(termEnd - 0.01, termEnd, p);

        // Fade desktop terminal
        if (termEl) termEl.style.opacity = String(termIn * termOut);
        if (termProgressWrapRef.current) {
          termProgressWrapRef.current.style.opacity = String(termIn * termOut);
        }
        // Fade mobile carousel wrapper
        if (!lg && mobileCarouselRef.current) {
          mobileCarouselRef.current.style.opacity = String(termIn * termOut);
        }

        if (termIn > 0 && termOut > 0) {
          // Determine which company
          const totalDur = termEnd - termStart;
          const localP = Math.max(0, Math.min(1, (p - termStart) / totalDur));
          const companyIdx = Math.min(Math.floor(localP * 4), 3);
          const companyProgress = (localP - companyIdx / 4) * 4;

          // Mobile: show/hide stacked cards based on scroll progress
          if (!lg) {
            for (let ci = 0; ci < 4; ci++) {
              const card = mobileCardRefs.current[ci];
              if (card) card.style.opacity = ci === companyIdx ? "1" : "0";
            }
            // Update dot indicators
            const CC4 = ["#60A5FA", "#42B883", "#06B6D4", "#F472B6"];
            termProgressRefs.current.forEach((dot, i) => {
              if (!dot) return;
              dot.style.width = i === companyIdx ? "20px" : "6px";
              dot.style.opacity = i === companyIdx ? "1" : "0.35";
              dot.style.background = i === companyIdx ? CC4[companyIdx] : "var(--text-dim)";
            });
          }

      if (termEl && termContent && termWipe) {

          // Phase boundaries — terminal types in first half, narrative reveals in second
          const P1_END = 0.2,
            P2_END = 0.35,
            P3_END = 0.48;
          const NAR_START = 0.5,
            NAR_END = 0.88;

          // Wipe — only at very end, AFTER narrative finishes
          const wipeProgress = ss(0.9, 0.97, companyProgress);
          termWipe.style.opacity =
            wipeProgress > 0 && wipeProgress < 1 ? "1" : "0";
          termWipe.style.transform = `translateY(${(1 - wipeProgress) * 100}%)`;

          if (wipeProgress >= 0.99) {
            if (termLastStateRef.current.chars !== -2) {
              termContent.innerHTML = "";
              termLastStateRef.current = { company: companyIdx, chars: -2 };
            }
          } else {
            const lines = ALL_COMPANY_LINES[companyIdx];
            const cc = CHAR_COUNTS[companyIdx];

            // How many chars to reveal
            let charsToShow = 0;
            if (companyProgress <= P1_END) {
              charsToShow = Math.floor(
                remap(companyProgress, 0, P1_END, 0, cc.p1),
              );
            } else if (companyProgress <= P2_END) {
              charsToShow =
                cc.p1 +
                Math.floor(remap(companyProgress, P1_END, P2_END, 0, cc.p2));
            } else if (companyProgress <= P3_END) {
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
              const lineLen = line.text.length + 1;
              if (charsSoFar >= charsToShow) break;

              const visibleChars = Math.min(
                line.text.length,
                charsToShow - charsSoFar,
              );
              const visibleText = escapeHtml(line.text.slice(0, visibleChars));
              const isPartial = visibleChars < line.text.length;

              const numStr = `<span style="color:${TC.lineNum};user-select:none;display:inline-block;width:3ch;text-align:right;margin-right:1.5ch;">${lineNum}</span>`;

              let fg: string = TC.text;
              let bg: string = "transparent";
              let italic = false;
              switch (line.style) {
                case "keyword":
                  fg = TC.keyword;
                  break;
                case "add":
                  fg = TC.addedFg;
                  bg = TC.addedBg;
                  break;
                case "remove":
                  fg = TC.removedFg;
                  bg = TC.removedBg;
                  break;
                case "comment":
                  fg = TC.comment;
                  italic = true;
                  break;
                case "promotion":
                  fg = "#FBBF24";
                  bg = "rgba(251,191,36,0.08)";
                  break;
                case "string":
                  fg = TC.string;
                  break;
              }

              const cursor =
                isPartial && !cursorPlaced
                  ? `<span style="color:${TC.text};animation:blink 1s step-end infinite;">█</span>`
                  : "";
              if (isPartial) cursorPlaced = true;

              html += `<div style="background:${bg};min-height:1.5em;line-height:1.5;padding:0 1ch;">${numStr}<span style="color:${fg};${italic ? "font-style:italic;" : ""}">${visibleText}</span>${cursor}</div>`;

              charsSoFar += lineLen;
              lineNum++;
            }

            // Cursor only during active typing — not after all content is shown
            // (prevents extra empty line)

            // Only update DOM when content actually changed (preserves cursor blink animation)
            if (
              termLastStateRef.current.company !== companyIdx ||
              termLastStateRef.current.chars !== charsToShow
            ) {
              termContent.innerHTML = html;
              termLastStateRef.current = {
                company: companyIdx,
                chars: charsToShow,
              };
            }
          }

          // V15-style narrative reveal — starts AFTER terminal finishes
          const narEl = termNarrativeRef.current;
          if (narEl) {
            const nar = TERM_NARRATIVES[companyIdx];
            // Map NAR_START..NAR_END to 0..1
            const narP = Math.max(
              0,
              Math.min(
                1,
                (companyProgress - NAR_START) / (NAR_END - NAR_START),
              ),
            );
            const sceneReveal = ss(0, 0.4, narP);
            const actionFade = ss(0.42, 0.6, narP);
            const shiftFade = ss(0.62, 0.8, narP);
            const fadeOut =
              companyProgress > 0.9 ? ss(0.9, 0.95, companyProgress) : 0;
            narEl.style.opacity = String(1 - fadeOut);

            const nameEl = narEl.querySelector<HTMLElement>("[data-role=name]");
            const periodEl =
              narEl.querySelector<HTMLElement>("[data-role=period]");
            const sceneEl =
              narEl.querySelector<HTMLElement>("[data-role=scene]");
            const actionEl =
              narEl.querySelector<HTMLElement>("[data-role=action]");
            const shiftEl =
              narEl.querySelector<HTMLElement>("[data-role=shift]");

            if (nameEl) {
              nameEl.textContent = TERM_COMPANIES[companyIdx].company + " · " + TERM_COMPANIES[companyIdx].location;
              nameEl.style.color = ["#60A5FA", "#42B883", "#06B6D4", "#F472B6"][
                companyIdx
              ];
              nameEl.style.opacity = String(ss(0, 0.1, narP));
            }
            if (periodEl) {
              periodEl.textContent = TERM_COMPANIES[companyIdx].dates;
              periodEl.style.opacity = String(ss(0, 0.1, narP));
            }
            if (sceneEl && nar) {
              sceneEl.textContent = nar.scene;
              const clipRight = 100 - sceneReveal * 100;
              sceneEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
            }
            if (actionEl && nar) {
              actionEl.textContent = nar.action;
              actionEl.style.opacity = String(actionFade);
              actionEl.style.transform = `translateY(${lerp(8, 0, actionFade)}px)`;
            }
            if (shiftEl && nar) {
              shiftEl.textContent = nar.shift;
              shiftEl.style.opacity = String(shiftFade);
              shiftEl.style.transform = `translateY(${lerp(8, 0, shiftFade)}px)`;
            }
          }

          // Dot indicator — active dot is pill, others are circles
          const DOT_COLORS = ["#60A5FA", "#42B883", "#06B6D4", "#F472B6"];
          for (let pi = 0; pi < 4; pi++) {
            const dot = termProgressRefs.current[pi];
            if (!dot) continue;
            const isActive = pi === companyIdx;
            dot.style.width = isActive ? "20px" : "6px";
            dot.style.opacity = isActive ? "1" : "0.35";
            dot.style.background = isActive ? DOT_COLORS[pi] : "var(--text-dim)";
          }
        }
      }
    }

    // Beat glow + vignette disabled — clean dark background only
    if (beatGlowEl.current) beatGlowEl.current.style.opacity = "0";
    if (vignetteEl.current) vignetteEl.current.style.opacity = "0";

    /* ============================================================== */
    /*  MOVEMENT 3: CRYSTALLIZE (0.88 — 0.98)                          */
    /* ============================================================== */
    {
      const cS = PH.CRYSTALLIZE.start,
        cE = PH.CRYSTALLIZE.end,
        cD = cE - cS;
      if (flashEl.current) flashEl.current.style.opacity = "0";
      if (crystLineEl.current) {
        const appear = ss(cS + cD * 0.15, cS + cD * 0.35, p);
        crystLineEl.current.style.opacity = String(appear * 0.3);
        crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
      }
      principles.forEach((pr, i) => {
        const el = principleEls.current[i];
        if (!el) return;
        const stagger = i * cD * 0.06;
        const fadeIn = ss(cS + cD * 0.2 + stagger, cS + cD * 0.55 + stagger, p);
        const settle = ss(cS + cD * 0.35 + stagger, cS + cD * 0.85, p);
        // Mobile: wider spacing between principles
        const mobileYOffset = lg ? pr.yOffset : (i - 1.5) * 20;
        const y = lerp(mobileYOffset + 6, mobileYOffset, settle);
        el.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
        el.style.opacity = String(fadeIn);
        el.style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
        el.style.maxWidth = lg ? "44vw" : "min(320px, 85vw)";
      });
    }
  });

  /* ---- Particles now driven from forge progress (0.27–0.46 → 0–1) ---- */

  /* ---- Resize (canvas + SVG rect cache) ---- */
  const handleResize = useCallback(() => {
    const w = window.innerWidth,
      h = window.innerHeight;
    sizeRef.current = { w, h };
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }
    if (funnelSvgRef.current) {
      const r = funnelSvgRef.current.getBoundingClientRect();
      svgRectRef.current = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    }
  }, []);

  /* ---- Particle animation loop (V7: explode → converge to SVG dots → fade) ---- */
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    let rafId: number;

    function draw() {
      const canvas = canvasRef.current,
        ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const p = particleProgressRef.current;
      ctx.clearRect(0, 0, w, h);

      // Only draw during explosion+convergence phases
      if (p > PP.FADE_OUT[1]) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const centerX = w * 0.5,
        centerY = h * 0.5;
      const particles = particlesRef.current;

      for (const particle of particles) {
        const si = particle.streamIdx;
        const target = F_TOP_POSITIONS[si];
        const { px: targetX, py: targetY } = svgToPixel(
          target.x,
          target.y,
          svgRectRef.current,
        );

        let px: number, py: number, alpha: number;

        if (p < PP.EXPLODE[1]) {
          // Explode outward from center
          const t = smoothstep(PP.EXPLODE[0], PP.EXPLODE[1], p);
          const eased = 1 - (1 - t) * (1 - t);
          const dist = particle.radius * Math.min(w, h) * eased;
          px = centerX + Math.cos(particle.angle) * dist;
          py = centerY + Math.sin(particle.angle) * dist;
          alpha = smoothstep(0, 0.015, p);
        } else {
          // Converge to target (SVG dot position)
          const t = smoothstep(PP.CONVERGE[0], PP.CONVERGE[1], p);
          const eased = t * t * (3 - 2 * t); // smoothstep easing
          const dist = particle.radius * Math.min(w, h);
          const explodedX = centerX + Math.cos(particle.angle) * dist;
          const explodedY = centerY + Math.sin(particle.angle) * dist;
          px = lerpFn(explodedX, targetX, eased);
          py = lerpFn(explodedY, targetY, eased);
          // Fade out as SVG dots fade in
          alpha = 1 - smoothstep(PP.FADE_OUT[0], PP.FADE_OUT[1], p);
        }

        if (alpha <= 0.01) continue;

        // Shrink particles as they converge
        const convergeT = smoothstep(PP.CONVERGE[0], PP.CONVERGE[1], p);
        const size = lerpFn(particle.size, particle.size * 0.6, convergeT);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        grad.addColorStop(0, particle.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha * 0.25 * (1 - convergeT * 0.7);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      <ForgeNav />

      {/* ============================================================ */}
      {/*  FORGE CONTAINER (1000vh) — V0's complete sequence            */}
      {/* ============================================================ */}
      <div
        ref={forgeContainerRef}
        style={{ height: `${CONTAINER_VH}vh` }}
        className="relative">
        <div
          ref={forgeStickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size] [--frag-scale:0.6] sm:[--frag-scale:0.85]"
          style={{ background: "var(--bg)", zIndex: 1 }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20"
            style={{ height: 0, opacity: 0, background: "var(--bg)" }}
          />

          {/* Atmosphere */}
          <div
            ref={gridEl}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div
            ref={vignetteEl}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, var(--bg) 100%)",
            }}
          />

          {/* Glow elements — no visible shape, just ambient color wash */}
          <div
            ref={glowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(91,158,194,0.04) 0%, transparent 70%)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
          <div
            ref={innerGlowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              background:
                "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
          <div
            ref={flashEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              background:
                "radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(240,230,208,0.08) 30%, transparent 60%)",
              opacity: 0,
            }}
          />
          <div
            ref={beatGlowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              opacity: 0,
              willChange: "opacity, background",
            }}
          />
          <div
            ref={crystLineEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "30vw",
              height: "1px",
              background: "var(--gold-dim)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />

          {/* Embers */}
          {embers.map((e, i) => (
            <div
              key={`ember-${i}`}
              ref={(el) => {
                emberEls.current[i] = el;
              }}
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{
                width: e.size,
                height: e.size,
                background:
                  "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 70%, transparent 100%)",
                opacity: 0,
                willChange: "transform, opacity",
              }}
            />
          ))}

          {/* Title */}
          <div
            ref={titleRef}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ willChange: "transform, opacity" }}>
            <div ref={titleInViewRef}>
              <motion.div
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={
                  titleActive ? { opacity: 1, letterSpacing: "0.5em" } : {}
                }
                transition={{ duration: 1.2, delay: 0.2 }}
                className="mb-6 text-xs sm:text-sm md:text-base text-center"
                style={{ color: ACT_BLUE }}>
                {ACT_II.act}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={titleActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
                className="font-sans text-4xl font-bold tracking-[-0.03em] text-center sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]"
                style={{ color: "var(--cream)" }}>
                {ACT_II.title
                  .toUpperCase()
                  .replace(/I/, "1")
                  .split(" ")
                  .map((word, i) => (
                    <span key={i} className="block">
                      <ScrambleWord text={word} active={titleActive} />
                    </span>
                  ))}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={titleActive ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
                className="font-serif text-sm italic text-center mt-6 mx-auto sm:text-base"
                style={{ color: "var(--cream-muted)", maxWidth: "min(500px, 85vw)" }}>
                {ACT_II.splash}
              </motion.p>
            </div>
          </div>

          {/* Forge fragments — scale down on mobile for less clutter */}
          {fragments.map((f, i) => {
            const setRef = (el: HTMLElement | null) => {
              fragmentEls.current[i] = el;
            };
            const base =
              "absolute left-1/2 top-1/2 select-none pointer-events-none";
            switch (f.type) {
              case "code":
                return (
                  <div
                    key={`code-${i}`}
                    ref={setRef}
                    aria-hidden
                    className={`${base} whitespace-nowrap`}
                    style={{
                      opacity: 0,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "rgba(14,14,20,0.85)",
                      border: `1px solid ${fcExt(f.companyIdx, 0.25)}`,
                      fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                      fontFamily: "var(--font-sans)",
                      color: fcExt(f.companyIdx, 0.95),
                      letterSpacing: "0.02em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: "rgba(198,120,221,0.9)" }}>
                      {f.code.match(
                        /^(const |let |var |export |async |await |function |interface |import )/,
                      )?.[0] ?? ""}
                    </span>
                    <span style={{ color: fcExt(f.companyIdx, 0.85) }}>
                      {f.code.replace(
                        /^(const |let |var |export |async |await |function |interface |import )/,
                        "",
                      )}
                    </span>
                  </div>
                );
              case "logo":
                return (
                  <div
                    key={`logo-${f.logoKey}-${i}`}
                    ref={setRef}
                    aria-hidden
                    className={`${base} `}
                    style={{
                      opacity: 0,
                      willChange: "transform, opacity, filter",
                    }}>
                    <svg
                      viewBox={f.label ? "0 0 24 36" : "0 0 24 24"}
                      fill="none"
                      style={{
                        overflow: "visible",
                        width: `calc(${f.logoSize}px * var(--frag-scale))`,
                        height: `calc(${f.label ? f.logoSize * 1.5 : f.logoSize}px * var(--frag-scale))`,
                      }}>
                      {LOGOS[f.logoKey]}
                      {f.label && (
                        <text
                          x="12"
                          y="31"
                          textAnchor="middle"
                          fill="#C0B8A0"
                          fontSize="5"
                          fontFamily="var(--font-sans)"
                          letterSpacing="0.06em"
                          style={{ textTransform: "uppercase" }}>
                          {f.label}
                        </text>
                      )}
                    </svg>
                  </div>
                );
              case "command":
                return (
                  <div
                    key={`cmd-${i}`}
                    ref={setRef}
                    aria-hidden
                    className={`${base} whitespace-nowrap `}
                    style={{
                      opacity: 0,
                      padding: "5px 10px",
                      borderRadius: "4px",
                      background: "rgba(7,7,10,0.9)",
                      border: `1px solid ${fcExt(f.companyIdx, 0.2)}`,
                      fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.01em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: fcExt(f.companyIdx, 0.85) }}>$ </span>
                    <span style={{ color: fcExt(f.companyIdx, 0.7) }}>
                      {f.cmd}
                    </span>
                  </div>
                );
              default:
                return (
                  <span
                    key={`${f.type}-${f.text}-${i}`}
                    ref={setRef as (el: HTMLSpanElement | null) => void}
                    aria-hidden
                    className={`${base} whitespace-nowrap font-sans `}
                    style={{
                      fontSize: `calc(${f.size}rem * var(--frag-scale))`,
                      fontWeight: f.weight,
                      color: fcExt(f.companyIdx, 0.95),
                      opacity: 0,
                      letterSpacing:
                        f.type === "company"
                          ? "0.1em"
                          : f.type === "tag"
                            ? "0.06em"
                            : f.type === "seed"
                              ? "0.04em"
                              : "0.02em",
                      textTransform:
                        f.type === "company" ? "uppercase" : undefined,
                      willChange: "transform, opacity, filter",
                      ...(f.type === "tag"
                        ? {
                            padding: "2px 8px",
                            borderRadius: "3px",
                            border: `1px solid ${fcExt(f.companyIdx, 0.2)}`,
                            background: fcExt(f.companyIdx, 0.05),
                          }
                        : {}),
                    }}>
                    {f.text}
                  </span>
                );
            }
          })}

          {/* Thesis */}
          {[
            "Most engineers learn to build things.",
            "Some learn to see them.",
            "That second kind of engineer takes time to become. Not because the skills are hard. Because the education is specific.",
          ].map((line, i) => (
            <div
              key={`thesis-${i}`}
              ref={(el) => {
                thesisEls.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
              style={{
                opacity: 0,
                fontFamily: i < 2 ? "var(--font-serif)" : "var(--font-sans)",
                fontSize:
                  i < 2
                    ? "clamp(1.4rem, 3vw, 2.4rem)"
                    : "clamp(0.8rem, 1.2vw, 1rem)",
                color: i < 2 ? "var(--cream)" : "var(--text-dim)",
                fontWeight: i < 2 ? 400 : 400,
                fontStyle: i === 1 ? "italic" : undefined,
                maxWidth: i < 2 ? "60vw" : "40vw",
                lineHeight: 1.5,
                willChange: "transform, opacity, filter",
              }}>
              {line}
            </div>
          ))}

          {/* Mid narrator — between funnel and terminal */}
          <div
            ref={midNarratorRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: 0, zIndex: 8, pointerEvents: "none" }}>
            <p
              className="font-serif text-center"
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                lineHeight: 1.5,
                color: "var(--cream, #F0E6D0)",
                maxWidth: "min(500px, 85vw)",
                fontStyle: "italic",
              }}>
              Let me show you where I've been.
            </p>
          </div>

          {/* Terminal + Narrative (replaces beats) */}
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          <div
            ref={terminalRef}
            className="absolute inset-0"
            style={{ opacity: 0, zIndex: 8 }}>
            {/* Desktop: Terminal + Narrative side by side */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-center flex-row" style={{ padding: "0 4vw", gap: "3vw" }}>
            {/* LEFT: Terminal */}
            <div
              style={{
                width: "clamp(560px, 38vw, 720px)",
                minHeight: "clamp(400px, 50cqh, 560px)",
                borderRadius: "8px",
                overflow: "hidden",
                background: TC.bg,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                fontFamily: MONO,
                fontSize: "clamp(10px, 1.6cqh, 13px)",
                position: "relative",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column" as const,
              }}>
              {/* Top bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  background: TC.topBar,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: TC.dotRed,
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: TC.dotYellow,
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: TC.dotGreen,
                  }}
                />
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#8b949e",
                    fontSize: "10px",
                  }}>
                  ~/career — zsh
                </span>
              </div>
              {/* Terminal content + wipe (wipe only covers content, not header) */}
              <div
                style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <pre
                  ref={termContentRef}
                  style={{
                    padding: "12px 0",
                    margin: 0,
                    overflow: "hidden",
                    color: TC.text,
                    lineHeight: 1.5,
                    fontSize: "clamp(10px, 1.5cqh, 13px)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word" as const,
                  }}
                />
                <div
                  ref={termWipeRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: TC.bg,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* RIGHT: V15-style narrative reveal */}
            <div
              ref={termNarrativeRef}
              style={{ width: "clamp(340px, 22vw, 420px)", padding: "0" }}>
              {/* Company label — name only (dates are in terminal) */}
              <div style={{ marginBottom: "1.5rem" }}>
                <span
                  data-role="name"
                  className="font-sans"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                  }}
                />
              </div>
              {/* Scene — clip-path reveal left-to-right */}
              <p
                data-role="scene"
                className="font-serif"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  color: "var(--cream, #F0E6D0)",
                  marginBottom: "1.25rem",
                  clipPath: "inset(0 100% 0 0)",
                }}
              />
              {/* Action — fade in */}
              <p
                data-role="action"
                className="font-sans"
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  color: "var(--cream-muted, #B0A890)",
                  marginBottom: "1.25rem",
                  opacity: 0,
                }}
              />
              {/* Shift — fade in italic */}
              <p
                data-role="shift"
                className="font-serif"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  color: "var(--cream, #F0E6D0)",
                  opacity: 0,
                }}
              />
            </div>
            </div>{/* close desktop wrapper */}

          {/* Mobile carousel — static swipeable cards, lg:hidden */}
          {(() => {
            const COMPANY_COLORS = ["#60A5FA", "#42B883", "#06B6D4", "#F472B6"];
            const ROLES: Record<string, string> = {
              AMBOSS: "Frontend Engineer",
              Compado: "Senior Frontend Engineer",
              CAPinside: "Senior Frontend Engineer",
              DKB: "Senior Frontend Engineer",
            };
            return (
              <div
                ref={mobileCarouselRef}
                className="absolute inset-0 lg:hidden"
                style={{ background: "var(--bg)" }}>
                {/* Stacked cards — scroll-driven, one visible at a time */}
                  {TERM_COMPANIES.map((co, ci) => {
                    const nar = TERM_NARRATIVES[ci];
                    return (
                      <div
                        key={co.company}
                        ref={(el) => { mobileCardRefs.current[ci] = el; }}
                        className="absolute inset-0 flex flex-col items-center px-6"
                        style={{ opacity: ci === 0 ? 1 : 0, paddingTop: "clamp(60px, 12vh, 120px)", willChange: "opacity", transition: "opacity 0.3s ease" }}>
                        {/* Company label + role — above the card */}
                        <div style={{ marginBottom: "0.6rem", textAlign: "center" }}>
                          <div className="font-ui" style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COMPANY_COLORS[ci] }}>
                            {co.company} &middot; {co.location}
                          </div>
                          <div className="font-sans" style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginTop: "0.25rem", letterSpacing: "0.04em" }}>
                            {ROLES[co.company]}
                          </div>
                        </div>
                        {/* Glass card container */}
                        <div
                          style={{
                            width: "100%",
                            borderRadius: "16px",
                            padding: "clamp(16px, 3vh, 24px)",
                            background: "rgba(14,14,20,0.45)",
                            backdropFilter: "blur(20px) saturate(1.3)",
                            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
                          }}>
                          {/* Narrative text — clear 3-tier hierarchy */}
                          <div style={{ width: "100%", marginBottom: "clamp(0.8rem, 2vh, 1.2rem)" }}>
                            <p className="font-serif" style={{ fontSize: "1.05rem", lineHeight: 1.55, color: "var(--cream)", marginBottom: "0.75rem" }}>
                              {nar.scene}
                            </p>
                            <p className="font-sans" style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "var(--cream-muted)", marginBottom: "0.75rem" }}>
                              {nar.action}
                            </p>
                            <p className="font-narrator" style={{ fontSize: "0.88rem", lineHeight: 1.5, fontStyle: "italic", color: "var(--gold-dim)" }}>
                              &ldquo;{nar.shift}&rdquo;
                            </p>
                          </div>
                          {/* Mini terminal — role + key takeaway instead of commit */}
                          <div
                            style={{
                              width: "100%",
                              borderRadius: "10px",
                              overflow: "hidden",
                              background: TC.bg,
                              border: "1px solid rgba(255,255,255,0.06)",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px", background: TC.topBar }}>
                              {[TC.dotRed, TC.dotYellow, TC.dotGreen].map((c) => (
                                <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                              ))}
                              <span className="font-sans" style={{ marginLeft: "auto", fontSize: "8px", color: "var(--text-dim)", letterSpacing: "0.05em" }}>~/career</span>
                            </div>
                            <pre style={{ padding: "8px 10px", margin: 0, fontFamily: MONO, fontSize: "10px", lineHeight: 1.7, color: TC.text, whiteSpace: "pre-wrap" }}>
                              <span style={{ color: TC.keyword }}>{co.commitType}: {co.commitMsg}</span>
                              {co.insight.map((line, li) => (
                                <span key={li}>{"\n"}<span style={{ color: TC.comment }}>{line}</span></span>
                              ))}
                              {co.promotion && (
                                <span>{"\n"}<span style={{ color: "#FBBF24", background: "rgba(251,191,36,0.08)", padding: "0 4px", borderRadius: "2px" }}>{co.promotion}</span></span>
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })()}
          </div>{/* close terminalRef outer */}

          {/* Dot indicator — Apple-style, all devices */}
          <div
            ref={termProgressWrapRef}
            style={{
              position: "absolute",
              bottom: "5vh",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10,
              pointerEvents: "auto",
              opacity: 0,
            }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`tp-${i}`}
                ref={(el) => {
                  termProgressRefs.current[i] = el;
                }}
                onClick={() => {
                  const beatDur = PH.BEATS[i].end - PH.BEATS[i].start;
                  const target = PH.BEATS[i].start + beatDur * 0.1;
                  const container = forgeContainerRef.current;
                  if (!container) return;
                  const containerTop =
                    container.getBoundingClientRect().top + window.scrollY;
                  const containerH =
                    container.offsetHeight - window.innerHeight;
                  window.scrollTo({
                    top: containerTop + target * containerH,
                    behavior: "smooth",
                  });
                }}
                style={{
                  height: "6px",
                  width: i === 0 ? "20px" : "6px",
                  borderRadius: "3px",
                  background: i === 0 ? "var(--gold)" : "var(--text-dim)",
                  opacity: i === 0 ? 1 : 0.35,
                  cursor: "pointer",
                  transition: "width 0.3s, opacity 0.3s, background 0.3s",
                }}
              />
            ))}
          </div>

          {/* Principles (crystallize) */}
          {principles.map((pr, i) => (
            <div
              key={`principle-${i}`}
              ref={(el) => {
                principleEls.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
              style={{
                opacity: 0,
                maxWidth: "44vw",
                willChange: "transform, opacity, filter",
              }}>
              <span
                className="font-sans uppercase tracking-widest block"
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  color: fc(i, 0.45),
                  marginBottom: "0.35rem",
                }}>
                {COMPANIES[i].company}
              </span>
              <span
                className="font-serif block"
                style={{
                  fontSize: "clamp(0.9rem, 1.8vw, 1.3rem)",
                  lineHeight: 1.55,
                  color: "var(--cream)",
                }}>
                {pr.text}
              </span>
            </div>
          ))}

          {/* Particle canvas (inside sticky, driven by forge progress) — hidden on phone */}
          <div
            ref={canvasWrapRef}
            className="absolute inset-0 hidden sm:block"
            style={{ opacity: 0, zIndex: 5 }}>
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
          {/* Funnel SVG (crossfades in from canvas) — hidden on phone */}
          <div
            ref={funnelSvgWrapRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none hidden sm:flex"
            style={{ opacity: 0, zIndex: 6, padding: "5vh 4vw" }}>
            <svg
              ref={funnelSvgRef}
              viewBox={`0 0 ${FV_W} ${FV_H}`}
              className="max-w-300"
              preserveAspectRatio="xMidYMid meet"
              style={{
                overflow: "visible",
                width: "100%",
                height: "100%",
                maxHeight: "80vh",
              }}>
              <defs>
                {STREAMS.map((s) => (
                  <linearGradient
                    key={`fgrad-${s.id}`}
                    id={`fgrad-${s.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.6} />
                    <stop
                      offset="100%"
                      stopColor={s.color}
                      stopOpacity={0.95}
                    />
                  </linearGradient>
                ))}
                {/* Per-dot glow filters */}
                {STREAMS.map((_, si) => (
                  <filter
                    key={`wsdot-f-${si}`}
                    id={`wsdot-${si}`}
                    x="-200%"
                    y="-200%"
                    width="500%"
                    height="500%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                  </filter>
                ))}
                <filter
                  id="ws-gold-glow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%">
                  <feGaussianBlur
                    ref={(el) => {
                      funnelBlurRef.current = el;
                    }}
                    in="SourceGraphic"
                    stdDeviation="0"
                  />
                </filter>
              </defs>

              {/* Stream ribbon segments */}
              {F_SEGMENTS.map((seg, i) => (
                <path
                  key={`fseg-${seg.streamId}-${seg.fromTier}-${seg.toTier}`}
                  ref={(el) => {
                    funnelSegmentRefs.current[i] = el;
                  }}
                  d={seg.path}
                  fill={`url(#fgrad-${seg.streamId})`}
                  opacity={0}
                  style={{ willChange: "opacity, transform" }}
                />
              ))}

              {/* Company node lines + labels */}
              {NODES.map((node, ni) => {
                const y = F_TIER_Y[ni + 1];
                const spread = F_TIER_SPREAD[ni + 1];
                return (
                  <g
                    key={`fnode-${node.id}`}
                    ref={(el) => {
                      funnelNodeRefs.current[ni] = el;
                    }}
                    opacity={0}>
                    <line
                      x1={F_CENTER_X - spread - 40}
                      y1={y}
                      x2={F_CENTER_X + spread + 40}
                      y2={y}
                      stroke={node.color}
                      strokeOpacity={0.2}
                      strokeWidth={1}
                      strokeDasharray="4 6"
                    />
                    <text
                      x={F_CENTER_X - spread - 52}
                      y={y - 12}
                      textAnchor="end"
                      className="font-sans"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                      fill={node.color}
                      fillOpacity={0.9}>
                      {node.label}
                    </text>
                    <text
                      x={F_CENTER_X - spread - 52}
                      y={y + 6}
                      textAnchor="end"
                      className="font-sans"
                      style={{ fontSize: "8px" }}
                      fill="#C0B8A0"
                      fillOpacity={0.7}>
                      {node.period}
                    </text>
                  </g>
                );
              })}

              {/* Top dots (V7 approved — glow + core + bright center) */}
              {STREAMS.map((stream, si) => {
                const pos = F_POSITIONS.get(stream.id)![0];
                return (
                  <g
                    key={`fdot-${stream.id}`}
                    ref={(el) => {
                      funnelDotRefs.current[si] = el;
                    }}
                    opacity={0}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={5}
                      fill={stream.color}
                      filter={`url(#wsdot-${si})`}
                      opacity={0.6}
                    />
                    <circle cx={pos.x} cy={pos.y} r={3.5} fill={stream.color} />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={1.5}
                      fill="white"
                      opacity={0.5}
                    />
                  </g>
                );
              })}

              {/* Top stream labels */}
              {STREAMS.map((stream, si) => {
                const pos = F_POSITIONS.get(stream.id)![0];
                return (
                  <g
                    key={`flabel-${stream.id}`}
                    ref={(el) => {
                      funnelStreamLabelRefs.current[si] = el;
                    }}
                    opacity={0}>
                    <text
                      x={pos.x}
                      y={pos.y - 16}
                      textAnchor="middle"
                      className="font-sans"
                      style={{
                        fontSize: "12px",
                        letterSpacing: "0.04em",
                        fontWeight: 500,
                      }}
                      fill={stream.color}
                      fillOpacity={0.9}>
                      {stream.label}
                    </text>
                  </g>
                );
              })}

              {/* Convergence point — diamond + white text */}
              <g
                ref={(el) => {
                  funnelConvergeRef.current = el;
                }}
                opacity={0}>
                <rect
                  x={F_CENTER_X - 3}
                  y={F_CONVERGE_Y - 3}
                  width={6}
                  height={6}
                  rx={1}
                  fill="#C9A84C"
                  transform={`rotate(45 ${F_CENTER_X} ${F_CONVERGE_Y})`}
                />
                <text
                  x={F_CENTER_X}
                  y={F_CONVERGE_Y + 22}
                  textAnchor="middle"
                  className="font-serif"
                  style={{
                    fontSize: "16px",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                  fill="var(--cream)">
                  The Engineer I Became
                </text>
              </g>
            </svg>
          </div>

          {/* Narrator glass panels — right side, accompanying funnel */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 7, overflow: "visible" }}>
            {FUNNEL_NARRATOR.map((text, ni) => {
              const topFrac = [0.28, 0.42, 0.58, 0.74][ni];
              return (
                <div
                  key={`narrator-${ni}`}
                  ref={(el) => {
                    funnelNarratorRefs.current[ni] = el;
                  }}
                  className="absolute hidden lg:block"
                  style={{
                    right: "4%",
                    top: `${topFrac * 100}%`,
                    maxWidth: "170px",
                    opacity: 0,
                    willChange: "transform, opacity",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "10px",
                    background: "rgba(14,14,20,0.5)",
                    backdropFilter: "blur(24px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)",
                  }}>
                  <span
                    className="font-narrator block"
                    style={{
                      fontSize: "0.75rem",
                      lineHeight: 1.6,
                      color: "rgba(192,184,160,0.92)",
                      fontStyle: "italic",
                    }}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile skill convergence — phone only, replaces SVG funnel */}
          <div
            ref={cameraTrackRef}
            className="absolute inset-0 sm:hidden pointer-events-none"
            style={{ opacity: 0, zIndex: 6 }}>
            {/* Skills accumulate center-screen as you scroll */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
              <div className="flex flex-wrap justify-center gap-2.5 max-w-[320px]">
                {STREAMS.map((stream, si) => (
                  <div
                    key={`mobile-skill-${stream.id}`}
                    ref={(el) => { cameraSkillRefs.current[si] = el; }}
                    className="font-sans"
                    style={{
                      fontSize: "0.75rem",
                      padding: "5px 14px",
                      borderRadius: "16px",
                      border: `1px solid ${stream.color}50`,
                      background: `${stream.color}10`,
                      color: stream.color,
                      letterSpacing: "0.03em",
                      opacity: 0,
                      willChange: "transform, opacity",
                    }}>
                    {stream.label}
                  </div>
                ))}
              </div>
              {/* Convergence diamond — appears after all skills */}
              <div
                ref={(el) => { cameraNodeRefs.current[0] = el; }}
                className="flex flex-col items-center gap-2 mt-2"
                style={{ opacity: 0, willChange: "opacity" }}>
                <div
                  className="rotate-45"
                  style={{
                    width: 11,
                    height: 11,
                    background: "var(--gold)",
                    boxShadow: "0 0 18px rgba(201,168,76,0.45)",
                  }}
                />
                <span
                  className="font-ui tracking-widest uppercase"
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--gold-dim)",
                    letterSpacing: "0.2em",
                  }}>
                  The Engineer I Became
                </span>
              </div>
            </div>
          </div>

          {/* Chrome */}
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 font-sans tracking-widest uppercase"
            style={{
              color: "var(--text-dim)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
            }}>
            The Forge — Workstation
          </div>
          <div
            ref={phaseEl}
            className="absolute bottom-12 left-8 font-sans tracking-widest uppercase"
            style={{
              color: "var(--gold-dim)",
              fontSize: "0.55rem",
              letterSpacing: "0.25em",
              opacity: 0,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "var(--stroke)" }}>
            <div
              ref={progressBarEl}
              className="h-full"
              style={{
                width: "0%",
                background: "var(--gold-dim)",
                transition: "none",
              }}
            />
          </div>
        </div>

        {/* ---- Post-section summary (INSIDE container, scrolls up over sticky) ---- */}
        <div
          ref={summaryPanelRef}
          className="relative flex flex-col items-center justify-center py-32 px-6 sm:px-8"
          style={{
            background: "var(--bg)",
            zIndex: 10,
            paddingTop: "min(150px, 20vh)",
            paddingBottom: "min(150px, 20vh)",
          }}>
          <div
            className="w-12 h-px mb-16"
            style={{ background: "var(--gold-dim)" }}
          />
          <div className="max-w-lg text-center">
            <p
              className="font-narrator"
              style={{
                color: "var(--cream-muted)",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                fontStyle: "italic",
              }}>
              What pulled me toward engineering was already there in nursing.
              ICU taught me that I liked complexity, troubleshooting, and
              understanding how different parts of a system affect each other.
            </p>
            <p
              className="font-narrator mt-8"
              style={{
                color: "var(--text-dim)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}>
              A lot of that thinking carried naturally into engineering.
            </p>
          </div>
          <div
            className="w-12 h-px mt-16"
            style={{ background: "var(--gold-dim)" }}
          />
        </div>
      </div>

      {/* Particle + scatter sections removed — particles now inside sticky viewport */}
    </>
  );
}
