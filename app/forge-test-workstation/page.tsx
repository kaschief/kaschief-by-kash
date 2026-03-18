"use client";

/**
 * ForgeWorkstation — Single-file workstation build.
 *
 * Structure:
 *   Container (2000vh — see CONTAINER_VH)
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
import { STREAMS, NODES } from "../forge-sankey-data";
import { ForgeNav } from "../forge-nav";
import { ss, smoothstep, lerp, remap } from "./math";
import {
  fc,
  fcExt,
  CC_EXT,
  ACT_BLUE,
  COMPANY_COLORS,
  COMPANY_ROLES,
  LOGOS,
  createFragments,
  createEmbers,
  createPrinciples,
  phaseLabel,
  hashToUnit,
} from "./forge-data";
import { BREAKPOINTS } from "@utilities";

/* ================================================================== */
/*  Breakpoint refs (no-re-render, matches Act I pattern)              */
/* ================================================================== */

function useBreakpointRefs() {
  const isLg = useRef(false);
  useEffect(() => {
    const mqLg = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    isLg.current = mqLg.matches;
    const lgH = (e: MediaQueryListEvent) => {
      isLg.current = e.matches;
    };
    mqLg.addEventListener("change", lgH);
    return () => {
      mqLg.removeEventListener("change", lgH);
    };
  }, []);
  return { isLg };
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
  /* roles map replaced by COMPANY_ROLES from forge-data (P1.2) */
  lines.push({
    text: `Author: Kash <${co.authorEmail}>`,
    style: "text",
    phase: 1,
  });
  lines.push({
    text: `Role:   ${COMPANY_ROLES[co.company] || "Frontend Engineer"}`,
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

// Intentional: terminal section uses real monospace for code authenticity.
// The rest of the site avoids mono (--font-mono remapped to Urbanist).
const TERMINAL_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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

/* remap() imported from ./math */

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
        x = lerp(prevX, F_CENTER_X, 0.35);
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
/*  Scroll phases — RELATIVE CHAIN                                     */
/*                                                                     */
/*  Each phase is defined by DURATION + GAP to next phase.             */
/*  Change one duration → everything downstream shifts automatically.  */
/*                                                                     */
/*  CONSTRAINT: summary panel is in normal flow after the sticky       */
/*  (100vh). Title MUST be fully hidden before it arrives (~0.053).    */
/* ================================================================== */

const CONTAINER_VH = 2000;

/* ==================================================================
   SCROLL ANIMATION CONSTANTS
   ===========================
   Every timing/styling value lives here. No magic numbers in render logic.
   All scroll values are fractions of total scroll (0–1) unless noted.

   VISUAL SEQUENCE (what the user sees):
   1. TITLE        — "ACT II / THE ENG1NEER" hero text
   2. FRAGMENTS    — keyword words (product, users, code...) + dark pills
                     (code snippets, logos, CLI commands) drift across screen
   3. CONVERGENCE  — keyword words pull toward center, fade out
   4. THESIS       — "Each of my past roles..." sentence fades in with
                     sequential word reveals (product, systems, people, scale)
   5. PARTICLES    — colored dots explode from center, converge to funnel positions
   6. FUNNEL       — SVG Sankey-style ribbons grow tier by tier with dot sources,
                     stream labels, company nodes, and narrator glass panels
   7. MID NARRATOR — "Let me show you where I've been" transition text
   8. TERMINAL     — code typing replay for each company (AMBOSS, Finleap, DKB, Med-El)
                     with narrative reveal (scene → action → shift) per company
   9. CRYSTALLIZE  — 4 principle cards fade in with blur, settle into grid
   ================================================================== */

/* ==================================================================
   CONFIGURATION OBJECTS — all timing and visual constants grouped
   by the scroll section they control. Values are scroll fractions
   (0–1) unless noted otherwise (px, vh, vw).
   ================================================================== */

/** Top-level phase durations — how much scroll each section occupies */
const PHASES = {
  title:            0.032,
  forge:            0.18,   // fragments drift + converge
  forgeTail:        0.04,   // extra time after convergence for cleanup
  thesisOverlap:    0.04,   // thesis starts this far before forge ends (crossfade)
  thesis:           0.10,   // sentence visible + word reveals
  thesisToParticles:0.0,    // gap (0 = immediate)
  particles:        0.14,   // canvas dots explode → converge to SVG
  funnel:           0.1,    // SVG ribbons grow tier by tier
  funnelLinger:     0.02,   // funnel holds complete before fading
  funnelFade:       0.025,  // funnel fade-out
  funnelToTerminal: 0.015,  // gap between funnel and terminal
  terminalCompany:  0.085,  // scroll per company (typing + narrative + wipe)
  terminalToCrystal:0.015,  // gap between terminal and crystallize
  crystallize:      0.08,   // principle cards appear + settle
  titleAnchor:      0.005,  // title starts this far into scroll
  forgeToTitle:     0.025,  // forge starts this far after title
} as const;

/** Seed keywords — colored words that drift, converge, and fade */
const SEED = {
  // Timing offsets (relative to forge start/end)
  fadeInDuration:    0.05,   // appear from blur
  fadeoutDuration:   0.05,   // fade during convergence — must finish before thesis
  driftDelay:        0.02,   // drift starts after forge begins
  driftMargin:       0.03,   // drift ends before forge ends
  convergeLead:      0.07,   // pull toward center before forge ends
  heatDelay:         0.07,   // scale-up starts after forge
  heatMargin:        0.02,   // heat ends before forge ends
  shrinkDelay:       0.005,  // shrink starts after forge ends (tail)
  // Visual
  heatMaxScale:      1.3,    // 130% at peak heat
  shrinkMinScale:    0.5,    // 50% during tail
  initialBlurDur:    0.04,   // blur clears over this duration
  maxDissolveBlur:   12,     // max blur px for non-seed dissolve
} as const;

/** Non-seed fragments — dark pills with code, logos, commands */
const FRAGMENTS = {
  earlyStart:        0.01,   // appear slightly before seeds
  fadeInDuration:     0.05,   // fade-in length
  dissolveSpeed:     0.7,    // multiplier on per-pill dissolve range
  driftInset:        0.01,   // drift starts/ends inset from forge bounds
  rotDriftFactor:    0.3,    // rotation increases 30% during drift
  alphaCode:         0.75,   // code snippet opacity
  alphaLogo:         0.85,   // logo opacity
  alphaDefault:      0.75,   // other pill types
} as const;

/** Ember sparks — tiny rising particles during forge phase */
const EMBER = {
  delay:             0.04,   // start this far after forge
  heatDuration:      0.08,   // each spark heats up
  coolLead:          0.05,   // start cooling before phase end
  riseDelay:         0.01,   // rise starts after phase begins
  baseOpacity:       0.4,    // base brightness
  flickerAmp:        0.3,    // flicker variation (+/- 30%)
  flickerFreq:       80,     // flicker speed
} as const;

/** Grid atmosphere — faint dot grid behind fragments */
const GRID = {
  delay:             0.02,   // start after forge
  overshoot:         0.01,   // extend past forge gate
  appearDuration:    0.04,   // fade-in duration
  fadeLead:          0.06,   // start fading before glow end
  maxOpacity:        0.05,   // barely visible
} as const;

/** Thesis sentence — fades in, drifts, reveals words sequentially */
const THESIS = {
  fadeInFrac:        0.3,    // first 30% of duration
  fadeOutFrac:       0.3,    // last 30% of duration
  wordZoneFrac:      0.35,   // word reveals begin at 35%
  driftFastWeight:   0.85,   // 85% drift before reveals
  driftSlowWeight:   0.15,   // 15% drift during reveals
  yStartLg:          4,      // desktop: start 4vh below center
  yStartSm:         -4,      // mobile: start 4vh above center
  yEndLg:           -8,      // desktop: drift to 8vh above
  yEndSm:           -14,     // mobile: drift to 14vh above
  initialBlur:       6,      // px blur at start
  maxWidthLg:        "60vw",
  maxWidthSm:        "85vw",
  wordStagger:       0.01,   // gap between each word reveal
  wordRevealDur:     0.007,  // each word's fade-in duration
  wordDropPx:        10,     // each word drops from 10px above
  wordCount:         4,      // "product", "systems", "people", "scale"
} as const;

/** Particle animation — canvas dots explode then converge to SVG positions */
const PARTICLE = {
  // Sub-phases (fractions of local 0–1 particle progress)
  canvasInStart:     0.0,
  canvasInEnd:       0.05,
  explodeStart:      0.05,
  explodeEnd:        0.2,
  convergeStart:     0.2,
  convergeEnd:       0.45,
  fadeOutStart:      0.4,
  fadeOutEnd:        0.55,
  // Spawn randomization
  angleSpread:       1.4,    // radians
  radiusMin:         0.12,   // fraction of viewport
  radiusRange:       0.28,
  sizeMin:           2,      // px
  sizeRange:         2.5,    // px
  // Canvas render
  appearDur:         0.015,  // fade-in duration
  alphaCutoff:       0.01,   // skip below this (perf)
  convergeShrink:    0.6,    // shrink to 60%
  dotOpacity:        0.85,
  glowOpacity:       0.25,
  glowFade:          0.7,    // glow fades during convergence
  glowRadius:        3,      // Nx dot size
} as const;

/** Canvas → SVG crossfade timing */
const CANVAS_XFADE = {
  inDuration:        0.01,   // canvas wrapper fade-in
  outFrac:           0.35,   // canvas out at 35% of particle duration
  outEndFrac:        0.5,    // canvas gone at 50%
} as const;

/** SVG funnel — ribbons, dots, labels, nodes */
const FUNNEL = {
  // Wrapper timing
  svgInDuration:     0.02,
  dotsInDuration:    0.03,
  labelsLead:        0.02,   // labels start before SVG
  labelsInDuration:  0.02,
  convergePtOvershoot: 0.02, // diamond extends past last tier
  // Dot visuals
  dotStagger:        0.003,
  dotScaleStart:     2,
  dotScaleEnd:       1,
  dotGlowStart:      6,      // px
  dotGlowEnd:        3,      // px
  // Label visuals
  labelStagger:      0.002,
  labelSlideY:       -10,    // px
  // Company node badges
  nodeAppearFrac:    0.7,    // 70% into ribbon tier
  nodeSlideY:        8,      // px
  // Convergence diamond
  convergeMaxBlur:   12,     // px
  // Narrator panels
  narratorFadeInFrac:  0.15,
  narratorFadeOutFrac: 0.85,
  narratorMaxOpacity:  0.75,
  narratorSlideY:      12,   // px
  narratorTopFracs:    [0.28, 0.42, 0.58, 0.74] as readonly number[],
  // Tier timing
  narratorDelayFrac:   0.4,  // narrator starts 40% into tier
  narratorOvershoot:   0.3,  // narrator lingers 30% past tier
  captionOvershoot:    0.3,
} as const;

/** Mobile skill cards — replace funnel on phone screens */
const MOBILE_SKILLS = {
  appearDur:         0.03,
  disappearDur:      0.015,
  skillStagger:      0.005,
  skillFadeDur:      0.02,
  skillSlideX:       40,     // px
  skillScaleStart:   0.8,
} as const;

/** Mid narrator — "Let me show you where I've been" */
const MID_NARRATOR = {
  delay:             0.005,  // starts just after funnel fades
  duration:          0.035,
  fadeDur:           0.005,  // very quick fade in/out
  slideY:            10,     // px
} as const;

/** Terminal — code typing replay per company */
const TERMINAL = {
  fadeDur:           0.01,
  companyCount:      4,
  // Typing sub-phases (fraction of company progress)
  typingP1:          0.2,    // first block done
  typingP2:          0.35,   // second block done
  typingP3:          0.48,   // third block done
  narStart:          0.5,    // narrative begins
  narEnd:            0.88,   // narrative complete
  wipeStart:         0.9,
  wipeEnd:           0.97,
  wipeComplete:      0.99,
  // Promotion highlight
  promotionFg:       "#FBBF24",
  promotionBg:       "rgba(251,191,36,0.08)",
  // Dot indicator
  dotActiveWidth:    "20px",
  dotInactiveWidth:  "6px",
  dotInactiveOpacity: 0.35,
} as const;

/** Terminal narrative sub-phases (within narStart→narEnd, mapped 0–1) */
const TERMINAL_NARRATOR = {
  sceneEnd:          0.4,
  actionStart:       0.42,
  actionEnd:         0.6,
  shiftStart:        0.62,
  shiftEnd:          0.8,
  fadeoutStart:      0.9,
  fadeoutEnd:        0.95,
  headerFadeEnd:     0.1,
  slideY:            8,      // px
} as const;

/** Crystallize — 4 principle cards fade in and settle */
const CRYSTALLIZE = {
  lineAppearStart:   0.15,
  lineAppearEnd:     0.35,
  lineOpacity:       0.3,
  staggerFrac:       0.06,
  fadeInStartFrac:   0.2,
  fadeInEndFrac:     0.55,
  settleStartFrac:   0.35,
  settleEndFrac:     0.85,
  yOffset:           6,      // vh
  initialBlur:       6,      // px
  mobileSpacing:     20,     // vh
  mobileCenter:      1.5,
  maxWidthLg:        "44vw",
  maxWidthSm:        "min(320px, 85vw)",
} as const;

/** Chrome — debug overlay, title fade, curtain reveal */
const CHROME = {
  labelOpacity:      0.3,
  titleSlowFadeMult: 3,
  titleCurtainThreshold: 0.3,  // summary panel erases title at 30% up viewport
  titleCurtainRange: 0.2,      // title fully erased over next 20%
  curtainFadePx:     80,       // fragment curtain reveal gradient zone
} as const;

/* ---- Anchor: title starts near the top ---- */
const TITLE_START = PHASES.titleAnchor;
const TITLE_END   = TITLE_START + PHASES.title;

/* ---- Forge overlaps with title (starts slightly after) ---- */
const FORGE_START = TITLE_START + PHASES.forgeToTitle;
const FORGE_END   = FORGE_START + PHASES.forge;
const FORGE_GATE  = FORGE_END + PHASES.forgeTail;

/* ---- Embers accompany the forge ---- */
const EMBERS_START = FORGE_START + EMBER.delay;
const EMBERS_END   = FORGE_GATE;

/* ---- Atmosphere accompanies forge ---- */
const GLOW_START = FORGE_START + GRID.delay;
const GLOW_END   = FORGE_GATE + GRID.overshoot;

/* ---- Thesis: crossfades in as seeds converge and fade ---- */
const THESIS_START = FORGE_END - PHASES.thesisOverlap;
const THESIS_END   = THESIS_START + PHASES.thesis;

/* ---- Seed sub-phases (within FORGE range) ---- */
const SEED_FADE_IN_START      = FORGE_START;
const SEED_FADE_IN_END        = FORGE_START + SEED.fadeInDuration;
const SEED_DRIFT_START        = FORGE_START + SEED.driftDelay;
const SEED_DRIFT_END          = FORGE_END - SEED.driftMargin;
const SEED_CONVERGE_START     = FORGE_END - SEED.convergeLead;
const SEED_CONVERGE_END       = FORGE_END;
const SEED_HEAT_START         = FORGE_START + SEED.heatDelay;
const SEED_HEAT_END           = FORGE_END - SEED.heatMargin;
const SEED_SCALE_SHRINK_START = FORGE_END + SEED.shrinkDelay;
const SEED_SCALE_SHRINK_END   = FORGE_GATE;

/* ---- Non-seed fragment sub-phases ---- */
const FRAG_FADE_IN_START = FORGE_START - FRAGMENTS.earlyStart;
const FRAG_FADE_IN_END   = FORGE_START + FRAGMENTS.fadeInDuration;

/* ---- Particles: canvas explode + converge + handoff to SVG ---- */
const PARTICLES_START = THESIS_END + PHASES.thesisToParticles;
const PARTICLES_END   = PARTICLES_START + PHASES.particles;

/* ---- Canvas sub-phases ---- */
const CANVAS_IN_START  = PARTICLES_START;
const CANVAS_IN_END    = PARTICLES_START + CANVAS_XFADE.inDuration;
const CANVAS_OUT_START = PARTICLES_START + PHASES.particles * CANVAS_XFADE.outFrac;
const CANVAS_OUT_END   = PARTICLES_START + PHASES.particles * CANVAS_XFADE.outEndFrac;

/* ---- SVG funnel ---- */
const SVG_IN_START    = CANVAS_OUT_START;
const SVG_IN_END      = CANVAS_OUT_START + FUNNEL.svgInDuration;
const DOTS_IN_START   = SVG_IN_START;
const DOTS_IN_END     = SVG_IN_START + FUNNEL.dotsInDuration;
const LABELS_IN_START = SVG_IN_START - FUNNEL.labelsLead;
const LABELS_IN_END   = SVG_IN_START + FUNNEL.labelsInDuration;

/* ---- Funnel ribbon tiers ---- */
const RIBBON_START  = SVG_IN_END;
const TIER_DURATION = PHASES.funnel / 4;
const RIBBON_TIERS  = [0, 1, 2, 3].map((i) => ({
  start: RIBBON_START + i * TIER_DURATION,
  end:   RIBBON_START + (i + 1) * TIER_DURATION,
}));
const FUNNEL_COMPLETE = RIBBON_TIERS[3].end;

/* ---- Convergence point + funnel fade ---- */
const CONVERGE_PT_START = RIBBON_TIERS[3].start;
const CONVERGE_PT_END   = FUNNEL_COMPLETE + FUNNEL.convergePtOvershoot;
const FUNNEL_OUT_START  = FUNNEL_COMPLETE + PHASES.funnelLinger;
const FUNNEL_OUT_END    = FUNNEL_OUT_START + PHASES.funnelFade;

/* ---- Narrator panels (tied to funnel tiers) ---- */
const NARRATOR_TIERS = RIBBON_TIERS.map((tier) => ({
  start: tier.start + TIER_DURATION * FUNNEL.narratorDelayFrac,
  end:   tier.end + TIER_DURATION * FUNNEL.narratorOvershoot,
}));

/* ---- Caption tiers ---- */
const CAPTION_TIERS = RIBBON_TIERS.map((tier) => ({
  start: tier.start,
  end:   tier.end + TIER_DURATION * FUNNEL.captionOvershoot,
}));

/* ---- Mid narrator ("Let me show you...") ---- */
const MID_NARRATOR_START = FUNNEL_OUT_END + MID_NARRATOR.delay;
const MID_NARRATOR_END   = MID_NARRATOR_START + MID_NARRATOR.duration;

/* ---- Terminal / Beats ---- */
const BEATS_START = MID_NARRATOR_END + PHASES.funnelToTerminal;
const BEATS = [0, 1, 2, 3].map((i) => ({
  start: BEATS_START + i * PHASES.terminalCompany,
  end: BEATS_START + (i + 1) * PHASES.terminalCompany,
}));
const BEATS_END = BEATS[3].end;

/* ---- Crystallize ---- */
const CRYSTALLIZE_START = BEATS_END + PHASES.terminalToCrystal;
const CRYSTALLIZE_END = CRYSTALLIZE_START + PHASES.crystallize;

/* ---- Chrome ---- */
const CHROME_END = CRYSTALLIZE_START;

/* ---- Assembled PH object (consumed by scroll callback) ---- */
const PH = {
  TITLE: { start: TITLE_START, end: TITLE_END },
  FORGE: { start: FORGE_START, end: FORGE_END },
  FORGE_GATE,
  EMBERS: { start: EMBERS_START, end: EMBERS_END },
  GLOW: { start: GLOW_START, end: GLOW_END },
  THESIS: { start: THESIS_START, end: THESIS_END },
  PARTICLES: { start: PARTICLES_START, end: PARTICLES_END },
  CANVAS_OUT: { start: CANVAS_OUT_START, end: CANVAS_OUT_END },
  SVG_IN: { start: SVG_IN_START, end: SVG_IN_END },
  DOTS_IN: { start: DOTS_IN_START, end: DOTS_IN_END },
  LABELS_IN: { start: LABELS_IN_START, end: LABELS_IN_END },
  RIBBON_TIERS,
  CONVERGE_PT: { start: CONVERGE_PT_START, end: CONVERGE_PT_END },
  FUNNEL_OUT: { start: FUNNEL_OUT_START, end: FUNNEL_OUT_END },
  CAPTION_TIERS,
  NARRATOR_TIERS,
  MID_NARRATOR: { start: MID_NARRATOR_START, end: MID_NARRATOR_END },
  BEATS,
  CRYSTALLIZE: { start: CRYSTALLIZE_START, end: CRYSTALLIZE_END },
  CHROME_END,
};

// Canvas particle local phases (0–1 within PARTICLES range)
const PP = {
  CANVAS_IN: [PARTICLE.canvasInStart, PARTICLE.canvasInEnd] as const,
  EXPLODE: [PARTICLE.explodeStart, PARTICLE.explodeEnd] as const,
  CONVERGE: [PARTICLE.convergeStart, PARTICLE.convergeEnd] as const,
  FADE_OUT: [PARTICLE.fadeOutStart, PARTICLE.fadeOutEnd] as const,
};

function initParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let si = 0; si < STREAMS.length; si++) {
    for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
      const seed = si * 100 + i;
      const baseAngle = (si / STREAMS.length) * Math.PI * 2;
      particles.push({
        streamIdx: si,
        angle: baseAngle + (hashToUnit(seed + 10) - 0.5) * PARTICLE.angleSpread,
        radius: PARTICLE.radiusMin + hashToUnit(seed + 11) * PARTICLE.radiusRange,
        size: PARTICLE.sizeMin + hashToUnit(seed + 1) * PARTICLE.sizeRange,
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
  const { isLg } = useBreakpointRefs();

  /* ---- V0 refs ---- */
  const forgeStickyRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);
  const forgeContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInViewRef = useRef<HTMLDivElement>(null);
  const fragmentEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
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
  /* scrollHintEl removed — ref was never rendered (P0.2) */
  const progressBarEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLDivElement>(null);

  /* ---- Particle refs ---- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleProgressRef = useRef(0);
  const particleAnimating = useRef(false);   // true when rAF loop is running
  const particleFrameId = useRef<number>(0);   // current rAF handle
  const drawParticles = useRef<() => void>(() => {});  // stable ref for draw fn
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

  /* ---- Forge scroll (V0 — 2000vh) ---- */
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
    /* scrollHintEl removed — was never rendered */
    if (progressBarEl.current)
      progressBarEl.current.style.width = `${p * 100}%`;
    if (phaseEl.current) {
      phaseEl.current.textContent = phaseLabel(p);
      phaseEl.current.style.opacity = String(
        p > PH.TITLE.start && p < PH.CHROME_END ? CHROME.labelOpacity : 0,
      );
    }

    /* ---- Title fade: slow scroll fade + fast erase when panel arrives ---- */
    if (titleRef.current) {
      // Slow fade over a wide scroll range
      const slowFade = 1 - ss(PH.TITLE.start, PH.TITLE.end * CHROME.titleSlowFadeMult, p);
      // Fast erase when panel is on-screen — same curtainReveal as fragments
      const curtainFade =
        curtainTop >= window.innerHeight
          ? 1
          : Math.max(
              0,
              (curtainTop - window.innerHeight * CHROME.titleCurtainThreshold) /
                (window.innerHeight * CHROME.titleCurtainRange),
            );
      titleRef.current.style.opacity = String(Math.min(slowFade, curtainFade));
    }

    /* ============================================================== */
    /*  MOVEMENT 1: THE FORGE                                          */
    /*  Uses PH.FORGE for boundaries, PH.FORGE_GATE for cutoff        */
    /* ============================================================== */
    const vh = window.innerHeight;
    const CURTAIN_FADE = CHROME.curtainFadePx;

    if (p < PH.FORGE_GATE) {
      fragments.forEach((f, i) => {
        const el = fragmentEls.current[i];
        if (!el) return;
        if (f.isSeed) {
          const fadeIn = ss(SEED_FADE_IN_START, SEED_FADE_IN_END, p);
          const drift = ss(SEED_DRIFT_START, SEED_DRIFT_END, p),
            converge = ss(SEED_CONVERGE_START, SEED_CONVERGE_END, p),
            heat = ss(SEED_HEAT_START, SEED_HEAT_END, p);
          const dX = f.x0 + f.dx * drift,
            dY = f.y0 + f.dy * drift;
          const x = lerp(dX, 0, converge),
            y = lerp(dY, 0, converge);
          const rot = lerp(f.rot, 0, converge);
          const scale =
            lerp(1, SEED.heatMaxScale, heat) *
            lerp(1, SEED.shrinkMinScale, ss(SEED_SCALE_SHRINK_START, SEED_SCALE_SHRINK_END, p));
          const fragScreenY = vh * 0.5 + (y * vh) / 100;
          const curtainReveal =
            curtainTop >= vh
              ? 1
              : Math.max(
                  0,
                  Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
                );
          const [cr, cg, cb] = CC_EXT[f.companyIdx % CC_EXT.length];
          el.style.color = `rgb(${cr},${cg},${cb})`;
          // Fade out during convergence (no gold blur/dissolve)
          const fadeOut =
            1 -
            ss(
              SEED_CONVERGE_START,
              SEED_CONVERGE_START + SEED.fadeoutDuration,
              p,
            );
          const initialBlur = lerp(
            1,
            0,
            ss(SEED_FADE_IN_START, SEED_FADE_IN_START + SEED.initialBlurDur, p),
          );
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg) scale(${scale})`;
          el.style.opacity = String(fadeIn * fadeOut * curtainReveal);
          el.style.filter = `blur(${initialBlur}px)`;
        } else {
          const fadeIn = ss(FRAG_FADE_IN_START, FRAG_FADE_IN_END, p),
            fadeOut = 1 - ss(f.dissolveStart * FRAGMENTS.dissolveSpeed, f.dissolveEnd * FRAGMENTS.dissolveSpeed, p);
          const drift = ss(FORGE_START + FRAGMENTS.driftInset, FORGE_END - FRAGMENTS.driftInset, p),
            dissolve = ss(f.dissolveStart * FRAGMENTS.dissolveSpeed, f.dissolveEnd * FRAGMENTS.dissolveSpeed, p);
          const x = f.x0 + f.dx * drift,
            y = f.y0 + f.dy * drift,
            rot = f.rot * (1 + drift * FRAGMENTS.rotDriftFactor);
          let baseAlpha: number;
          switch (f.type) {
            case "code":
            case "command":
              baseAlpha = FRAGMENTS.alphaCode;
              break;
            case "logo":
              baseAlpha = FRAGMENTS.alphaLogo;
              break;
            default:
              baseAlpha = FRAGMENTS.alphaDefault;
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
          el.style.filter = `blur(${lerp(0, SEED.maxDissolveBlur, dissolve)}px)`;
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
      const heat = ss(EMBERS_START + e.delay, EMBERS_START + EMBER.heatDuration, p),
        cool = ss(EMBERS_END - EMBER.coolLead, EMBERS_END, p),
        active = heat * (1 - cool);
      const rise = ss(EMBERS_START + EMBER.riseDelay + e.delay, EMBERS_END, p);
      el.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      el.style.opacity = String(active * (EMBER.baseOpacity + Math.sin(p * EMBER.flickerFreq + i) * EMBER.flickerAmp));
    });

    /* ---- Forge atmosphere — disabled, no visible glows ---- */
    if (glowEl.current) glowEl.current.style.opacity = "0";
    if (innerGlowEl.current) innerGlowEl.current.style.opacity = "0";
    if (gridEl.current) {
      const appear = ss(GLOW_START, GLOW_START + GRID.appearDuration, p),
        fade = 1 - ss(GLOW_END - GRID.fadeLead, GLOW_END, p);
      gridEl.current.style.opacity = String(appear * fade * GRID.maxOpacity);
    }

    /* ---- Thesis ---- */
    const lg = isLg.current;
    if (thesisEls.current[0]) {
      const thesisFadeInEnd = THESIS_START + PHASES.thesis * THESIS.fadeInFrac;
      const thesisFadeOutStart = THESIS_END - PHASES.thesis * THESIS.fadeOutFrac;
      const fadeIn = ss(THESIS_START, thesisFadeInEnd, p),
        fadeOut = 1 - ss(thesisFadeOutStart, THESIS_END, p);
      // Two-speed drift: fast approach before words, near-still during reveals
      const wordRevealZone = THESIS_START + PHASES.thesis * THESIS.wordZoneFrac;
      const driftFast = ss(THESIS_START, wordRevealZone, p);
      const driftSlow = ss(wordRevealZone, THESIS_END, p);
      const drift = driftFast * THESIS.driftFastWeight + driftSlow * THESIS.driftSlowWeight;
      const yStart = lg ? THESIS.yStartLg : THESIS.yStartSm;
      const yEnd = lg ? THESIS.yEndLg : THESIS.yEndSm;
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(yStart, yEnd, drift)}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(THESIS.initialBlur, 0, fadeIn)}px)`;
      thesisEls.current[0].style.maxWidth = lg ? THESIS.maxWidthLg : THESIS.maxWidthSm;

      // Sequential word reveal: each word drops in with translateY
      const WORD_THRESHOLDS = Array.from({ length: THESIS.wordCount }, (_, i) =>
        wordRevealZone + i * THESIS.wordStagger,
      );
      for (let wi = 0; wi < THESIS.wordCount; wi++) {
        const w = thesisWordRefs.current[wi];
        if (!w) continue;
        const wordProgress = ss(
          WORD_THRESHOLDS[wi],
          WORD_THRESHOLDS[wi] + THESIS.wordRevealDur,
          p,
        );
        w.style.opacity = String(wordProgress);
        w.style.transform = `translateY(${lerp(THESIS.wordDropPx, 0, wordProgress)}px)`;
        w.style.display = "inline-block";
      }
    }

    /* ============================================================== */
    /*  PARTICLES → DOTS → RIBBONS                                     */
    /*  Range: PH.PARTICLES.start → PH.FUNNEL_OUT.end                  */
    /*  Canvas particles converge to SVG dot positions (V7 approach),   */
    /*  SVG dots appear as canvas fades, ribbons grow from dots.        */
    /*  All sub-phase timings defined in PP_* and CANVAS/SVG constants. */
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

      if (pt > 0 && pt <= PP.FADE_OUT[1] && !particleAnimating.current) {
        particleAnimating.current = true;
        particleFrameId.current = requestAnimationFrame(drawParticles.current);
      }

      // Canvas + SVG overlap at same positions for seamless handoff (like V7)
      // Canvas fades out AS SVG dots fade in — no black gap
      if (canvasWrapRef.current) {
        const canvasIn = ss(CANVAS_IN_START, CANVAS_IN_END, p);
        const canvasOut = 1 - ss(CANVAS_OUT_START, CANVAS_OUT_END, p);
        canvasWrapRef.current.style.opacity = String(canvasIn * canvasOut);
      }

      // SVG funnel wrapper: appears as canvas starts fading (simultaneous crossfade)
      if (funnelSvgWrapRef.current) {
        const svgIn = ss(SVG_IN_START, SVG_IN_END, p);
        const svgOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        funnelSvgWrapRef.current.style.opacity = String(svgIn * svgOut);
      }

      // SVG dots: appear as canvas particles arrive at same positions
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelDotRefs.current[si];
        if (!el) continue;
        const stagger = si * FUNNEL.dotStagger;
        const dotIn = ss(DOTS_IN_START + stagger, DOTS_IN_END + stagger, p);
        const dotOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        const ribbonStart = ss(RIBBON_TIERS[0].start, RIBBON_TIERS[0].end, p);
        const scale = lerp(FUNNEL.dotScaleStart, FUNNEL.dotScaleEnd, ribbonStart);
        const glowR = lerp(FUNNEL.dotGlowStart, FUNNEL.dotGlowEnd, ribbonStart);
        el.style.opacity = String(dotIn * dotOut);
        el.style.transform = `scale(${dotIn > 0 ? scale : 0})`;
        const blur = el.querySelector("feGaussianBlur");
        if (blur) blur.setAttribute("stdDeviation", String(glowR));
      }

      // Stream labels
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelStreamLabelRefs.current[si];
        if (!el) continue;
        const stagger = si * FUNNEL.labelStagger;
        const labelIn = ss(
          LABELS_IN_START + stagger,
          LABELS_IN_END + stagger,
          p,
        );
        const labelOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        el.style.opacity = String(labelIn * labelOut);
        el.style.transform = `translateY(${lerp(FUNNEL.labelSlideY, 0, labelIn)}px)`;
      }

      // Ribbon segments grow tier by tier
      const TIER_THRESHOLDS = RIBBON_TIERS.map(
        (t) => [t.start, t.end] as const,
      );
      for (let i = 0; i < F_SEGMENTS.length; i++) {
        const el = funnelSegmentRefs.current[i];
        if (!el) continue;
        const seg = F_SEGMENTS[i];
        const threshIdx = Math.min(seg.toTier - 1, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const t = ss(threshStart, threshEnd, p);
        const fadeOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        el.style.opacity = String(lerp(0, seg.opacityEnd, t) * fadeOut);
        const scaleY = lerp(0, 1, t);
        el.style.transformOrigin = `${F_CENTER_X}px ${F_TIER_Y[seg.fromTier]}px`;
        el.style.transform = `scaleY(${scaleY})`;
      }

      // Company nodes — appear just before ribbons reach their tier (late in the threshold)
      for (let ni = 0; ni < NODES.length; ni++) {
        const el = funnelNodeRefs.current[ni];
        if (!el) continue;
        const threshIdx = Math.min(ni, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const nodeT = ss(lerp(threshStart, threshEnd, FUNNEL.nodeAppearFrac), threshEnd, p);
        const fadeOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        el.style.opacity = String(nodeT * fadeOut);
        el.style.transform = `translateY(${lerp(FUNNEL.nodeSlideY, 0, nodeT)}px)`;
      }

      // Convergence point — appears after ribbons complete
      if (funnelConvergeRef.current) {
        const convergenceAppear = ss(CONVERGE_PT_START, CONVERGE_PT_END, p);
        const convergenceFadeOut =
          1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
        funnelConvergeRef.current.style.opacity = String(
          convergenceAppear * convergenceFadeOut,
        );
        if (funnelBlurRef.current) {
          funnelBlurRef.current.setAttribute(
            "stdDeviation",
            String(lerp(0, FUNNEL.convergeMaxBlur, convergenceAppear)),
          );
        }
      }

      // Narrator glass panels — tied to funnel tiers
      for (let ni = 0; ni < FUNNEL_NARRATOR.length; ni++) {
        const el = funnelNarratorRefs.current[ni];
        if (!el) continue;
        const { start: narratorStart, end: narratorEnd } = NARRATOR_TIERS[ni];
        const narratorFadeIn = ss(
          narratorStart,
          lerp(narratorStart, narratorEnd, FUNNEL.narratorFadeInFrac),
          p,
        );
        const narratorFadeOut =
          1 - ss(lerp(narratorStart, narratorEnd, FUNNEL.narratorFadeOutFrac), narratorEnd, p);
        el.style.opacity = String(narratorFadeIn * narratorFadeOut * FUNNEL.narratorMaxOpacity);
        el.style.transform = `translateY(${lerp(FUNNEL.narratorSlideY, 0, narratorFadeIn)}px)`;
      }

      /* ---- Mobile camera-track (phone only) ---- */
      if (!lg) {
        if (cameraTrackRef.current) {
          const trackAppear = ss(PARTICLES_START, PARTICLES_START + MOBILE_SKILLS.appearDur, p);
          const trackDisappear =
            1 - ss(FUNNEL_OUT_END, FUNNEL_OUT_END + MOBILE_SKILLS.disappearDur, p);
          cameraTrackRef.current.style.opacity = String(
            trackAppear * trackDisappear,
          );
        }
        const SKILL_TIER_STARTS = RIBBON_TIERS.map((t) => t.start);
        for (let si = 0; si < STREAMS.length; si++) {
          const el = cameraSkillRefs.current[si];
          if (!el) continue;
          const firstTier = STREAMS[si].path[0];
          const stagger = si * MOBILE_SKILLS.skillStagger;
          const tierStart = SKILL_TIER_STARTS[firstTier] + stagger;
          const skillFadeIn = ss(tierStart, tierStart + MOBILE_SKILLS.skillFadeDur, p);
          const skillFadeOut =
            1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
          const fromLeft = si % 2 === 0;
          const slideX = lerp(fromLeft ? -MOBILE_SKILLS.skillSlideX : MOBILE_SKILLS.skillSlideX, 0, skillFadeIn);
          const scale = lerp(MOBILE_SKILLS.skillScaleStart, 1, skillFadeIn);
          el.style.opacity = String(Math.max(0, skillFadeIn * skillFadeOut));
          el.style.transform = `translateX(${slideX}px) scale(${scale})`;
        }
        const convergenceDiamond = cameraNodeRefs.current[0];
        if (convergenceDiamond) {
          const diamondIn = ss(CONVERGE_PT_START, CONVERGE_PT_END, p);
          const diamondOut = 1 - ss(PH.FUNNEL_OUT.start, PH.FUNNEL_OUT.end, p);
          convergenceDiamond.style.opacity = String(diamondIn * diamondOut);
        }
      }
    }

    /* ---- Mid narrator: "Let me show you where I've been" ---- */
    if (midNarratorRef.current) {
      const midIn = ss(MID_NARRATOR_START, MID_NARRATOR_START + MID_NARRATOR.fadeDur, p);
      const midOut = 1 - ss(MID_NARRATOR_END - MID_NARRATOR.fadeDur, MID_NARRATOR_END, p);
      midNarratorRef.current.style.opacity = String(midIn * midOut);
      midNarratorRef.current.style.transform = `translateY(${lerp(MID_NARRATOR.slideY, 0, midIn)}px)`;
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
      const termIn = ss(termStart, termStart + TERMINAL.fadeDur, p);
      const termOut = 1 - ss(termEnd - TERMINAL.fadeDur, termEnd, p);

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
        const companyIdx = Math.min(Math.floor(localP * TERMINAL.companyCount), TERMINAL.companyCount - 1);
        const companyProgress = (localP - companyIdx / TERMINAL.companyCount) * TERMINAL.companyCount;

        // Mobile: show/hide stacked cards based on scroll progress
        if (!lg) {
          for (let ci = 0; ci < TERMINAL.companyCount; ci++) {
            const card = mobileCardRefs.current[ci];
            if (card) card.style.opacity = ci === companyIdx ? "1" : "0";
          }
          // Update dot indicators
          const CC4 = COMPANY_COLORS;
          termProgressRefs.current.forEach((dot, i) => {
            if (!dot) return;
            dot.style.width = i === companyIdx ? TERMINAL.dotActiveWidth : TERMINAL.dotInactiveWidth;
            dot.style.opacity = i === companyIdx ? "1" : String(TERMINAL.dotInactiveOpacity);
            dot.style.background =
              i === companyIdx ? CC4[companyIdx] : "var(--text-dim)";
          });
        }

        if (termEl && termContent && termWipe) {
          // Phase boundaries — terminal types in first half, narrative reveals in second
          const P1_END = TERMINAL.typingP1,
            P2_END = TERMINAL.typingP2,
            P3_END = TERMINAL.typingP3;
          const NAR_START = TERMINAL.narStart,
            NAR_END = TERMINAL.narEnd;

          // Wipe — only at very end, AFTER narrative finishes
          const wipeProgress = ss(TERMINAL.wipeStart, TERMINAL.wipeEnd, companyProgress);
          termWipe.style.opacity =
            wipeProgress > 0 && wipeProgress < 1 ? "1" : "0";
          termWipe.style.transform = `translateY(${(1 - wipeProgress) * 100}%)`;

          if (wipeProgress >= TERMINAL.wipeComplete) {
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
                  fg = TERMINAL.promotionFg;
                  bg = TERMINAL.promotionBg;
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
            const sceneReveal = ss(0, TERMINAL_NARRATOR.sceneEnd, narP);
            const actionFade = ss(TERMINAL_NARRATOR.actionStart, TERMINAL_NARRATOR.actionEnd, narP);
            const shiftFade = ss(TERMINAL_NARRATOR.shiftStart, TERMINAL_NARRATOR.shiftEnd, narP);
            const fadeOut =
              companyProgress > TERMINAL_NARRATOR.fadeoutStart ? ss(TERMINAL_NARRATOR.fadeoutStart, TERMINAL_NARRATOR.fadeoutEnd, companyProgress) : 0;
            narEl.style.opacity = String(1 - fadeOut);

            const nameEl = narEl.querySelector<HTMLElement>("[data-role=name]");
            /* periodEl removed — no JSX element has data-role="period" (P2.5) */
            const sceneEl =
              narEl.querySelector<HTMLElement>("[data-role=scene]");
            const actionEl =
              narEl.querySelector<HTMLElement>("[data-role=action]");
            const shiftEl =
              narEl.querySelector<HTMLElement>("[data-role=shift]");

            if (nameEl) {
              nameEl.textContent =
                TERM_COMPANIES[companyIdx].company +
                " · " +
                TERM_COMPANIES[companyIdx].location;
              nameEl.style.color = COMPANY_COLORS[companyIdx];
              nameEl.style.opacity = String(ss(0, TERMINAL_NARRATOR.headerFadeEnd, narP));
            }
            /* periodEl block removed — dead code path (P2.5) */
            if (sceneEl && nar) {
              sceneEl.textContent = nar.scene;
              const clipRight = 100 - sceneReveal * 100;
              sceneEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
            }
            if (actionEl && nar) {
              actionEl.textContent = nar.action;
              actionEl.style.opacity = String(actionFade);
              actionEl.style.transform = `translateY(${lerp(TERMINAL_NARRATOR.slideY, 0, actionFade)}px)`;
            }
            if (shiftEl && nar) {
              shiftEl.textContent = nar.shift;
              shiftEl.style.opacity = String(shiftFade);
              shiftEl.style.transform = `translateY(${lerp(TERMINAL_NARRATOR.slideY, 0, shiftFade)}px)`;
            }
          }

          // Dot indicator — active dot is pill, others are circles
          const DOT_COLORS = COMPANY_COLORS;
          for (let pi = 0; pi < TERMINAL.companyCount; pi++) {
            const dot = termProgressRefs.current[pi];
            if (!dot) continue;
            const isActive = pi === companyIdx;
            dot.style.width = isActive ? TERMINAL.dotActiveWidth : TERMINAL.dotInactiveWidth;
            dot.style.opacity = isActive ? "1" : String(TERMINAL.dotInactiveOpacity);
            dot.style.background = isActive
              ? DOT_COLORS[pi]
              : "var(--text-dim)";
          }
        }
      }
    }

    // Beat glow + vignette disabled — clean dark background only
    if (beatGlowEl.current) beatGlowEl.current.style.opacity = "0";
    if (vignetteEl.current) vignetteEl.current.style.opacity = "0";

    /* ============================================================== */
    /*  MOVEMENT 3: CRYSTALLIZE (PH.CRYSTALLIZE range)                  */
    /* ============================================================== */
    {
      const cS = PH.CRYSTALLIZE.start,
        cE = PH.CRYSTALLIZE.end,
        cD = cE - cS;
      if (flashEl.current) flashEl.current.style.opacity = "0";
      if (crystLineEl.current) {
        const appear = ss(cS + cD * CRYSTALLIZE.lineAppearStart, cS + cD * CRYSTALLIZE.lineAppearEnd, p);
        crystLineEl.current.style.opacity = String(appear * CRYSTALLIZE.lineOpacity);
        crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
      }
      principles.forEach((pr, i) => {
        const el = principleEls.current[i];
        if (!el) return;
        const stagger = i * cD * CRYSTALLIZE.staggerFrac;
        const fadeIn = ss(cS + cD * CRYSTALLIZE.fadeInStartFrac + stagger, cS + cD * CRYSTALLIZE.fadeInEndFrac + stagger, p);
        const settle = ss(cS + cD * CRYSTALLIZE.settleStartFrac + stagger, cS + cD * CRYSTALLIZE.settleEndFrac, p);
        // Mobile: wider spacing between principles
        const mobileYOffset = lg ? pr.yOffset : (i - CRYSTALLIZE.mobileCenter) * CRYSTALLIZE.mobileSpacing;
        const y = lerp(mobileYOffset + CRYSTALLIZE.yOffset, mobileYOffset, settle);
        el.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
        el.style.opacity = String(fadeIn);
        el.style.filter = `blur(${lerp(CRYSTALLIZE.initialBlur, 0, fadeIn)}px)`;
        el.style.maxWidth = lg ? CRYSTALLIZE.maxWidthLg : CRYSTALLIZE.maxWidthSm;
      });
    }
  });

  /* ---- Particles driven from scroll progress (PARTICLES range → local 0–1) ---- */

  /* ---- Resize (canvas + SVG rect cache) ---- */
  const handleResize = useCallback(() => {
    const w = window.innerWidth,
      h = window.innerHeight;
    sizeRef.current = { w, h };
    const canvas = canvasRef.current;
    if (canvas) {
      // Scale canvas backing store to device pixel ratio for crisp rendering
      // on Retina/HiDPI displays. CSS size stays at logical pixels; the
      // scale() call lets draw commands use logical coords while the backing
      // buffer has enough physical pixels. Must re-apply on every resize
      // because resetting canvas.width clears the context transform.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const canvasContext = canvas.getContext("2d");
      if (canvasContext) canvasContext.scale(dpr, dpr);
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

  /* ---- Particle animation loop ----
     Gated by scroll progress: starts only when particleProgressRef enters
     (0, PP.FADE_OUT[1]] (triggered in the scroll callback), self-terminates
     when progress leaves that range. No IntersectionObserver needed — the
     scroll callback is the single authority on when particles are active. */
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    function draw() {
      const canvas = canvasRef.current,
        canvasCtx = canvas?.getContext("2d");
      if (!canvasCtx || !canvas) {
        particleAnimating.current = false;
        return;
      }
      const { w: viewportW, h: viewportH } = sizeRef.current;
      if (viewportW === 0 || viewportH === 0) {
        particleAnimating.current = false;
        return;
      }

      const progress = particleProgressRef.current;
      canvasCtx.clearRect(0, 0, viewportW, viewportH);

      if (progress <= 0 || progress > PP.FADE_OUT[1]) {
        particleAnimating.current = false;
        return;
      }

      const centerX = viewportW * 0.5,
        centerY = viewportH * 0.5;
      const particles = particlesRef.current;
      const minDim = Math.min(viewportW, viewportH);

      for (const particle of particles) {
        const target = F_TOP_POSITIONS[particle.streamIdx];
        const { px: targetX, py: targetY } = svgToPixel(
          target.x,
          target.y,
          svgRectRef.current,
        );

        let dotX: number, dotY: number, alpha: number;

        if (progress < PP.EXPLODE[1]) {
          const explodeT = smoothstep(PP.EXPLODE[0], PP.EXPLODE[1], progress);
          const eased = 1 - (1 - explodeT) * (1 - explodeT);
          const dist = particle.radius * minDim * eased;
          dotX = centerX + Math.cos(particle.angle) * dist;
          dotY = centerY + Math.sin(particle.angle) * dist;
          alpha = smoothstep(0, PARTICLE.appearDur, progress);
        } else {
          const convergeT = smoothstep(PP.CONVERGE[0], PP.CONVERGE[1], progress);
          const eased = convergeT * convergeT * (3 - 2 * convergeT);
          const dist = particle.radius * minDim;
          const explodedX = centerX + Math.cos(particle.angle) * dist;
          const explodedY = centerY + Math.sin(particle.angle) * dist;
          dotX = lerp(explodedX, targetX, eased);
          dotY = lerp(explodedY, targetY, eased);
          alpha = 1 - smoothstep(PP.FADE_OUT[0], PP.FADE_OUT[1], progress);
        }

        if (alpha <= PARTICLE.alphaCutoff) continue;

        const convergeT = smoothstep(PP.CONVERGE[0], PP.CONVERGE[1], progress);
        const dotSize = lerp(particle.size, particle.size * PARTICLE.convergeShrink, convergeT);

        canvasCtx.beginPath();
        canvasCtx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        canvasCtx.fillStyle = particle.color;
        canvasCtx.globalAlpha = alpha * PARTICLE.dotOpacity;
        canvasCtx.fill();

        const glowSize = dotSize * PARTICLE.glowRadius;
        canvasCtx.beginPath();
        canvasCtx.arc(dotX, dotY, glowSize, 0, Math.PI * 2);
        const glowGradient = canvasCtx.createRadialGradient(dotX, dotY, 0, dotX, dotY, glowSize);
        glowGradient.addColorStop(0, particle.color);
        glowGradient.addColorStop(1, "transparent");
        canvasCtx.fillStyle = glowGradient;
        canvasCtx.globalAlpha = alpha * PARTICLE.glowOpacity * (1 - convergeT * PARTICLE.glowFade);
        canvasCtx.fill();
      }

      canvasCtx.globalAlpha = 1;
      particleFrameId.current = requestAnimationFrame(draw);
    }

    drawParticles.current = draw;

    return () => {
      cancelAnimationFrame(particleFrameId.current);
      particleAnimating.current = false;
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
      {/*  FORGE CONTAINER (2000vh) — V0's complete sequence            */}
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
                style={{
                  color: "var(--cream-muted)",
                  maxWidth: "min(500px, 85vw)",
                }}>
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
                          fill="var(--cream-muted)"
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
                        f.type === "tag"
                          ? "0.06em"
                          : f.type === "seed"
                            ? "0.04em"
                            : "0.02em",
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

          {/* Thesis — keywords highlight sequentially on scroll */}
          <div
            ref={(el) => {
              thesisEls.current[0] = el;
            }}
            className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
            style={{
              opacity: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
              color: "var(--cream)",
              fontWeight: 400,
              maxWidth: "60vw",
              lineHeight: 1.5,
              willChange: "transform, opacity, filter",
            }}>
            Each of my past roles sharpened a different part of how I think
            about{" "}
            <span
              ref={(el) => {
                thesisWordRefs.current[0] = el;
              }}
              style={{ opacity: 0, willChange: "opacity, transform" }}>
              users,
            </span>{" "}
            <span
              ref={(el) => {
                thesisWordRefs.current[1] = el;
              }}
              style={{ opacity: 0, willChange: "opacity, transform" }}>
              structure,
            </span>{" "}
            <span
              ref={(el) => {
                thesisWordRefs.current[2] = el;
              }}
              style={{ opacity: 0, willChange: "opacity, transform" }}>
              clarity,
            </span>{" "}
            <span
              ref={(el) => {
                thesisWordRefs.current[3] = el;
              }}
              style={{ opacity: 0, willChange: "opacity, transform" }}>
              and scale.
            </span>
          </div>

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
            <div
              className="hidden lg:flex absolute inset-0 items-center justify-center flex-row"
              style={{ padding: "0 4vw", gap: "3vw" }}>
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
                  fontFamily: TERMINAL_FONT,
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
            </div>
            {/* close desktop wrapper */}

            {/* Mobile carousel — static swipeable cards, lg:hidden */}
            {(() => {
              /* COMPANY_COLORS + COMPANY_ROLES imported from forge-data */
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
                        ref={(el) => {
                          mobileCardRefs.current[ci] = el;
                        }}
                        className="absolute inset-0 flex flex-col items-center px-6"
                        style={{
                          opacity: ci === 0 ? 1 : 0,
                          paddingTop: "clamp(60px, 12vh, 120px)",
                          willChange: "opacity",
                          transition: "opacity 0.3s ease",
                        }}>
                        {/* Company label + role — above the card */}
                        <div
                          style={{
                            marginBottom: "0.6rem",
                            textAlign: "center",
                          }}>
                          <div
                            className="font-ui"
                            style={{
                              fontSize: "0.7rem",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: COMPANY_COLORS[ci],
                            }}>
                            {co.company} &middot; {co.location}
                          </div>
                          <div
                            className="font-sans"
                            style={{
                              fontSize: "0.6rem",
                              color: "var(--text-dim)",
                              marginTop: "0.25rem",
                              letterSpacing: "0.04em",
                            }}>
                            {COMPANY_ROLES[co.company]}
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
                            boxShadow:
                              "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
                          }}>
                          {/* Narrative text — clear 3-tier hierarchy */}
                          <div
                            style={{
                              width: "100%",
                              marginBottom: "clamp(0.8rem, 2vh, 1.2rem)",
                            }}>
                            <p
                              className="font-serif"
                              style={{
                                fontSize: "1.05rem",
                                lineHeight: 1.55,
                                color: "var(--cream)",
                                marginBottom: "0.75rem",
                              }}>
                              {nar.scene}
                            </p>
                            <p
                              className="font-sans"
                              style={{
                                fontSize: "0.82rem",
                                lineHeight: 1.6,
                                color: "var(--cream-muted)",
                                marginBottom: "0.75rem",
                              }}>
                              {nar.action}
                            </p>
                            <p
                              className="font-narrator"
                              style={{
                                fontSize: "0.88rem",
                                lineHeight: 1.5,
                                fontStyle: "italic",
                                color: "var(--gold-dim)",
                              }}>
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
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 10px",
                                background: TC.topBar,
                              }}>
                              {[TC.dotRed, TC.dotYellow, TC.dotGreen].map(
                                (c) => (
                                  <div
                                    key={c}
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: "50%",
                                      background: c,
                                    }}
                                  />
                                ),
                              )}
                              <span
                                className="font-sans"
                                style={{
                                  marginLeft: "auto",
                                  fontSize: "8px",
                                  color: "var(--text-dim)",
                                  letterSpacing: "0.05em",
                                }}>
                                ~/career
                              </span>
                            </div>
                            <pre
                              style={{
                                padding: "8px 10px",
                                margin: 0,
                                fontFamily: TERMINAL_FONT,
                                fontSize: "10px",
                                lineHeight: 1.7,
                                color: TC.text,
                                whiteSpace: "pre-wrap",
                              }}>
                              <span style={{ color: TC.keyword }}>
                                {co.commitType}: {co.commitMsg}
                              </span>
                              {co.insight.map((line, li) => (
                                <span key={li}>
                                  {"\n"}
                                  <span style={{ color: TC.comment }}>
                                    {line}
                                  </span>
                                </span>
                              ))}
                              {co.promotion && (
                                <span>
                                  {"\n"}
                                  <span
                                    style={{
                                      color: "#FBBF24",
                                      background: "rgba(251,191,36,0.08)",
                                      padding: "0 4px",
                                      borderRadius: "2px",
                                    }}>
                                    {co.promotion}
                                  </span>
                                </span>
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
          </div>
          {/* close terminalRef outer */}

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
                      fill="var(--cream-muted)"
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
              const topFrac = FUNNEL.narratorTopFracs[ni];
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
                    ref={(el) => {
                      cameraSkillRefs.current[si] = el;
                    }}
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
                ref={(el) => {
                  cameraNodeRefs.current[0] = el;
                }}
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
              That way of thinking carried naturally into engineering.
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
