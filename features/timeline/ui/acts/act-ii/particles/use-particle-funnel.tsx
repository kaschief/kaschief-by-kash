"use client";

/**
 * useParticleFunnel — canvas particle explosion + SVG funnel ribbons + mobile skill cards.
 *
 * SVG streams are rendered with d3.area() so adjacent streams share exact
 * mathematical edges — zero antialiasing gaps. Each stream is a single
 * continuous filled <path> from its entry tier through the merge zone.
 *
 * Owns:
 *   - Canvas particle init, resize, rAF draw loop
 *   - All funnel SVG refs (dots, ribbons, labels, nodes)
 *   - Mobile camera-track skill cards (phone only)
 *
 * Returns:
 *   update(progress) — called per scroll frame from the orchestrator
 *   jsx              — rendered inside the sticky viewport
 */

import { useRef, useEffect, useCallback, type RefObject } from "react";
import { STREAMS, NODES } from "@data";
import { smoothstep, lerp } from "../math";
import { hashToUnit, CONTENT } from "../act-ii.data";
import {
  PARTICLE,
  FUNNEL,
  MOBILE_SKILLS,
  SCROLL_PHASES,
  PARTICLE_PHASES,
  PARTICLES_START,
  CANVAS_IN_START,
  CANVAS_IN_END,
  CANVAS_OUT_START,
  CANVAS_OUT_END,
  SVG_IN_START,
  SVG_IN_END,
  DOTS_IN_START,
  DOTS_IN_END,
  LABELS_IN_START,
  LABELS_IN_END,
  RIBBON_TIERS,
  MERGE_START,
  MERGE_END,
} from "../act-ii.types";

/* ================================================================== */
/*  Particle types                                                      */
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
/*  Funnel layout constants (SVG viewBox coordinates)                   */
/* ================================================================== */

const FUNNEL_VIEWBOX_WIDTH = 1000;
const FUNNEL_VIEWBOX_HEIGHT = 800;
/** Y positions for the 5 horizontal tiers: entry + 4 company nodes */
const TIER_Y = [80, 250, 400, 550, 700] as const;
/** Half-spread of all streams at each tier (streams fan wider at top) */
const TIER_SPREAD = [400, 300, 200, 120, 60] as const;
const CENTER_X = 500;
const UNIT_W = 5;

/* Merge / column zone */
const MERGE_Y = 850; // converge sooner — right below DKB
const COLUMN_EXIT_Y = 4000; // far off-screen so braid runs into Act III
const COLUMN_W = STREAMS.reduce((sum, s) => sum + s.width * UNIT_W, 0);

/* ================================================================== */
/*  Stream geometry — compute center-x at each tier for every stream   */
/* ================================================================== */

interface TierPoint {
  y: number;
  cx: number; // center x
  hw: number; // half-width
}

/**
 * For each stream, compute an array of control points from entry → merge → exit.
 * The points define where the stream's center and half-width are at each Y tier.
 */
function computeStreamPoints(): Map<string, TierPoint[]> {
  const result = new Map<string, TierPoint[]>();
  const sorted = [...STREAMS];
  const topSpread = TIER_SPREAD[0];
  const topStep = (topSpread * 2) / (sorted.length - 1);

  for (let si = 0; si < sorted.length; si++) {
    const stream = sorted[si];
    const hw = (stream.width * UNIT_W) / 2;
    const points: TierPoint[] = [];

    // Tier 0: entry — evenly spread
    const topCX = CENTER_X - topSpread + si * topStep;
    points.push({ y: TIER_Y[0], cx: topCX, hw });

    // Tiers 1–4: company nodes
    let prevCX = topCX;
    for (let ni = 0; ni < NODES.length; ni++) {
      const tierIdx = ni + 1;
      const spread = TIER_SPREAD[tierIdx];
      const passesThrough = stream.path.includes(ni);
      const passingStreams = sorted.filter((s) => s.path.includes(ni));
      const passingIndex = passingStreams.indexOf(stream);

      let cx: number;
      if (passesThrough) {
        const step = passingStreams.length > 1
          ? (spread * 2) / (passingStreams.length - 1)
          : 0;
        cx = CENTER_X - spread + passingIndex * step;
      } else {
        cx = lerp(prevCX, CENTER_X, 0.35);
        const maxDist = spread * 1.4;
        if (Math.abs(cx - CENTER_X) > maxDist)
          cx = CENTER_X + Math.sign(cx - CENTER_X) * maxDist;
      }
      points.push({ y: TIER_Y[tierIdx], cx, hw });
      prevCX = cx;
    }

    // Merge tier: streams align into a contiguous band
    const bandLeft = CENTER_X - COLUMN_W / 2;
    let slotOffset = 0;
    for (let j = 0; j < si; j++) slotOffset += sorted[j].width * UNIT_W;
    const slotCX = bandLeft + slotOffset + hw;
    // Generous overlap (1.5 units per side) ensures solid cream with no antialiasing seams
    const mergeHW = hw + 1.5;

    // Intermediate point at y=770: 30% toward merge slot, giving a short
    // organic transition before the straight DKB→merge zone
    const intermediateCX = lerp(prevCX, slotCX, 0.3);
    const intermediateHW = lerp(hw, mergeHW, 0.3);
    points.push({ y: 770, cx: intermediateCX, hw: intermediateHW });

    points.push({ y: MERGE_Y, cx: slotCX, hw: mergeHW });

    // Column exit: same slot, straight down, same overlap
    points.push({ y: COLUMN_EXIT_Y, cx: slotCX, hw: mergeHW });

    result.set(stream.id, points);
  }
  return result;
}

