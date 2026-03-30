"use client";

import React from "react";
import { motion, useTransform } from "framer-motion";
import { ACT_I } from "@data";
import { BREAKPOINTS } from "@utilities";
import {
  DEVICES,
  type Devices,
  FOCUS_START,
  FOCUS_SLICE,
  STACK_LG,
  STACK_SM,
  BALL_TRAVEL_FRACTION,
  BALL_END_X,
  BALL_SIZE_KEYS,
  BALL_PEAK_OPACITY,
  REVEALED_TEXT_MAX_W,
} from "./chaos-to-order.constants";

const COUNT = ACT_I.skillScenarios.length;

function getBreakpointTier(isDesktop: boolean): Devices {
  if (isDesktop) return DEVICES.desktop;
  if (typeof window !== "undefined" && window.innerWidth >= BREAKPOINTS.sm)
    return DEVICES.tablet;
  return DEVICES.phone;
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
        <React.Fragment key={ACT_I.skillScenarios[i].id}>
          <Ball index={i} scrollProgress={scrollProgress} lgRef={lgRef} />
          <RevealedText
            index={i}
            scrollProgress={scrollProgress}
            lgRef={lgRef}
          />
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
    const bp = getBreakpointTier(lgRef.current);
    if (bp === DEVICES.phone) return "-100%"; // offscreen
    const stack = bp === DEVICES.desktop ? STACK_LG[index] : STACK_SM[index];
    const startX = stack.left + 2;
    const endX = bp === DEVICES.desktop ? BALL_END_X.lg : BALL_END_X.md;
    return `${startX + (endX - startX) * Math.min(v / BALL_TRAVEL_FRACTION, 1)}%`;
  });

  // Match ball vertical position to each card's question text center
  const BALL_LG_OFFSETS = [1.5, 1.5, 2.2, 1.5, 2.2, 2.0];
  const top = useTransform(t, () => {
    const bp = getBreakpointTier(lgRef.current);
    if (bp === DEVICES.phone) return "-100%";
    const stack = bp === DEVICES.desktop ? STACK_LG[index] : STACK_SM[index];
    if (bp === DEVICES.tablet) return `${stack.top + 0.5}%`;
    return `${stack.top + BALL_LG_OFFSETS[index]}%`;
  });

  const size = useTransform(
    t,
    [0, 0.1, 0.35, BALL_TRAVEL_FRACTION],
    [...BALL_SIZE_KEYS],
  );
  const opacity = useTransform(
    t,
    [0, 0.05, 0.15, 0.55, 0.7],
    [0, 0, BALL_PEAK_OPACITY, BALL_PEAK_OPACITY, 0],
  );

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
        background:
          "radial-gradient(circle, rgba(245,236,216,0.95) 0%, rgba(224,82,82,0.35) 50%, transparent 75%)",
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
    if (getBreakpointTier(lgRef.current) === DEVICES.phone) return 0;
    return v < 0.55 ? 0 : Math.min(1, (v - 0.55) / 0.2);
  });

  const left = useTransform(t, () => {
    const bp = getBreakpointTier(lgRef.current);
    return bp === DEVICES.desktop ? "40%" : "48%";
  });

  // Per-card vertical offset to align capability text with the question text center
  const LG_OFFSETS = [-0.5, -0.5, 0.2, -0.5, 0.2, 0.0];
  const SM_OFFSETS = [-0.5, -0.5, 0.0, -0.5, 0.0, -0.2];
  const top = useTransform(t, () => {
    const bp = getBreakpointTier(lgRef.current);
    const stack = bp === DEVICES.desktop ? STACK_LG[index] : STACK_SM[index];
    const offset =
      bp === DEVICES.desktop ? LG_OFFSETS[index] : SM_OFFSETS[index];
    return `${stack.top + offset}%`;
  });

  return (
    <motion.div
      className="pointer-events-none absolute z-10 hidden lg:block"
      style={{
        left,
        top,
        opacity,
        maxWidth: `min(${REVEALED_TEXT_MAX_W}px, 50%)`,
      }}>
      <p
        className="font-narrator text-[clamp(13px,1.3vw,18px)] leading-relaxed"
        style={{ color: "var(--gold)" }}>
        {ACT_I.skillScenarios[index].iStatement}
      </p>
    </motion.div>
  );
}
