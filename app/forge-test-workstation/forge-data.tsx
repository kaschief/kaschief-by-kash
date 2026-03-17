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
  [6, 182, 212],   // CAPinside — cyan/teal
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
  /** Scene: the situation you walked into */
  scene: string;
  /** What you actually did */
  action: string;
  /** What shifted in how you see engineering */
  shift: string;
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
  /* React — atom orbits (already good, slightly refined) */
  react: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="2.8" fill="#61DAFB" />
      <ellipse cx="18" cy="18" rx="14" ry="5.2" stroke="#61DAFB" strokeWidth="1" />
      <ellipse cx="18" cy="18" rx="14" ry="5.2" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 18 18)" />
      <ellipse cx="18" cy="18" rx="14" ry="5.2" stroke="#61DAFB" strokeWidth="1" transform="rotate(120 18 18)" />
    </svg>
  ),
  /* Vue — nested chevrons (already good, slightly tightened) */
  vue: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 30 L4 8 L10 8 L18 22 L26 8 L32 8 Z" fill="#42B883" />
      <path d="M18 24 L10 8 L14 8 L18 16 L22 8 L26 8 Z" fill="#35495E" />
    </svg>
  ),
  /* TypeScript — blue rounded rect with proper T+S letterforms */
  typescript: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="3" width="30" height="30" rx="4" fill="#3178C6" />
      {/* T — crossbar and stem */}
      <path d="M10 13 L21 13 L21 15.2 L16.8 15.2 L16.8 27 L14.2 27 L14.2 15.2 L10 15.2 Z" fill="white" />
      {/* S — proper S curve */}
      <path d="M24.5 15.2 C24.5 13.8 23.2 12.6 21.2 12.6 C19.2 12.6 17.8 13.7 17.8 15.3 C17.8 17.1 19.2 17.7 21 18.3 C23.2 19 25.2 19.8 25.2 22.2 C25.2 24.6 23.2 26.2 20.8 26.2 C18.2 26.2 16.4 24.8 16.2 22.8 L18.6 22.4 C18.7 23.8 19.6 24.6 20.9 24.6 C22.2 24.6 23 23.7 23 22.4 C23 20.8 21.6 20.2 19.8 19.5 C17.8 18.7 16.2 17.8 16.2 15.5 C16.2 13.1 18.2 11.4 21.1 11.4 C23.6 11.4 25.4 12.8 25.6 14.8 Z" fill="white" />
    </svg>
  ),
  /* Git — the official Git diamond/rotated-square with branch icon */
  git: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Rotated square background */}
      <path d="M17.1 2.4 L33.6 17.1 C34.5 17.9 34.5 19.1 33.6 19.9 L19.9 33.6 C19.1 34.5 17.9 34.5 17.1 33.6 L2.4 19.9 C1.5 19.1 1.5 17.9 2.4 17.1 L17.1 2.4 Z" fill="#F05032" />
      {/* F-shaped branch icon in white */}
      <circle cx="18" cy="12" r="1.8" fill="white" />
      <circle cx="18" cy="24" r="1.8" fill="white" />
      <circle cx="24" cy="16" r="1.8" fill="white" />
      <path d="M18 13.8 L18 22.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 17 C18 17 20 16 22.2 16" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  ),
  /* Next.js — filled black circle with N and gradient arrow */
  nextjs: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" fill="white" />
      <circle cx="18" cy="18" r="15.2" fill="black" />
      <path d="M14 12 L14 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 12 L25 26" stroke="url(#nj)" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 16 L23 24" stroke="url(#nj2)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="nj" x1="14" y1="12" x2="25" y2="26">
          <stop offset="0.6" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nj2" x1="23" y1="16" x2="23" y2="24">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  /* Playwright — three colored vertical bars (chromium, firefox, webkit) */
  playwright: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="4" width="28" height="28" rx="4" fill="rgba(255,255,255,0.04)" />
      <rect x="8" y="8" width="5" height="20" rx="1.5" fill="#E2574C" fillOpacity="0.9" />
      <rect x="15.5" y="8" width="5" height="20" rx="1.5" fill="#2EAD33" fillOpacity="0.9" />
      <rect x="23" y="8" width="5" height="20" rx="1.5" fill="#4A90D9" fillOpacity="0.9" />
    </svg>
  ),
  /* Jest — jester hat silhouette with J */
  jest: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Hat / arch shape */}
      <path d="M8 17 C8 8 14 3 18 3 C22 3 28 8 28 17 L8 17 Z" fill="#C21325" />
      {/* Three hat bumps */}
      <circle cx="11" cy="5" r="2.5" fill="#C21325" />
      <circle cx="18" cy="2.5" r="2.5" fill="#C21325" />
      <circle cx="25" cy="5" r="2.5" fill="#C21325" />
      {/* Hat brim */}
      <rect x="7" y="16" width="22" height="2.5" rx="1.2" fill="#C21325" />
      {/* Stem / J shape */}
      <path d="M20 18.5 L20 27 C20 30 17 31 15 29" stroke="#C21325" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Chin circle */}
      <circle cx="18" cy="33" r="2" fill="#C21325" />
    </svg>
  ),
  /* Sentry — the distinctive curved/broken ring shape */
  sentry: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path
        d="M20.6 4.8 C19.5 3.1 17 3.1 15.9 4.8 L6.4 20.5 C5.3 22.1 6.5 24.2 8.4 24.2 L11.2 24.2 C11.2 20.4 13.4 17 16.8 15.2 L17.8 17 C15.4 18.4 13.8 21 13.8 24 L13.8 24.2 L22.8 24.2 L22.8 26.4 L13.8 26.4 C13.8 26.4 11.2 26.4 11.2 26.4 L8.4 26.4 C5.2 26.4 3 22.8 4.6 20 L14.2 4.2 C15.8 1.6 19.6 1.6 21.2 4.2 L25 10.4 L23.2 11.4 Z"
        fill="#362D59"
      />
      {/* Small bottom-right connecting piece */}
      <path d="M26 24.2 L26 26.4 L23.5 26.4 L23.5 24.2 Z" fill="#362D59" />
      <path d="M28.5 24.2 L28.5 26.4 L27 26.4 L27 24.2 Z" fill="#362D59" />
    </svg>
  ),
  /* Lighthouse — Google Lighthouse beacon */
  lighthouse: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Light rays */}
      <path d="M18 6 L14 10" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6 L22 10" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6 L18 3" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6 L12 7" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6 L24 7" stroke="#FFA000" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lantern housing */}
      <rect x="15" y="6" width="6" height="5" rx="1" fill="#FFA000" />
      {/* Tower body */}
      <path d="M14 11 L13 30 L23 30 L22 11 Z" fill="#E53935" />
      {/* Horizontal stripes */}
      <rect x="13.5" y="16" width="9" height="2" fill="white" fillOpacity="0.9" />
      <rect x="13.2" y="22" width="9.6" height="2" fill="white" fillOpacity="0.9" />
      {/* Base */}
      <rect x="11" y="30" width="14" height="3" rx="1" fill="#C62828" />
    </svg>
  ),
  /* CSS3 — shield shape with "3" */
  css: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Shield body */}
      <path d="M5 4 L7 30 L18 34 L29 30 L31 4 Z" fill="#264DE4" />
      {/* Inner shield highlight */}
      <path d="M18 6.5 L18 31.5 L27.2 28.4 L28.8 6.5 Z" fill="#2965F1" />
      {/* Number 3 in white */}
      <path d="M13.5 12 L23 12 L22.5 14.5 L17 14.5 L17 17 L22 17 L21.5 24.5 L18 25.8 L14.5 24.5 L14.2 21 L16.8 21 L17 22.8 L18 23.2 L19 22.8 L19.3 19.5 L14 19.5 Z" fill="white" />
    </svg>
  ),
  /* Node.js — hexagonal logo in green */
  node: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Hexagon */}
      <path d="M18 2 L31 10 L31 26 L18 34 L5 26 L5 10 Z" fill="#339933" />
      {/* Stylized "n" in white */}
      <path d="M13 14 L13 24 L15.5 24 L15.5 17.5 L20 24 L22.5 24 L22.5 14 L20 14 L20 20 L15.5 14 Z" fill="white" fillOpacity="0.95" />
    </svg>
  ),
  /* Webpack — nested diamond/cube in blue */
  webpack: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      {/* Outer diamond */}
      <path d="M18 1 L35 10 L35 26 L18 35 L1 26 L1 10 Z" fill="#1C78C0" fillOpacity="0.3" stroke="#1C78C0" strokeWidth="0.8" />
      {/* Inner facets — the "W" cube shape */}
      <path d="M18 5 L30 12 L30 24 L18 31 L6 24 L6 12 Z" fill="none" stroke="#8DD6F9" strokeWidth="0.8" />
      {/* Inner cube lines */}
      <path d="M18 5 L18 17" stroke="#8DD6F9" strokeWidth="0.8" />
      <path d="M18 17 L30 12" stroke="#8DD6F9" strokeWidth="0.8" />
      <path d="M18 17 L6 12" stroke="#8DD6F9" strokeWidth="0.8" />
      <path d="M18 17 L18 31" stroke="#8DD6F9" strokeWidth="0.8" />
      <path d="M18 17 L30 24" stroke="#8DD6F9" strokeWidth="0.6" strokeOpacity="0.5" />
      <path d="M18 17 L6 24" stroke="#8DD6F9" strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Center face fill */}
      <path d="M18 5 L30 12 L18 17 Z" fill="#8DD6F9" fillOpacity="0.3" />
      <path d="M18 5 L6 12 L18 17 Z" fill="#8DD6F9" fillOpacity="0.2" />
      <path d="M18 17 L30 24 L18 31 Z" fill="#8DD6F9" fillOpacity="0.15" />
      <path d="M18 17 L6 24 L18 31 Z" fill="#8DD6F9" fillOpacity="0.1" />
    </svg>
  ),
  // Company logos — 44px, prominent
  amboss: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path d="M14 32 L22 10 L30 32" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="17" y1="25" x2="27" y2="25" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  compado: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path d="M6 10 C6 7 8 5 11 5 L33 5 C36 5 38 7 38 10 L38 28 C38 31 36 33 33 33 L18 33 L12 39 L12 33 L11 33 C8 33 6 31 6 28 Z" stroke="#42B883" strokeWidth="1.5" fill="none" />
      <path d="M15 17 L21 17 M19 15 L21 17 L19 19" stroke="#42B883" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 15 L19 15" stroke="#42B883" strokeWidth="1" />
      <path d="M17 21 L19 21" stroke="#42B883" strokeWidth="1" />
    </svg>
  ),
  capinside: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="4" y="4" width="36" height="36" rx="8" stroke="#06B6D4" strokeWidth="1.5" fill="none" />
      <path d="M28 14 C25 11 19 11 16 14 C13 17 13 23 16 26 L14 30 C14 30 20 28 21 27.5 C24 28.5 28 27 30 24 C32 21 31 17 28 14 Z" stroke="#06B6D4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dkb: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="2" y="10" width="40" height="24" rx="4" fill="#1A56DB" fillOpacity="0.12" stroke="#1A56DB" strokeWidth="1.4" />
      <text x="22" y="27" textAnchor="middle" fill="#1A56DB" fontSize="14" fontWeight="800" fontFamily="var(--font-sans)" letterSpacing="0.1em">DKB</text>
    </svg>
  ),
  vscode: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M27 3 L27 33 L9 27 L5 24 L5 12 L9 9 L27 3 Z" fill="#007ACC" fillOpacity="0.15" stroke="#007ACC" strokeWidth="1" />
      <path d="M22 11 L12 18 L22 25" stroke="#007ACC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M27 3 L27 33" stroke="#007ACC" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  anthropic: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 6 L28 30 L23.5 30 L18 15.5 L12.5 30 L8 30 Z" fill="#D97706" />
      <path d="M14 24 L22 24" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chatgpt: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 4 C24 4 28 8 28 13 L28 20 C28 22 26 24 24 24 L18 24" stroke="#10A37F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M18 32 C12 32 8 28 8 23 L8 16 C8 14 10 12 12 12 L18 12" stroke="#10A37F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 8 C12 5 16 4 19 6 L24 9 C26 10 27 13 25 15 L21 18" stroke="#10A37F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26 28 C24 31 20 32 17 30 L12 27 C10 26 9 23 11 21 L15 18" stroke="#10A37F" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  miro: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="3" width="30" height="30" rx="5" fill="#FFD02F" />
      <path d="M11 8 L15 8 L19 18 L23 8 L27 8 L21 28 L17 28 L11 8 Z" fill="#050038" />
      <path d="M8 8 L12 8 L16 18 L12 28 L8 28 L8 8 Z" fill="#050038" />
    </svg>
  ),
  figma: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M14 4 C11 4 8 7 8 10 C8 13 11 16 14 16 L18 16 L18 4 Z" fill="#F24E1E" />
      <path d="M18 4 L22 4 C25 4 28 7 28 10 C28 13 25 16 22 16 L18 16 Z" fill="#FF7262" />
      <path d="M14 16 C11 16 8 19 8 22 C8 25 11 28 14 28 L18 28 L18 16 Z" fill="#A259FF" />
      <path d="M18 16 L22 16 C25 16 28 19 28 22 C28 25 25 28 22 28 C19 28 18 25 18 22 Z" fill="#1ABCFE" />
      <path d="M14 28 C11 28 8 31 8 34 C8 34 11 36 14 36 C17 36 18 34 18 34 L18 28 Z" fill="#0ACF83" />
    </svg>
  ),
  jira: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M33 17.4 L19.2 3.6 L18 2.4 L6.6 13.8 L3 17.4 C2.4 18 2.4 18.6 3 19.2 L13.2 29.4 L18 34.2 L29.4 22.8 L29.7 22.5 L33 19.2 C33.6 18.6 33.6 18 33 17.4 Z M18 23.4 L12.6 18 L18 12.6 L23.4 18 Z" fill="#2684FF" />
      <path d="M18 12.6 C15 9.6 15 5.4 17.7 2.7 L6.6 13.8 L12.6 18 Z" fill="url(#jira-g1)" />
      <path d="M23.4 18 L18 23.4 C21 26.4 21 30.6 18.3 33.3 L29.4 22.2 Z" fill="url(#jira-g2)" />
      <defs>
        <linearGradient id="jira-g1" x1="17" y1="8" x2="10" y2="15">
          <stop stopColor="#0052CC" />
          <stop offset="1" stopColor="#2684FF" />
        </linearGradient>
        <linearGradient id="jira-g2" x1="19" y1="28" x2="26" y2="21">
          <stop stopColor="#0052CC" />
          <stop offset="1" stopColor="#2684FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

