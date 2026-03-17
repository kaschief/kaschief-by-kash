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
import { DL } from "../forge-element-map";
import { ForgeNav } from "../forge-nav";
import {
  ss,
  lerp,
  fc,
  ACT_BLUE,
  LOGOS,
  CC,
  createFragments,
  createEmbers,
  createWhispers,
  createPrinciples,
  BEATS,
  phaseLabel,
  srand,

} from "./forge-data";

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

interface Point {
  x: number;
  y: number;
}

interface Particle {
  streamIdx: number;
  baseT: number;
  explodeAngle: number;
  explodeRadius: number;
  size: number;
  wobblePhase: number;
  wobbleAmp: number;
  color: string;
  prevX: number;
  prevY: number;
  prev2X: number;
  prev2Y: number;
}


const PARTICLES_PER_STREAM = 20;

/* ================================================================== */
/*  Funnel layout (from funnel page, adapted for workstation)          */
/* ================================================================== */

const FV_W = 1000, FV_H = 800;
const F_TIER_Y = [80, 250, 400, 550, 700] as const;
const F_CONVERGE_Y = 760;
const F_TIER_SPREAD = [400, 300, 200, 120, 60] as const;
const F_CENTER_X = 500;
const F_UNIT_W = 4;

interface FTierPos { x: number; y: number; w: number; }

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
        const passingStep = passingStreams.length > 1 ? (spread * 2) / (passingStreams.length - 1) : 0;
        x = F_CENTER_X - spread + passingIndex * passingStep;
      } else {
        x = lerpFn(prevX, F_CENTER_X, 0.35);
        const maxDist = spread * 1.4;
        if (Math.abs(x - F_CENTER_X) > maxDist) x = F_CENTER_X + Math.sign(x - F_CENTER_X) * maxDist;
      }
      positions.push({ x, y: F_TIER_Y[tierIdx], w });
      prevX = x;
    }
    result.set(stream.id, positions);
  }
  return result;
}

const F_POSITIONS = computeFunnelPositions();

interface FSegment { streamId: string; color: string; fromTier: number; toTier: number; path: string; opacityEnd: number; }

function buildFunnelSegments(): FSegment[] {
  const segments: FSegment[] = [];
  for (const stream of STREAMS) {
    const positions = F_POSITIONS.get(stream.id)!;
    for (let i = 0; i < positions.length - 1; i++) {
      const p1 = positions[i], p2 = positions[i + 1];
      const my = (p1.y + p2.y) / 2;
      const path = [
        `M ${p1.x - p1.w / 2} ${p1.y}`,
        `C ${p1.x - p1.w / 2} ${my}, ${p2.x - p2.w / 2} ${my}, ${p2.x - p2.w / 2} ${p2.y}`,
        `L ${p2.x + p2.w / 2} ${p2.y}`,
        `C ${p2.x + p2.w / 2} ${my}, ${p1.x + p1.w / 2} ${my}, ${p1.x + p1.w / 2} ${p1.y}`,
        `Z`,
      ].join(" ");
      segments.push({ streamId: stream.id, color: stream.color, fromTier: i, toTier: i + 1, path, opacityEnd: 0.25 + (i + 1) * 0.08 });
    }
  }
  return segments;
}

const F_SEGMENTS = buildFunnelSegments();

const PP = {
  CANVAS_IN: [0.0, 0.05] as const,
  EXPLODE: [0.05, 0.15] as const,
  FALL: [0.15, 0.3] as const,
  FUNNEL: [0.3, 0.85] as const,
  FADE_OUT: [0.82, 0.92] as const,
};

const FUNNEL_TIERS = {
  entry: 0.12,
  amboss: 0.28,
  compado: 0.44,
  capinside: 0.6,
  dkb: 0.76,
  converge: 0.9,
};
const FUNNEL_SPREAD = {
  entry: 0.42,
  amboss: 0.34,
  compado: 0.24,
  capinside: 0.16,
  dkb: 0.08,
  converge: 0.0,
};

