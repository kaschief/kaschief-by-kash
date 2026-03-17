import { type ReactNode } from "react";
import { COMPANIES } from "@data";

/* ================================================================== */
/*  Seeded random                                                      */
/* ================================================================== */

export function srand(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

/* ================================================================== */
/*  Math (V0 local versions)                                           */
/* ================================================================== */

export function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
export function ss(e0: number, e1: number, x: number) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ================================================================== */
/*  Colors                                                             */
/* ================================================================== */

export const ACT_BLUE = "#5B9EC2";

export const CC = [
  [96, 165, 250],  // AMBOSS — blue
  [66, 184, 131],  // Compado — green
  [49, 120, 198],  // CAPinside — ts blue
  [244, 114, 182], // DKB — pink
];

export function fc(ci: number, a: number): string {
  const [r, g, b] = CC[ci];
  return `rgba(${r},${g},${b},${a})`;
}

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface FragmentBase {
  companyIdx: number;
  isSeed: boolean;
  x0: number; y0: number;
  dx: number; dy: number;
  rot: number;
  dissolveStart: number;
  dissolveEnd: number;
}

export interface TextFrag extends FragmentBase {
  type: "company" | "phrase" | "tag" | "seed";
  text: string;
  size: number;
  weight: number;
}

export interface CodeFrag extends FragmentBase {
  type: "code";
  code: string;
  size: number;
}

export interface LogoFrag extends FragmentBase {
  type: "logo";
  logoKey: string;
  label: string;
  logoSize: number;
}

export interface CommandFrag extends FragmentBase {
  type: "command";
  cmd: string;
  size: number;
}

export type Fragment = TextFrag | CodeFrag | LogoFrag | CommandFrag;

export interface BeatData {
  company: string;
  period: string;
  learned: string;
  insight: string;
  companyIdx: number;
}

export interface WhisperData {
  text: string;
  beatIdx: number;
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  size: number;
}

export interface PrincipleData {
  text: string;
  companyIdx: number;
  yOffset: number;
}

export interface EmberData {
  x0: number; y0: number;
  dx: number; speed: number;
  size: number; delay: number;
}

/* ================================================================== */
/*  Logo SVGs                                                          */
/* ================================================================== */

export const LOGOS: Record<string, ReactNode> = {
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

export function createFragments(): Fragment[] {
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

export const BEATS: BeatData[] = [
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

export function createWhispers(): WhisperData[] {
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

  add("React", 0); add("500K", 0); add("Berlin 2018", 0);
  add("A/B", 0); add("clinical", 0);
  add("Vue", 1); add("+50%", 1); add("Berlin 2019", 1);
  add("SEO", 1); add("speed", 1);
  add("TypeScript", 2); add("10K", 2); add("Hamburg", 2);
  add("legacy", 2); add("rewrite", 2);
  add("Playwright", 3); add("5M", 3); add("Berlin 2021", 3);
  add("weekly", 3); add("testing", 3);

  return whispers;
}

export function createPrinciples(): PrincipleData[] {
  return COMPANIES.map((c, i) => ({
    text: c.distillation.principle,
    companyIdx: i,
    yOffset: (i - 1.5) * 11,
  }));
}

export function createEmbers(): EmberData[] {
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
/*  Beat timing                                                        */
/* ================================================================== */

export const BEAT_RANGES = [
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

export function phaseLabel(p: number): string {
  let l = "";
  for (const ph of PHASES) if (p >= ph.s) l = ph.l;
  return l;
}
