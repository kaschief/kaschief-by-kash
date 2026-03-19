"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { STREAMS, NODES, smoothstep, lerp } from "../sankey-data";
import { LabNav } from "../lab-nav";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Point {
  x: number;
  y: number;
}

interface Particle {
  /** Which stream this belongs to */
  streamIdx: number;
  /** Particle's fixed position along its path (0-1) */
  baseT: number;
  /** Scroll value at which this particle starts appearing */
  startScroll: number;
  /** Scroll value at which this particle reaches its final position */
  endScroll: number;
  /** Rendered radius */
  size: number;
  /** Pre-resolved color */
  color: string;
  /** The bezier path this particle follows */
  path: Point[];
  /** Slight per-particle offset for organic feel */
  wobblePhase: number;
  wobbleAmplitude: number;
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

/** Y positions of the four company nodes as fractions of canvas height */
const NODE_Y_FRACTIONS = [0.15, 0.38, 0.61, 0.84];

/** X spread for each stream at the top — spread wide then converge */
const STREAM_X_OFFSETS: Record<string, { topFrac: number; botFrac: number }> = {
  empathy:      { topFrac: 0.10, botFrac: 0.22 },
  react:        { topFrac: 0.20, botFrac: 0.30 },
  vue:          { topFrac: 0.30, botFrac: 0.38 },
  typescript:   { topFrac: 0.38, botFrac: 0.44 },
  performance:  { topFrac: 0.48, botFrac: 0.50 },
  testing:      { topFrac: 0.58, botFrac: 0.56 },
  architecture: { topFrac: 0.66, botFrac: 0.62 },
  product:      { topFrac: 0.76, botFrac: 0.70 },
  quality:      { topFrac: 0.86, botFrac: 0.78 },
};

const PARTICLES_PER_STREAM = 20;

/* ------------------------------------------------------------------ */
/*  Path helpers                                                       */
/* ------------------------------------------------------------------ */

/** Quadratic bezier point at t */
function quadBezier(p0: Point, cp: Point, p1: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y,
  };
}

/**
 * Build a path (array of ~60 sampled points) for a stream given canvas size.
 * The path goes through each node the stream passes through, using
 * quadratic bezier curves between nodes. For streams that skip nodes
 * (e.g., React going 0→3), the curve arcs outward.
 */
function buildStreamPath(
  stream: (typeof STREAMS)[number],
  canvasW: number,
  canvasH: number,
): Point[] {
  const nodeYs = NODE_Y_FRACTIONS.map((f) => f * canvasH);
  const offsets = STREAM_X_OFFSETS[stream.id] ?? { topFrac: 0.5, botFrac: 0.5 };

  // Compute x position at each node this stream passes through
  // Interpolate between topFrac and botFrac based on where each node sits vertically
  const waypoints: Point[] = stream.path.map((nodeIdx) => {
    const yFrac = NODE_Y_FRACTIONS[nodeIdx];
    // Map 0.15→0 and 0.84→1 for interpolation range
    const normalized = (yFrac - 0.15) / (0.84 - 0.15);
    const xFrac = lerp(offsets.topFrac, offsets.botFrac, normalized);
    return { x: xFrac * canvasW, y: nodeYs[nodeIdx] };
  });

  if (waypoints.length < 2) return waypoints;

  // Sample bezier curves between consecutive waypoints
  const SAMPLES_PER_SEGMENT = 40;
  const points: Point[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[i];
    const p1 = waypoints[i + 1];

    // Determine if this segment skips nodes (arc outward)
    const nodeGap = stream.path[i + 1] - stream.path[i];
    const skipDistance = nodeGap > 1 ? nodeGap : 0;

    // Control point — midpoint y, offset x outward for skipped nodes
    const arcOffset = skipDistance * 80 * (offsets.topFrac > 0.5 ? 1 : -1);
    const cp: Point = {
      x: (p0.x + p1.x) / 2 + arcOffset,
      y: (p0.y + p1.y) / 2,
    };

    for (let s = 0; s <= SAMPLES_PER_SEGMENT; s++) {
      // Skip first point of subsequent segments to avoid duplicates
      if (i > 0 && s === 0) continue;
      const t = s / SAMPLES_PER_SEGMENT;
      points.push(quadBezier(p0, cp, p1, t));
    }
  }

  return points;
}

/** Get interpolated position along a sampled path at parameter t (0-1) */
function getPositionAlongPath(path: Point[], t: number): Point {
  if (path.length === 0) return { x: 0, y: 0 };
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];

  const idx = t * (path.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, path.length - 1);
  const frac = idx - lo;

  return {
    x: lerp(path[lo].x, path[hi].x, frac),
    y: lerp(path[lo].y, path[hi].y, frac),
  };
}

/* ------------------------------------------------------------------ */
/*  Particle initialization                                            */
/* ------------------------------------------------------------------ */

