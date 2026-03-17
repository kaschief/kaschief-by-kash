"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { STREAMS, NODES, smoothstep, lerp } from "../forge-sankey-data";
import { DL_SVG_STYLE } from "../forge-element-map";
import { ForgeNav } from "../forge-nav";

/* ================================================================== */
/*  Layout constants                                                   */
/* ================================================================== */

const VIEW_W = 1000;
const VIEW_H = 800;

// Y positions for each tier (top spread + 4 company nodes + convergence point)
const TIER_Y = [80, 250, 400, 550, 700] as const;
const CONVERGE_Y = 760;

// How spread-out streams are at each tier (x-range half-width from center)
// Top: full spread; each node tightens
const TIER_SPREAD = [400, 300, 200, 120, 60] as const;

const CENTER_X = 500;
const UNIT_W = 4; // stream.width * UNIT_W = pixel width

// Scroll thresholds — each tier reveals between these fractions
const TIER_THRESHOLDS = [
  [0.0, 0.12], // top spread
  [0.12, 0.30], // AMBOSS
  [0.30, 0.50], // Compado
  [0.50, 0.72], // CAPinside
  [0.72, 0.90], // DKB
  [0.88, 1.0], // convergence point
] as const;

/* ================================================================== */
/*  Compute x-position for each stream at each tier                    */
/* ================================================================== */

interface TierPos {
  x: number;
  y: number;
  w: number;
}

/**
 * At the top tier (index 0), all 9 streams are evenly spread.
 * At each company node tier (1-4), streams that pass through that node
 * converge more toward center; others still drift inward.
 */
function computeStreamPositions(): Map<string, TierPos[]> {
  const result = new Map<string, TierPos[]>();

  // Sort streams consistently for spacing
  const sorted = [...STREAMS];

  // Top tier: evenly spaced across full width
  const topSpread = TIER_SPREAD[0];
  const topStep = (topSpread * 2) / (sorted.length - 1);

  for (let si = 0; si < sorted.length; si++) {
    const stream = sorted[si];
    const positions: TierPos[] = [];
    const w = stream.width * UNIT_W;

    // Tier 0: top spread
    const topX = CENTER_X - topSpread + si * topStep;
    positions.push({ x: topX, y: TIER_Y[0], w });

    // Previous x — used to compute drift for non-passing streams
    let prevX = topX;

    // Tiers 1-4: company nodes
    for (let ni = 0; ni < NODES.length; ni++) {
      const tierIdx = ni + 1;
      const spread = TIER_SPREAD[tierIdx];
      const passesThrough = stream.path.includes(ni);

      // Get streams passing through this node for stacking
      const passingStreams = sorted.filter((s) => s.path.includes(ni));
      const passingIndex = passingStreams.indexOf(stream);

      let x: number;
      if (passesThrough) {
        // Stack passing streams within the spread band
        const passingStep =
          passingStreams.length > 1
            ? (spread * 2) / (passingStreams.length - 1)
            : 0;
        x = CENTER_X - spread + passingIndex * passingStep;
      } else {
        // Non-passing streams drift toward center but less aggressively
        const pullFactor = 0.35;
        x = lerp(prevX, CENTER_X, pullFactor);
        // Also compress toward the spread band
        const maxDist = spread * 1.4;
        if (Math.abs(x - CENTER_X) > maxDist) {
          x = CENTER_X + Math.sign(x - CENTER_X) * maxDist;
        }
      }

      positions.push({ x, y: TIER_Y[tierIdx], w });
      prevX = x;
    }

    result.set(stream.id, positions);
  }

  return result;
}

const STREAM_POSITIONS = computeStreamPositions();

/* ================================================================== */
/*  Build static SVG path data for each stream segment                 */
/* ================================================================== */

interface SegmentData {
  streamId: string;
  color: string;
  fromTier: number;
  toTier: number;
  path: string;
  opacityStart: number; // 0.35 → grows with convergence
  opacityEnd: number;
}

function buildSegments(): SegmentData[] {
  const segments: SegmentData[] = [];

  for (const stream of STREAMS) {
    const positions = STREAM_POSITIONS.get(stream.id)!;

    for (let i = 0; i < positions.length - 1; i++) {
      const p1 = positions[i];
      const p2 = positions[i + 1];
      const w1 = p1.w;
      const w2 = p2.w;

      // Build cubic bezier "ribbon" path (vertical flow)
      const my = (p1.y + p2.y) / 2;
      const path = [
        `M ${p1.x - w1 / 2} ${p1.y}`,
        `C ${p1.x - w1 / 2} ${my}, ${p2.x - w2 / 2} ${my}, ${p2.x - w2 / 2} ${p2.y}`,
        `L ${p2.x + w2 / 2} ${p2.y}`,
        `C ${p2.x + w2 / 2} ${my}, ${p1.x + w1 / 2} ${my}, ${p1.x + w1 / 2} ${p1.y}`,
        `Z`,
      ].join(" ");

      // Opacity increases with tier depth (convergence = higher intensity)
      const opacityStart = 0.25 + i * 0.08;
      const opacityEnd = 0.25 + (i + 1) * 0.08;

      segments.push({
        streamId: stream.id,
        color: stream.color,
        fromTier: i,
        toTier: i + 1,
        path,
        opacityStart,
        opacityEnd,
      });
    }
  }

  return segments;
}

