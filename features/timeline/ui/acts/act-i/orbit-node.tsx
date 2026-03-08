"use client";

import { useState } from "react";
import { motion, useTransform } from "framer-motion";
import type { OrbitNode as OrbitNodeData } from "@data";
import {
  C,
  SNAP_START,
  SNAP_END,
  STACK_START,
  STACK_END,
  MOBILE_FADEOUT_START,
  MOBILE_FADEOUT_END,
  NODE_DELAYS,
  NODE_START_ROTATIONS,
  NODE_END_ROTATIONS,
  NODE_WEIGHTS,
  CHAOS_LG,
  CHAOS_SM,
  ORDER_LG,
  ORDER_SM,
  STACK_LG,
  STACK_SM,
  MAX_W_LG,
  MAX_W_SM,
  MAX_W_STACK_LG,
  MAX_W_STACK_SM,
} from "./chaos-to-order.constants";
import { useMouseDisplacement } from "./chaos-to-order.hooks";

interface OrbitNodeProps {
  node: OrbitNodeData;
  index: number;
  visible: boolean;
  drift: import("framer-motion").MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: import("framer-motion").MotionValue<number>;
  lgRef: React.RefObject<boolean>;
}

export function OrbitNode({
  node,
  index,
  visible,
  drift,
  containerRef,
  scrollProgress,
  lgRef,
}: OrbitNodeProps) {
  const [hovered, setHovered] = useState(false);
  const [burstDone, setBurstDone] = useState(false);
  const interactive = lgRef.current;

  const { x: displaceX, y: displaceY } = useMouseDisplacement(
    containerRef,
    CHAOS_LG[index].left,
    CHAOS_LG[index].top,
    NODE_WEIGHTS[index],
    interactive,
  );

  // Scroll-driven chaos → order → stack
  // Reads breakpoint at evaluation time, not render time
  const leftStr = useTransform(scrollProgress, (p) => {
    const lg = lgRef.current;
    const chaos = lg ? CHAOS_LG[index] : CHAOS_SM[index];
    const order = lg ? ORDER_LG[index] : ORDER_SM[index];
    const stack = lg ? STACK_LG[index] : STACK_SM[index];

    if (p < SNAP_END) {
      const t = Math.min(1, Math.max(0, (p - SNAP_START) / (SNAP_END - SNAP_START)));
      return `${chaos.left + (order.left - chaos.left) * t}%`;
    }
    const t = Math.min(1, Math.max(0, (p - STACK_START) / (STACK_END - STACK_START)));
    return `${order.left + (stack.left - order.left) * t}%`;
  });
  const topStr = useTransform(scrollProgress, (p) => {
    const lg = lgRef.current;
    const chaos = lg ? CHAOS_LG[index] : CHAOS_SM[index];
    const order = lg ? ORDER_LG[index] : ORDER_SM[index];
    const stack = lg ? STACK_LG[index] : STACK_SM[index];

    if (p < SNAP_END) {
      const t = Math.min(1, Math.max(0, (p - SNAP_START) / (SNAP_END - SNAP_START)));
      return `${chaos.top + (order.top - chaos.top) * t}%`;
    }
    const t = Math.min(1, Math.max(0, (p - STACK_START) / (STACK_END - STACK_START)));
    return `${order.top + (stack.top - order.top) * t}%`;
  });
  const maxWidth = useTransform(scrollProgress, (p) => {
    const lg = lgRef.current;
    const orbitMw = lg ? MAX_W_LG[index] : MAX_W_SM;
    if (p < STACK_START) return orbitMw;
    const t = Math.min(1, Math.max(0, (p - STACK_START) / (STACK_END - STACK_START)));
    return t > 0.3 ? (lg ? MAX_W_STACK_LG : MAX_W_STACK_SM) : orbitMw;
  });

  const scrollRotate = useTransform(
    scrollProgress,
    [0, SNAP_START, SNAP_END],
    [NODE_END_ROTATIONS[index], NODE_END_ROTATIONS[index], 0],
  );

  // Fade out chaos-only effects (drift + mouse displacement) during snap
  const chaosFade = useTransform(scrollProgress, [SNAP_START, SNAP_END], [1, 0]);
  const fadedDrift = useTransform([drift, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceX = useTransform([displaceX, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceY = useTransform([displaceY, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const combinedY = useTransform([fadedDisplaceY, fadedDrift], ([dy, d]) => (dy as number) + (d as number));

  // Dim during chaos (0.25), full brightness when ordered (1).
  // On mobile, fade out before focus accordion takes over.
  const finalOpacity = useTransform(scrollProgress, (p) => {
    if (p < SNAP_START) return 0.25;
    if (p < SNAP_END) return 0.25 + 0.75 * ((p - SNAP_START) / (SNAP_END - SNAP_START));
    // Phone only (< 640px): fade out before accordion
    if (typeof window !== "undefined" && window.innerWidth < 640 && p >= MOBILE_FADEOUT_START) {
      const t = Math.min(1, (p - MOBILE_FADEOUT_START) / (MOBILE_FADEOUT_END - MOBILE_FADEOUT_START));
      return 1 - t;
    }
    return 1;
  });

  // Fade out secondary content (did, built, transfer, hairline) during stack transition
  const detailOpacity = useTransform(scrollProgress, [STACK_START - 0.03, STACK_START], [1, 0]);

  const isHovered = lgRef.current && hovered;
  const chaosTarget = lgRef.current ? CHAOS_LG[index] : CHAOS_SM[index];

  return (
    <motion.div
      onMouseEnter={lgRef.current ? () => setHovered(true) : undefined}
      onMouseLeave={lgRef.current ? () => setHovered(false) : undefined}
      initial={{
        left: "50%",
        top: "50%",
        opacity: 0,
        scale: 0.3,
        rotate: NODE_START_ROTATIONS[index],
      }}
      animate={
        visible
          ? {
              left: `${chaosTarget.left}%`,
              top: `${chaosTarget.top}%`,
              opacity: [0, 0.45, 0.25],
              scale: 1,
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 12,
        mass: 1.2,
        delay: NODE_DELAYS[index],
        opacity: { duration: 0.8, delay: NODE_DELAYS[index], ease: [0.22, 1, 0.36, 1] },
      }}
      onAnimationComplete={() => setBurstDone(true)}
      className="absolute z-5 cursor-default"
      style={{
        ...(burstDone ? { left: leftStr, top: topStr } : {}),
        maxWidth,
        rotate: scrollRotate,
        opacity: isHovered ? 1 : finalOpacity,
        willChange: "auto",
      }}>
      <motion.div style={{ x: fadedDisplaceX, y: combinedY }}>

        {/* Label — fades out during stack on mobile, stays on desktop */}
        <motion.div
          className="mb-1 font-sans text-[8px] font-medium uppercase tracking-[0.12em] md:text-[9px]"
          style={{
            color: isHovered ? C.accentHot : C.accent,
            opacity: isHovered ? 0.9 : 0.5,
            transition: "all 0.4s",
          }}>
          {node.label}
        </motion.div>

        {/* Title */}
        <div
          className="mb-1.5 font-sans text-[clamp(13px,1.6vw,20px)] leading-tight tracking-[-0.01em] sm:font-serif sm:tracking-normal"
          style={{
            color: isHovered ? C.cardTitleHover : C.cardTitle,
            transition: "color 0.4s",
          }}>
          {node.title}
        </div>

        {/* Detail content — fades out during stack */}
        <motion.div style={{ opacity: detailOpacity }}>
          <p
            className="hidden font-sans text-[clamp(8px,0.85vw,11px)] font-light leading-[1.7] sm:block"
            style={{
              color: isHovered ? C.cardBodyHover : C.cardBody,
              transition: "color 0.4s",
            }}>
            {node.did}
          </p>

          <p
            className="mt-2 hidden pt-1.5 font-sans text-[clamp(8px,0.8vw,10px)] leading-[1.6] sm:block"
            style={{
              color: isHovered ? C.cardSecondaryHover : C.cardSecondary,
              borderTop: `1px solid ${isHovered ? C.hairlineBorderHover : C.hairlineBorder}`,
              transition: "all 0.4s",
            }}>
            <em
              className="not-italic"
              style={{
                color: isHovered ? C.accentHot : C.accent,
                transition: "color 0.4s",
              }}>
              {"\u2192"}
            </em>{" "}
            {node.built}
          </p>

          <p
            className="mt-2 hidden font-serif text-[clamp(9px,0.8vw,11px)] italic leading-normal sm:block"
            style={{
              color: C.cardTransfer,
              opacity: isHovered ? 0.85 : 0,
              maxHeight: isHovered ? 80 : 0,
              overflow: "hidden",
              transition: "opacity 0.4s ease, max-height 0.5s ease",
            }}>
            {node.transfer}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
