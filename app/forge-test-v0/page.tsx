"use client";

import { useRef, useMemo, useState, useEffect, type ReactNode } from "react";
import { motion, useScroll, useMotionValueEvent, useInView } from "framer-motion";
import { COMPANIES, ACT_II } from "@data";
import { DL } from "../forge-element-map";
import { ForgeNav } from "../forge-nav";
// ActLabel not needed — using inline motion.div for act label

/* ---- Inline ScrambleText (not exported from feature barrel) ------ */

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function useScramble(text: string, active: boolean, staggerMs = 40, cyclesPerChar = 4, intervalMs = 50) {
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
        if (elapsed < startDelay) { cycles[i]++; done = false; return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]; }
        if (resolved[i]) return ch;
        cycles[i]++;
        if (cycles[i] - Math.floor(startDelay / intervalMs) >= cyclesPerChar) { resolved[i] = true; return ch; }
        done = false;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
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
/*  Constants                                                          */
/* ================================================================== */

const ACT_BLUE = "#5B9EC2";
const RUNWAY = "1000vh";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface FragmentBase {
  companyIdx: number;
  isSeed: boolean;
  x0: number; y0: number;
  dx: number; dy: number;
  rot: number;
  dissolveStart: number;
  dissolveEnd: number;
}

interface TextFrag extends FragmentBase {
  type: "company" | "phrase" | "tag" | "seed";
  text: string;
  size: number;
  weight: number;
}

interface CodeFrag extends FragmentBase {
  type: "code";
  code: string;
  size: number;
}

interface LogoFrag extends FragmentBase {
  type: "logo";
  logoKey: string;
  label: string;
  logoSize: number;
}

interface CommandFrag extends FragmentBase {
  type: "command";
  cmd: string;
  size: number;
}

type Fragment = TextFrag | CodeFrag | LogoFrag | CommandFrag;

interface BeatData {
  company: string;
  period: string;
  learned: string;
  insight: string;
  companyIdx: number;
}

interface WhisperData {
  text: string;
  beatIdx: number;
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  size: number;
}

interface PrincipleData {
  text: string;
  companyIdx: number;
  yOffset: number;
}

interface EmberData {
  x0: number; y0: number;
  dx: number; speed: number;
  size: number; delay: number;
}

/* ================================================================== */
/*  Seeded random                                                      */
/* ================================================================== */

function srand(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

/* ================================================================== */
/*  Colors                                                             */
/* ================================================================== */

const CC = [
  [96, 165, 250],  // AMBOSS — blue
  [66, 184, 131],  // Compado — green
  [49, 120, 198],  // CAPinside — ts blue
  [244, 114, 182], // DKB — pink
];

function fc(ci: number, a: number): string {
  const [r, g, b] = CC[ci];
  return `rgba(${r},${g},${b},${a})`;
}

/* ================================================================== */
/*  Logo SVGs                                                          */
/* ================================================================== */

const LOGOS: Record<string, ReactNode> = {
  react: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="3" fill="#61DAFB" />
      <ellipse cx="18" cy="18" rx="14" ry="5.5" stroke="#61DAFB" strokeWidth="1.2" />
      <ellipse cx="18" cy="18" rx="14" ry="5.5" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 18 18)" />
      <ellipse cx="18" cy="18" rx="14" ry="5.5" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 18 18)" />
    </svg>
  ),
  vue: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 30 L4 8 L10 8 L18 22 L26 8 L32 8 Z" fill="#42B883" />
      <path d="M18 24 L10 8 L14 8 L18 16 L22 8 L26 8 Z" fill="#35495E" />
    </svg>
  ),
  typescript: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="3" width="30" height="30" rx="4" fill="#3178C6" />
      <text x="18" y="24" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="var(--font-sans)">TS</text>
    </svg>
  ),
  git: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 6 L18 30" stroke="#F05032" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="10" r="3" stroke="#F05032" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="26" r="3" stroke="#F05032" strokeWidth="1.5" fill="none" />
      <path d="M18 18 Q24 18 26 13" stroke="#F05032" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="27" cy="12" r="2.5" stroke="#F05032" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  nextjs: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="15" stroke="white" strokeWidth="1.2" />
      <path d="M14 12 L14 24 L25 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 18 L23 24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  playwright: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="3" width="30" height="30" rx="4" stroke="#2EAD33" strokeWidth="1.5" fill="none" />
      <text x="18" y="24" textAnchor="middle" fill="#2EAD33" fontSize="13" fontWeight="bold" fontFamily="var(--font-sans)">PW</text>
    </svg>
  ),
  jest: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="15" stroke="#C21325" strokeWidth="1.2" fill="none" />
      <text x="18" y="24" textAnchor="middle" fill="#C21325" fontSize="16" fontWeight="bold" fontFamily="var(--font-serif)">J</text>
    </svg>
  ),
  sentry: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 6 C14 12, 10 20, 8 28 L12 28 C13 22, 15 16, 18 12 C21 16, 23 22, 24 28 L28 28 C26 20, 22 12, 18 6 Z" fill="#362D59" stroke="#8B6CC1" strokeWidth="0.5" />
    </svg>
  ),
};

/* ================================================================== */
/*  Data factories                                                     */
/* ================================================================== */

