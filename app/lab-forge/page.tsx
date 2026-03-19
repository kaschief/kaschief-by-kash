"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Deterministic PRNG (seed-based) */
function srand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function lerpColor(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  t: number,
): [number, number, number] {
  return [
    Math.round(lerp(r1, r2, t)),
    Math.round(lerp(g1, g2, t)),
    Math.round(lerp(b1, b2, t)),
  ];
}

/* ------------------------------------------------------------------ */
/*  Company data                                                       */
/* ------------------------------------------------------------------ */

interface CompanyData {
  name: string;
  label: string;
  baseColor: [number, number, number];
  scene: string;
  action: string;
  shift: string;
}

const COMPANIES: CompanyData[] = [
  {
    name: "AMBOSS",
    label: "AMBOSS",
    baseColor: [96, 165, 250], // #60A5FA
    scene:
      "Half a million medical students. An app that was supposed to help them pass their exams. I came from the ward — I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
    action:
      "I helped migrate from vanilla JS to React. I introduced A/B testing to stop guessing what worked. I broke production once — and that taught me testing discipline. But the thing that mattered most: I brought the instinct from nursing.",
    shift:
      "I learned that the gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail.",
  },
  {
    name: "Compado",
    label: "COMPADO",
    baseColor: [66, 184, 131], // #42B883
    scene:
      "The sites were replicas of each other — same structure, different brands, different audiences. Every change meant touching six copies. Visitors arrived from search with zero loyalty and no patience.",
    action:
      "I rebuilt the architecture so you could swap parts without duplicating everything. Component-driven design, shared across brands. Then I attacked load times: Lighthouse audits, CSS compression, lazy loading, infinite scroll.",
    shift:
      "I discovered that every millisecond is a user who stays or leaves. Performance isn\u2019t a technical achievement — it\u2019s a product decision.",
  },
  {
    name: "CAPinside",
    label: "CAPINSIDE",
    baseColor: [49, 120, 198], // #3178C6
    scene:
      "Ten thousand financial advisors depending on a platform that had grown fragile. Nobody reviewed code — the process existed on paper but nobody prioritized it. Tests were sparse. TypeScript was new to me.",
    action:
      "I learned to work across different systems. But more importantly, I started seeing something I hadn\u2019t seen before: the codebase wasn\u2019t just code. It was a record of how the team communicated.",
    shift:
      "I realised you can\u2019t fix code without fixing process. This was my first time diagnosing a team through its codebase.",
  },
  {
    name: "DKB",
    label: "DKB CODE FACTORY",
    baseColor: [244, 114, 182], // #F472B6
    scene:
      "Germany\u2019s largest direct bank. Five million users. A banking app moving from legacy to React and TypeScript. Monthly releases. Security, stability, regulations at every turn. And when I arrived: zero automated tests.",
    action:
      "I introduced Playwright end-to-end testing and built the patterns the team adopted. Moved releases from monthly to weekly. Feature flags that let product toggle features without deployments.",
    shift:
      "I wasn\u2019t just building features anymore. I was shaping how the team worked, what we shipped, and why. Then they promoted me to engineering manager.",
  },
];

/* ------------------------------------------------------------------ */
/*  Particle types                                                     */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  homeX: number;
  homeY: number;
  clusterX: number;
  clusterY: number;
  color: [number, number, number];
  prevColor: [number, number, number];
  nextColor: [number, number, number];
  size: number;
  glowRadius: number;
  vx: number;
  vy: number;
  hueOffset: number; // per-particle hue variation
  wobblePhase: number;
  wobbleSpeed: number;
}

