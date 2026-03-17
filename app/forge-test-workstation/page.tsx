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

// Pre-compute top-tier positions for each stream (targets for canvas particles)
const F_TOP_POSITIONS = STREAMS.map((s) => F_POSITIONS.get(s.id)![0]);

/** Map SVG viewBox coord to pixel coord using actual SVG bounding rect */
function svgToPixel(
  sx: number, sy: number,
  svgRect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  const scale = Math.min(svgRect.width / FV_W, svgRect.height / FV_H);
  const renderedW = FV_W * scale, renderedH = FV_H * scale;
  const offX = svgRect.left + (svgRect.width - renderedW) / 2;
  const offY = svgRect.top + (svgRect.height - renderedH) / 2;
  return { px: offX + sx * scale, py: offY + sy * scale };
}

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
      segments.push({ streamId: stream.id, color: stream.color, fromTier: i, toTier: i + 1, path, opacityEnd: 0.4 + (i + 1) * 0.1 });
    }
  }
  return segments;
}

const F_SEGMENTS = buildFunnelSegments();

const WS_TIER_CAPTIONS = [
  { caption: "The user is never an abstraction. The moment you treat them like one, the product starts lying to people.", color: "#60A5FA" },
  { caption: "Load time is not a metric. It is a user\u2019s first impression of whether you respect their time.", color: "#42B883" },
  { caption: "A codebase is a record of a team\u2019s habits. If you want to change the code, you have to change how the team works.", color: "#3178C6" },
  { caption: "At a certain scale, the highest-leverage thing an engineer can do is make the right decision obvious.", color: "#F472B6" },
];

