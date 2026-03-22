"use client";

/**
 * useParticleFunnel — canvas particle explosion + SVG funnel ribbons + mobile skill cards.
 *
 * Owns:
 *   - Canvas particle init, resize, rAF draw loop
 *   - All funnel SVG refs (dots, ribbons, labels, nodes, convergence diamond)
 *   - Narrator glass panels (right side, tied to funnel tiers)
 *   - Mobile camera-track skill cards (phone only)
 *   - Mid-narrator transition text
 *
 * Returns:
 *   update(progress) — called per scroll frame from the orchestrator
 *   jsx           — rendered inside the sticky viewport
 */

import { useRef, useEffect, useCallback, type RefObject } from "react";
import { STREAMS, NODES } from "../sankey-data";
import { smoothstep, lerp } from "./math";
import { hashToUnit, CONTENT } from "./engineer-data";
import {
  PARTICLE,
  FUNNEL,
  MOBILE_SKILLS,
  MID_NARRATOR,
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
  CONVERGE_PT_START,
  CONVERGE_PT_END,
  FUNNEL_OUT_END,
  NARRATOR_TIERS,
  MID_NARRATOR_START,
  MID_NARRATOR_END,
} from "./engineer-candidate.types";

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
/*  Funnel layout (SVG viewBox coordinates)                             */
/* ================================================================== */

const FUNNEL_VIEWBOX_WIDTH = 1000,
  FUNNEL_VIEWBOX_HEIGHT = 800;
const FUNNEL_TIER_POSITIONS = [80, 250, 400, 550, 700] as const;
const F_CONVERGE_Y = 760;
const F_TIER_SPREAD = [400, 300, 200, 120, 60] as const;
const FUNNEL_CENTER_X = 500;
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
  for (let streamIndex = 0; streamIndex < sorted.length; streamIndex++) {
    const stream = sorted[streamIndex];
    const positions: FTierPos[] = [];
    const w = stream.width * F_UNIT_W;
    const topX = FUNNEL_CENTER_X - topSpread + streamIndex * topStep;
    positions.push({ x: topX, y: FUNNEL_TIER_POSITIONS[0], w });
    let prevX = topX;
    for (let nodeIndex = 0; nodeIndex < NODES.length; nodeIndex++) {
      const tierIdx = nodeIndex + 1;
      const spread = F_TIER_SPREAD[tierIdx];
      const passesThrough = stream.path.includes(nodeIndex);
      const passingStreams = sorted.filter((s) => s.path.includes(nodeIndex));
      const passingIndex = passingStreams.indexOf(stream);
      let x: number;
      if (passesThrough) {
        const passingStep =
          passingStreams.length > 1
            ? (spread * 2) / (passingStreams.length - 1)
            : 0;
        x = FUNNEL_CENTER_X - spread + passingIndex * passingStep;
      } else {
        x = lerp(prevX, FUNNEL_CENTER_X, 0.35);
        const maxDist = spread * 1.4;
        if (Math.abs(x - FUNNEL_CENTER_X) > maxDist)
          x = FUNNEL_CENTER_X + Math.sign(x - FUNNEL_CENTER_X) * maxDist;
      }
      positions.push({ x, y: FUNNEL_TIER_POSITIONS[tierIdx], w });
      prevX = x;
    }
    result.set(stream.id, positions);
  }
  return result;
}

const FUNNEL_POSITIONS = computeFunnelPositions();
const FUNNEL_TOP_POSITIONS = STREAMS.map((s) => FUNNEL_POSITIONS.get(s.id)![0]);