const PARTICLE_COUNT = 120;
const PER_COMPANY = 30;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ForgeTestV19() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  // Text refs for overlay
  const labelRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  /* ---- Initialize particles ---- */
  const initParticles = useCallback((w: number, h: number) => {
    const rng = srand(42);
    const particles: Particle[] = [];
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const companyIdx = Math.floor(i / PER_COMPANY);
      const base = COMPANIES[companyIdx].baseColor;

      // Scattered "home" positions across viewport
      const homeX = rng() * w;
      const homeY = rng() * h;

      // Cluster positions — tight group at center
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 30 + 5;
      const clusterX = cx + Math.cos(angle) * dist;
      const clusterY = cy + Math.sin(angle) * dist;

      const hueOffset = (rng() - 0.5) * 40; // ±20 variation

      particles.push({
        x: cx,
        y: cy,
        targetX: homeX,
        targetY: homeY,
        homeX,
        homeY,
        clusterX,
        clusterY,
        color: [base[0], base[1], base[2]],
        prevColor: [base[0], base[1], base[2]],
        nextColor: [base[0], base[1], base[2]],
        size: 2 + rng() * 2,
        glowRadius: 8 + rng() * 4,
        vx: 0,
        vy: 0,
        hueOffset,
        wobblePhase: rng() * Math.PI * 2,
        wobbleSpeed: 0.5 + rng() * 1.5,
      });
    }

    particlesRef.current = particles;
  }, []);

  /* ---- Apply hue offset to base color ---- */
  const applyHueOffset = useCallback(
    (base: [number, number, number], offset: number): [number, number, number] => {
      // Simple hue shift via rotation in RGB space (approximate)
      const shift = offset / 255;
      return [
        Math.max(0, Math.min(255, base[0] + offset * 0.5)),
        Math.max(0, Math.min(255, base[1] + shift * 20)),
        Math.max(0, Math.min(255, base[2] - offset * 0.3)),
      ];
    },
    [],
  );

  /* ---- Main draw loop ---- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const progress = scrollRef.current;
    const particles = particlesRef.current;
    const frame = frameCountRef.current;
    frameCountRef.current = frame + 1;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "screen";

    // Determine current company and local progress
    const companyFloat = progress * 4;
    const companyIdx = Math.min(3, Math.floor(companyFloat));
    const localProgress = companyFloat - companyIdx;

    // Phase boundaries (within each company's 25%)
    const BURST_END = 0.1;
    const FREEZE_END = 0.3;
    const DRIFT_END = 0.6;
    const CONVERGE_END = 0.8;
    // PULSE: 0.8 - 1.0

    // Update text overlay
    const company = COMPANIES[companyIdx];
    const label = labelRef.current;
    const scene = sceneRef.current;
    const action = actionRef.current;
    const shift = shiftRef.current;
    const final_ = finalRef.current;

    if (label && scene && action && shift && final_) {
      // Company label
      const labelOpacity = smoothstep(BURST_END, BURST_END + 0.05, localProgress) *
        (1 - smoothstep(CONVERGE_END, CONVERGE_END + 0.1, localProgress));
      label.style.opacity = String(labelOpacity);
      label.style.color = `rgb(${company.baseColor[0]},${company.baseColor[1]},${company.baseColor[2]})`;
      label.textContent = company.label;

      // Scene text
      const sceneOpacity = smoothstep(BURST_END + 0.05, FREEZE_END, localProgress) *
        (1 - smoothstep(CONVERGE_END - 0.1, CONVERGE_END, localProgress));
      scene.style.opacity = String(sceneOpacity);
      scene.textContent = company.scene;

      // Action text
      const actionOpacity = smoothstep(FREEZE_END, FREEZE_END + 0.1, localProgress) *
        (1 - smoothstep(DRIFT_END + 0.05, CONVERGE_END, localProgress));
      action.style.opacity = String(actionOpacity);
      action.textContent = company.action;

      // Shift text
      const shiftOpacity = smoothstep(CONVERGE_END - 0.1, CONVERGE_END, localProgress) *
        (companyIdx < 3
          ? 1 - smoothstep(0.95, 1.0, localProgress)
          : 1);
      shift.style.opacity = String(shiftOpacity);
      shift.textContent = company.shift;

      // Final text (DKB only, end)
      const isFinal = companyIdx === 3 && localProgress > 0.85;
      final_.style.opacity = String(isFinal ? smoothstep(0.85, 0.95, localProgress) : 0);
    }

    // Update and draw each particle
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pCompanyIdx = Math.floor(i / PER_COMPANY);

      // Which company's phase is this particle responding to?
      // All particles respond to the global scroll, but with their company's color
      const isActiveCompany = pCompanyIdx === companyIdx;
      const isPreviousCompany = pCompanyIdx === companyIdx - 1;
      const isUpcoming = pCompanyIdx > companyIdx;
      const isPast = pCompanyIdx < companyIdx;

      // Color transition
      const currentBase = COMPANIES[companyIdx].baseColor;
      const prevBase = companyIdx > 0 ? COMPANIES[companyIdx - 1].baseColor : currentBase;

      if (localProgress < BURST_END) {
        // Color lerp during burst
        const colorT = localProgress / BURST_END;
        const blended = lerpColor(
          prevBase[0], prevBase[1], prevBase[2],
          currentBase[0], currentBase[1], currentBase[2],
          colorT,
        );
        p.color = applyHueOffset(blended, p.hueOffset) as [number, number, number];
      } else {
        p.color = applyHueOffset(currentBase, p.hueOffset) as [number, number, number];
      }

      // Target position based on phase
      let targetX: number;
      let targetY: number;
      let easing = 0.04;
      let wobbleAmp = 0;
      let brightness = 1;

      if (localProgress < BURST_END) {
        // BURST: fly outward from center to home
        const burstT = localProgress / BURST_END;
        targetX = lerp(cx, p.homeX, burstT);
        targetY = lerp(cy, p.homeY, burstT);
        easing = 0.15;
      } else if (localProgress < FREEZE_END) {
        // FREEZE: settle at home, gentle wobble
        targetX = p.homeX;
        targetY = p.homeY;
        wobbleAmp = 2;
        easing = 0.06;
      } else if (localProgress < DRIFT_END) {
        // DRIFT: slow drift, some clustering toward center text area
        const driftT = (localProgress - FREEZE_END) / (DRIFT_END - FREEZE_END);
        const driftTargetX = lerp(p.homeX, lerp(p.homeX, cx, 0.15), driftT);
        const driftTargetY = lerp(p.homeY, lerp(p.homeY, cy, 0.15), driftT);
        targetX = driftTargetX;
        targetY = driftTargetY;
        wobbleAmp = 3;
        easing = 0.03;

        // Particles near text become brighter
        const distToCenter = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        if (distToCenter < 100) {
          brightness = 1.3;
        }
      } else if (localProgress < CONVERGE_END) {
        // CONVERGE: accelerate toward center cluster
        const convergeT = smoothstep(DRIFT_END, CONVERGE_END, localProgress);
        targetX = lerp(p.homeX, p.clusterX, convergeT);
        targetY = lerp(p.homeY, p.clusterY, convergeT);
        easing = 0.08;
      } else {
        // PULSE: breathe in/out at cluster
        const pulseT = (localProgress - CONVERGE_END) / (1 - CONVERGE_END);
        const breathe = Math.sin(pulseT * Math.PI * 4) * 8;
        const angle = Math.atan2(p.clusterY - cy, p.clusterX - cx);
        targetX = p.clusterX + Math.cos(angle) * breathe;
        targetY = p.clusterY + Math.sin(angle) * breathe;
        easing = 0.1;

        // Glow flash near end
        if (companyIdx < 3 && pulseT > 0.7) {
          brightness = 1 + (pulseT - 0.7) / 0.3 * 0.8;
        }

        // DKB final: dim
        if (companyIdx === 3 && pulseT > 0.5) {
          brightness = lerp(1, 0.3, (pulseT - 0.5) / 0.5);
        }
      }

      // Hide particles from future companies (they haven't appeared yet)
      let alpha = 1;
      if (isUpcoming) {
        alpha = 0;
      } else if (isPast && !isPreviousCompany) {
        alpha = 0;
      } else if (isPreviousCompany) {
        // Fade out previous company's particles during burst
        alpha = localProgress < BURST_END ? 1 - localProgress / BURST_END : 0;
      }

      // Show all particles for current company group
      if (isActiveCompany) {
        alpha = 1;
      }

      // Wobble
      if (wobbleAmp > 0) {
        const wobbleX = Math.sin(frame * 0.02 * p.wobbleSpeed + p.wobblePhase) * wobbleAmp;
        const wobbleY = Math.cos(frame * 0.02 * p.wobbleSpeed + p.wobblePhase * 1.3) * wobbleAmp;
        targetX += wobbleX;
        targetY += wobbleY;
      }

      // Move toward target
      p.vx += (targetX - p.x) * easing;
      p.vy += (targetY - p.y) * easing;
      p.vx *= 0.85; // damping
      p.vy *= 0.85;
      p.x += p.vx;
      p.y += p.vy;

      // Draw
      if (alpha <= 0) continue;

      const r = Math.min(255, p.color[0] * brightness);
      const g = Math.min(255, p.color[1] * brightness);
      const b = Math.min(255, p.color[2] * brightness);

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.6 * alpha})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.15 * alpha})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(
        p.x - p.glowRadius,
        p.y - p.glowRadius,
        p.glowRadius * 2,
        p.glowRadius * 2,
      );

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    animFrameRef.current = requestAnimationFrame(draw);
  }, [applyHueOffset]);

  /* ---- Setup ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles, draw]);

  return (
    <div
      ref={containerRef}
      style={{ height: "1200vh", background: "var(--bg)" }}
    >
      <LabNav />

      {/* Sticky viewport */}
      <div
        className="sticky top-0 left-0 w-full"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        {/* Canvas — behind text */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        />

        {/* HTML overlay — on top of canvas */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 2, pointerEvents: "none" }}
        >
          {/* Company label */}
          <div
            ref={labelRef}
            className="absolute font-sans text-xs uppercase tracking-widest"
            style={{
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0,
              fontWeight: 600,
            }}
          />

          {/* Scene text */}
          <div
            ref={sceneRef}
            className="absolute font-serif text-lg leading-relaxed text-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 480,
              color: "var(--cream)",
              opacity: 0,
            }}
          />

          {/* Action text */}
          <div
            ref={actionRef}
            className="absolute font-sans text-sm leading-relaxed text-center"
            style={{
              top: "65%",
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: 440,
              color: "var(--cream-muted)",
              opacity: 0,
            }}
          />

          {/* Shift text */}
          <div
            ref={shiftRef}
            className="absolute font-serif text-lg italic leading-relaxed text-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 480,
              color: "var(--cream)",
              opacity: 0,
            }}
          />

          {/* Final convergence text */}
          <div
            ref={finalRef}
            className="absolute font-serif text-2xl text-center"
            style={{
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "var(--gold)",
              opacity: 0,
              fontWeight: 500,
            }}
          >
            The Engineer I Became
          </div>
        </div>
      </div>
    </div>
  );
}