const PP = {
  CANVAS_IN: [0.0, 0.05] as const,
  EXPLODE: [0.05, 0.20] as const,
  CONVERGE: [0.20, 0.45] as const,  // converge to SVG dot positions
  FADE_OUT: [0.40, 0.55] as const,  // fade as SVG dots appear
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
  const funnelCaptionRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          el.style.filter = `blur(${lerp(1, 0, ss(0.03, 0.07, p))}px)`;
          const glow =
            heat > 0.05
              ? `0 0 ${lerp(0, 12, heat)}px ${fc(f.companyIdx, 0.8)}`
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
      // Canvas particles: full range 0.26–0.46 → local 0–1
      const PART_START = 0.26, PART_END = 0.46;
      const pt = Math.max(0, Math.min(1, (p - PART_START) / (PART_END - PART_START)));
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
        const svgOut = 1 - ss(0.44, 0.47, p);
        funnelSvgWrapRef.current.style.opacity = String(svgIn * svgOut);
      }

      // SVG dots: appear as canvas particles arrive at same positions
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelDotRefs.current[si];
        if (!el) continue;
        const stagger = si * 0.003;
        const dotIn = ss(0.33 + stagger, 0.36 + stagger, p);
        const dotOut = 1 - ss(0.44, 0.47, p);
        const ribbonStart = ss(0.36, 0.40, p);
        const scale = lerpFn(2, 1, ribbonStart);
        const glowR = lerpFn(6, 3, ribbonStart);
        el.style.opacity = String(dotIn * dotOut);
        el.style.transform = `scale(${dotIn > 0 ? scale : 0})`;
        const blur = el.querySelector("feGaussianBlur");
        if (blur) blur.setAttribute("stdDeviation", String(glowR));
      }

      // Stream labels — appear at 0.31–0.35
      for (let si = 0; si < STREAMS.length; si++) {
        const el = funnelStreamLabelRefs.current[si];
        if (!el) continue;
        const stagger = si * 0.004;
        const labelIn = ss(0.31 + stagger, 0.35 + stagger, p);
        const labelOut = 1 - ss(0.44, 0.47, p);
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
        const fadeOut = 1 - ss(0.44, 0.47, p);
        el.style.opacity = String(lerpFn(0, seg.opacityEnd, t) * fadeOut);
        const scaleY = lerpFn(0, 1, t);
        el.style.transformOrigin = `${F_CENTER_X}px ${F_TIER_Y[seg.fromTier]}px`;
        el.style.transform = `scaleY(${scaleY})`;
      }

      // Company nodes — appear as ribbons reach them
      for (let ni = 0; ni < NODES.length; ni++) {
        const el = funnelNodeRefs.current[ni];
        if (!el) continue;
        const threshIdx = Math.min(ni, TIER_THRESHOLDS.length - 1);
        const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
        const nodeT = ss(lerpFn(threshStart, threshEnd, 0.4), lerpFn(threshStart, threshEnd, 0.8), p);
        const fadeOut = 1 - ss(0.44, 0.47, p);
        el.style.opacity = String(nodeT * fadeOut);
        el.style.transform = `translateY(${lerpFn(8, 0, nodeT)}px)`;
      }

      // Convergence point — 0.42–0.46
      if (funnelConvergeRef.current) {
        const ct = ss(0.42, 0.46, p);
        const fadeOut = 1 - ss(0.44, 0.47, p);
        funnelConvergeRef.current.style.opacity = String(ct * fadeOut);
        if (funnelBlurRef.current) {
          funnelBlurRef.current.setAttribute("stdDeviation", String(lerpFn(0, 12, ct)));
        }
      }

      // Narrative captions — liquid glass cards per tier
      const WS_CAP_THRESHOLDS = [[0.33, 0.37], [0.37, 0.40], [0.40, 0.43], [0.43, 0.46]];
      for (let ni = 0; ni < WS_TIER_CAPTIONS.length; ni++) {
        const el = funnelCaptionRefs.current[ni];
        if (!el) continue;
        const [ts, te] = WS_CAP_THRESHOLDS[ni];
        const fadeIn = ss(lerpFn(ts, te, 0.15), lerpFn(ts, te, 0.45), p);
        const fadeOut = 1 - ss(lerpFn(ts, te, 0.8), te + 0.01, p);
        el.style.opacity = String(fadeIn * fadeOut);
        el.style.transform = `translateY(${lerpFn(8, 0, fadeIn)}px)`;
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
      svgRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
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
      if (!ctx || !canvas) { rafId = requestAnimationFrame(draw); return; }
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }

      const p = particleProgressRef.current;
      ctx.clearRect(0, 0, w, h);

      // Only draw during explosion+convergence phases
      if (p > PP.FADE_OUT[1]) { rafId = requestAnimationFrame(draw); return; }

      const centerX = w * 0.5, centerY = h * 0.5;
      const particles = particlesRef.current;

      for (const particle of particles) {
        const si = particle.streamIdx;
        const target = F_TOP_POSITIONS[si];
        const { px: targetX, py: targetY } = svgToPixel(target.x, target.y, svgRectRef.current);

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

          <div
            ref={glowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: "75vw",
              height: "75vh",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(91,158,194,0.08) 0%, rgba(91,158,194,0.03) 35%, transparent 65%)",
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
                "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)",
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
                style={{ color: "var(--cream-muted)", maxWidth: 500 }}>
                {ACT_II.splash}
              </motion.p>
            </div>
          </div>

          {/* Forge fragments */}
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
                      border: "1px solid rgba(91,158,194,0.25)",
                      fontSize: `${f.size}rem`,
                      fontFamily: "var(--font-sans)",
                      color: fc(f.companyIdx, 0.95),
                      letterSpacing: "0.02em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: "rgba(198,120,221,0.9)" }}>
                      {f.code.match(
                        /^(const |let |var |export |async |await |function |interface |import )/,
                      )?.[0] ?? ""}
                    </span>
                    <span style={{ color: fc(f.companyIdx, 0.85) }}>
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
                        opacity: 0.9,
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
                      border: "1px solid rgba(74,222,128,0.2)",
                      fontSize: `${f.size}rem`,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.01em",
                      willChange: "transform, opacity, filter",
                    }}>
                    <span style={{ color: "rgba(74,222,128,0.85)" }}>$ </span>
                    <span style={{ color: "rgba(74,222,128,0.7)" }}>
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
                      color: fc(f.companyIdx, 0.95),
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
          {BEATS.map((beat, bi) => (
            <div key={`beat-group-${bi}`}>
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
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
          {/* Funnel SVG (crossfades in from canvas) */}
          <div
            ref={funnelSvgWrapRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0, zIndex: 6 }}>
            <svg
              ref={funnelSvgRef}
              viewBox={`0 0 ${FV_W} ${FV_H}`}
              className="w-full h-full max-w-300"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: "visible" }}>
              <defs>
                {STREAMS.map((s) => (
                  <linearGradient key={`fgrad-${s.id}`} id={`fgrad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
                {/* Per-dot glow filters */}
                {STREAMS.map((_, si) => (
                  <filter key={`wsdot-f-${si}`} id={`wsdot-${si}`} x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                  </filter>
                ))}
                <filter id="ws-gold-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur
                    ref={(el) => { funnelBlurRef.current = el; }}
                    in="SourceGraphic"
                    stdDeviation="0"
                  />
                </filter>
              </defs>

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

              {/* Company node lines + labels */}
              {NODES.map((node, ni) => {
                const y = F_TIER_Y[ni + 1];
                const spread = F_TIER_SPREAD[ni + 1];
                return (
                  <g key={`fnode-${node.id}`} ref={(el) => { funnelNodeRefs.current[ni] = el; }} opacity={0}>
                    <line x1={F_CENTER_X - spread - 40} y1={y} x2={F_CENTER_X + spread + 40} y2={y} stroke={node.color} strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 6" />
                    <text x={F_CENTER_X - spread - 52} y={y - 12} textAnchor="end" className="font-sans" style={{ fontSize: "11px", fontWeight: 600 }} fill={node.color} fillOpacity={0.9}>{node.label}</text>
                    <text x={F_CENTER_X - spread - 52} y={y + 6} textAnchor="end" className="font-sans" style={{ fontSize: "8px" }} fill="#8A8478" fillOpacity={0.65}>{node.period}</text>
                    <circle cx={F_CENTER_X} cy={y} r={3} fill={node.color} fillOpacity={0.5} />
                  </g>
                );
              })}

              {/* Top dots (V7 approved — glow + core + bright center) */}
              {STREAMS.map((stream, si) => {
                const pos = F_POSITIONS.get(stream.id)![0];
                return (
                  <g key={`fdot-${stream.id}`} ref={(el) => { funnelDotRefs.current[si] = el; }} opacity={0} style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}>
                    <circle cx={pos.x} cy={pos.y} r={5} fill={stream.color} filter={`url(#wsdot-${si})`} opacity={0.6} />
                    <circle cx={pos.x} cy={pos.y} r={3.5} fill={stream.color} />
                    <circle cx={pos.x} cy={pos.y} r={1.5} fill="white" opacity={0.5} />
                  </g>
                );
              })}

              {/* Top stream labels */}
              {STREAMS.map((stream, si) => {
                const pos = F_POSITIONS.get(stream.id)![0];
                return (
                  <g key={`flabel-${stream.id}`} ref={(el) => { funnelStreamLabelRefs.current[si] = el; }} opacity={0}>
                    <text x={pos.x} y={pos.y - 16} textAnchor="middle" className="font-sans" style={{ fontSize: "9px", letterSpacing: "0.04em", fontWeight: 500 }} fill={stream.color} fillOpacity={0.9}>{stream.label}</text>
                  </g>
                );
              })}

              {/* Convergence point — single gold diamond + text */}
              <g ref={(el) => { funnelConvergeRef.current = el; }} opacity={0}>
                <rect x={F_CENTER_X - 4} y={F_CONVERGE_Y - 4} width={8} height={8} rx={1} fill="#C9A84C" transform={`rotate(45 ${F_CENTER_X} ${F_CONVERGE_Y})`} />
                <line x1={F_CENTER_X - 40} y1={F_CONVERGE_Y} x2={F_CENTER_X - 8} y2={F_CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.25} strokeWidth={0.5} />
                <line x1={F_CENTER_X + 8} y1={F_CONVERGE_Y} x2={F_CENTER_X + 40} y2={F_CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.25} strokeWidth={0.5} />
                <text x={F_CENTER_X} y={F_CONVERGE_Y + 22} textAnchor="middle" className="font-serif" style={{ fontSize: "12px", letterSpacing: "0.06em" }} fill="#C9A84C" fillOpacity={0.8}>The Engineer I Became</text>
              </g>
            </svg>
          </div>

          {/* Narrative captions — liquid glass cards centered in tier rows */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 7 }}>
            {WS_TIER_CAPTIONS.map((cap, ni) => {
              const tierTopFrac = [0.20, 0.38, 0.54, 0.72][ni];
              return (
                <div
                  key={`caption-${ni}`}
                  ref={(el) => { funnelCaptionRefs.current[ni] = el; }}
                  className="absolute left-1/2 -translate-x-1/2 text-center"
                  style={{
                    top: `${tierTopFrac * 100}%`,
                    maxWidth: "400px",
                    opacity: 0,
                    willChange: "transform, opacity",
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    background: "rgba(14,14,20,0.45)",
                    backdropFilter: "blur(20px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}>
                  <span className="font-serif block" style={{
                    fontSize: "0.9rem", lineHeight: 1.6,
                    color: "var(--cream, #F0E6D0)", opacity: 0.85,
                  }}>
                    {cap.caption}
                  </span>
                </div>
              );
            })}
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
              Before there was code, there was a ward. Before there were components, there were patients.
              The instinct to watch how people actually behave under pressure — not how you imagine they will —
              that came from nursing. It never left. It just found a new medium: four companies, nine
              streams of craft, and six years of building systems where every decision compounds.
            </p>
            <p
              className="font-narrator mt-8"
              style={{
                color: "var(--text-dim)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}>
              What follows is what that instinct became when it met React, Vue, TypeScript,
              testing pipelines, and the pressure of five million users who never knew your name.
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