function initParticles(canvasW: number, canvasH: number): {
  particles: Particle[];
  paths: Point[][];
} {
  const particles: Particle[] = [];
  const paths: Point[][] = [];

  STREAMS.forEach((stream, si) => {
    const path = buildStreamPath(stream, canvasW, canvasH);
    paths.push(path);

    for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
      // Distribute particles evenly along the path with slight jitter
      const baseT = (i + Math.random() * 0.4) / PARTICLES_PER_STREAM;

      // Stagger when each particle starts and ends based on its position
      // Earlier particles (lower baseT) appear first
      const startScroll = 0.02 + baseT * 0.3;
      const endScroll = startScroll + 0.2 + Math.random() * 0.15;

      particles.push({
        streamIdx: si,
        baseT: Math.min(baseT, 1),
        startScroll,
        endScroll: Math.min(endScroll, 0.95),
        size: 2 + Math.random() * 2,
        color: stream.color,
        path,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmplitude: 1.5 + Math.random() * 2.5,
      });
    }
  });

  return { particles, paths };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ForgeTestV5() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const pathsRef = useRef<Point[][]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const timeRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    progressRef.current = p;
  });

  /* ---- Resize handling ---- */
  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { w, h };
    setDims({ w, h });

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

    // Re-init particles with new dimensions
    const { particles, paths } = initParticles(w, h);
    particlesRef.current = particles;
    pathsRef.current = paths;
  }, []);

  /* ---- Animation loop ---- */
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    let rafId: number;

    function draw() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      timeRef.current += 0.016; // ~60fps time accumulator
      const time = timeRef.current;
      const p = progressRef.current;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw node lines
      const nodeYs = NODE_Y_FRACTIONS.map((f) => f * h);
      ctx.save();
      for (const ny of nodeYs) {
        ctx.beginPath();
        ctx.moveTo(w * 0.06, ny);
        ctx.lineTo(w * 0.94, ny);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // Draw particles
      ctx.save();
      for (const particle of particlesRef.current) {
        const streamProgress = smoothstep(
          particle.startScroll,
          particle.endScroll,
          p,
        );
        if (streamProgress <= 0) continue;

        // Particle position along path based on scroll + slight time-based drift
        const drift =
          Math.sin(time * 0.8 + particle.wobblePhase) * 0.01;
        const t = Math.min(particle.baseT * streamProgress + drift, 1);
        if (t < 0) continue;

        const pos = getPositionAlongPath(particle.path, t);

        // Wobble perpendicular to path direction
        const wobbleOffset =
          Math.sin(time * 1.2 + particle.wobblePhase) *
          particle.wobbleAmplitude;

        // Get path tangent for perpendicular offset
        const tNext = Math.min(t + 0.01, 1);
        const posNext = getPositionAlongPath(particle.path, tNext);
        const dx = posNext.x - pos.x;
        const dy = posNext.y - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        // Perpendicular: (-dy, dx)
        const px = pos.x + (-dy / len) * wobbleOffset;
        const py = pos.y + (dx / len) * wobbleOffset;

        // Fade in at start, fade out at end of stream
        const alpha =
          streamProgress < 0.1
            ? streamProgress / 0.1
            : streamProgress > 0.9
              ? (1 - streamProgress) / 0.1
              : 1;

        // Pulsing size
        const sizeMultiplier =
          1 + Math.sin(time * 2 + particle.wobblePhase) * 0.15;
        const size = particle.size * sizeMultiplier;

        // Draw glow
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Draw a dimmer trail behind
        const tTrail = Math.max(t - 0.03, 0);
        const posTrail = getPositionAlongPath(particle.path, tTrail);
        ctx.beginPath();
        ctx.arc(posTrail.x, posTrail.y, size * 0.6, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowBlur = 4;
        ctx.fill();

        // Even dimmer second trail
        const tTrail2 = Math.max(t - 0.06, 0);
        const posTrail2 = getPositionAlongPath(particle.path, tTrail2);
        ctx.beginPath();
        ctx.arc(posTrail2.x, posTrail2.y, size * 0.35, 0, Math.PI * 2);
        ctx.globalAlpha = alpha * 0.12;
        ctx.shadowBlur = 2;
        ctx.fill();
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

  /* ---- Node labels (HTML for crisp text) ---- */
  const nodeLabels = NODES.map((node, i) => {
    const top = `${NODE_Y_FRACTIONS[i] * 100}%`;
    return (
      <div
        key={node.id}
        className="absolute left-6 -translate-y-1/2 pointer-events-none"
        style={{ top }}
      >
        <span
          className="font-sans text-xs tracking-wider uppercase"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {node.label}
        </span>
        <span
          className="font-sans text-[10px] ml-2"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {node.period}
        </span>
      </div>
    );
  });

  /* ---- Stream legend ---- */
  const legend = (
    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-x-4 gap-y-1 pointer-events-none">
      {STREAMS.map((s) => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}
          />
          <span
            className="font-sans text-[10px] tracking-wide"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{ height: "600vh", background: "#07070A" }}
    >
      <LabNav />
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Title */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h1
            className="font-sans text-sm tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            V5: Particle Flow
          </h1>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: dims.w, height: dims.h }}
        />

        {/* Node labels */}
        {nodeLabels}

        {/* Legend */}
        {legend}
      </div>
    </div>
  );
}
