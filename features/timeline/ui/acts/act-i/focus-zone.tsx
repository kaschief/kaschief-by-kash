"use client";

import { useRef } from "react";
import {
  LayoutGroup,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ORBIT_NODES, type OrbitNode } from "@data";
import { C } from "./chaos-to-order.constants";

const COUNT = ORBIT_NODES.length;

// ─── Scroll Ranges ──────────────────────────────────────────────────────────
// Each element gets an equal slice of scroll progress.
// Within each slice: first 30% is transition-in, middle 40% is hold, last 30% is transition-out.
const SLICE = 1 / (COUNT + 1); // extra slice for final hold

function getActiveIndex(p: number): number {
  // Returns fractional index: floor = active element, fraction = sub-progress
  return Math.min(COUNT - 1, Math.max(0, Math.floor(p / SLICE)));
}

function getSubProgress(p: number, index: number): number {
  const start = index * SLICE;
  return Math.min(1, Math.max(0, (p - start) / SLICE));
}

// ─── FocusZone Component ──────────────────────────────────────────────────

export function FocusZone() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: `${(COUNT + 1) * 100}vh` }}>
      <div className="sticky top-0 mx-auto h-screen max-w-350 overflow-hidden">
        <LayoutGroup>
          <FocusZoneInner scrollProgress={scrollYProgress} />
        </LayoutGroup>
      </div>
    </div>
  );
}

// ─── Inner (reads motion values) ────────────────────────────────────────────

function FocusZoneInner({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  return (
    <div className="relative flex h-full flex-col px-6 pt-16 lg:px-12 lg:pt-20">
      {ORBIT_NODES.map((node, i) => (
        <CompletedRow
          key={node.label}
          node={node}
          index={i}
          scrollProgress={scrollProgress}
        />
      ))}

      <ActiveElement scrollProgress={scrollProgress} />
    </div>
  );
}

// ─── Completed Row ──────────────────────────────────────────────────────────
// Shows as a compact label+title row once the element's slice is past.

function CompletedRow({
  node,
  index,
  scrollProgress,
}: {
  node: OrbitNode;
  index: number;
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    return activeIdx > index ? 1 : 0;
  });

  const y = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    return activeIdx > index ? 0 : 20;
  });

  const height = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    return activeIdx > index ? "auto" : "0px";
  });

  return (
    <motion.div
      layout
      layoutId={`focus-${node.label}`}
      style={{ opacity, y, height, overflow: "hidden" }}
      className="mb-2">
      <div className="flex items-baseline gap-3 py-1.5">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.25em]"
          style={{ color: C.accent, opacity: 0.6 }}>
          {node.label}
        </span>
        <span
          className="font-serif text-[clamp(12px,1.2vw,16px)] leading-tight"
          style={{ color: C.cardTitle }}>
          {node.title}
        </span>
      </div>
      <div
        className="h-px w-full"
        style={{ background: C.hairlineBorder }}
      />
    </motion.div>
  );
}

// ─── Active Element ─────────────────────────────────────────────────────────
// The currently examined element with full detail view.

function ActiveElement({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  return (
    <div className="relative mt-4 flex-1">
      {ORBIT_NODES.map((node, i) => (
        <ActiveCard
          key={node.label}
          node={node}
          index={i}
          scrollProgress={scrollProgress}
        />
      ))}
    </div>
  );
}

function ActiveCard({
  node,
  index,
  scrollProgress,
}: {
  node: OrbitNode;
  index: number;
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  // Visible when this is the active index
  const opacity = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    if (activeIdx !== index) return 0;
    const sub = getSubProgress(p, index);
    // Fade in first 20%, hold, fade out last 20%
    if (sub < 0.2) return sub / 0.2;
    if (sub > 0.8) return (1 - sub) / 0.2;
    return 1;
  });

  const pointerEvents = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    return activeIdx === index ? "auto" : "none";
  });

  // Detail column grows in from 0 width
  const detailProgress = useTransform(scrollProgress, (p) => {
    const activeIdx = getActiveIndex(p);
    if (activeIdx !== index) return 0;
    const sub = getSubProgress(p, index);
    // Detail starts growing at 15% into the slice, fully open by 45%
    return Math.min(1, Math.max(0, (sub - 0.15) / 0.3));
  });

  const detailOpacity = useTransform(detailProgress, [0, 0.3, 1], [0, 1, 1]);

  return (
    <motion.div
      layout
      layoutId={`focus-${node.label}`}
      className="absolute inset-x-0 top-0"
      style={{ opacity, pointerEvents: pointerEvents as any }}>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left column — label + title + "did" */}
        <div className="lg:w-[40%]">
          <div
            className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] lg:text-[11px]"
            style={{ color: C.accent }}>
            {node.label}
          </div>
          <div
            className="mb-3 font-serif text-[clamp(18px,2.2vw,28px)] leading-tight"
            style={{ color: C.narrator }}>
            {node.title}
          </div>
          <p
            className="font-mono text-[clamp(10px,1vw,13px)] font-light leading-[1.8]"
            style={{ color: C.cardBody }}>
            {node.clinical}
          </p>
        </div>

        {/* Right column — grows out of left */}
        <motion.div
          className="overflow-hidden lg:flex-1"
          style={{ opacity: detailOpacity }}>
          <div
            className="h-full rounded-lg border p-5 lg:p-8"
            style={{
              borderColor: C.hairlineBorder,
              background: "rgba(7,7,10,0.6)",
            }}>
            {/* Capability */}
            <div
              className="mb-1 font-mono text-[8px] uppercase tracking-[0.3em]"
              style={{ color: C.accent, opacity: 0.7 }}>
              Capability unlocked
            </div>
            <p
              className="mb-5 font-serif text-[clamp(13px,1.3vw,18px)] italic leading-relaxed"
              style={{ color: C.narrator }}>
              {node.capability}
            </p>

            {/* Transfer */}
            <div
              className="mb-1 font-mono text-[8px] uppercase tracking-[0.3em]"
              style={{ color: C.accent, opacity: 0.5 }}>
              The transfer
            </div>
            <p
              className="font-serif text-[clamp(11px,1.1vw,15px)] leading-relaxed"
              style={{ color: C.cardBody }}>
              {node.transfer}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