function createFragments(): Fragment[] {
  const frags: Fragment[] = [];
  let s = 0;

  function pos() {
    s++;
    return {
      x0: (srand(s * 7.1) - 0.5) * 82,
      y0: (srand(s * 13.3) - 0.5) * 72,
      dx: (srand(s * 3.7) - 0.5) * 24,
      dy: (srand(s * 5.3) - 0.5) * 20,
      rot: (srand(s * 11.1) - 0.5) * 30,
    };
  }

  const text = (t: string, ci: number, kind: TextFrag["type"], size: number, weight = 400, ds = 0.22, de = 0.32): TextFrag => ({
    type: kind, text: t, companyIdx: ci, isSeed: kind === "seed", size, weight, dissolveStart: ds, dissolveEnd: de, ...pos(),
  });
  const code = (c: string, ci: number, size = 0.65): CodeFrag => ({
    type: "code", code: c, companyIdx: ci, isSeed: false, size, dissolveStart: 0.23, dissolveEnd: 0.33, ...pos(),
  });
  const logo = (key: string, ci: number, label: string, logoSize = 34): LogoFrag => ({
    type: "logo", logoKey: key, label, companyIdx: ci, isSeed: false, logoSize, dissolveStart: 0.18, dissolveEnd: 0.28, ...pos(),
  });
  const cmd = (c: string, ci: number, size = 0.65): CommandFrag => ({
    type: "command", cmd: c, companyIdx: ci, isSeed: false, size, dissolveStart: 0.20, dissolveEnd: 0.30, ...pos(),
  });

  // Companies
  frags.push(text("AMBOSS", 0, "company", 1.5, 600, 0.24, 0.34));
  frags.push(text("Compado", 1, "company", 1.5, 600, 0.24, 0.34));
  frags.push(text("CAPinside", 2, "company", 1.5, 600, 0.24, 0.34));
  frags.push(text("DKB", 3, "company", 1.7, 700, 0.25, 0.35));

  // Phrases
  frags.push(text("500K students", 0, "phrase", 0.85, 400, 0.22, 0.32));
  frags.push(text("A/B experiments", 0, "phrase", 0.8));
  frags.push(text("beta to production", 0, "phrase", 0.75));
  frags.push(text("page speed", 1, "phrase", 0.85));
  frags.push(text("conversion flows", 1, "phrase", 0.8));
  frags.push(text("organic traffic", 1, "phrase", 0.75));
  frags.push(text("legacy rewrite", 2, "phrase", 0.85));
  frags.push(text("10K advisors", 2, "phrase", 0.8));
  frags.push(text("migration paths", 2, "phrase", 0.75));
  frags.push(text("banking platform", 3, "phrase", 0.85));
  frags.push(text("test automation", 3, "phrase", 0.8));
  frags.push(text("weekly deploys", 3, "phrase", 0.75));
  frags.push(text("5M users", 3, "phrase", 0.9, 500));
  frags.push(text("micro-frontends", 3, "phrase", 0.75));

  // Tags
  frags.push(text("React", 0, "tag", 0.7, 500, 0.20, 0.30));
  frags.push(text("Vue", 1, "tag", 0.7, 500, 0.20, 0.30));
  frags.push(text("TypeScript", 2, "tag", 0.7, 500, 0.20, 0.30));
  frags.push(text("Playwright", 3, "tag", 0.7, 500, 0.20, 0.30));
  frags.push(text("Jest", 3, "tag", 0.65, 500, 0.19, 0.29));
  frags.push(text("Performance", 1, "tag", 0.65, 500, 0.20, 0.30));
  frags.push(text("Med-Ed", 0, "tag", 0.65, 500, 0.19, 0.29));
  frags.push(text("Fintech", 2, "tag", 0.65, 500, 0.20, 0.30));
  frags.push(text("Banking", 3, "tag", 0.65, 500, 0.20, 0.30));
  frags.push(text("SEO", 1, "tag", 0.65, 500, 0.19, 0.29));

  // Code
  frags.push(code("const isReady = await pipeline.validate()", 3));
  frags.push(code("useEffect(() => { fetchData() }, [])", 0));
  frags.push(code("describe('payment flow', () => {", 3));
  frags.push(code("expect(loadTime).toBeLessThan(300)", 1));
  frags.push(code("<DataGrid columns={schema} />", 2));
  frags.push(code("interface Advisor { id: string }", 2));
  frags.push(code("const metrics = useWebVitals()", 1));
  frags.push(code("render(<StudyFlow variant={B} />)", 0));
  frags.push(code("await page.goto('/dashboard')", 3));
  frags.push(code("export function migrate(legacy: Schema)", 2));

  // Logos
  frags.push(logo("react", 0, "React", 34));
  frags.push(logo("vue", 1, "Vue.js", 34));
  frags.push(logo("typescript", 2, "TypeScript", 32));
  frags.push(logo("git", 0, "Git", 30));
  frags.push(logo("nextjs", 3, "Next.js", 32));
  frags.push(logo("playwright", 3, "Playwright", 30));
  frags.push(logo("jest", 3, "Jest", 30));
  frags.push(logo("sentry", 1, "Sentry", 30));

  // Commands
  frags.push(cmd("git push origin main", 0));
  frags.push(cmd("npx playwright test --headed", 3));
  frags.push(cmd("npm run build && npm run deploy", 1));
  frags.push(cmd("jest --coverage --watchAll", 3));
  frags.push(cmd("lighthouse https://app.amboss.com", 0));

  // Seeds
  COMPANIES.forEach((c, ci) => {
    c.distillation.seedWords.forEach((w) => {
      frags.push(text(w, ci, "seed", 1.05, 600));
    });
  });

  return frags;
}

