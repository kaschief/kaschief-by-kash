"use client";

/**
 * V8: Particles → Dots → Ribbons + Narrative Captions
 *
 * V7 + scroll-triggered storytelling captions per stream/company.
 * Captions appear as ribbons reach each company tier.
 */

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { STREAMS, NODES, smoothstep, lerp } from "../forge-sankey-data";
import { ForgeNav } from "../forge-nav";

/* ================================================================== */
/*  Layout                                                              */
/* ================================================================== */

const VW = 1000, VH = 800;
const TIER_Y = [80, 250, 400, 550, 700] as const;
const CONVERGE_Y = 760;
const TIER_SPREAD = [400, 300, 200, 120, 60] as const;
const CX = 500;
const UW = 4;

/* ================================================================== */
/*  Stream positions                                                    */
/* ================================================================== */

interface TierPos { x: number; y: number; w: number }

function computePositions(): Map<string, TierPos[]> {
  const result = new Map<string, TierPos[]>();
  const sorted = [...STREAMS];
  const topSpread = TIER_SPREAD[0];
  const topStep = (topSpread * 2) / (sorted.length - 1);
  for (let si = 0; si < sorted.length; si++) {
    const stream = sorted[si];
    const positions: TierPos[] = [];
    const w = stream.width * UW;
    const topX = CX - topSpread + si * topStep;
    positions.push({ x: topX, y: TIER_Y[0], w });
    let prevX = topX;
    for (let ni = 0; ni < NODES.length; ni++) {
      const spread = TIER_SPREAD[ni + 1];
      const passesThrough = stream.path.includes(ni);
      const passingStreams = sorted.filter((s) => s.path.includes(ni));
      const passingIndex = passingStreams.indexOf(stream);
      let x: number;
      if (passesThrough) {
        const step = passingStreams.length > 1 ? (spread * 2) / (passingStreams.length - 1) : 0;
        x = CX - spread + passingIndex * step;
      } else {
        x = lerp(prevX, CX, 0.35);
        const maxDist = spread * 1.4;
        if (Math.abs(x - CX) > maxDist) x = CX + Math.sign(x - CX) * maxDist;
      }
      positions.push({ x, y: TIER_Y[ni + 1], w });
      prevX = x;
    }
    result.set(stream.id, positions);
  }
  return result;
}

const POS = computePositions();
const TOP_POSITIONS = STREAMS.map((s) => POS.get(s.id)![0]);

/* ================================================================== */
/*  Ribbon segments                                                     */
/* ================================================================== */

interface Seg { streamId: string; color: string; fromTier: number; toTier: number; path: string; opEnd: number }

function buildSegments(): Seg[] {
  const segs: Seg[] = [];
  for (const stream of STREAMS) {
    const positions = POS.get(stream.id)!;
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
      segs.push({ streamId: stream.id, color: stream.color, fromTier: i, toTier: i + 1, path, opEnd: 0.4 + (i + 1) * 0.1 });
    }
  }
  return segs;
}

const SEGS = buildSegments();

/* ================================================================== */
/*  Narrative captions per company tier                                 */
/* ================================================================== */

const TIER_CAPTIONS: { company: string; caption: string; color: string }[] = [
  {
    company: "AMBOSS",
    caption: "The user is never an abstraction. The moment you treat them like one, the product starts lying to people.",
    color: NODES[0].color,
  },
  {
    company: "Compado",
    caption: "Load time is not a metric. It is a user\u2019s first impression of whether you respect their time.",
    color: NODES[1].color,
  },
  {
    company: "CAPinside",
    caption: "A codebase is a record of a team\u2019s habits. If you want to change the code, you have to change how the team works.",
    color: NODES[2].color,
  },
  {
    company: "DKB",
    caption: "At a certain scale, the highest-leverage thing an engineer can do is make the right decision obvious.",
    color: NODES[3].color,
  },
];

/* ================================================================== */
/*  Particles                                                           */
/* ================================================================== */