const STREAM_POINTS = computeStreamPoints();
/** Top positions for canvas particle convergence targets */
const TOP_POSITIONS = STREAMS.map((s) => {
  const pt = STREAM_POINTS.get(s.id)![0];
  return { x: pt.cx, y: pt.y, w: pt.hw * 2 };
});

/* ================================================================== */
/*  Path generator — one continuous closed path per stream              */
/*  Upper tiers (0–4): bezier curves for organic feel                   */
/*  Intermediate + merge + column (5–7): straight lines for alignment   */
/* ================================================================== */

/** Index where straight-line segments begin (intermediate→merge onward).
 *  Points: 0=entry, 1-4=companies, 5=intermediate@770, 6=merge@850, 7=exit.
 *  DKB(4)→intermediate(5) uses bezier for the organic transition;
 *  intermediate(5)→merge(6)→exit(7) use straight lines for gapless edges. */
const STRAIGHT_FROM_IDX = 5;

/** How far below TIER_Y[0] the ribbon stem begins — sits just under the dot, not behind it */
const STEM_BELOW = 6;

function buildStreamPath(streamId: string): string {
  const pts = STREAM_POINTS.get(streamId)!;
  // We build a closed shape: left edge going DOWN, then right edge going UP.
  // Left edge: top-left → bottom-left (each tier's cx - hw)
  // Right edge: bottom-right → top-right (each tier's cx + hw, reversed)

  const leftDown: string[] = [];
  const rightUp: string[] = [];

  // Stem starts just below the dot so the ribbon grows downward without occluding it.
  const stem = pts[0];
  const stemY = stem.y + STEM_BELOW;
  leftDown.push(`M ${stem.cx - stem.hw} ${stemY}`);
  leftDown.push(`L ${stem.cx - stem.hw} ${stemY}`);

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const prevL = prev.cx - prev.hw;
    const currL = curr.cx - curr.hw;
    const prevR = prev.cx + prev.hw;
    const currR = curr.cx + curr.hw;

    if (i >= STRAIGHT_FROM_IDX) {
      // Merge/column zone: straight lines for flush edges
      leftDown.push(`L ${currL} ${curr.y}`);
      // Right edge (will be reversed): straight line
      rightUp.unshift(`L ${prevR} ${prev.y}`);
    } else {
      // Upper tiers: cubic bezier for organic curves
      const my = (prev.y + curr.y) / 2;
      leftDown.push(`C ${prevL} ${my}, ${currL} ${my}, ${currL} ${curr.y}`);
      rightUp.unshift(`C ${currR} ${my}, ${prevR} ${my}, ${prevR} ${prev.y}`);
    }
  }

  // Close: line from bottom-left to bottom-right, then right edge up, then stem, then close
  const last = pts[pts.length - 1];
  const pathParts = [
    ...leftDown,
    `L ${last.cx + last.hw} ${last.y}`, // bottom-left → bottom-right
    ...rightUp,
    // Right-side stem: from tier-0 right back up to stem start
    `L ${stem.cx + stem.hw} ${stemY}`,
    `Z`,
  ];

  return pathParts.join(" ");
}