const SEGMENTS = buildSegments();

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ForgeTestV4() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for DOM elements we'll manipulate directly
  const segmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const labelRefs = useRef<(SVGGElement | null)[]>([]); // top stream labels
  const nodeRefs = useRef<(SVGGElement | null)[]>([]); // company node groups
  const convergeRef = useRef<SVGGElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ---- Scroll-driven update ---- */
  const update = useCallback((progress: number) => {
    // --- Segments ---
    for (let i = 0; i < SEGMENTS.length; i++) {
      const el = segmentRefs.current[i];
      if (!el) continue;

      const seg = SEGMENTS[i];
      const [threshStart, threshEnd] = TIER_THRESHOLDS[seg.toTier];
      const t = smoothstep(threshStart, threshEnd, progress);

      // Clip reveal: use a dasharray trick for path drawing
      // For filled shapes, we use opacity instead
      const opacity = lerp(0, seg.opacityEnd, t);
      el.style.opacity = String(opacity);

      // Scale from compressed to full as tier reveals
      const scaleY = lerp(0.3, 1, t);
      // Transform origin at the fromTier's y position
      const originY = TIER_Y[seg.fromTier];
      el.style.transformOrigin = `${CENTER_X}px ${originY}px`;
      el.style.transform = `scaleY(${scaleY})`;
    }

    // --- Top stream labels ---
    const topT = smoothstep(TIER_THRESHOLDS[0][0], TIER_THRESHOLDS[0][1], progress);
    for (let i = 0; i < STREAMS.length; i++) {
      const el = labelRefs.current[i];
      if (!el) continue;
      el.style.opacity = String(topT);
      el.style.transform = `translateY(${lerp(-12, 0, topT)}px)`;
    }

    // --- Company node labels + lines ---
    for (let ni = 0; ni < NODES.length; ni++) {
      const el = nodeRefs.current[ni];
      if (!el) continue;
      const tierIdx = ni + 1;
      const [threshStart, threshEnd] = TIER_THRESHOLDS[tierIdx];
      const t = smoothstep(threshStart, threshEnd, progress);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${lerp(8, 0, t)}px)`;
    }

    // --- Convergence point ---
    if (convergeRef.current) {
      const [cStart, cEnd] = TIER_THRESHOLDS[5];
      const t = smoothstep(cStart, cEnd, progress);
      convergeRef.current.style.opacity = String(t);
      // Glow pulse via filter
      const glowStrength = lerp(0, 12, t);
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", String(glowStrength));
      }
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", update);

  // Initial render at 0
  useEffect(() => {
    update(0);
  }, [update]);

  /* ---- Build gradient defs ---- */
  const gradientDefs = STREAMS.map((s) => (
    <linearGradient
      key={`grad-${s.id}`}
      id={`grad-${s.id}`}
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
      <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
    </linearGradient>
  ));

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "600vh", background: "#07070A" }}
    >
      <ForgeNav />
      {/* Title */}
      <div
        className="fixed top-6 left-8 z-10 font-sans"
        style={{ color: "var(--text-dim, #8A8478)" }}
      >
        <span className="text-xs tracking-widest uppercase opacity-60">
          V4: Convergence Funnel
        </span>
      </div>


      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full h-full max-w-[1200px]"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
        >
          <defs>
            {gradientDefs}

            {/* Gold glow filter for convergence point */}
            <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur
                ref={(el) => {
                  blurRef.current = el;
                }}
                in="SourceGraphic"
                stdDeviation="0"
              />
            </filter>
          </defs>

          {/* ---- Company node horizontal lines + labels ---- */}
          {NODES.map((node, ni) => {
            const tierIdx = ni + 1;
            const y = TIER_Y[tierIdx];
            const spread = TIER_SPREAD[tierIdx];
            return (
              <g
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[ni] = el;
                }}
                opacity={0}
              >
                {/* Thin horizontal line spanning the stream spread */}
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
                {/* Node label — left side */}
                <text
                  x={CENTER_X - spread - 52}
                  y={y - 12}
                  textAnchor="end"
                  className="font-sans"
                  style={{ fontSize: "11px" }}
                  fill={node.color}
                  fillOpacity={0.7}
                >
                  {node.label}
                </text>
                <text
                  x={CENTER_X - spread - 52}
                  y={y + 6}
                  textAnchor="end"
                  className="font-sans"
                  style={{ fontSize: "8px" }}
                  fill="#8A8478"
                  fillOpacity={0.5}
                >
                  {node.period}
                </text>
                {/* Small dot at center for node */}
                <circle
                  cx={CENTER_X}
                  cy={y}
                  r={3}
                  fill={node.color}
                  fillOpacity={0.35}
                />
              </g>
            );
          })}

          {/* ---- Stream ribbon segments ---- */}
          {SEGMENTS.map((seg, i) => (
            <path
              key={`${seg.streamId}-${seg.fromTier}-${seg.toTier}`}
              ref={(el) => {
                segmentRefs.current[i] = el;
              }}
              d={seg.path}
              fill={`url(#grad-${seg.streamId})`}
              opacity={0}
              style={{ willChange: "opacity, transform" }}
            />
          ))}

          {/* ---- Top stream labels ---- */}
          {STREAMS.map((stream, si) => {
            const pos = STREAM_POSITIONS.get(stream.id)![0];
            return (
              <g
                key={`label-${stream.id}`}
                ref={(el) => {
                  labelRefs.current[si] = el;
                }}
                opacity={0}
              >
                {/* Small dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y - 18}
                  r={2.5}
                  fill={stream.color}
                  fillOpacity={0.6}
                />
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y - 28}
                  textAnchor="middle"
                  className="font-sans"
                  style={{ fontSize: "9px", letterSpacing: "0.02em" }}
                  fill={stream.color}
                  fillOpacity={0.6}
                >
                  {stream.label}
                </text>
              </g>
            );
          })}

          {/* ---- Convergence point ---- */}
          <g
            ref={(el) => {
              convergeRef.current = el;
            }}
            opacity={0}
          >
            {/* Gold glow circle */}
            <circle
              cx={CENTER_X}
              cy={CONVERGE_Y}
              r={6}
              fill="#C9A84C"
              filter="url(#gold-glow)"
            />
            {/* Inner bright dot */}
            <circle cx={CENTER_X} cy={CONVERGE_Y} r={3} fill="#F0E6D0" />

            {/* Lines converging to point */}
            <line
              x1={CENTER_X - 50}
              y1={CONVERGE_Y}
              x2={CENTER_X - 8}
              y2={CONVERGE_Y}
              stroke="#C9A84C"
              strokeOpacity={0.3}
              strokeWidth={0.5}
            />
            <line
              x1={CENTER_X + 8}
              y1={CONVERGE_Y}
              x2={CENTER_X + 50}
              y2={CONVERGE_Y}
              stroke="#C9A84C"
              strokeOpacity={0.3}
              strokeWidth={0.5}
            />

            {/* Label */}
            <text
              x={CENTER_X}
              y={CONVERGE_Y + 24}
              textAnchor="middle"
              className="font-serif"
              style={{ fontSize: "13px", letterSpacing: "0.04em" }}
              fill="#F0E6D0"
            >
              The Engineer I Became
            </text>
          </g>

          {/* ---- Debug labels ---- */}
          <text x={500} y={55} fill={DL_SVG_STYLE.fill} fontSize={DL_SVG_STYLE.fontSize} fontFamily={DL_SVG_STYLE.fontFamily} letterSpacing={DL_SVG_STYLE.letterSpacing}>STREAM LABELS</text>
          <text x={180} y={450} fill={DL_SVG_STYLE.fill} fontSize={DL_SVG_STYLE.fontSize} fontFamily={DL_SVG_STYLE.fontFamily} letterSpacing={DL_SVG_STYLE.letterSpacing}>STREAM RIBBONS</text>
          <text x={850} y={245} fill={DL_SVG_STYLE.fill} fontSize={DL_SVG_STYLE.fontSize} fontFamily={DL_SVG_STYLE.fontFamily} letterSpacing={DL_SVG_STYLE.letterSpacing}>NODE LINES</text>
          <text x={100} y={240} fill={DL_SVG_STYLE.fill} fontSize={DL_SVG_STYLE.fontSize} fontFamily={DL_SVG_STYLE.fontFamily} letterSpacing={DL_SVG_STYLE.letterSpacing}>NODE LABELS</text>
          <text x={530} y={755} fill={DL_SVG_STYLE.fill} fontSize={DL_SVG_STYLE.fontSize} fontFamily={DL_SVG_STYLE.fontFamily} letterSpacing={DL_SVG_STYLE.letterSpacing}>CONVERGENCE POINT</text>
        </svg>
      </div>
    </div>
  );
}
