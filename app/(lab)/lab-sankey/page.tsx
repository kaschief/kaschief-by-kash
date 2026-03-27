"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import {
  STREAMS,
  NODES,
  smoothstep,
  hFlowPath,
  computeHLayout,
  type StreamPos,
} from "@data";
import { LabNav } from "../lab-nav";

/* ================================================================== */
/*  Constants                                                         */
/* ================================================================== */

const NODE_X = [120, 400, 680, 960];
const NODE_CENTER_Y = 250;
const SVG_W = 1200;
const SVG_H = 500;
const NODE_BAR_WIDTH = 6;
const RUNWAY_VH = 500; // scroll runway

/* ================================================================== */
/*  Pre-computed layout (runs once, no re-render needed)              */
/* ================================================================== */

interface Segment {
  streamId: string;
  color: string;
  label: string;
  from: StreamPos;
  to: StreamPos;
  /** Normalized scroll band [start, end] for this segment reveal */
  scrollStart: number;
  scrollEnd: number;
}

interface StreamLabelInfo {
  streamId: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
}

function buildSegments(
  layout: Map<string, StreamPos[]>,
): { segments: Segment[]; streamLabels: StreamLabelInfo[] } {
  const segments: Segment[] = [];
  const streamLabels: StreamLabelInfo[] = [];

  for (const stream of STREAMS) {
    const positions = layout.get(stream.id);
    if (!positions || positions.length < 2) continue;

    // Label at the first position
    streamLabels.push({
      streamId: stream.id,
      label: stream.label,
      color: stream.color,
      x: positions[0].x,
      y: positions[0].y,
      w: positions[0].w,
    });

    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];
      // Scroll band: distribute across 0→0.85 based on the "from" node index
      // relative to the total span, with some overlap for smoothness
      const fromNorm = from.nodeIdx / (NODES.length - 1);
      const toNorm = to.nodeIdx / (NODES.length - 1);
      const scrollStart = fromNorm * 0.7;
      const scrollEnd = 0.15 + toNorm * 0.7;

      segments.push({
        streamId: stream.id,
        color: stream.color,
        label: stream.label,
        from,
        to,
        scrollStart,
        scrollEnd,
      });
    }
  }

  return { segments, streamLabels };
}

/* ================================================================== */
/*  Node bar height computation                                       */
/* ================================================================== */

function computeNodeBarHeights(
  layout: Map<string, StreamPos[]>,
): { y1: number; y2: number }[] {
  const heights: { y1: number; y2: number }[] = [];
  for (let ni = 0; ni < NODES.length; ni++) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const stream of STREAMS) {
      const positions = layout.get(stream.id);
      if (!positions) continue;
      const pos = positions.find((p) => p.nodeIdx === ni);
      if (pos) {
        minY = Math.min(minY, pos.y - pos.w / 2);
        maxY = Math.max(maxY, pos.y + pos.w / 2);
      }
    }
    const pad = 12;
    heights.push({
      y1: minY === Infinity ? NODE_CENTER_Y - 50 : minY - pad,
      y2: maxY === -Infinity ? NODE_CENTER_Y + 50 : maxY + pad,
    });
  }
  return heights;
}

/* ================================================================== */
/*  Page Component                                                    */
/* ================================================================== */