/** Map SVG viewBox coord to pixel coord using actual SVG bounding rect */
function svgToPixel(
  sx: number,
  sy: number,
  svgRect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  const scale = Math.min(svgRect.width / FUNNEL_VIEWBOX_WIDTH, svgRect.height / FUNNEL_VIEWBOX_HEIGHT);
  const renderedW = FUNNEL_VIEWBOX_WIDTH * scale,
    renderedH = FUNNEL_VIEWBOX_HEIGHT * scale;
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
    const positions = FUNNEL_POSITIONS.get(stream.id)!;
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

const FUNNEL_SEGMENTS = buildFunnelSegments();

const FUNNEL_NARRATOR = CONTENT.funnelNarrator;

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
/*  Hook options                                                        */
/* ================================================================== */

interface ParticleFunnelOptions {
  isLgRef: RefObject<boolean>;
}

/* ================================================================== */
/*  Hook                                                                */
/* ================================================================== */

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
  const funnelSegmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const funnelStreamLabelRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const funnelConvergeRef = useRef<SVGGElement | null>(null);
  const funnelBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const funnelNarratorRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ---- Mobile camera-track refs ---- */
  const cameraTrackRef = useRef<HTMLDivElement>(null);
  const cameraNodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cameraSkillRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ---- Mid narrator ref ---- */
  const midNarratorRef = useRef<HTMLDivElement>(null);

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
        const target = FUNNEL_TOP_POSITIONS[particle.streamIdx];
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
    /* ---- Canvas particles: full range -> local 0-1 ---- */
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
      const svgOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
      funnelSvgWrapRef.current.style.opacity = String(svgIn * svgOut);
    }

    /* ---- SVG dots ---- */
    for (let streamIndex = 0; streamIndex < STREAMS.length; streamIndex++) {
      const element = funnelDotRefs.current[streamIndex];
      if (!element) continue;
      const stagger = streamIndex * FUNNEL.dotStagger;
      const dotIn = smoothstep(DOTS_IN_START + stagger, DOTS_IN_END + stagger, progress);
      const dotOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
      const ribbonStart = smoothstep(RIBBON_TIERS[0].start, RIBBON_TIERS[0].end, progress);
      const scale = lerp(FUNNEL.dotScaleStart, FUNNEL.dotScaleEnd, ribbonStart);
      const glowR = lerp(FUNNEL.dotGlowStart, FUNNEL.dotGlowEnd, ribbonStart);
      element.style.opacity = String(dotIn * dotOut);
      element.style.transform = `scale(${dotIn > 0 ? scale : 0})`;
      const blur = element.querySelector("feGaussianBlur");
      if (blur) blur.setAttribute("stdDeviation", String(glowR));
    }

    /* ---- Stream labels ---- */
    for (let streamIndex = 0; streamIndex < STREAMS.length; streamIndex++) {
      const element = funnelStreamLabelRefs.current[streamIndex];
      if (!element) continue;
      const stagger = streamIndex * FUNNEL.labelStagger;
      const labelIn = smoothstep(
        LABELS_IN_START + stagger,
        LABELS_IN_END + stagger,
        progress,
      );
      const labelOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
      element.style.opacity = String(labelIn * labelOut);
      element.style.transform = `translateY(${lerp(FUNNEL.labelSlideY, 0, labelIn)}px)`;
    }

    /* ---- Ribbon segments grow tier by tier ---- */
    const TIER_THRESHOLDS = RIBBON_TIERS.map(
      (t) => [t.start, t.end] as const,
    );
    for (let i = 0; i < FUNNEL_SEGMENTS.length; i++) {
      const element = funnelSegmentRefs.current[i];
      if (!element) continue;
      const seg = FUNNEL_SEGMENTS[i];
      const threshIdx = Math.min(seg.toTier - 1, TIER_THRESHOLDS.length - 1);
      const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
      const t = smoothstep(threshStart, threshEnd, progress);
      const fadeOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
      element.style.opacity = String(lerp(0, seg.opacityEnd, t) * fadeOut);
      const scaleY = lerp(0, 1, t);
      element.style.transformOrigin = `${FUNNEL_CENTER_X}px ${FUNNEL_TIER_POSITIONS[seg.fromTier]}px`;
      element.style.transform = `scaleY(${scaleY})`;
    }

    /* ---- Company nodes ---- */
    for (let nodeIndex = 0; nodeIndex < NODES.length; nodeIndex++) {
      const element = funnelNodeRefs.current[nodeIndex];
      if (!element) continue;
      const threshIdx = Math.min(nodeIndex, TIER_THRESHOLDS.length - 1);
      const [threshStart, threshEnd] = TIER_THRESHOLDS[threshIdx];
      const nodeT = smoothstep(lerp(threshStart, threshEnd, FUNNEL.nodeAppearFrac), threshEnd, progress);
      const fadeOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
      element.style.opacity = String(nodeT * fadeOut);
      element.style.transform = `translateY(${lerp(FUNNEL.nodeSlideY, 0, nodeT)}px)`;
    }

    /* ---- Convergence point ---- */
    if (funnelConvergeRef.current) {
      const convergenceAppear = smoothstep(CONVERGE_PT_START, CONVERGE_PT_END, progress);
      const convergenceFadeOut =
        1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
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

    /* ---- Narrator glass panels ---- */
    for (let narratorIndex = 0; narratorIndex < FUNNEL_NARRATOR.length; narratorIndex++) {
      const element = funnelNarratorRefs.current[narratorIndex];
      if (!element) continue;
      const { start: narratorStart, end: narratorEnd } = NARRATOR_TIERS[narratorIndex];
      const narratorFadeIn = smoothstep(
        narratorStart,
        lerp(narratorStart, narratorEnd, FUNNEL.narratorFadeInFrac),
        progress,
      );
      const narratorFadeOut =
        1 - smoothstep(lerp(narratorStart, narratorEnd, FUNNEL.narratorFadeOutFrac), narratorEnd, progress);
      element.style.opacity = String(narratorFadeIn * narratorFadeOut * FUNNEL.narratorMaxOpacity);
      element.style.transform = `translateY(${lerp(FUNNEL.narratorSlideY, 0, narratorFadeIn)}px)`;
    }

    /* ---- Mobile camera-track (phone only) ---- */
    if (!isDesktop) {
      if (cameraTrackRef.current) {
        const trackAppear = smoothstep(PARTICLES_START, PARTICLES_START + MOBILE_SKILLS.appearDur, progress);
        const trackDisappear =
          1 - smoothstep(FUNNEL_OUT_END, FUNNEL_OUT_END + MOBILE_SKILLS.disappearDur, progress);
        cameraTrackRef.current.style.opacity = String(
          trackAppear * trackDisappear,
        );
      }
      const SKILL_TIER_STARTS = RIBBON_TIERS.map((t) => t.start);
      for (let streamIndex = 0; streamIndex < STREAMS.length; streamIndex++) {
        const element = cameraSkillRefs.current[streamIndex];
        if (!element) continue;
        const firstTier = STREAMS[streamIndex].path[0];
        const stagger = streamIndex * MOBILE_SKILLS.skillStagger;
        const tierStart = SKILL_TIER_STARTS[firstTier] + stagger;
        const skillFadeIn = smoothstep(tierStart, tierStart + MOBILE_SKILLS.skillFadeDur, progress);
        const skillFadeOut =
          1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
        const fromLeft = streamIndex % 2 === 0;
        const slideX = lerp(fromLeft ? -MOBILE_SKILLS.skillSlideX : MOBILE_SKILLS.skillSlideX, 0, skillFadeIn);
        const scale = lerp(MOBILE_SKILLS.skillScaleStart, 1, skillFadeIn);
        element.style.opacity = String(Math.max(0, skillFadeIn * skillFadeOut));
        element.style.transform = `translateX(${slideX}px) scale(${scale})`;
      }
      const convergenceDiamond = cameraNodeRefs.current[0];
      if (convergenceDiamond) {
        const diamondIn = smoothstep(CONVERGE_PT_START, CONVERGE_PT_END, progress);
        const diamondOut = 1 - smoothstep(SCROLL_PHASES.FUNNEL_OUT.start, SCROLL_PHASES.FUNNEL_OUT.end, progress);
        convergenceDiamond.style.opacity = String(diamondIn * diamondOut);
      }
    }

    /* ---- Mid narrator ---- */
    if (midNarratorRef.current) {
      const midIn = smoothstep(MID_NARRATOR_START, MID_NARRATOR_START + MID_NARRATOR.fadeDur, progress);
      const midOut = 1 - smoothstep(MID_NARRATOR_END - MID_NARRATOR.fadeDur, MID_NARRATOR_END, progress);
      midNarratorRef.current.style.opacity = String(midIn * midOut);
      midNarratorRef.current.style.transform = `translateY(${lerp(MID_NARRATOR.slideY, 0, midIn)}px)`;
    }
  }

  /* ================================================================ */
  /*  JSX                                                               */
  /* ================================================================ */

  const jsx = (
    <>
      {/* Mid narrator -- between funnel and terminal */}
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
          {CONTENT.midNarrator}
        </p>
      </div>

      {/* Particle canvas (inside sticky, driven by scroll progress) -- hidden on phone */}
      <div
        ref={canvasWrapRef}
        className="absolute inset-0 hidden sm:block"
        style={{ opacity: 0, zIndex: 5 }}>
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* Funnel SVG (crossfades in from canvas) -- hidden on phone */}
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
                ref={(element) => {
                  funnelBlurRef.current = element;
                }}
                in="SourceGraphic"
                stdDeviation="0"
              />
            </filter>
          </defs>

          {/* Stream ribbon segments */}
          {FUNNEL_SEGMENTS.map((seg, i) => (
            <path
              key={`fseg-${seg.streamId}-${seg.fromTier}-${seg.toTier}`}
              ref={(element) => {
                funnelSegmentRefs.current[i] = element;
              }}
              d={seg.path}
              fill={`url(#fgrad-${seg.streamId})`}
              opacity={0}
              style={{ willChange: "opacity, transform" }}
            />
          ))}

          {/* Company node lines + labels */}
          {NODES.map((node, nodeIndex) => {
            const y = FUNNEL_TIER_POSITIONS[nodeIndex + 1];
            const spread = F_TIER_SPREAD[nodeIndex + 1];
            return (
              <g
                key={`fnode-${node.id}`}
                ref={(element) => {
                  funnelNodeRefs.current[nodeIndex] = element;
                }}
                opacity={0}>
                <line
                  x1={FUNNEL_CENTER_X - spread - 40}
                  y1={y}
                  x2={FUNNEL_CENTER_X + spread + 40}
                  y2={y}
                  stroke={node.color}
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={FUNNEL_CENTER_X - spread - 52}
                  y={y - 12}
                  textAnchor="end"
                  className="font-sans"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                  fill={node.color}
                  fillOpacity={0.9}>
                  {node.label}
                </text>
                <text
                  x={FUNNEL_CENTER_X - spread - 52}
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
          {STREAMS.map((stream, streamIndex) => {
            const pos = FUNNEL_POSITIONS.get(stream.id)![0];
            return (
              <g
                key={`fdot-${stream.id}`}
                ref={(element) => {
                  funnelDotRefs.current[streamIndex] = element;
                }}
                opacity={0}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={5}
                  fill={stream.color}
                  filter={`url(#wsdot-${streamIndex})`}
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
          {STREAMS.map((stream, streamIndex) => {
            const pos = FUNNEL_POSITIONS.get(stream.id)![0];
            return (
              <g
                key={`flabel-${stream.id}`}
                ref={(element) => {
                  funnelStreamLabelRefs.current[streamIndex] = element;
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

          {/* Convergence point -- diamond + white text */}
          <g
            ref={(element) => {
              funnelConvergeRef.current = element;
            }}
            opacity={0}>
            <rect
              x={FUNNEL_CENTER_X - 3}
              y={F_CONVERGE_Y - 3}
              width={6}
              height={6}
              rx={1}
              fill="#C9A84C"
              transform={`rotate(45 ${FUNNEL_CENTER_X} ${F_CONVERGE_Y})`}
            />
            <text
              x={FUNNEL_CENTER_X}
              y={F_CONVERGE_Y + 22}
              textAnchor="middle"
              className="font-serif"
              style={{
                fontSize: "16px",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
              fill="var(--cream)">
              {CONTENT.convergenceLabel}
            </text>
          </g>
        </svg>
      </div>

      {/* Narrator glass panels -- right side, accompanying funnel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 7, overflow: "visible" }}>
        {FUNNEL_NARRATOR.map((text, narratorIndex) => {
          const topFrac = FUNNEL.narratorTopFracs[narratorIndex];
          return (
            <div
              key={`narrator-${narratorIndex}`}
              ref={(element) => {
                funnelNarratorRefs.current[narratorIndex] = element;
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

      {/* Mobile skill convergence -- phone only, replaces SVG funnel */}
      <div
        ref={cameraTrackRef}
        className="absolute inset-0 sm:hidden pointer-events-none"
        style={{ opacity: 0, zIndex: 6 }}>
        {/* Skills accumulate center-screen as you scroll */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
          <div className="flex flex-wrap justify-center gap-2.5 max-w-[320px]">
            {STREAMS.map((stream, streamIndex) => (
              <div
                key={`mobile-skill-${stream.id}`}
                ref={(element) => {
                  cameraSkillRefs.current[streamIndex] = element;
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
          {/* Convergence diamond -- appears after all skills */}
          <div
            ref={(element) => {
              cameraNodeRefs.current[0] = element;
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
              {CONTENT.convergenceLabel}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return { update, jsx };
}