const BEATS: BeatData[] = [
  {
    company: "AMBOSS",
    period: "Berlin, 2018 — 2019",
    learned: "What I learned to see: the user is a real person with a real context",
    insight: "The user is never an abstraction. The moment you treat them like one, the product starts lying to people.",
    companyIdx: 0,
  },
  {
    company: "Compado",
    period: "Berlin, 2019 — 2021",
    learned: "What I learned to see: performance is a product decision, not a technical one",
    insight: "Load time is not a metric. It is a user\u2019s first impression of whether you respect their time.",
    companyIdx: 1,
  },
  {
    company: "CAPinside",
    period: "Hamburg, 2021",
    learned: "What I learned to see: code quality is a team behaviour, not a personal one",
    insight: "A codebase is a record of a team\u2019s habits. If you want to change the code, you have to change how the team works.",
    companyIdx: 2,
  },
  {
    company: "DKB Code Factory",
    period: "Berlin, 2021 — 2024",
    learned: "What I learned to see: at scale, judgment is the product",
    insight: "At a certain scale, the highest-leverage thing an engineer can do is make the right decision obvious.",
    companyIdx: 3,
  },
];

function createWhispers(): WhisperData[] {
  const whispers: WhisperData[] = [];
  let s = 200;

  const add = (text: string, beatIdx: number) => {
    s++;
    const side = srand(s * 2.1) > 0.5 ? 1 : -1;
    whispers.push({
      text,
      beatIdx,
      x0: side * (srand(s * 7.7) * 18 + 22),
      y0: (srand(s * 11.3) - 0.5) * 50,
      dx: (srand(s * 3.1) - 0.5) * 6,
      dy: (srand(s * 5.9) - 0.5) * 4,
      size: srand(s * 9.3) * 0.2 + 0.6,
    });
  };

  // Beat 0 — AMBOSS
  add("React", 0); add("500K", 0); add("Berlin 2018", 0);
  add("A/B", 0); add("clinical", 0);
  // Beat 1 — Compado
  add("Vue", 1); add("+50%", 1); add("Berlin 2019", 1);
  add("SEO", 1); add("speed", 1);
  // Beat 2 — CAPinside
  add("TypeScript", 2); add("10K", 2); add("Hamburg", 2);
  add("legacy", 2); add("rewrite", 2);
  // Beat 3 — DKB
  add("Playwright", 3); add("5M", 3); add("Berlin 2021", 3);
  add("weekly", 3); add("testing", 3);

  return whispers;
}

function createPrinciples(): PrincipleData[] {
  return COMPANIES.map((c, i) => ({
    text: c.distillation.principle,
    companyIdx: i,
    yOffset: (i - 1.5) * 11,
  }));
}

function createEmbers(): EmberData[] {
  return Array.from({ length: 20 }, (_, i) => ({
    x0: (srand((i + 50) * 7.3) - 0.5) * 60,
    y0: srand((i + 50) * 11.1) * 40 + 10,
    dx: (srand((i + 50) * 3.9) - 0.5) * 8,
    speed: srand((i + 50) * 5.7) * 30 + 15,
    size: srand((i + 50) * 9.1) * 3 + 1.5,
    delay: srand((i + 50) * 2.3) * 0.08,
  }));
}

/* ================================================================== */
/*  Math                                                               */
/* ================================================================== */

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function ss(e0: number, e1: number, x: number) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ================================================================== */
/*  Beat timing — each beat's fade in/hold/fade out ranges             */
/* ================================================================== */

const BEAT_RANGES = [
  { fadeIn: [0.32, 0.37], hold: [0.37, 0.44], fadeOut: [0.44, 0.49] },
  { fadeIn: [0.47, 0.52], hold: [0.52, 0.59], fadeOut: [0.59, 0.64] },
  { fadeIn: [0.62, 0.67], hold: [0.67, 0.74], fadeOut: [0.74, 0.79] },
  { fadeIn: [0.77, 0.82], hold: [0.82, 0.88], fadeOut: [0.88, 0.92] },
] as const;

/* ================================================================== */
/*  Phase labels                                                       */
/* ================================================================== */

const PHASES = [
  { s: 0, l: "" },
  { s: 0.04, l: "RAW" },
  { s: 0.15, l: "HEAT" },
  { s: 0.22, l: "SMELT" },
  { s: 0.28, l: "THESIS" },
  { s: 0.35, l: "SIGHT" },
  { s: 0.88, l: "CRYSTALLIZE" },
] as const;