function srand(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

interface Particle { streamIdx: number; angle: number; radius: number; size: number; color: string }

const PARTICLES_PER_STREAM = 12;

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

const PARTICLES = initParticles();

/* ================================================================== */
/*  Phases                                                              */
/* ================================================================== */

const PH = {
  EXPLODE:     [0.00, 0.06],
  CONVERGE:    [0.06, 0.12],
  HANDOFF:     [0.10, 0.14],
  LABELS:      [0.12, 0.18],
  TIER_1:      [0.18, 0.34],
  TIER_2:      [0.32, 0.52],
  TIER_3:      [0.50, 0.68],
  TIER_4:      [0.66, 0.84],
  CONVERGE_PT: [0.82, 0.96],
} as const;

const TIER_PHASES = [PH.TIER_1, PH.TIER_2, PH.TIER_3, PH.TIER_4];

/* ================================================================== */
/*  SVG↔Canvas coordinate mapping                                      */
/* ================================================================== */

function svgToPixel(
  sx: number, sy: number,
  svgRect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  const scale = Math.min(svgRect.width / VW, svgRect.height / VH);
  const renderedW = VW * scale, renderedH = VH * scale;
  const offX = svgRect.left + (svgRect.width - renderedW) / 2;
  const offY = svgRect.top + (svgRect.height - renderedH) / 2;
  return { px: offX + sx * scale, py: offY + sy * scale };
}

/* ================================================================== */
/*  Component                                                           */
/* ================================================================== */

export default function ForgeTestV8() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGGElement | null)[]>([]);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const convergeRef = useRef<SVGGElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const progressRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleResize = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight;
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
    if (svgRef.current) {
      const r = svgRef.current.getBoundingClientRect();
      svgRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  }, []);

  /* ---- Canvas draw loop ---- */
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    let rafId: number;

    function draw() {
      const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) { rafId = requestAnimationFrame(draw); return; }
      const { w, h } = sizeRef.current;
      if (w === 0) { rafId = requestAnimationFrame(draw); return; }

      const p = progressRef.current;
      ctx.clearRect(0, 0, w, h);
      if (p > PH.HANDOFF[1]) { rafId = requestAnimationFrame(draw); return; }

      const centerX = w * 0.5, centerY = h * 0.5;

      for (const particle of PARTICLES) {
        const si = particle.streamIdx;
        const target = TOP_POSITIONS[si];
        const { px: targetX, py: targetY } = svgToPixel(target.x, target.y, svgRectRef.current);

        let px: number, py: number, alpha: number;

        if (p < PH.EXPLODE[1]) {
          const t = smoothstep(PH.EXPLODE[0], PH.EXPLODE[1], p);
          const eased = 1 - (1 - t) * (1 - t);
          const dist = particle.radius * Math.min(w, h) * eased;
          px = centerX + Math.cos(particle.angle) * dist;
          py = centerY + Math.sin(particle.angle) * dist;
          alpha = smoothstep(0, 0.015, p);
        } else {
          const t = smoothstep(PH.CONVERGE[0], PH.CONVERGE[1], p);
          const eased = t * t * (3 - 2 * t);
          const dist = particle.radius * Math.min(w, h);
          const explodedX = centerX + Math.cos(particle.angle) * dist;
          const explodedY = centerY + Math.sin(particle.angle) * dist;
          px = lerp(explodedX, targetX, eased);
          py = lerp(explodedY, targetY, eased);
          alpha = 1 - smoothstep(PH.HANDOFF[0], PH.HANDOFF[1], p);
        }

        if (alpha <= 0.01) continue;

        const convergeT = smoothstep(PH.CONVERGE[0], PH.CONVERGE[1], p);
        const size = lerp(particle.size, particle.size * 0.6, convergeT);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fill();

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
    return () => { window.removeEventListener("resize", handleResize); cancelAnimationFrame(rafId); };
  }, [handleResize]);

  /* ---- Scroll update ---- */
  const update = useCallback((p: number) => {
    progressRef.current = p;

    if (canvasWrapRef.current) {
      const fadeOut = 1 - smoothstep(PH.HANDOFF[0], PH.HANDOFF[1], p);
      canvasWrapRef.current.style.opacity = String(fadeOut);
    }

    // SVG Dots
    for (let si = 0; si < STREAMS.length; si++) {
      const el = dotRefs.current[si];
      if (!el) continue;
      const stagger = si * 0.003;
      const t = smoothstep(PH.HANDOFF[0] + stagger, PH.HANDOFF[1] + stagger, p);
      const ribbonStart = smoothstep(PH.TIER_1[0], PH.TIER_1[0] + 0.06, p);
      const scale = lerp(2, 1, ribbonStart);
      const glowR = lerp(6, 3, ribbonStart);
      el.style.opacity = String(t);
      el.style.transform = `scale(${t > 0 ? scale : 0})`;
      const blur = el.querySelector("feGaussianBlur");
      if (blur) blur.setAttribute("stdDeviation", String(glowR));
    }

    // Labels
    for (let si = 0; si < STREAMS.length; si++) {
      const el = labelRefs.current[si];
      if (!el) continue;
      const stagger = si * 0.004;
      const t = smoothstep(PH.LABELS[0] + stagger, PH.LABELS[1] + stagger, p);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${lerp(-10, 0, t)}px)`;
    }

    // Ribbon segments
    for (let i = 0; i < SEGS.length; i++) {
      const el = segRefs.current[i];
      if (!el) continue;
      const seg = SEGS[i];
      const tierIdx = seg.toTier - 1;
      const [phaseStart, phaseEnd] = TIER_PHASES[tierIdx];
      const t = smoothstep(phaseStart, phaseEnd, p);
      el.style.opacity = String(lerp(0, seg.opEnd, t));
      el.style.transformOrigin = `${CX}px ${TIER_Y[seg.fromTier]}px`;
      el.style.transform = `scaleY(${t})`;
    }

    // Company nodes
    for (let ni = 0; ni < NODES.length; ni++) {
      const el = nodeRefs.current[ni];
      if (!el) continue;
      const [phaseStart, phaseEnd] = TIER_PHASES[ni];
      const t = smoothstep(lerp(phaseStart, phaseEnd, 0.4), lerp(phaseStart, phaseEnd, 0.8), p);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${lerp(8, 0, t)}px)`;
    }

    // Narrative captions — appear as ribbons reach each tier, hold, then fade
    for (let ni = 0; ni < TIER_CAPTIONS.length; ni++) {
      const el = captionRefs.current[ni];
      if (!el) continue;
      const [phaseStart, phaseEnd] = TIER_PHASES[ni];
      const fadeIn = smoothstep(lerp(phaseStart, phaseEnd, 0.3), lerp(phaseStart, phaseEnd, 0.5), p);
      const fadeOut = 1 - smoothstep(lerp(phaseStart, phaseEnd, 0.85), phaseEnd + 0.02, p);
      el.style.opacity = String(fadeIn * fadeOut);
      el.style.transform = `translateY(${lerp(12, 0, fadeIn)}px)`;
    }

    // Convergence
    if (convergeRef.current) {
      const t = smoothstep(PH.CONVERGE_PT[0], PH.CONVERGE_PT[1], p);
      convergeRef.current.style.opacity = String(t);
      if (blurRef.current) blurRef.current.setAttribute("stdDeviation", String(lerp(0, 12, t)));
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", update);
  useEffect(() => { update(0); }, [update]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "700vh", background: "var(--bg, #07070A)" }}>
      <ForgeNav />

      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Canvas */}
        <div ref={canvasWrapRef} className="absolute inset-0" style={{ zIndex: 1 }}>
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>

        {/* SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full h-full max-w-300 relative"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible", zIndex: 2 }}>
          <defs>
            {STREAMS.map((s) => (
              <linearGradient key={`g-${s.id}`} id={`v8g-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.8} />
              </linearGradient>
            ))}
            {STREAMS.map((_, si) => (
              <filter key={`df-${si}`} id={`v8dot-${si}`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
              </filter>
            ))}
            <filter id="v8-gold-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur ref={(el) => { blurRef.current = el; }} in="SourceGraphic" stdDeviation="0" />
            </filter>
          </defs>

          {/* Ribbon segments */}
          {SEGS.map((seg, i) => (
            <path
              key={`seg-${seg.streamId}-${seg.toTier}`}
              ref={(el) => { segRefs.current[i] = el; }}
              d={seg.path}
              fill={`url(#v8g-${seg.streamId})`}
              opacity={0}
              style={{ willChange: "opacity, transform" }}
            />
          ))}

          {/* Company nodes */}
          {NODES.map((node, ni) => {
            const y = TIER_Y[ni + 1];
            const spread = TIER_SPREAD[ni + 1];
            return (
              <g key={`node-${node.id}`} ref={(el) => { nodeRefs.current[ni] = el; }} opacity={0}>
                <line x1={CX - spread - 40} y1={y} x2={CX + spread + 40} y2={y} stroke={node.color} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="4 6" />
                <text x={CX - spread - 52} y={y - 12} textAnchor="end" className="font-sans" style={{ fontSize: "11px", fontWeight: 600 }} fill={node.color} fillOpacity={0.85}>{node.label}</text>
                <text x={CX - spread - 52} y={y + 6} textAnchor="end" className="font-sans" style={{ fontSize: "8px" }} fill="#8A8478" fillOpacity={0.6}>{node.period}</text>
                <circle cx={CX} cy={y} r={3} fill={node.color} fillOpacity={0.5} />
              </g>
            );
          })}

          {/* Top dots */}
          {STREAMS.map((stream, si) => {
            const pos = POS.get(stream.id)![0];
            return (
              <g key={`dot-${stream.id}`} ref={(el) => { dotRefs.current[si] = el; }} opacity={0} style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}>
                <circle cx={pos.x} cy={pos.y} r={5} fill={stream.color} filter={`url(#v8dot-${si})`} opacity={0.6} />
                <circle cx={pos.x} cy={pos.y} r={3.5} fill={stream.color} />
                <circle cx={pos.x} cy={pos.y} r={1.5} fill="white" opacity={0.5} />
              </g>
            );
          })}

          {/* Labels */}
          {STREAMS.map((stream, si) => {
            const pos = POS.get(stream.id)![0];
            return (
              <g key={`label-${stream.id}`} ref={(el) => { labelRefs.current[si] = el; }} opacity={0}>
                <text x={pos.x} y={pos.y - 22} textAnchor="middle" className="font-sans" style={{ fontSize: "9px", letterSpacing: "0.04em", fontWeight: 500 }} fill={stream.color} fillOpacity={0.9}>{stream.label}</text>
              </g>
            );
          })}

          {/* Convergence point */}
          <g ref={(el) => { convergeRef.current = el; }} opacity={0}>
            <circle cx={CX} cy={CONVERGE_Y} r={6} fill="#C9A84C" filter="url(#v8-gold-glow)" />
            <circle cx={CX} cy={CONVERGE_Y} r={3} fill="#F0E6D0" />
            <line x1={CX - 50} y1={CONVERGE_Y} x2={CX - 8} y2={CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.3} strokeWidth={0.5} />
            <line x1={CX + 8} y1={CONVERGE_Y} x2={CX + 50} y2={CONVERGE_Y} stroke="#C9A84C" strokeOpacity={0.3} strokeWidth={0.5} />
            <text x={CX} y={CONVERGE_Y + 24} textAnchor="middle" className="font-serif" style={{ fontSize: "13px", letterSpacing: "0.04em" }} fill="#F0E6D0">The Engineer I Became</text>
          </g>
        </svg>

        {/* Narrative captions — centered in each tier's row area */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {TIER_CAPTIONS.map((cap, ni) => {
            // Position each caption at the vertical center of its tier row
            // TIER_Y in SVG coords: [80, 250, 400, 550, 700]
            // Midpoint between tier ni+1 and tier ni+2 (or converge)
            const tierTopFrac = [0.20, 0.38, 0.54, 0.72][ni]; // approximate screen fractions
            return (
              <div
                key={`caption-${ni}`}
                ref={(el) => { captionRefs.current[ni] = el; }}
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
                <span
                  className="font-serif block"
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "var(--cream, #F0E6D0)",
                    opacity: 0.85,
                  }}>
                  {cap.caption}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