/* ================================================================== */
/*  Data factories                                                     */
/* ================================================================== */

export function createFragments(): Fragment[] {
  const frags: Fragment[] = [];
  let s = 0;

  // Grid-based positioning to prevent overlap
  const COLS = 8, ROWS = 7;
  const usedCells = new Set<number>();

  function pos() {
    s++;
    // Find an unused grid cell, with jitter for natural look
    let cell: number;
    let attempts = 0;
    do {
      cell = Math.floor(srand(s * 7.1 + attempts * 3.3) * COLS * ROWS);
      attempts++;
    } while (usedCells.has(cell) && attempts < 20);
    usedCells.add(cell);
    const col = cell % COLS;
    const row = Math.floor(cell / COLS);
    const cellW = 82 / COLS;
    const cellH = 72 / ROWS;
    // Position within grid cell + small jitter
    const jitterX = (srand(s * 11.7) - 0.5) * cellW * 0.6;
    const jitterY = (srand(s * 17.3) - 0.5) * cellH * 0.6;
    return {
      x0: -41 + col * cellW + cellW / 2 + jitterX,
      y0: -36 + row * cellH + cellH / 2 + jitterY,
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

  // Companies (logos instead of text)
  frags.push(logo("amboss", 0, "AMBOSS", 38));
  frags.push(logo("compado", 1, "Compado", 38));
  frags.push(logo("capinside", 2, "CAPinside", 38));
  frags.push(logo("dkb", 3, "", 38));

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

  // Tags (only ones that DON'T have a logo equivalent)
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

  // Logos — ALL get labels except where text is already in the logo itself
  frags.push(logo("react", 0, "React", 34));
  frags.push(logo("vue", 1, "Vue", 34));
  frags.push(logo("typescript", 2, "", 32));     // "TS" in logo
  frags.push(logo("git", 0, "Git", 30));
  frags.push(logo("nextjs", 3, "Next.js", 32));
  frags.push(logo("playwright", 3, "Playwright", 30));
  frags.push(logo("jest", 3, "Jest", 30));
  frags.push(logo("sentry", 1, "Sentry", 30));
  frags.push(logo("lighthouse", 0, "Lighthouse", 30));
  frags.push(logo("css", 1, "", 30));            // "3" in logo
  frags.push(logo("node", 3, "Node.js", 30));
  frags.push(logo("webpack", 3, "Webpack", 28));
  frags.push(logo("vscode", 0, "VS Code", 30));
  frags.push(logo("anthropic", 3, "Anthropic", 30));
  frags.push(logo("chatgpt", 3, "ChatGPT", 30));
  frags.push(logo("miro", 1, "", 30));           // "M" in logo
  frags.push(logo("figma", 2, "Figma", 30));
  frags.push(logo("jira", 3, "Jira", 30));

  // Commands
  frags.push(cmd("git push origin main", 0));
  frags.push(cmd("npx playwright test --headed", 3));
  frags.push(cmd("npm run build && npm run deploy", 1));
  frags.push(cmd("jest --coverage --watchAll", 3));
  frags.push(cmd("lighthouse https://app.amboss.com", 0));

  // Seeds — cycle through all 4 company colors for variety
  let seedColorIdx = 0;
  COMPANIES.forEach((c) => {
    c.distillation.seedWords.forEach((w) => {
      frags.push(text(w, seedColorIdx % 4, "seed", 1.05, 600));
      seedColorIdx++;
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
    scene: "Half a million medical students. An app that was supposed to help them pass their exams. I came from the ward — I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
    action: "I helped migrate from vanilla JS to React. I introduced A/B testing to stop guessing what worked. I broke production once — and that taught me testing discipline. But the thing that mattered most: I brought the instinct from nursing. I could tell when a flow was lying to the user about what they\u2019d already reviewed.",
    shift: "I learned that the gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail. And I was one of the only engineers who could see that gap.",
  },
  {
    company: "Compado",
    period: "Berlin, 2019 — 2021",
    learned: "What I learned to see: performance is a product decision, not a technical one",
    insight: "Load time is not a metric. It is a user\u2019s first impression of whether you respect their time.",
    companyIdx: 1,
    scene: "The sites were replicas of each other — same structure, different brands, different audiences. Every change meant touching six copies. Visitors arrived from search with zero loyalty and no patience.",
    action: "I rebuilt the architecture so you could swap parts without duplicating everything. Component-driven design, shared across brands. Then I attacked load times: Lighthouse audits, CSS compression, lazy loading, infinite scroll. I built my first chatbot — not AI, but a conversational interface that brought the user closer to the product.",
    shift: "I discovered that every millisecond is a user who stays or leaves. Performance isn\u2019t a technical achievement — it\u2019s a product decision. And I learned to think about audiences I\u2019d never meet.",
  },
  {
    company: "CAPinside",
    period: "Hamburg, 2021",
    learned: "What I learned to see: code quality is a team behaviour, not a personal one",
    insight: "A codebase is a record of a team\u2019s habits. If you want to change the code, you have to change how the team works.",
    companyIdx: 2,
    scene: "Ten thousand financial advisors depending on a platform that had grown fragile. Nobody reviewed code — the process existed on paper but nobody prioritized it. Tests were sparse. TypeScript was new to me. React on one side, Ruby and PHP on the other.",
    action: "I learned to work across different systems. But more importantly, I started seeing something I hadn\u2019t seen before: the codebase wasn\u2019t just code. It was a record of how the team communicated. Every shortcut, every duplicated pattern, every skipped review — it was the team\u2019s habits, frozen in the repository.",
    shift: "I realised you can\u2019t fix code without fixing process. This was my first time diagnosing a team through its codebase — reading the organisation through the code.",
  },
  {
    company: "DKB Code Factory",
    period: "Berlin, 2021 — 2024",
    learned: "What I learned to see: at scale, judgment is the product",
    insight: "At a certain scale, the highest-leverage thing an engineer can do is make the right decision obvious.",
    companyIdx: 3,
    scene: "Germany\u2019s largest direct bank. Five million users. A banking app moving from legacy to React and TypeScript. Monthly releases. Security, stability, regulations at every turn. And when I arrived: zero automated tests.",
    action: "I introduced Playwright end-to-end testing and built the patterns the team adopted. Moved releases from monthly to weekly. Feature flags that let product toggle features without deployments. A shared design system. Multi-factor auth, session management. I cleaned the frontend into feature modules with unit tests. And somewhere along the way, I found myself in the product room — pushing back on flows that didn\u2019t feel right, shaping what got built.",
    shift: "Production bugs dropped 30%. But the real shift was personal: I wasn\u2019t just building features anymore. I was shaping how the team worked, what we shipped, and why. Then they promoted me to engineering manager.",
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
