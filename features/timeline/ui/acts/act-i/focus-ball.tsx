"use client";

import React from "react";
import { motion, useTransform } from "framer-motion";
import { ORBIT_NODES } from "@data";
import { BP } from "@utilities";
import {
  C,
  FOCUS_START,
  FOCUS_SLICE,
  STACK_LG,
  STACK_SM,
} from "./chaos-to-order.constants";

const COUNT = ORBIT_NODES.length;

function getBreakpoint(lg: boolean): "sm" | "md" | "lg" {
  if (lg) return "lg";
  if (typeof window !== "undefined" && window.innerWidth >= BP.sm) return "md";
  return "sm";
}

export function FocusBall({
  scrollProgress,
  lgRef,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
  lgRef: React.RefObject<boolean>;
}) {
  return (
    <>
      {/* Desktop/tablet: ball + revealed text per node */}
      {Array.from({ length: COUNT }, (_, i) => (
        <React.Fragment key={ORBIT_NODES[i].id}>
          <Ball index={i} scrollProgress={scrollProgress} lgRef={lgRef} />
          <RevealedText index={i} scrollProgress={scrollProgress} lgRef={lgRef} />
        </React.Fragment>
      ))}
    </>
  );
}

// ─── Ball (md+ only) ────────────────────────────────────────────────────────

function Ball({
  index,
  scrollProgress,
  lgRef,
}: {
  index: number;
  scrollProgress: import("framer-motion").MotionValue<number>;
  lgRef: React.RefObject<boolean>;
}) {
  const phaseStart = FOCUS_START + index * FOCUS_SLICE;
  const phaseEnd = phaseStart + FOCUS_SLICE;
  const t = useTransform(scrollProgress, [phaseStart, phaseEnd], [0, 1]);

  const left = useTransform(t, (v) => {
    const bp = getBreakpoint(lgRef.current);
    if (bp === "sm") return "-100%"; // offscreen
    const stack = bp === "lg" ? STACK_LG[index] : STACK_SM[index];
    const startX = stack.left + 2;
    const endX = bp === "lg" ? 38 : 44;
    return `${startX + (endX - startX) * Math.min(v / 0.6, 1)}%`;
  });

  // Match ball vertical position to each card's question text center
  const BALL_LG_OFFSETS = [1.5, 1.5, 2.2, 1.5, 2.2, 2.0];
  const top = useTransform(t, () => {
    const bp = getBreakpoint(lgRef.current);
    if (bp === "sm") return "-100%";
    const stack = bp === "lg" ? STACK_LG[index] : STACK_SM[index];
    if (bp === "md") return `${stack.top + 0.5}%`;
    return `${stack.top + BALL_LG_OFFSETS[index]}%`;
  });

  const size = useTransform(t, [0, 0.1, 0.35, 0.6], [0, 12, 20, 12]);
  const opacity = useTransform(t, [0, 0.05, 0.15, 0.55, 0.7], [0, 0, 0.9, 0.9, 0]);

  const boxShadow = useTransform(t, (v) => {
    if (v > 0.65) return "none";
    const strength = v < 0.25 ? v / 0.25 : Math.max(0, 1 - (v - 0.25) / 0.4);
    const r = 24 * strength;
    return `0 0 ${r}px ${r * 0.4}px rgba(224,82,82,0.2)`;
  });

  return (
    <motion.div
      className="pointer-events-none absolute z-10 hidden rounded-full sm:block"
      style={{
        left,
        top,
        opacity,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(245,236,216,0.95) 0%, rgba(224,82,82,0.35) 50%, transparent 75%)",
        boxShadow,
        willChange: "transform, opacity",
      }}
    />
  );
}

// ─── Revealed text (md+ only) ───────────────────────────────────────────────

function RevealedText({
  index,
  scrollProgress,
  lgRef,
}: {
  index: number;
  scrollProgress: import("framer-motion").MotionValue<number>;
  lgRef: React.RefObject<boolean>;
}) {
  const phaseStart = FOCUS_START + index * FOCUS_SLICE;
  const phaseEnd = phaseStart + FOCUS_SLICE;
  const t = useTransform(scrollProgress, [phaseStart, phaseEnd], [0, 1]);

  const opacity = useTransform(t, (v) => {
    if (getBreakpoint(lgRef.current) === "sm") return 0;
    return v < 0.55 ? 0 : Math.min(1, (v - 0.55) / 0.2);
  });

  const left = useTransform(t, () => {
    const bp = getBreakpoint(lgRef.current);
    return bp === "lg" ? "40%" : "48%";
  });

  // Per-card vertical offset to align capability text with the question text center
  const LG_OFFSETS = [0.5, 0.5, 1.2, 0.5, 1.2, 1.0];
  const SM_OFFSETS = [0.5, 0.5, 1.0, 0.5, 1.0, 0.8];
  const top = useTransform(t, () => {
    const bp = getBreakpoint(lgRef.current);
    const stack = bp === "lg" ? STACK_LG[index] : STACK_SM[index];
    const offset = bp === "lg" ? LG_OFFSETS[index] : SM_OFFSETS[index];
    return `${stack.top + offset}%`;
  });

  return (
    <motion.div
      className="pointer-events-none absolute z-10 hidden sm:block"
      style={{ left, top, opacity, maxWidth: "min(500px, 50%)" }}>
      <p
        className="font-sans text-[clamp(11px,1.1vw,15px)] font-light leading-relaxed"
        style={{ color: C.narrator }}>
        {ORBIT_NODES[index].capability}
      </p>
    </motion.div>
  );
}