/** Pre-computed area paths for all streams */
const STREAM_PATHS = STREAMS.map((s) => ({
  id: s.id,
  color: s.color,
  path: buildStreamPath(s.id),
}));

/* ================================================================== */
/*  Canvas → SVG coordinate mapping                                    */
/* ================================================================== */

function svgToPixel(
  sx: number,
  sy: number,
  svgRect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  const scale = Math.min(
    svgRect.width / FUNNEL_VIEWBOX_WIDTH,
    svgRect.height / FUNNEL_VIEWBOX_HEIGHT,
  );
  const renderedW = FUNNEL_VIEWBOX_WIDTH * scale;
  const renderedH = FUNNEL_VIEWBOX_HEIGHT * scale;
  const offX = svgRect.left + (svgRect.width - renderedW) / 2;
  const offY = svgRect.top + (svgRect.height - renderedH) / 2;
  return { px: offX + sx * scale, py: offY + sy * scale };
}

/* ================================================================== */
/*  Canvas particles                                                    */
/* ================================================================== */

function initParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let streamIndex = 0; streamIndex < STREAMS.length; streamIndex++) {
    for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
      const seed = streamIndex * 100 + i;
      const baseAngle = (streamIndex / STREAMS.length) * Math.PI * 2;
      particles.push({
        streamIdx: streamIndex,
        angle: baseAngle + (hashToUnit(seed + 10) - 0.5) * PARTICLE.angleSpread,
        radius: PARTICLE.radiusMin + hashToUnit(seed + 11) * PARTICLE.radiusRange,
        size: PARTICLE.sizeMin + hashToUnit(seed + 1) * PARTICLE.sizeRange,
        color: STREAMS[streamIndex].color,
      });
    }
  }
  return particles;
}

/* ================================================================== */
/*  Hook                                                                */
/* ================================================================== */

interface ParticleFunnelOptions {
  isLgRef: RefObject<boolean>;
}