export default function ForgeTestV1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const nodeBarRefs = useRef<(SVGRectElement | null)[]>([]);
  const nodeLabelRefs = useRef<(SVGTextElement | null)[]>([]);
  const nodePeriodRefs = useRef<(SVGTextElement | null)[]>([]);
  const streamLabelRefs = useRef<(SVGTextElement | null)[]>([]);
  const clipRectRefs = useRef<(SVGRectElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Pre-compute all layout data once
  const { segments, streamLabels, nodeBarHeights } = useMemo(() => {
    const lay = computeHLayout(NODE_X, NODE_CENTER_Y);
    const { segments: segs, streamLabels: labels } = buildSegments(lay);
    const barHeights = computeNodeBarHeights(lay);
    return { segments: segs, streamLabels: labels, nodeBarHeights: barHeights, layout: lay };
  }, []);

  // Build path `d` strings once
  const segmentPaths = useMemo(
    () =>
      segments.map((seg) =>
        hFlowPath(seg.from.x, seg.from.y, seg.from.w, seg.to.x, seg.to.y, seg.to.w),
      ),
    [segments],
  );

  // Scroll-driven updates — no React re-render
  const onScroll = useCallback(
    (progress: number) => {
      // -- Title fade out --
      if (titleRef.current) {
        const titleOp = 1 - smoothstep(0, 0.08, progress);
        titleRef.current.style.opacity = String(titleOp);
      }

      // -- Segments: clipPath reveal + opacity --
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const t = smoothstep(seg.scrollStart, seg.scrollEnd, progress);

        // Clip rect — reveals from left to right
        const clipRect = clipRectRefs.current[i];
        if (clipRect) {
          // The clip rect width goes from 0 to full SVG width
          const segMinX = Math.min(seg.from.x, seg.to.x) - 30;
          const segMaxX = Math.max(seg.from.x, seg.to.x) + 30;
          const segW = segMaxX - segMinX;
          clipRect.setAttribute("x", String(segMinX));
          clipRect.setAttribute("width", String(segW * t));
        }

        // Path opacity: dim → bright as revealed
        const pathEl = segmentRefs.current[i];
        if (pathEl) {
          const opacity = t < 0.01 ? 0 : 0.15 + t * 0.55;
          pathEl.style.opacity = String(opacity);
        }
      }

      // -- Node bars: light up as progress reaches them --
      for (let ni = 0; ni < NODES.length; ni++) {
        const nodeProgress = smoothstep(
          (ni / (NODES.length - 1)) * 0.7,
          0.1 + (ni / (NODES.length - 1)) * 0.7,
          progress,
        );

        const barEl = nodeBarRefs.current[ni];
        if (barEl) {
          const opacity = 0.1 + nodeProgress * 0.5;
          barEl.style.opacity = String(opacity);
        }

        const labelEl = nodeLabelRefs.current[ni];
        if (labelEl) {
          const opacity = 0.2 + nodeProgress * 0.8;
          labelEl.style.opacity = String(opacity);
        }

        const periodEl = nodePeriodRefs.current[ni];
        if (periodEl) {
          const opacity = 0.1 + nodeProgress * 0.6;
          periodEl.style.opacity = String(opacity);
        }
      }

      // -- Stream labels: fade in early --
      for (let si = 0; si < streamLabels.length; si++) {
        const sLabel = streamLabels[si];
        // Find the first segment for this stream
        const firstSeg = segments.find((s) => s.streamId === sLabel.streamId);
        if (!firstSeg) continue;
        const t = smoothstep(firstSeg.scrollStart, firstSeg.scrollStart + 0.08, progress);
        const labelEl = streamLabelRefs.current[si];
        if (labelEl) {
          labelEl.style.opacity = String(t * 0.9);
        }
      }
    },
    [segments, streamLabels],
  );

  useMotionValueEvent(scrollYProgress, "change", onScroll);

  // Set initial state on mount
  useEffect(() => {
    onScroll(0);
  }, [onScroll]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${RUNWAY_VH}vh`, background: "var(--bg)" }}
    >
      <LabNav />
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Title */}
        <h1
          ref={titleRef}
          className="font-sans absolute top-8 left-8 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-dim)" }}
        >
          V1: Horizontal Classic
        </h1>

        {/* SVG Sankey */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full max-w-[1100px] h-auto"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* One clipPath per segment */}
            {segments.map((_, i) => (
              <clipPath key={`clip-${i}`} id={`seg-clip-${i}`}>
                <rect
                  ref={(el) => { clipRectRefs.current[i] = el; }}
                  x="0"
                  y="0"
                  width="0"
                  height={SVG_H}
                />
              </clipPath>
            ))}
          </defs>

          {/* Node bars */}
          {NODES.map((node, ni) => {
            const bar = nodeBarHeights[ni];
            return (
              <g key={node.id}>
                <rect
                  ref={(el) => { nodeBarRefs.current[ni] = el; }}
                  x={NODE_X[ni] - NODE_BAR_WIDTH / 2}
                  y={bar.y1}
                  width={NODE_BAR_WIDTH}
                  height={bar.y2 - bar.y1}
                  rx={3}
                  fill={node.color}
                  style={{ opacity: 0.1 }}
                />
                {/* Company name */}
                <text
                  ref={(el) => { nodeLabelRefs.current[ni] = el; }}
                  x={NODE_X[ni]}
                  y={bar.y2 + 24}
                  textAnchor="middle"
                  className="font-sans"
                  style={{
                    fontSize: "13px",
                    fill: node.color,
                    opacity: 0.2,
                    fontWeight: 600,
                  }}
                >
                  {node.label}
                </text>
                {/* Period */}
                <text
                  ref={(el) => { nodePeriodRefs.current[ni] = el; }}
                  x={NODE_X[ni]}
                  y={bar.y2 + 42}
                  textAnchor="middle"
                  className="font-sans"
                  style={{
                    fontSize: "10px",
                    fill: "var(--text-dim)",
                    opacity: 0.1,
                  }}
                >
                  {node.period}
                </text>
              </g>
            );
          })}

          {/* Stream segments — curved Sankey paths */}
          {segments.map((seg, i) => (
            <path
              key={`seg-${seg.streamId}-${i}`}
              ref={(el) => { segmentRefs.current[i] = el; }}
              d={segmentPaths[i]}
              fill={seg.color}
              clipPath={`url(#seg-clip-${i})`}
              style={{ opacity: 0, transition: "opacity 0.05s ease" }}
            />
          ))}

          {/* Stream labels at their origin */}
          {streamLabels.map((sl, si) => (
            <text
              key={`label-${sl.streamId}`}
              ref={(el) => { streamLabelRefs.current[si] = el; }}
              x={sl.x - 16}
              y={sl.y + 1}
              textAnchor="end"
              className="font-sans"
              style={{
                fontSize: "10px",
                fill: sl.color,
                opacity: 0,
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              {sl.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