function phaseLabel(p: number): string {
  let l = "";
  for (const ph of PHASES) if (p >= ph.s) l = ph.l;
  return l;
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ForgeTestPage() {
  /* ---- Refs ---- */
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInViewRef = useRef<HTMLDivElement>(null);
  const fragmentEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisEls = useRef<(HTMLDivElement | null)[]>([]);
  const beatEls = useRef<(HTMLDivElement | null)[]>([]);
  const beatLabelEls = useRef<(HTMLDivElement | null)[]>([]);
  const beatLearnedEls = useRef<(HTMLDivElement | null)[]>([]);
  const whisperEls = useRef<(HTMLElement | null)[]>([]);
  const principleEls = useRef<(HTMLDivElement | null)[]>([]);
  const glowEl = useRef<HTMLDivElement>(null);
  const innerGlowEl = useRef<HTMLDivElement>(null);
  const flashEl = useRef<HTMLDivElement>(null);
  const gridEl = useRef<HTMLDivElement>(null);
  const vignetteEl = useRef<HTMLDivElement>(null);
  const beatGlowEl = useRef<HTMLDivElement>(null);
  const scrollHintEl = useRef<HTMLDivElement>(null);
  const progressBarEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);
  const crystLineEl = useRef<HTMLDivElement>(null);

  /* ---- Data ---- */
  const fragments = useMemo(createFragments, []);
  const whispers = useMemo(createWhispers, []);
  const principles = useMemo(createPrinciples, []);
  const embers = useMemo(createEmbers, []);

  /* ---- Title scramble trigger ---- */
  const titleInView = useInView(titleInViewRef, { once: true, amount: 0.5 });
  const [titleActive, setTitleActive] = useState(false);
  useEffect(() => { if (titleInView) setTitleActive(true); }, [titleInView]);

  /* ---- Scroll ---- */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    /* ---- Curtain edge: where the summary panel top is on screen ---- */
    let curtainTop = window.innerHeight; // default: off-screen (no curtain)
    if (summaryPanelRef.current) {
      const st = summaryPanelRef.current.getBoundingClientRect().top;
      if (st < window.innerHeight) curtainTop = Math.max(0, st);
    }

    /* ---- Chrome ---- */
    if (scrollHintEl.current)
      scrollHintEl.current.style.opacity = String(1 - ss(0, 0.03, p));
    if (progressBarEl.current)
      progressBarEl.current.style.width = `${p * 100}%`;
    if (phaseEl.current) {
      phaseEl.current.textContent = phaseLabel(p);
      phaseEl.current.style.opacity = String(p > 0.03 && p < 0.96 ? 0.3 : 0);
    }

    /* ---- Title fade out ---- */
    if (titleRef.current) {
      const fade = 1 - ss(0.03, 0.09, p);
      titleRef.current.style.opacity = String(fade);
      titleRef.current.style.transform = `translateY(${lerp(0, -30, ss(0.03, 0.09, p))}px)`;
    }

    /* ============================================================== */
    /*  MOVEMENT 1: THE FORGE (0.04 — 0.30)                           */
    /* ============================================================== */
    const vh = window.innerHeight;
    const CURTAIN_FADE = 80; // px fade zone below curtain edge

    if (p < 0.36) {
      fragments.forEach((f, i) => {
        const el = fragmentEls.current[i];
        if (!el) return;

        if (f.isSeed) {
          const fadeIn = ss(0.04, 0.12, p);
          const fadeOut = 1 - ss(0.26, 0.33, p);
          const drift = ss(0.08, 0.22, p);
          const converge = ss(0.20, 0.30, p);
          const heat = ss(0.14, 0.26, p);

          const dX = f.x0 + f.dx * drift;
          const dY = f.y0 + f.dy * drift;
          const x = lerp(dX, 0, converge);
          const y = lerp(dY, 0, converge);
          const rot = lerp(f.rot, 0, converge);
          const scale = lerp(1, 1.3, heat) * lerp(1, 0.5, ss(0.28, 0.33, p));

          // Curtain: fragment screen Y vs summary panel edge
          const fragScreenY = vh * 0.5 + y * vh / 100;
          const curtainReveal = curtainTop >= vh ? 1 : Math.max(0, Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE));
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg) scale(${scale})`;
          el.style.opacity = String(fadeIn * fadeOut * curtainReveal);
          el.style.filter = `blur(${lerp(1, 0, ss(0.04, 0.10, p))}px) brightness(${lerp(1, 1.8, heat)})`;

          const glow = heat > 0.05
            ? `0 0 ${lerp(0, 28, heat)}px ${fc(f.companyIdx, 0.9)}, 0 0 ${lerp(0, 56, heat)}px ${fc(f.companyIdx, 0.3)}`
            : "none";
          if (f.type === "seed") (el as HTMLElement).style.textShadow = glow;
          else (el as HTMLElement).style.boxShadow = glow;
        } else {
          const fadeIn = ss(0.03, 0.12, p);
          const fadeOut = 1 - ss(f.dissolveStart, f.dissolveEnd, p);
          const drift = ss(0.06, 0.28, p);
          const dissolve = ss(f.dissolveStart, f.dissolveEnd, p);

          const x = f.x0 + f.dx * drift;
          const y = f.y0 + f.dy * drift;
          const rot = f.rot * (1 + drift * 0.3);

          let baseAlpha: number;
          switch (f.type) {
            case "company": baseAlpha = 0.8; break;
            case "code": baseAlpha = 0.5; break;
            case "command": baseAlpha = 0.5; break;
            case "logo": baseAlpha = 0.6; break;
            default: baseAlpha = 0.5;
          }

          // Curtain: fragment screen Y vs summary panel edge
          const fragScreenY = vh * 0.5 + y * vh / 100;
          const curtainReveal = curtainTop >= vh ? 1 : Math.max(0, Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE));
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg)`;
          el.style.opacity = String(fadeIn * fadeOut * baseAlpha * curtainReveal);
          el.style.filter = `blur(${lerp(0, 12, dissolve)}px)`;
        }
      });
    } else {
      // Hide all forge fragments after forge phase
      fragments.forEach((_, i) => {
        const el = fragmentEls.current[i];
        if (el) el.style.opacity = "0";
      });
    }

    /* ---- Embers ---- */
    embers.forEach((e, i) => {
      const el = emberEls.current[i];
      if (!el) return;
      const heat = ss(0.10 + e.delay, 0.22, p);
      const cool = ss(0.28, 0.35, p);
      const active = heat * (1 - cool);
      const rise = ss(0.12 + e.delay, 0.30, p);
      el.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      el.style.opacity = String(active * (0.4 + Math.sin(p * 80 + i) * 0.3));
    });

    /* ---- Forge atmosphere ---- */
    if (glowEl.current) {
      const heat = ss(0.06, 0.24, p);
      const cool = ss(0.28, 0.36, p);
      glowEl.current.style.opacity = String(heat * (1 - cool * 0.7) * 0.75);
      glowEl.current.style.transform = `translate(-50%, -50%) scale(${lerp(0.3, 1.4, heat)})`;
    }
    if (innerGlowEl.current) {
      const heat = ss(0.12, 0.26, p);
      const cool = ss(0.28, 0.35, p);
      const pulse = Math.sin(p * Math.PI * 14) * 0.1 + 1;
      innerGlowEl.current.style.opacity = String(heat * (1 - cool) * 0.85 * pulse);
      innerGlowEl.current.style.transform = `translate(-50%, -50%) scale(${lerp(0.2, 1.1, heat) * pulse})`;
    }
    if (gridEl.current) {
      const appear = ss(0.03, 0.08, p);
      const fade = 1 - ss(0.26, 0.35, p);
      gridEl.current.style.opacity = String(appear * fade * 0.05);
    }

    /* ============================================================== */
    /*  THESIS (0.26 — 0.35)                                           */
    /* ============================================================== */

    // Line 1: "Most engineers learn to build things."
    if (thesisEls.current[0]) {
      const fadeIn = ss(0.25, 0.29, p);
      const fadeOut = 1 - ss(0.33, 0.37, p);
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(4, -2, ss(0.25, 0.37, p))}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    }
    // Line 2: "Some learn to see them."
    if (thesisEls.current[1]) {
      const fadeIn = ss(0.27, 0.31, p);
      const fadeOut = 1 - ss(0.33, 0.37, p);
      thesisEls.current[1].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[1].style.transform = `translate(-50%, calc(-50% + ${lerp(9, 3, ss(0.27, 0.37, p))}vh))`;
      thesisEls.current[1].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    }
    // Bridge: "That second kind of engineer takes time to become..."
    if (thesisEls.current[2]) {
      const fadeIn = ss(0.30, 0.34, p);
      const fadeOut = 1 - ss(0.35, 0.38, p);
      thesisEls.current[2].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[2].style.transform = `translate(-50%, calc(-50% + ${lerp(16, 12, ss(0.30, 0.38, p))}vh))`;
      thesisEls.current[2].style.filter = `blur(${lerp(4, 0, fadeIn)}px)`;
    }

    /* ============================================================== */
    /*  MOVEMENT 2: THE SIGHT (0.32 — 0.92)                            */
    /* ============================================================== */

    BEAT_RANGES.forEach((range, bi) => {
      const beatEl = beatEls.current[bi];
      const labelEl = beatLabelEls.current[bi];
      const learnedEl = beatLearnedEls.current[bi];
      if (!beatEl || !labelEl || !learnedEl) return;

      const fadeIn = ss(range.fadeIn[0], range.fadeIn[1], p);
      const fadeOut = 1 - ss(range.fadeOut[0], range.fadeOut[1], p);
      const vis = fadeIn * fadeOut;
      const settle = ss(range.fadeIn[0], range.hold[1], p);

      // Insight text
      beatEl.style.opacity = String(vis);
      beatEl.style.transform = `translate(-50%, calc(-50% + ${lerp(6, 0, settle)}vh))`;
      beatEl.style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;

      // Company label
      labelEl.style.opacity = String(vis * 0.4);
      labelEl.style.transform = `translate(-50%, calc(-50% + ${lerp(-16, -14, settle)}vh))`;

      // "What I learned to see" label
      learnedEl.style.opacity = String(vis * 0.3);
      learnedEl.style.transform = `translate(-50%, calc(-50% + ${lerp(15, 13, settle)}vh))`;
    });

    /* ---- Whisper fragments ---- */
    whispers.forEach((w, i) => {
      const el = whisperEls.current[i];
      if (!el) return;

      const range = BEAT_RANGES[w.beatIdx];
      const fadeIn = ss(range.fadeIn[0] + 0.01, range.fadeIn[1] + 0.02, p);
      const fadeOut = 1 - ss(range.fadeOut[0] - 0.01, range.fadeOut[1], p);
      const drift = ss(range.fadeIn[0], range.fadeOut[1], p);

      el.style.opacity = String(fadeIn * fadeOut * 0.2);
      el.style.transform = `translate(calc(-50% + ${w.x0 + w.dx * drift}vw), calc(-50% + ${w.y0 + w.dy * drift}vh))`;
    });

    /* ---- Beat atmosphere glow ---- */
    if (beatGlowEl.current) {
      // Determine which beat is active and blend colors
      let glowOpacity = 0;
      let glowR = 0, glowG = 0, glowB = 0;

      BEAT_RANGES.forEach((range, bi) => {
        const vis = ss(range.fadeIn[0], range.fadeIn[1], p) * (1 - ss(range.fadeOut[0], range.fadeOut[1], p));
        if (vis > 0) {
          const [r, g, b] = CC[bi];
          glowR = lerp(glowR, r, vis);
          glowG = lerp(glowG, g, vis);
          glowB = lerp(glowB, b, vis);
          glowOpacity = Math.max(glowOpacity, vis);
        }
      });

      beatGlowEl.current.style.opacity = String(glowOpacity * 0.15);
      beatGlowEl.current.style.background = `radial-gradient(circle, rgba(${Math.round(glowR)},${Math.round(glowG)},${Math.round(glowB)},0.2) 0%, transparent 65%)`;
    }

    /* ---- Vignette ---- */
    if (vignetteEl.current) {
      const forgeV = ss(0.12, 0.26, p) * (1 - ss(0.28, 0.35, p));
      const beatV = p > 0.32 && p < 0.92 ? 0.3 : 0;
      vignetteEl.current.style.opacity = String(Math.max(forgeV * 0.6, beatV));
    }

    /* ============================================================== */
    /*  MOVEMENT 3: CRYSTALLIZE (0.88 — 1.00)                          */
    /* ============================================================== */

    if (flashEl.current) {
      const flash = ss(0.88, 0.90, p) * (1 - ss(0.90, 0.94, p));
      flashEl.current.style.opacity = String(flash * 0.5);
    }

    if (crystLineEl.current) {
      const appear = ss(0.90, 0.94, p);
      crystLineEl.current.style.opacity = String(appear * 0.3);
      crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
    }

    principles.forEach((pr, i) => {
      const el = principleEls.current[i];
      if (!el) return;
      const stagger = i * 0.02;
      const fadeIn = ss(0.91 + stagger, 0.96 + stagger, p);
      const settle = ss(0.94 + stagger, 0.99, p);
      const y = lerp(pr.yOffset + 6, pr.yOffset, settle);
      el.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      el.style.opacity = String(fadeIn);
      el.style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    });
  });

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <div ref={containerRef} style={{ height: RUNWAY }} className="relative">
      <ForgeNav />
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>

        {/* ---- Atmosphere ---- */}
        <div ref={gridEl} aria-hidden className="absolute inset-0 pointer-events-none" style={{
          opacity: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div ref={vignetteEl} aria-hidden className="absolute inset-0 pointer-events-none" style={{
          opacity: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, var(--bg) 100%)",
        }} />

        <DL style={{ top: "44%", left: "44%" }}>FORGE GLOW</DL>
        <div ref={glowEl} aria-hidden className="absolute left-1/2 top-1/2 pointer-events-none" style={{
          width: "75vw", height: "75vh", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,158,194,0.20) 0%, rgba(91,158,194,0.07) 35%, transparent 65%)",
          opacity: 0, willChange: "transform, opacity",
        }} />

        <div ref={innerGlowEl} aria-hidden className="absolute left-1/2 top-1/2 pointer-events-none" style={{
          width: "30vw", height: "30vh", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, rgba(201,168,76,0.12) 40%, transparent 70%)",
          opacity: 0, willChange: "transform, opacity",
        }} />

        <div ref={flashEl} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
          width: "100vw", height: "100vh",
          background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(240,230,208,0.08) 30%, transparent 60%)",
          opacity: 0,
        }} />

        {/* Beat atmosphere glow */}
        <div ref={beatGlowEl} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
          width: "80vw", height: "80vh", borderRadius: "50%", opacity: 0, willChange: "opacity, background",
        }} />

        {/* Crystallize line */}
        <div ref={crystLineEl} aria-hidden className="absolute left-1/2 top-1/2 pointer-events-none" style={{
          width: "30vw", height: "1px", background: "var(--gold-dim)", opacity: 0,
          willChange: "transform, opacity",
        }} />

        {/* ---- Embers ---- */}
        <DL style={{ top: "14%", left: "50%", transform: "translateX(-50%)" }}>EMBERS</DL>
        {embers.map((e, i) => (
          <div key={`ember-${i}`} ref={(el) => { emberEls.current[i] = el; }} aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
            style={{
              width: e.size, height: e.size,
              background: "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 70%, transparent 100%)",
              opacity: 0, willChange: "transform, opacity",
            }}
          />
        ))}

        {/* ---- Title: ACT II / THE ENGINEER ---- */}
        <div ref={titleRef} className="absolute inset-0 flex flex-col items-center justify-center" style={{ willChange: "transform, opacity" }}>
          <DL style={{ top: 8, left: 8 }}>TITLE</DL>
          <div ref={titleInViewRef}>
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={titleActive ? { opacity: 1, letterSpacing: "0.5em" } : {}}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mb-6 text-xs sm:text-sm md:text-base text-center"
              style={{ color: ACT_BLUE }}
            >
              {ACT_II.act}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={titleActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-sans text-4xl font-bold tracking-[-0.03em] text-center sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]"
              style={{ color: "var(--cream)" }}
            >
              {ACT_II.title.toUpperCase().replace(/I/, "1").split(" ").map((word, i) => (
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
              style={{ color: "var(--cream-muted)", maxWidth: 500 }}
            >
              {ACT_II.splash}
            </motion.p>
          </div>
        </div>

        {/* ---- Forge fragments ---- */}
        <DL style={{ top: "18%", right: 12 }}>FORGE FRAGMENTS + SEED WORDS</DL>
        {fragments.map((f, i) => {
          const setRef = (el: HTMLElement | null) => { fragmentEls.current[i] = el; };
          const base = "absolute left-1/2 top-1/2 select-none pointer-events-none";

          switch (f.type) {
            case "code":
              return (
                <div key={`code-${i}`} ref={setRef} aria-hidden className={`${base} whitespace-nowrap`} style={{
                  opacity: 0, padding: "6px 12px", borderRadius: "6px",
                  background: "rgba(14,14,20,0.85)", border: "1px solid rgba(91,158,194,0.15)",
                  fontSize: `${f.size}rem`, fontFamily: "var(--font-sans)",
                  color: fc(f.companyIdx, 0.7), letterSpacing: "0.02em",
                  willChange: "transform, opacity, filter",
                }}>
                  <span style={{ color: "rgba(198,120,221,0.7)" }}>
                    {f.code.match(/^(const |let |var |export |async |await |function |interface |import )/)?.[0] ?? ""}
                  </span>
                  <span style={{ color: fc(f.companyIdx, 0.65) }}>
                    {f.code.replace(/^(const |let |var |export |async |await |function |interface |import )/, "")}
                  </span>
                </div>
              );
            case "logo":
              return (
                <div key={`logo-${f.logoKey}-${i}`} ref={setRef} aria-hidden className={`${base} flex flex-col items-center gap-1`} style={{
                  opacity: 0, willChange: "transform, opacity, filter",
                }}>
                  <div style={{ width: f.logoSize, height: f.logoSize, opacity: 0.7 }}>{LOGOS[f.logoKey]}</div>
                  <span className="font-sans" style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                </div>
              );
            case "command":
              return (
                <div key={`cmd-${i}`} ref={setRef} aria-hidden className={`${base} whitespace-nowrap`} style={{
                  opacity: 0, padding: "5px 10px", borderRadius: "4px",
                  background: "rgba(7,7,10,0.9)", border: "1px solid rgba(74,222,128,0.12)",
                  fontSize: `${f.size}rem`, fontFamily: "var(--font-sans)", letterSpacing: "0.01em",
                  willChange: "transform, opacity, filter",
                }}>
                  <span style={{ color: "rgba(74,222,128,0.6)" }}>$ </span>
                  <span style={{ color: "rgba(74,222,128,0.45)" }}>{f.cmd}</span>
                </div>
              );
            default:
              return (
                <span key={`${f.type}-${f.text}-${i}`} ref={setRef as (el: HTMLSpanElement | null) => void} aria-hidden
                  className={`${base} whitespace-nowrap font-sans`} style={{
                    fontSize: `${f.size}rem`, fontWeight: f.weight,
                    color: fc(f.companyIdx, 0.7), opacity: 0,
                    letterSpacing: f.type === "company" ? "0.1em" : f.type === "tag" ? "0.06em" : f.type === "seed" ? "0.04em" : "0.02em",
                    textTransform: f.type === "company" ? "uppercase" : undefined,
                    willChange: "transform, opacity, filter",
                    ...(f.type === "tag" ? {
                      padding: "2px 8px", borderRadius: "3px",
                      border: `1px solid ${fc(f.companyIdx, 0.2)}`,
                      background: fc(f.companyIdx, 0.05),
                    } : {}),
                  }}>
                  {f.text}
                </span>
              );
          }
        })}

        {/* ---- Thesis text ---- */}
        <DL style={{ top: "42%", left: "20%" }}>THESIS</DL>
        {[
          "Most engineers learn to build things.",
          "Some learn to see them.",
          "That second kind of engineer takes time to become. Not because the skills are hard. Because the education is specific.",
        ].map((line, i) => (
          <div key={`thesis-${i}`} ref={(el) => { thesisEls.current[i] = el; }}
            className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
            style={{
              opacity: 0,
              fontFamily: i < 2 ? "var(--font-serif)" : "var(--font-sans)",
              fontSize: i < 2 ? "clamp(1.4rem, 3vw, 2.4rem)" : "clamp(0.8rem, 1.2vw, 1rem)",
              color: i < 2 ? "var(--cream)" : "var(--text-dim)",
              fontWeight: i < 2 ? 400 : 400,
              fontStyle: i === 1 ? "italic" : undefined,
              maxWidth: i < 2 ? "60vw" : "40vw",
              lineHeight: 1.5,
              willChange: "transform, opacity, filter",
            }}
          >
            {line}
          </div>
        ))}

        {/* ---- Narrative beats ---- */}
        <DL style={{ top: "34%", right: 12 }}>NARRATIVE BEATS</DL>
        {BEATS.map((beat, bi) => (
          <div key={`beat-group-${bi}`}>
            {/* Company label */}
            <DL style={{ top: -12, left: "50%", transform: "translateX(-50%)" }}>{`BEAT ${bi + 1}: ${beat.company}`}</DL>
            <div ref={(el) => { beatLabelEls.current[bi] = el; }}
              className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none font-sans"
              style={{
                opacity: 0, fontSize: "0.6rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: fc(beat.companyIdx, 0.5),
                willChange: "transform, opacity",
              }}
            >
              <span style={{ display: "block", marginBottom: "0.25rem" }}>{beat.company}</span>
              <span style={{ fontSize: "0.55rem", color: "var(--text-faint)" }}>{beat.period}</span>
            </div>

            {/* Insight text */}
            <div ref={(el) => { beatEls.current[bi] = el; }}
              className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
              style={{
                opacity: 0, fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.2rem, 2.8vw, 2rem)",
                lineHeight: 1.5, color: "var(--cream)",
                maxWidth: "50vw",
                willChange: "transform, opacity, filter",
              }}
            >
              {beat.insight}
            </div>

            {/* "What I learned to see" */}
            <div ref={(el) => { beatLearnedEls.current[bi] = el; }}
              className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none font-sans"
              style={{
                opacity: 0, fontSize: "clamp(0.6rem, 0.8vw, 0.75rem)",
                letterSpacing: "0.08em", fontStyle: "italic",
                color: "var(--text-dim)", maxWidth: "40vw",
                willChange: "transform, opacity",
              }}
            >
              {beat.learned}
            </div>
          </div>
        ))}

        {/* ---- Whisper fragments ---- */}
        <DL style={{ top: "22%", left: 12 }}>WHISPERS</DL>
        {whispers.map((w, i) => (
          <span key={`whisper-${i}`} ref={(el) => { whisperEls.current[i] = el; }}
            aria-hidden
            className="absolute left-1/2 top-1/2 whitespace-nowrap font-sans select-none pointer-events-none"
            style={{
              opacity: 0, fontSize: `${w.size}rem`,
              color: fc(BEATS[w.beatIdx].companyIdx, 0.35),
              letterSpacing: "0.06em",
              willChange: "transform, opacity",
            }}
          >
            {w.text}
          </span>
        ))}

        {/* ---- Principles ---- */}
        <DL style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}>PRINCIPLES (CRYSTALLIZE)</DL>
        {principles.map((pr, i) => (
          <div key={`principle-${i}`} ref={(el) => { principleEls.current[i] = el; }}
            className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
            style={{ opacity: 0, maxWidth: "44vw", willChange: "transform, opacity, filter" }}
          >
            <span className="font-sans uppercase tracking-widest block" style={{
              fontSize: "0.6rem", letterSpacing: "0.18em", color: fc(i, 0.45), marginBottom: "0.35rem",
            }}>
              {COMPANIES[i].company}
            </span>
            <span className="font-serif block" style={{
              fontSize: "clamp(0.9rem, 1.8vw, 1.3rem)", lineHeight: 1.55, color: "var(--cream)",
            }}>
              {pr.text}
            </span>
          </div>
        ))}

        {/* ---- Chrome ---- */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 font-sans tracking-widest uppercase"
          style={{ color: "var(--text-dim)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>
          The Forge — Act II Prototype
        </div>


        <div ref={phaseEl} className="absolute bottom-12 left-8 font-sans tracking-widest uppercase"
          style={{ color: "var(--gold-dim)", fontSize: "0.55rem", letterSpacing: "0.25em", opacity: 0 }} />

        <div ref={scrollHintEl} className="absolute bottom-8 left-1/2 -translate-x-1/2 font-sans tracking-widest uppercase"
          style={{ color: "var(--text-faint)", fontSize: "0.6rem", letterSpacing: "0.15em", animation: "breathe 3s ease-in-out infinite" }}>
          scroll to begin
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--stroke)" }}>
          <div ref={progressBarEl} className="h-full" style={{ width: "0%", background: "var(--gold-dim)", transition: "none" }} />
        </div>
      </div>

      {/* ---- Post-section summary ---- */}
      <div ref={summaryPanelRef} className="relative flex flex-col items-center justify-center py-32 px-8" style={{ background: "var(--bg)" }}>
        <div className="w-12 h-px mb-12" style={{ background: "var(--gold-dim)" }} />
        <p className="font-sans uppercase tracking-widest mb-16"
          style={{ color: "var(--text-dim)", fontSize: "0.6rem", letterSpacing: "0.2em" }}>
          What four years of engineering crystallised
        </p>
        <div className="grid gap-14 max-w-2xl">
          {principles.map((pr, i) => (
            <div key={`sum-${i}`} className="text-center">
              <p className="font-sans uppercase tracking-widest mb-3"
                style={{ color: fc(i, 0.45), fontSize: "0.55rem", letterSpacing: "0.18em" }}>
                {COMPANIES[i].company}
              </p>
              <p className="font-serif" style={{ color: "var(--cream)", fontSize: "1.1rem", lineHeight: 1.6 }}>
                {pr.text}
              </p>
            </div>
          ))}
        </div>
        <div className="w-12 h-px mt-16" style={{ background: "var(--gold-dim)" }} />
      </div>
    </div>
  );
}