export function useParticleFunnel({ isLgRef: isLg }: ParticleFunnelOptions) {
  /* ---- Canvas refs ---- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const particleProgressRef = useRef(0);
  const particleAnimating = useRef(false);
  const particleFrameId = useRef<number>(0);
  const drawParticles = useRef<() => void>(() => {});
  const sizeRef = useRef({ w: 0, h: 0 });
  const particlesRef = useRef<Particle[]>(initParticles());

  /* ---- Funnel SVG refs ---- */
  const funnelSvgWrapRef = useRef<HTMLDivElement>(null);
  const funnelSvgRef = useRef<SVGSVGElement>(null);
  const svgRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const funnelDotRefs = useRef<(SVGGElement | null)[]>([]);
  /** One ref per stream — single continuous d3.area path */
  const streamPathRefs = useRef<(SVGPathElement | null)[]>([]);
  /** Per-stream clip rects (SVG <rect> inside <clipPath>) for viewBox-space clipping */
  const streamClipRectRefs = useRef<(SVGRectElement | null)[]>([]);
  const funnelStreamLabelRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const mergeTextLeftRef = useRef<HTMLDivElement>(null);
  const mergeTextRightRef = useRef<HTMLDivElement>(null);

  /* ---- Mobile camera-track refs ---- */
  const cameraTrackRef = useRef<HTMLDivElement>(null);
  const cameraSkillRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  /* ---- Particle animation loop ---- */
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

      if (progress <= 0 || progress > PARTICLE_PHASES.FADE_OUT[1]) {
        particleAnimating.current = false;
        return;
      }

      const centerX = viewportW * 0.5,
        centerY = viewportH * 0.5;
      const particles = particlesRef.current;
      const minDim = Math.min(viewportW, viewportH);

      // Lazy re-measure: SVG may not have been laid out when handleResize ran on mount
      if (svgRectRef.current.width === 0 && funnelSvgRef.current) {
        const r = funnelSvgRef.current.getBoundingClientRect();
        svgRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
      }

      for (const particle of particles) {
        const target = TOP_POSITIONS[particle.streamIdx];
        const { px: targetX, py: targetY } = svgToPixel(
          target.x,
          target.y,
          svgRectRef.current,
        );

        let dotX: number, dotY: number, alpha: number;

        if (progress < PARTICLE_PHASES.EXPLODE[1]) {
          const explodeT = smoothstep(PARTICLE_PHASES.EXPLODE[0], PARTICLE_PHASES.EXPLODE[1], progress);
          const eased = 1 - (1 - explodeT) * (1 - explodeT);
          const dist = particle.radius * minDim * eased;
          dotX = centerX + Math.cos(particle.angle) * dist;
          dotY = centerY + Math.sin(particle.angle) * dist;
          alpha = smoothstep(0, PARTICLE.appearDur, progress);
        } else {
          const convergeT = smoothstep(PARTICLE_PHASES.CONVERGE[0], PARTICLE_PHASES.CONVERGE[1], progress);
          const eased = convergeT * convergeT * (3 - 2 * convergeT);
          const dist = particle.radius * minDim;
          const explodedX = centerX + Math.cos(particle.angle) * dist;
          const explodedY = centerY + Math.sin(particle.angle) * dist;
          dotX = lerp(explodedX, targetX, eased);
          dotY = lerp(explodedY, targetY, eased);
          alpha = 1 - smoothstep(PARTICLE_PHASES.FADE_OUT[0], PARTICLE_PHASES.FADE_OUT[1], progress);
        }

        if (alpha <= PARTICLE.alphaCutoff) continue;

        const convergeT = smoothstep(PARTICLE_PHASES.CONVERGE[0], PARTICLE_PHASES.CONVERGE[1], progress);
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
  /*  update(progress) — called per scroll frame                        */
  /* ================================================================ */

  function update(progress: number) {
    const isDesktop = isLg.current;

    /* ---- Canvas particles: full range → local 0-1 ---- */
    const PART_START = SCROLL_PHASES.PARTICLES.start,
      PART_END = SCROLL_PHASES.PARTICLES.end;
    const particleProgress = Math.max(
      0,
      Math.min(1, (progress - PART_START) / (PART_END - PART_START)),
    );
    particleProgressRef.current = particleProgress;

    if (particleProgress > 0 && particleProgress <= PARTICLE_PHASES.FADE_OUT[1] && !particleAnimating.current) {
      particleAnimating.current = true;
      particleFrameId.current = requestAnimationFrame(drawParticles.current);
    }

    /* ---- Canvas + SVG crossfade ---- */
    if (canvasWrapRef.current) {
      const canvasIn = smoothstep(CANVAS_IN_START, CANVAS_IN_END, progress);
      const canvasOut = 1 - smoothstep(CANVAS_OUT_START, CANVAS_OUT_END, progress);
      canvasWrapRef.current.style.opacity = String(canvasIn * canvasOut);
    }

    if (funnelSvgWrapRef.current) {
      const svgIn = smoothstep(SVG_IN_START, SVG_IN_END, progress);
      funnelSvgWrapRef.current.style.opacity = String(svgIn);
    }

    /* ---- Camera: follow the braid downward like tracking a brush stroke ---- */
    if (funnelSvgRef.current) {
      const camT = smoothstep(RIBBON_TIERS[3].start, MERGE_END, progress);
      const eased = camT * camT * (3 - 2 * camT);
      // Pan: viewBox Y drifts downward, following the converging streams
      // The "window" tracks the braid as it forms and exits downward
      const panY = lerp(0, MERGE_Y, eased); // follow down past braid, pushing color off top
      // Narrow: width tightens toward the braid center
      const narrowW = lerp(FUNNEL_VIEWBOX_WIDTH, 400, eased);
      const narrowX = lerp(0, CENTER_X - 200, eased); // keep centered
      // Height tightens vertically to frame the braid
      const narrowH = lerp(FUNNEL_VIEWBOX_HEIGHT, 500, eased);
      funnelSvgRef.current.setAttribute(
        "viewBox",
        `${narrowX} ${panY} ${narrowW} ${narrowH}`,
      );
    }

    /* ---- SVG dots ---- */
    for (let si = 0; si < STREAMS.length; si++) {
      const el = funnelDotRefs.current[si];
      if (!el) continue;
      const stagger = si * FUNNEL.dotStagger;
      const dotIn = smoothstep(DOTS_IN_START + stagger, DOTS_IN_END + stagger, progress);
      const ribbonStart = smoothstep(RIBBON_TIERS[0].start, RIBBON_TIERS[0].end, progress);
      const scale = lerp(FUNNEL.dotScaleStart, FUNNEL.dotScaleEnd, ribbonStart);
      const glowR = lerp(FUNNEL.dotGlowStart, FUNNEL.dotGlowEnd, ribbonStart);
      el.style.opacity = String(dotIn);
      el.style.transform = `scale(${dotIn > 0 ? scale : 0})`;
      const blur = el.querySelector("feGaussianBlur");
      if (blur) blur.setAttribute("stdDeviation", String(glowR));
    }

    /* ---- Stream labels ---- */
    for (let si = 0; si < STREAMS.length; si++) {
      const el = funnelStreamLabelRefs.current[si];
      if (!el) continue;
      const stagger = si * FUNNEL.labelStagger;
      const labelIn = smoothstep(
        LABELS_IN_START + stagger,
        LABELS_IN_END + stagger,
        progress,
      );
      el.style.opacity = String(labelIn);
      el.style.transform = `translateY(${lerp(FUNNEL.labelSlideY, 0, labelIn)}px)`;
    }

    /* ---- Stream paths — staggered organic reveal ---- */
    /*
     * Each stream gets a seeded stagger offset so they grow at slightly
     * different speeds — like free animals in a flock, not a marching grid.
     * All start near tier 0 but some push ahead, others lag a beat.
     * Streams are skills, not company-owned; path only determines routing.
     */
    {
      // Per-tier smoothstep chain. RIBBON_TIERS are contiguous
      // (tier[0].end === tier[1].start) so there are no gaps.
      const tierYs: number[] = [TIER_Y[0], ...TIER_Y.slice(1), MERGE_Y, COLUMN_EXIT_Y];
      const thresholds = [
        ...RIBBON_TIERS.map((t) => ({ start: t.start, end: t.end })),
        { start: MERGE_START, end: lerp(MERGE_START, MERGE_END, 0.7) },
        { start: lerp(MERGE_START, MERGE_END, 0.5), end: MERGE_END },
      ];

      const clipTop = TIER_Y[0] + STEM_BELOW - 1; // just below dot
      const STAGGER_RANGE = 0.004;

      for (let si = 0; si < STREAMS.length; si++) {
        const el = streamPathRefs.current[si];
        const clipRect = streamClipRectRefs.current[si];
        if (!el) continue;

        // Per-stream progress offset — some lead, some trail
        const staggerOffset = (hashToUnit(si * 137 + 29) - 0.5) * 2 * STAGGER_RANGE;
        // Stagger fades out approaching merge — streams converge into lockstep
        const mergeBlend = smoothstep(MERGE_START, lerp(MERGE_START, MERGE_END, 0.3), progress);
        const sp = progress + staggerOffset * (1 - mergeBlend);

        // Each stream evaluates the threshold chain at its own staggered progress
        let clipBottom: number = TIER_Y[0];
        for (let ti = 0; ti < thresholds.length; ti++) {
          const { start, end } = thresholds[ti];
          // Stagger ribbon tiers, raw progress for merge (must converge together)
          const p = ti < RIBBON_TIERS.length ? sp : progress;
          const t = smoothstep(start, end, p);
          if (t > 0) clipBottom = Math.max(clipBottom, lerp(tierYs[ti], tierYs[ti + 1], t));
        }

        // Entry: ribbon grows from dot row during first tier
        const entryT = smoothstep(RIBBON_TIERS[0].start, RIBBON_TIERS[0].end, sp);

        if (entryT <= 0) {
          el.style.opacity = "0";
          if (clipRect) clipRect.setAttribute("height", "0");
          continue;
        }

        const streamClipBottom = entryT < 1
          ? lerp(TIER_Y[0], clipBottom, entryT)
          : clipBottom;

        if (clipRect) {
          clipRect.setAttribute("y", String(clipTop));
          clipRect.setAttribute("height", String(Math.max(0, streamClipBottom - clipTop)));
        }
        el.style.opacity = "1";
      }
    }

    /* ---- Company nodes ---- */
    for (let ni = 0; ni < NODES.length; ni++) {
      const el = funnelNodeRefs.current[ni];
      if (!el) continue;
      const { start, end } = RIBBON_TIERS[ni];
      const nodeT = smoothstep(lerp(start, end, FUNNEL.nodeAppearFrac), end, progress);
      el.style.opacity = String(nodeT);
      el.style.transform = `translateY(${lerp(FUNNEL.nodeSlideY, 0, nodeT)}px)`;
    }

    /* ---- Flanking text — fades in during merge, survives the scroll (no fade-out) ---- */
    const textFadeIn = smoothstep(MERGE_START, lerp(MERGE_START, MERGE_END, 0.6), progress);
    const textParallax = smoothstep(RIBBON_TIERS[3].start, MERGE_END, progress);
    const textDriftY = lerp(20, -10, textParallax);
    if (mergeTextLeftRef.current) {
      mergeTextLeftRef.current.style.opacity = String(textFadeIn);
      mergeTextLeftRef.current.style.transform = `translateY(calc(-50% + ${textDriftY}px)) translateX(${lerp(-40, 0, textFadeIn)}px)`;
    }
    if (mergeTextRightRef.current) {
      mergeTextRightRef.current.style.opacity = String(textFadeIn);
      mergeTextRightRef.current.style.transform = `translateY(calc(-50% + ${textDriftY + 15}px)) translateX(${lerp(40, 0, textFadeIn)}px)`;
    }

    /* ---- Mobile camera-track (phone only) ---- */
    if (!isDesktop) {
      if (cameraTrackRef.current) {
        const trackAppear = smoothstep(PARTICLES_START, PARTICLES_START + MOBILE_SKILLS.appearDur, progress);
        cameraTrackRef.current.style.opacity = String(trackAppear);
      }
      const SKILL_TIER_STARTS = RIBBON_TIERS.map((t) => t.start);
      for (let si = 0; si < STREAMS.length; si++) {
        const el = cameraSkillRefs.current[si];
        if (!el) continue;
        const firstTier = STREAMS[si].path[0];
        const stagger = si * MOBILE_SKILLS.skillStagger;
        const tierStart = SKILL_TIER_STARTS[firstTier] + stagger;
        const skillFadeIn = smoothstep(tierStart, tierStart + MOBILE_SKILLS.skillFadeDur, progress);
        const fromLeft = si % 2 === 0;
        const slideX = lerp(fromLeft ? -MOBILE_SKILLS.skillSlideX : MOBILE_SKILLS.skillSlideX, 0, skillFadeIn);
        const scale = lerp(MOBILE_SKILLS.skillScaleStart, 1, skillFadeIn);
        el.style.opacity = String(Math.max(0, skillFadeIn));
        el.style.transform = `translateX(${slideX}px) scale(${scale})`;
      }
    }
  }

  /* ================================================================ */
  /*  JSX                                                               */
  /* ================================================================ */

  const jsx = (
    <>
      {/* Particle canvas — hidden on phone */}
      <div
        ref={canvasWrapRef}
        className="absolute inset-0 hidden sm:block"
        style={{ opacity: 0, zIndex: 5 }}>
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* Funnel SVG — hidden on phone */}
      <div
        ref={funnelSvgWrapRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none hidden sm:flex"
        style={{ opacity: 0, zIndex: 6, padding: "5vh 4vw" }}>
        <svg
          ref={funnelSvgRef}
          viewBox={`0 0 ${FUNNEL_VIEWBOX_WIDTH} ${FUNNEL_VIEWBOX_HEIGHT}`}
          className="max-w-300"
          preserveAspectRatio="xMidYMid meet"
          style={{
            overflow: "visible",
            width: "100%",
            height: "100%",
            maxHeight: "80vh",
          }}>
          <defs>
            {/* Per-stream gradient: full color → cream at merge zone */}
            {STREAMS.map((s) => (
              <linearGradient
                key={`fgrad-${s.id}`}
                id={`fgrad-${s.id}`}
                x1="0"
                y1={TIER_Y[0]}
                x2="0"
                y2={MERGE_Y + 200}
                gradientUnits="userSpaceOnUse">
                {/* Full company color for first 80%, cross-fade to cream at full opacity — no dark bleed */}
                <stop offset="0%" stopColor={s.color} stopOpacity={0.9} />
                <stop offset="50%" stopColor={s.color} stopOpacity={1} />
                <stop offset="78%" stopColor={s.color} stopOpacity={1} />
                <stop offset="88%" stopColor="#F0E6D0" stopOpacity={1} />
                <stop offset="100%" stopColor="#F0E6D0" stopOpacity={1} />
              </linearGradient>
            ))}
            {/* Per-stream clip paths — userSpaceOnUse so coordinates match viewBox */}
            {STREAMS.map((_, si) => (
              <clipPath key={`sclip-${si}`} id={`sclip-${si}`} clipPathUnits="userSpaceOnUse">
                <rect
                  ref={(el) => { streamClipRectRefs.current[si] = el; }}
                  x="0"
                  y={TIER_Y[0] + STEM_BELOW - 1}
                  width={FUNNEL_VIEWBOX_WIDTH * 2}
                  height="0"
                />
              </clipPath>
            ))}
            {/* Stream gradients handle the full color → cream transition; no separate column gradient */}
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
                ref={(element) => {
                  funnelBlurRef.current = element;
                }}
                in="SourceGraphic"
                stdDeviation="0"
              />
            </filter>
          </defs>

          {/* D3 area paths — one continuous shape per stream */}
          {STREAM_PATHS.map((sp, si) => (
            <path
              key={`stream-${sp.id}`}
              ref={(el) => { streamPathRefs.current[si] = el; }}
              d={sp.path}
              fill={`url(#fgrad-${sp.id})`}
              stroke="none"
              opacity={0}
              clipPath={`url(#sclip-${si})`}
              style={{ willChange: "opacity" }}
            />
          ))}

          {/* No separate merged column rect — stream gradients handle the cream transition */}

          {/* Company node lines + labels */}
          {NODES.map((node, ni) => {
            const y = TIER_Y[ni + 1];
            const spread = TIER_SPREAD[ni + 1];
            return (
              <g
                key={`fnode-${node.id}`}
                ref={(el) => { funnelNodeRefs.current[ni] = el; }}
                opacity={0}>
                <line
                  x1={CENTER_X - spread - 40}
                  y1={y}
                  x2={CENTER_X + spread + 40}
                  y2={y}
                  stroke={node.color}
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={CENTER_X - spread - 52}
                  y={y - 12}
                  textAnchor="end"
                  className="font-sans"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                  fill={node.color}
                  fillOpacity={0.9}>
                  {node.label}
                </text>
                <text
                  x={CENTER_X - spread - 52}
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

          {/* Top dots (glow + core + bright center) */}
          {STREAMS.map((stream, si) => {
            const pt = STREAM_POINTS.get(stream.id)![0];
            return (
              <g
                key={`fdot-${stream.id}`}
                ref={(el) => { funnelDotRefs.current[si] = el; }}
                opacity={0}
                style={{ transformOrigin: `${pt.cx}px ${pt.y}px` }}>
                <circle
                  cx={pt.cx}
                  cy={pt.y}
                  r={5}
                  fill={stream.color}
                  filter={`url(#wsdot-${si})`}
                  opacity={0.6}
                />
                <circle cx={pt.cx} cy={pt.y} r={3.5} fill={stream.color} />
                <circle
                  cx={pt.cx}
                  cy={pt.y}
                  r={1.5}
                  fill="white"
                  opacity={0.5}
                />
              </g>
            );
          })}

          {/* Top stream labels */}
          {STREAMS.map((stream, si) => {
            const pt = STREAM_POINTS.get(stream.id)![0];
            return (
              <g
                key={`flabel-${stream.id}`}
                ref={(el) => { funnelStreamLabelRefs.current[si] = el; }}
                opacity={0}>
                <text
                  x={pt.cx}
                  y={pt.y - 16}
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
        </svg>
      </div>

      {/* Flanking text — left */}
      <div
        ref={mergeTextLeftRef}
        className="absolute pointer-events-none hidden sm:block"
        style={{
          right: "calc(50% + 120px)",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "min(320px, 26vw)",
          opacity: 0,
          willChange: "transform, opacity",
          textAlign: "right",
          zIndex: 10,
        }}>
        <p
          className="font-serif"
          style={{
            fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
            lineHeight: 1.6,
            color: "#F0E6D0",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}>
          {CONTENT.merge.left}
        </p>
      </div>

      {/* Flanking text — right (staggered lower) */}
      <div
        ref={mergeTextRightRef}
        className="absolute pointer-events-none hidden sm:block"
        style={{
          left: "calc(50% + 120px)",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "min(320px, 26vw)",
          opacity: 0,
          willChange: "transform, opacity",
          textAlign: "left",
          zIndex: 10,
        }}>
        <p
          className="font-serif"
          style={{
            fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
            lineHeight: 1.6,
            color: "#F0E6D0",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}>
          {CONTENT.merge.right}
        </p>
      </div>

      {/* Mobile skill convergence — phone only, replaces SVG funnel */}
      <div
        ref={cameraTrackRef}
        className="absolute inset-0 sm:hidden pointer-events-none"
        style={{ opacity: 0, zIndex: 6 }}>
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
        </div>
      </div>
    </>
  );

  return { update, jsx };
}