function quadBezier(p0: Point, cp: Point, p1: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y,
  };
}
function sampleBezierPath(
  p0: Point,
  cp: Point,
  p1: Point,
  samples: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= samples; i++)
    pts.push(quadBezier(p0, cp, p1, i / samples));
  return pts;
}
function samplePath(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];
  const idx = t * (points.length - 1);
  const i = Math.floor(idx);
  const frac = idx - i;
  if (i >= points.length - 1) return points[points.length - 1];
  return {
    x: points[i].x + (points[i + 1].x - points[i].x) * frac,
    y: points[i].y + (points[i + 1].y - points[i].y) * frac,
  };
}
function buildFunnelPaths(cw: number, ch: number): Point[][] {
  const tierYs = [
    FUNNEL_TIERS.entry,
    FUNNEL_TIERS.amboss,
    FUNNEL_TIERS.compado,
    FUNNEL_TIERS.capinside,
    FUNNEL_TIERS.dkb,
    FUNNEL_TIERS.converge,
  ];
  const tierSpreads = [
    FUNNEL_SPREAD.entry,
    FUNNEL_SPREAD.amboss,
    FUNNEL_SPREAD.compado,
    FUNNEL_SPREAD.capinside,
    FUNNEL_SPREAD.dkb,
    FUNNEL_SPREAD.converge,
  ];
  const paths: Point[][] = [];
  const n = STREAMS.length;
  for (let si = 0; si < n; si++) {
    const stream = STREAMS[si];
    const wp: Point[] = [];
    for (let ti = 0; ti < tierYs.length; ti++) {
      const y = tierYs[ti] * ch,
        spread = tierSpreads[ti];
      if (ti === 0 || ti === tierYs.length - 1) {
        const xF = n > 1 ? 0.5 - spread + (si / (n - 1)) * spread * 2 : 0.5;
        wp.push({ x: xF * cw, y });
      } else {
        const ni = ti - 1,
          passesThrough = stream.path.includes(ni);
        if (passesThrough) {
          const passing = STREAMS.filter((s) => s.path.includes(ni));
          const pIdx = passing.indexOf(stream),
            cnt = passing.length;
          const xF =
            cnt > 1 ? 0.5 - spread + (pIdx / (cnt - 1)) * spread * 2 : 0.5;
          wp.push({ x: xF * cw, y });
        } else {
          const prevX = wp[wp.length - 1].x,
            driftX = lerpFn(prevX, cw * 0.5, 0.35);
          const maxDist = spread * 1.3 * cw;
          const x =
            Math.abs(driftX - cw * 0.5) > maxDist
              ? cw * 0.5 + Math.sign(driftX - cw * 0.5) * maxDist
              : driftX;
          wp.push({ x, y });
        }
      }
    }
    const fullPath: Point[] = [];
    for (let i = 0; i < wp.length - 1; i++) {
      const p0 = wp[i],
        p1 = wp[i + 1],
        cp: Point = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const seg = sampleBezierPath(p0, cp, p1, 30);
      for (let j = i > 0 ? 1 : 0; j < seg.length; j++) fullPath.push(seg[j]);
    }
    paths.push(fullPath);
  }
  return paths;
}
function initParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let si = 0; si < STREAMS.length; si++) {
    const stream = STREAMS[si];
    for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
      const seed = si * 100 + i;
      const baseAngle = (si / STREAMS.length) * Math.PI * 2;
      particles.push({
        streamIdx: si,
        baseT: (i + srand(seed) * 0.5) / PARTICLES_PER_STREAM,
        explodeAngle: baseAngle + (srand(seed + 10) - 0.5) * 1.2,
        explodeRadius: 0.15 + srand(seed + 11) * 0.25,
        size: 2 + srand(seed + 1) * 2,
        wobblePhase: srand(seed + 2) * Math.PI * 2,
        wobbleAmp: 1.5 + srand(seed + 3) * 2.5,
        color: stream.color,
        prevX: 0,
        prevY: 0,
        prev2X: 0,
        prev2Y: 0,
      });
    }
  }
  return particles;
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ForgeWorkstation() {
  /* ---- V0 refs ---- */
  const forgeStickyRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);
  const forgeContainerRef = useRef<HTMLDivElement>(null);
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
  const crystLineEl = useRef<HTMLDivElement>(null);
  const scrollHintEl = useRef<HTMLDivElement>(null);
  const progressBarEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLDivElement>(null);

  /* ---- Particle refs ---- */
  /* particleContainerRef removed — particles now in sticky viewport */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleProgressRef = useRef(0);
  const timeRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const particlesRef = useRef<Particle[]>(initParticles());
  const funnelPathsRef = useRef<Point[][]>([]);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  /* funnelLabelRefs removed — replaced by SVG funnelStreamLabelRefs */

  /* ---- Funnel SVG refs ---- */
  const funnelSvgWrapRef = useRef<HTMLDivElement>(null);
  const funnelSegmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const funnelStreamLabelRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelConvergeRef = useRef<SVGGElement | null>(null);
  const funnelBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);

  /* ---- Data ---- */
  const fragments = useMemo(createFragments, []);
  const whispers = useMemo(createWhispers, []);
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
      scrollHintEl.current.style.opacity = String(1 - ss(0, 0.02, p));
    if (progressBarEl.current)
      progressBarEl.current.style.width = `${p * 100}%`;
    if (phaseEl.current) {
      phaseEl.current.textContent = phaseLabel(p);
      phaseEl.current.style.opacity = String(p > 0.02 && p < 0.92 ? 0.3 : 0);
    }

    /* ---- Title fade out ---- */
    if (titleRef.current) {
      const fade = 1 - ss(0.02, 0.06, p);
      titleRef.current.style.opacity = String(fade);
      titleRef.current.style.transform = `translateY(${lerp(0, -30, ss(0.02, 0.06, p))}px)`;
    }

    /* ============================================================== */
    /*  MOVEMENT 1: THE FORGE (0.03 — 0.21)                           */
    /* ============================================================== */
    const vh = window.innerHeight;
    const CURTAIN_FADE = 80;

    if (p < 0.25) {
      fragments.forEach((f, i) => {
        const el = fragmentEls.current[i];
        if (!el) return;
        if (f.isSeed) {
          const fadeIn = ss(0.03, 0.08, p),
            fadeOut = 1 - ss(0.18, 0.23, p);
          const drift = ss(0.05, 0.15, p),
            converge = ss(0.14, 0.21, p),
            heat = ss(0.10, 0.18, p);
          const dX = f.x0 + f.dx * drift,
            dY = f.y0 + f.dy * drift;
          const x = lerp(dX, 0, converge),
            y = lerp(dY, 0, converge);
          const rot = lerp(f.rot, 0, converge);
          const scale = lerp(1, 1.3, heat) * lerp(1, 0.5, ss(0.19, 0.23, p));
          const fragScreenY = vh * 0.5 + y * vh / 100;
          const curtainReveal = curtainTop >= vh ? 1 : Math.max(0, Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE));
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg) scale(${scale})`;
          el.style.opacity = String(fadeIn * fadeOut * curtainReveal);
          el.style.filter = `blur(${lerp(1, 0, ss(0.03, 0.07, p))}px) brightness(${lerp(1, 1.8, heat)})`;
          const glow =
            heat > 0.05
              ? `0 0 ${lerp(0, 28, heat)}px ${fc(f.companyIdx, 0.9)}, 0 0 ${lerp(0, 56, heat)}px ${fc(f.companyIdx, 0.3)}`
              : "none";
          if (f.type === "seed") (el as HTMLElement).style.textShadow = glow;
          else (el as HTMLElement).style.boxShadow = glow;
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
              baseAlpha = 0.8;
              break;
            case "code":
            case "command":
              baseAlpha = 0.5;
              break;
            case "logo":
              baseAlpha = 0.6;
              break;
            default:
              baseAlpha = 0.5;
          }
          const fragScreenY = vh * 0.5 + y * vh / 100;
          const curtainReveal = curtainTop >= vh ? 1 : Math.max(0, Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE));
          el.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) rotate(${rot}deg)`;
          el.style.opacity = String(fadeIn * fadeOut * baseAlpha * curtainReveal);
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

    /* ---- Forge atmosphere ---- */
    if (glowEl.current) {
      const heat = ss(0.04, 0.17, p),
        cool = ss(0.19, 0.25, p);
      glowEl.current.style.opacity = String(heat * (1 - cool * 0.7) * 0.75);
      glowEl.current.style.transform = `translate(-50%, -50%) scale(${lerp(0.3, 1.4, heat)})`;
    }
    if (innerGlowEl.current) {
      const heat = ss(0.08, 0.18, p),
        cool = ss(0.19, 0.24, p);
      const pulse = Math.sin(p * Math.PI * 20) * 0.1 + 1;
      innerGlowEl.current.style.opacity = String(
        heat * (1 - cool) * 0.85 * pulse,
      );
      innerGlowEl.current.style.transform = `translate(-50%, -50%) scale(${lerp(0.2, 1.1, heat) * pulse})`;
    }
    if (gridEl.current) {
      const appear = ss(0.02, 0.06, p),
        fade = 1 - ss(0.18, 0.24, p);
      gridEl.current.style.opacity = String(appear * fade * 0.05);
    }

    /* ---- Thesis (0.17 — 0.27) ---- */
    if (thesisEls.current[0]) {
      const fadeIn = ss(0.17, 0.20, p),
        fadeOut = 1 - ss(0.24, 0.27, p);
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(4, -2, ss(0.17, 0.27, p))}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    }
    if (thesisEls.current[1]) {
      const fadeIn = ss(0.19, 0.22, p),
        fadeOut = 1 - ss(0.24, 0.27, p);
      thesisEls.current[1].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[1].style.transform = `translate(-50%, calc(-50% + ${lerp(9, 3, ss(0.19, 0.27, p))}vh))`;
      thesisEls.current[1].style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    }
    if (thesisEls.current[2]) {
      const fadeIn = ss(0.21, 0.24, p),
        fadeOut = 1 - ss(0.25, 0.27, p);
      thesisEls.current[2].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[2].style.transform = `translate(-50%, calc(-50% + ${lerp(16, 12, ss(0.21, 0.27, p))}vh))`;
      thesisEls.current[2].style.filter = `blur(${lerp(4, 0, fadeIn)}px)`;
    }

    /* ============================================================== */
    /*  PARTICLES → RIBBONS (0.26 — 0.46)                             */
    /*  One continuous system: particles settle, ribbons grow from     */
    /*  them, labels appear alongside. No crossfade.                  */
    /*                                                                 */
    /*  0.26–0.30: particles explode + fall into top-tier positions    */
    /*  0.29–0.33: stream labels appear above settled particles        */
    /*  0.31–0.42: ribbons grow downward from particle positions       */
    /*             (particles shrink as ribbons absorb them)           */
    /*  0.40–0.44: convergence point appears                          */
    /*  0.44–0.47: everything fades out                               */
    /* ============================================================== */
    {
      // Canvas particles: full range 0.26–0.46 → local 0–1
      const PART_START = 0.26, PART_END = 0.46;
      const pt = Math.max(0, Math.min(1, (p - PART_START) / (PART_END - PART_START)));
      particleProgressRef.current = pt;

      // Canvas stays visible through the whole phase (particles are the source)
      if (canvasWrapRef.current) {
        const canvasIn = ss(0.26, 0.27, p);
        const canvasOut = 1 - ss(0.44, 0.47, p);
        canvasWrapRef.current.style.opacity = String(canvasIn * canvasOut);
      }

      // SVG funnel wrapper: appears once ribbons start growing, fades with everything
      if (funnelSvgWrapRef.current) {
        const svgIn = ss(0.30, 0.32, p);
        const svgOut = 1 - ss(0.44, 0.47, p);
        funnelSvgWrapRef.current.style.opacity = String(svgIn * svgOut);
      }

      // Stream labels — appear early alongside particles settling
      const labelT = ss(0.29, 0.33, p);
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelStreamLabelRefs.current[si];
        if (!el) continue;
        const labelOut = 1 - ss(0.44, 0.47, p);
        el.style.opacity = String(labelT * labelOut);
        el.style.transform = `translateY(${lerpFn(-8, 0, labelT)}px)`;
      }

      // Ribbon segments grow downward from top tier — scaleY from 0
      // Each tier reveals progressively
      const TIER_THRESHOLDS = [
        [0.30, 0.33], // top spread → AMBOSS
        [0.33, 0.36], // AMBOSS → Compado
        [0.36, 0.39], // Compado → CAPinside
        [0.39, 0.42], // CAPinside → DKB
      ];
      for (let i = 0; i < F_SEGMENTS.length; i++) {
        const el = funnelSegmentRefs.current[i];
        if (!el) continue;
        const seg = F_SEGMENTS[i];
        // Segments connect fromTier→toTier, threshold is based on toTier index
        const threshIdx = Math.min(seg.toTier - 1, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const t = ss(threshStart, threshEnd, p);
        const fadeOut = 1 - ss(0.44, 0.47, p);
        el.style.opacity = String(lerpFn(0, seg.opacityEnd, t) * fadeOut);
        // Grow from the top (fromTier position) downward
        const scaleY = lerpFn(0, 1, t);
        el.style.transformOrigin = `${F_CENTER_X}px ${F_TIER_Y[seg.fromTier]}px`;
        el.style.transform = `scaleY(${scaleY})`;
      }

      // Company node labels + lines — appear as ribbons reach each tier
      for (let ni = 0; ni < NODES.length; ni++) {
        const el = funnelNodeRefs.current[ni];
        if (!el) continue;
        const threshIdx = Math.min(ni, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const t = ss(threshStart, threshEnd, p);
        const fadeOut = 1 - ss(0.44, 0.47, p);
        el.style.opacity = String(t * fadeOut);
        el.style.transform = `translateY(${lerpFn(8, 0, t)}px)`;
      }

      // Convergence point — appears after all ribbons reach bottom
      if (funnelConvergeRef.current) {
        const ct = ss(0.42, 0.44, p);
        const fadeOut = 1 - ss(0.45, 0.47, p);
        funnelConvergeRef.current.style.opacity = String(ct * fadeOut);
        if (funnelBlurRef.current) {
          funnelBlurRef.current.setAttribute("stdDeviation", String(lerpFn(0, 12, ct)));
        }
      }
    }

    /* ============================================================== */
    /*  MOVEMENT 2: THE SIGHT (0.48 — 0.78)                            */
    /* ============================================================== */
    const WS_BEAT_RANGES = [
      { fadeIn: [0.48, 0.52], hold: [0.52, 0.57], fadeOut: [0.57, 0.61] },
      { fadeIn: [0.60, 0.64], hold: [0.64, 0.69], fadeOut: [0.69, 0.73] },
      { fadeIn: [0.72, 0.76], hold: [0.76, 0.80], fadeOut: [0.80, 0.83] },
      { fadeIn: [0.82, 0.85], hold: [0.85, 0.88], fadeOut: [0.88, 0.91] },
    ];
    WS_BEAT_RANGES.forEach((range, bi) => {
      const beatEl = beatEls.current[bi],
        labelEl = beatLabelEls.current[bi],
        learnedEl = beatLearnedEls.current[bi];
      if (!beatEl || !labelEl || !learnedEl) return;
      const fadeIn = ss(range.fadeIn[0], range.fadeIn[1], p),
        fadeOut = 1 - ss(range.fadeOut[0], range.fadeOut[1], p);
      const vis = fadeIn * fadeOut,
        settle = ss(range.fadeIn[0], range.hold[1], p);
      beatEl.style.opacity = String(vis);
      beatEl.style.transform = `translate(-50%, calc(-50% + ${lerp(6, 0, settle)}vh))`;
      beatEl.style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
      labelEl.style.opacity = String(vis * 0.4);
      labelEl.style.transform = `translate(-50%, calc(-50% + ${lerp(-16, -14, settle)}vh))`;
      learnedEl.style.opacity = String(vis * 0.3);
      learnedEl.style.transform = `translate(-50%, calc(-50% + ${lerp(15, 13, settle)}vh))`;
    });

    whispers.forEach((w, i) => {
      const el = whisperEls.current[i];
      if (!el) return;
      const range = WS_BEAT_RANGES[w.beatIdx];
      const fadeIn = ss(range.fadeIn[0] + 0.01, range.fadeIn[1] + 0.02, p);
      const fadeOut = 1 - ss(range.fadeOut[0] - 0.01, range.fadeOut[1], p);
      const drift = ss(range.fadeIn[0], range.fadeOut[1], p);
      el.style.opacity = String(fadeIn * fadeOut * 0.2);
      el.style.transform = `translate(calc(-50% + ${w.x0 + w.dx * drift}vw), calc(-50% + ${w.y0 + w.dy * drift}vh))`;
    });

    if (beatGlowEl.current) {
      let glowOpacity = 0,
        glowR = 0,
        glowG = 0,
        glowB = 0;
      WS_BEAT_RANGES.forEach((range, bi) => {
        const vis =
          ss(range.fadeIn[0], range.fadeIn[1], p) *
          (1 - ss(range.fadeOut[0], range.fadeOut[1], p));
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

    if (vignetteEl.current) {
      const forgeV = ss(0.08, 0.18, p) * (1 - ss(0.19, 0.24, p));
      const beatV = p > 0.48 && p < 0.91 ? 0.3 : 0;
      vignetteEl.current.style.opacity = String(Math.max(forgeV * 0.6, beatV));
    }

    /* ============================================================== */
    /*  MOVEMENT 3: CRYSTALLIZE (0.90 — 1.00)                          */
    /* ============================================================== */
    if (flashEl.current) {
      const flash = ss(0.90, 0.92, p) * (1 - ss(0.92, 0.95, p));
      flashEl.current.style.opacity = String(flash * 0.5);
    }
    if (crystLineEl.current) {
      const appear = ss(0.92, 0.95, p);
      crystLineEl.current.style.opacity = String(appear * 0.3);
      crystLineEl.current.style.transform = `translate(-50%, -50%) scaleX(${lerp(0, 1, appear)})`;
    }
    principles.forEach((pr, i) => {
      const el = principleEls.current[i];
      if (!el) return;
      const stagger = i * 0.015;
      const fadeIn = ss(0.93 + stagger, 0.97 + stagger, p);
      const settle = ss(0.95 + stagger, 0.99, p);
      const y = lerp(pr.yOffset + 6, pr.yOffset, settle);
      el.style.transform = `translate(-50%, calc(-50% + ${y}vh))`;
      el.style.opacity = String(fadeIn);
      el.style.filter = `blur(${lerp(6, 0, fadeIn)}px)`;
    });
  });

  /* ---- Particles now driven from forge progress (0.27–0.46 → 0–1) ---- */

  /* ---- Resize (canvas) ---- */
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
    funnelPathsRef.current = buildFunnelPaths(w, h);
  }, []);

  /* ---- Particle animation loop ---- */
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
      timeRef.current += 0.016;
      const time = timeRef.current,
        p = particleProgressRef.current;
      ctx.clearRect(0, 0, w, h);
      const funnelPaths = funnelPathsRef.current,
        particles = particlesRef.current;

      // Canvas opacity + funnel labels now driven by forge scroll handler
      const canvasOpacity = canvasWrapRef.current
        ? parseFloat(canvasWrapRef.current.style.opacity || "0")
        : 0;

      if (canvasOpacity < 0.01) {
        for (const particle of particles) {
          particle.prevX = w * 0.5;
          particle.prevY = h * 0.5;
          particle.prev2X = w * 0.5;
          particle.prev2Y = h * 0.5;
        }
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Funnel node lines now rendered in SVG overlay

      // Particles
      ctx.save();
      const centerX = w * 0.5,
        centerY = h * 0.5;
      for (const particle of particles) {
        const si = particle.streamIdx;
        let px = centerX,
          py = centerY,
          alpha = 0;
        if (p < PP.EXPLODE[0]) {
          alpha = 0;
        } else if (p < PP.EXPLODE[1]) {
          const explodeT = smoothstep(PP.EXPLODE[0], PP.EXPLODE[1], p);
          const eased = 1 - (1 - explodeT) * (1 - explodeT);
          const dist = particle.explodeRadius * Math.min(w, h) * eased;
          px = centerX + Math.cos(particle.explodeAngle) * dist;
          py = centerY + Math.sin(particle.explodeAngle) * dist;
          alpha = smoothstep(PP.EXPLODE[0], PP.EXPLODE[0] + 0.02, p);
        } else if (p < PP.FALL[1]) {
          const fallT = smoothstep(PP.FALL[0], PP.FALL[1], p);
          const dist = particle.explodeRadius * Math.min(w, h);
          const ex = centerX + Math.cos(particle.explodeAngle) * dist,
            ey = centerY + Math.sin(particle.explodeAngle) * dist;
          const funnelPath = funnelPaths[si];
          const entryPos =
            funnelPath?.length > 0
              ? funnelPath[0]
              : { x: centerX, y: h * FUNNEL_TIERS.entry };
          px = lerpFn(ex, entryPos.x, fallT);
          py = lerpFn(ey, entryPos.y, fallT * fallT);
          alpha = 1;
        } else if (p < PP.FUNNEL[1]) {
          const funnelT = smoothstep(PP.FUNNEL[0], PP.FUNNEL[1], p);
          const funnelPath = funnelPaths[si];
          if (funnelPath?.length > 0) {
            const pos = samplePath(funnelPath, particle.baseT * funnelT);
            px = pos.x;
            py = pos.y;
          }
          alpha = 1 - smoothstep(PP.FADE_OUT[0], PP.FADE_OUT[1], p);
        } else {
          alpha = 0;
        }

        if (alpha <= 0.01) {
          particle.prevX = px;
          particle.prevY = py;
          particle.prev2X = px;
          particle.prev2Y = py;
          continue;
        }

        // Particles shrink as ribbons grow (ribbons absorb them)
        const ribbonGrowth = smoothstep(PP.FUNNEL[0], PP.FUNNEL[0] + 0.3, p);
        const shrinkFactor = lerpFn(1, 0.3, ribbonGrowth);

        const wobble =
          Math.sin(time * 1.2 + particle.wobblePhase) * particle.wobbleAmp * shrinkFactor;
        const tdx = px - particle.prevX,
          tdy = py - particle.prevY,
          tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
        const finalX = px + (-tdy / tlen) * wobble,
          finalY = py + (tdx / tlen) * wobble;
        const sizeM = 1 + Math.sin(time * 2 + particle.wobblePhase) * 0.15,
          size = particle.size * sizeM * shrinkFactor;

        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(particle.prevX, particle.prevY, size * 0.6, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(particle.prev2X, particle.prev2Y, size * 0.35, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.12;
        ctx.shadowBlur = 2;
        ctx.fill();
        particle.prev2X = particle.prevX;
        particle.prev2Y = particle.prevY;
        particle.prevX = px;
        particle.prevY = py;
      }
      ctx.restore();
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
        style={{ height: "1400vh" }}
        className="relative">
        <div
          ref={forgeStickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
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
          <DL style={{ top: "44%", left: "44%" }}>FORGE GLOW</DL>
          <div
            ref={glowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "75vw",
              height: "75vh",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(91,158,194,0.20) 0%, rgba(91,158,194,0.07) 35%, transparent 65%)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
          <div
            ref={innerGlowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "30vw",
              height: "30vh",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,76,0.4) 0%, rgba(201,168,76,0.12) 40%, transparent 70%)",
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
              width: "80vw",
              height: "80vh",
              borderRadius: "50%",
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
          <DL
            style={{ top: "14%", left: "50%", transform: "translateX(-50%)" }}>
            EMBERS
          </DL>
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
            <DL style={{ top: 8, left: 8 }}>TITLE</DL>
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
                style={{ color: "var(--cream-muted)", maxWidth: 500 }}>
                {ACT_II.splash}
              </motion.p>
            </div>
          </div>

          {/* Forge fragments */}
          <DL style={{ top: "18%", right: 12 }}>
            FORGE FRAGMENTS + SEED WORDS
          </DL>
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
                      border: "1px solid rgba(91,158,194,0.15)",
                      fontSize: `${f.size}rem`,
                      fontFamily: "var(--font-sans)",
                      color: fc(f.companyIdx, 0.7),
                      letterSpacing: "0.02em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: "rgba(198,120,221,0.7)" }}>
                      {f.code.match(
                        /^(const |let |var |export |async |await |function |interface |import )/,
                      )?.[0] ?? ""}
                    </span>
                    <span style={{ color: fc(f.companyIdx, 0.65) }}>
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
                    className={`${base} flex flex-col items-center gap-1`}
                    style={{
                      opacity: 0,
                      willChange: "transform, opacity, filter",
                    }}>
                    <div
                      style={{
                        width: f.logoSize,
                        height: f.logoSize,
                        opacity: 0.7,
                      }}>
                      {LOGOS[f.logoKey]}
                    </div>
                    <span
                      className="font-sans"
                      style={{
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                      }}>
                      {f.label}
                    </span>
                  </div>
                );
              case "command":
                return (
                  <div
                    key={`cmd-${i}`}
                    ref={setRef}
                    aria-hidden
                    className={`${base} whitespace-nowrap`}
                    style={{
                      opacity: 0,
                      padding: "5px 10px",
                      borderRadius: "4px",
                      background: "rgba(7,7,10,0.9)",
                      border: "1px solid rgba(74,222,128,0.12)",
                      fontSize: `${f.size}rem`,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.01em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: "rgba(74,222,128,0.6)" }}>$ </span>
                    <span style={{ color: "rgba(74,222,128,0.45)" }}>
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
                    className={`${base} whitespace-nowrap font-sans`}
                    style={{
                      fontSize: `${f.size}rem`,
                      fontWeight: f.weight,
                      color: fc(f.companyIdx, 0.7),
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
                            border: `1px solid ${fc(f.companyIdx, 0.2)}`,
                            background: fc(f.companyIdx, 0.05),
                          }
                        : {}),
                    }}>
                    {f.text}
                  </span>
                );
            }
          })}

          {/* Thesis */}
          <DL style={{ top: "42%", left: "20%" }}>THESIS</DL>
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

          {/* Narrative beats */}
          <DL style={{ top: "34%", right: 12 }}>NARRATIVE BEATS</DL>
          {BEATS.map((beat, bi) => (
            <div key={`beat-group-${bi}`}>
              <DL
                style={{
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}>{`BEAT ${bi + 1}: ${beat.company}`}</DL>
              <div
                ref={(el) => {
                  beatLabelEls.current[bi] = el;
                }}
                className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none font-sans"
                style={{
                  opacity: 0,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: fc(beat.companyIdx, 0.5),
                  willChange: "transform, opacity",
                }}>
                <span style={{ display: "block", marginBottom: "0.25rem" }}>
                  {beat.company}
                </span>
                <span
                  style={{ fontSize: "0.55rem", color: "var(--text-faint)" }}>
                  {beat.period}
                </span>
              </div>
              <div
                ref={(el) => {
                  beatEls.current[bi] = el;
                }}
                className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
                style={{
                  opacity: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.2rem, 2.8vw, 2rem)",
                  lineHeight: 1.5,
                  color: "var(--cream)",
                  maxWidth: "50vw",
                  willChange: "transform, opacity, filter",
                }}>
                {beat.insight}
              </div>
              <div
                ref={(el) => {
                  beatLearnedEls.current[bi] = el;
                }}
                className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none font-sans"
                style={{
                  opacity: 0,
                  fontSize: "clamp(0.6rem, 0.8vw, 0.75rem)",
                  letterSpacing: "0.08em",
                  fontStyle: "italic",
                  color: "var(--text-dim)",
                  maxWidth: "40vw",
                  willChange: "transform, opacity",
                }}>
                {beat.learned}
              </div>
            </div>
          ))}

          {/* Whispers */}
          <DL style={{ top: "22%", left: 12 }}>WHISPERS</DL>
          {whispers.map((w, i) => (
            <span
              key={`whisper-${i}`}
              ref={(el) => {
                whisperEls.current[i] = el;
              }}
              aria-hidden
              className="absolute left-1/2 top-1/2 whitespace-nowrap font-sans select-none pointer-events-none"
              style={{
                opacity: 0,
                fontSize: `${w.size}rem`,
                color: fc(BEATS[w.beatIdx].companyIdx, 0.35),
                letterSpacing: "0.06em",
                willChange: "transform, opacity",
              }}>
              {w.text}
            </span>
          ))}

          {/* Principles (crystallize) */}
          <DL
            style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}>
            PRINCIPLES (CRYSTALLIZE)
          </DL>
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

          {/* Particle canvas (inside sticky, driven by forge progress) */}
          <div
            ref={canvasWrapRef}
            className="absolute inset-0"
            style={{ opacity: 0, zIndex: 5 }}>
            <DL style={{ top: 40, left: 8 }}>PARTICLES (CANVAS)</DL>
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
          {/* Funnel SVG (crossfades in from canvas) */}
          <div
            ref={funnelSvgWrapRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0, zIndex: 6 }}>
            <svg
              viewBox={`0 0 ${FV_W} ${FV_H}`}
              className="w-full h-full max-w-[1200px]"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: "visible" }}>
              <defs>
                {STREAMS.map((s) => (
                  <linearGradient key={`fgrad-${s.id}`} id={`fgrad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
                  </linearGradient>
                ))}
                <filter id="ws-gold-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur
                    ref={(el) => { funnelBlurRef.current = el; }}
                    in="SourceGraphic"
                    stdDeviation="0"
                  />
                </filter>
              </defs>

              {/* Company node lines + labels */}
              {NODES.map((node, ni) => {
                const y = F_TIER_Y[ni + 1];
                const spread = F_TIER_SPREAD[ni + 1];
                return (
                  <g key={`fnode-${node.id}`} ref={(el) => { funnelNodeRefs.current[ni] = el; }} opacity={0}>
                    <line x1={F_CENTER_X - spread - 40} y1={y} x2={F_CENTER_X + spread + 40} y2={y} stroke={node.color} strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 6" />
                    <text x={F_CENTER_X - spread - 52} y={y - 12} textAnchor="end" className="font-sans" style={{ fontSize: "11px" }} fill={node.color} fillOpacity={0.7}>{node.label}</text>
                    <text x={F_CENTER_X - spread - 52} y={y + 6} textAnchor="end" className="font-sans" style={{ fontSize: "8px" }} fill="#8A8478" fillOpacity={0.5}>{node.period}</text>
                    <circle cx={F_CENTER_X} cy={y} r={3} fill={node.color} fillOpacity={0.35} />
                  </g>
                );
              })}

              {/* Stream ribbon segments */}
              {F_SEGMENTS.map((seg, i) => (
                <path
                  key={`fseg-${seg.streamId}-${seg.fromTier}-${seg.toTier}`}
                  ref={(el) => { funnelSegmentRefs.current[i] = el; }}
                  d={seg.path}
                  fill={`url(#fgrad-${seg.streamId})`}
                  opacity={0}
                  style={{ willChange: "opacity, transform" }}
                />
              ))}

              {/* Top stream labels */}
              {STREAMS.map((stream, si) => {
                const pos = F_POSITIONS.get(stream.id)![0];
                return (
                  <g key={`flabel-${stream.id}`} ref={(el) => { funnelStreamLabelRefs.current[si] = el; }} opacity={0}>
                    <circle cx={pos.x} cy={pos.y - 18} r={2.5} fill={stream.color} fillOpacity={0.6} />
                    <text x={pos.x} y={pos.y - 28} textAnchor="middle" className="font-sans" style={{ fontSize: "9px", letterSpacing: "0.02em" }} fill={stream.color} fillOpacity={0.6}>{stream.label}</text>
                  </g>
                );
              })}

              {/* Convergence point */}
              <g ref={(el) => { funnelConvergeRef.current = el; }} opacity={0}>
                <circle cx={F_CENTER_X} cy={F_CONVERGE_Y} r={6} fill="#C9A84C" filter="url(#ws-gold-glow)" />
                <circle cx={F_CENTER_X} cy={F_CONVERGE_Y} r={3} fill="#F0E6D0" />
                <line x1={F_CENTER_X - 50} y1={F_CONVERGE_Y} x2={F_CENTER_X - 8} y2={F_CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.3} strokeWidth={0.5} />
                <line x1={F_CENTER_X + 8} y1={F_CONVERGE_Y} x2={F_CENTER_X + 50} y2={F_CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.3} strokeWidth={0.5} />
                <text x={F_CENTER_X} y={F_CONVERGE_Y + 24} textAnchor="middle" className="font-serif" style={{ fontSize: "13px", letterSpacing: "0.04em" }} fill="#F0E6D0">The Engineer I Became</text>
              </g>
            </svg>
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
            ref={scrollHintEl}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-sans tracking-widest uppercase"
            style={{
              color: "var(--text-faint)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              animation: "breathe 3s ease-in-out infinite",
            }}>
            scroll to begin
          </div>
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
          className="relative flex flex-col items-center justify-center py-32 px-8"
          style={{ background: "var(--bg)", zIndex: 10 }}>
          <div
            className="w-12 h-px mb-12"
            style={{ background: "var(--gold-dim)" }}
          />
          <p
            className="font-sans uppercase tracking-widest mb-16"
            style={{
              color: "var(--text-dim)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
            }}>
            What four years of engineering crystallised
          </p>
          <div className="grid gap-14 max-w-2xl">
            {principles.map((pr, i) => (
              <div key={`sum-${i}`} className="text-center">
                <p
                  className="font-sans uppercase tracking-widest mb-3"
                  style={{
                    color: fc(i, 0.45),
                    fontSize: "0.55rem",
                    letterSpacing: "0.18em",
                  }}>
                  {COMPANIES[i].company}
                </p>
                <p
                  className="font-serif"
                  style={{
                    color: "var(--cream)",
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                  }}>
                  {pr.text}
                </p>
              </div>
            ))}
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
