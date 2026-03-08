"use client";

import { useRef, useState } from "react";
import { motion, useTransform, useMotionValueEvent } from "framer-motion";
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
  MAX_W_LG_PX,
  MAX_W_LG_VW,
  MAX_W_SM_VW,
  MAX_W_STACK_LG_PX,
  MAX_W_STACK_LG_VW,
  MAX_W_STACK_MD_PX,
  MAX_W_STACK_MD_VW,
  MAX_W_STACK_SM_VW,
  NUDGE_DELAYS,
  NUDGE_DISPLAY_MS,
  BURST_SPRING,
  PROOF_MAX_HEIGHT,
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
  const [nudged, setNudged] = useState(false);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeDone = useRef(false);
  const inStack = useRef(false);
  const interactive = lgRef.current;

  // Track whether we're in stack/focus phase to disable hover effects
  useMotionValueEvent(scrollProgress, "change", (p) => {
    inStack.current = p >= STACK_START;
    if (inStack.current && hovered) setHovered(false);
  });

  // Auto-expand proof on staggered cards as a hint that cards are hoverable
  const nudgeDelay = NUDGE_DELAYS[index];
  const canNudge = nudgeDelay > 0 || index === 0;
  useMotionValueEvent(scrollProgress, "change", (p) => {
    if (!canNudge || nudgeDone.current || !lgRef.current) return;
    if (p >= SNAP_END + 0.02 && p < STACK_START && !nudgeTimer.current) {
      nudgeTimer.current = setTimeout(() => {
        if (hovered) { nudgeDone.current = true; return; }
        setNudged(true);
        setTimeout(() => {
          setNudged(false);
          nudgeDone.current = true;
        }, NUDGE_DISPLAY_MS);
      }, nudgeDelay);
    }
    if (p < SNAP_START || p >= STACK_START) {
      if (nudgeTimer.current) { clearTimeout(nudgeTimer.current); nudgeTimer.current = null; }
      setNudged(false);
    }
  });

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
    const vw = typeof window !== "undefined" ? window.innerWidth / 100 : 10;
    const orbitPx = lg
      ? Math.min(MAX_W_LG_PX[index], MAX_W_LG_VW[index] * vw)
      : MAX_W_SM_VW * vw;
    if (p < STACK_START) return orbitPx;
    const isMd = !lg && typeof window !== "undefined" && window.innerWidth >= 640;
    const stackPx = lg
      ? Math.min(MAX_W_STACK_LG_PX, MAX_W_STACK_LG_VW * vw)
      : isMd
        ? Math.min(MAX_W_STACK_MD_PX, MAX_W_STACK_MD_VW * vw)
        : MAX_W_STACK_SM_VW * vw;
    const t = Math.min(1, Math.max(0, (p - STACK_START) / (STACK_END - STACK_START)));
    return orbitPx + (stackPx - orbitPx) * t;
  });

  const scrollRotate = useTransform(
    scrollProgress,
    [0, SNAP_START, SNAP_END],
    [NODE_END_ROTATIONS[index], NODE_END_ROTATIONS[index], 0],
  );

  // Fade out chaos-only effects (drift + mouse displacement) during snap
  // Hard zero after SNAP_END so spring momentum can't leak into order/focus
  const chaosFade = useTransform(scrollProgress, (p) =>
    p >= SNAP_END ? 0 : p <= SNAP_START ? 1 : 1 - (p - SNAP_START) / (SNAP_END - SNAP_START),
  );
  const fadedDrift = useTransform([drift, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceX = useTransform([displaceX, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceY = useTransform([displaceY, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const combinedY = useTransform([fadedDisplaceY, fadedDrift], ([dy, d]) => (dy as number) + (d as number));

  // Desktop: 0.25 chaos → 1 order (committed values).
  // Mobile: dimmer — 0.15 chaos → 0.7 order, then fade out before accordion.
  const finalOpacity = useTransform(scrollProgress, (p) => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 640;
    const chaosVal = mobile ? 0.15 : 0.25;
    const orderVal = mobile ? 0.7 : 1;
    if (p < SNAP_START) return chaosVal;
    if (p < SNAP_END) return chaosVal + (orderVal - chaosVal) * ((p - SNAP_START) / (SNAP_END - SNAP_START));
    if (mobile && p >= MOBILE_FADEOUT_START) {
      const t = Math.min(1, (p - MOBILE_FADEOUT_START) / (MOBILE_FADEOUT_END - MOBILE_FADEOUT_START));
      return orderVal - orderVal * t;
    }
    return orderVal;
  });

  // Title: hidden in chaos, fades in during snap, stays visible through stack
  const titleOpacity = useTransform(scrollProgress, [SNAP_START, SNAP_END], [0, 1]);
  // Title becomes primary text in stack — brighten color (hover handled in style prop)
  const titleColor = useTransform(scrollProgress, (p) => {
    if (p < STACK_START) return C.cardTitle;
    const t = Math.min(1, (p - STACK_START) / (STACK_END - STACK_START));
    return t > 0.5 ? C.narrator : C.cardTitle;
  });
  // Proof: hidden in chaos, fades in during snap, fades out during stack
  const proofOpacity = useTransform(scrollProgress, [SNAP_START, SNAP_END, STACK_START - 0.03, STACK_START], [0, 1, 1, 0]);

  // Question color: bright in chaos, muted in order, bright again in focus
  const questionColor = useTransform(scrollProgress, (p) => {
    if (p < SNAP_START) return C.narrator;         // chaos
    if (p < SNAP_END) return C.cardTitle;           // snap
    if (p < STACK_START) return C.cardTitle;         // order
    return C.narrator;                               // focus
  });

  // Accent color for highlighted question substring — red in order phase only
  const accentColor = useTransform(scrollProgress, (p) => {
    if (p < SNAP_START) return C.narrator;            // chaos — same as question
    if (p < SNAP_END) return C.accentMuted;            // snap — fade to muted red
    if (p < STACK_START) return C.accentMuted;         // order — muted red
    return C.accentMuted;                              // focus — stays red
  });

  // ID watermark: hidden in chaos/order, fades in during focus
  const watermarkOpacity = useTransform(scrollProgress, [STACK_START, STACK_END], [0, 1]);

  const isHovered = (lgRef.current && hovered) || nudged;
  const chaosTarget = lgRef.current ? CHAOS_LG[index] : CHAOS_SM[index];

  return (
    <motion.div
      role="article"
      tabIndex={lgRef.current ? 0 : undefined}
      aria-label={node.question}
      onMouseEnter={lgRef.current ? () => { if (!inStack.current) { setHovered(true); setNudged(false); } } : undefined}
      onMouseLeave={lgRef.current ? () => setHovered(false) : undefined}
      onFocus={lgRef.current ? () => { if (!inStack.current) setHovered(true); } : undefined}
      onBlur={lgRef.current ? () => setHovered(false) : undefined}
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
        ...BURST_SPRING,
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
      {/* ID watermark — fixed to container, not card width */}
      <motion.div
        className="pointer-events-none absolute top-[40%] -translate-y-1/2 select-none whitespace-nowrap font-serif text-[clamp(45px,8cqh,120px)] font-bold uppercase leading-none"
        style={{
          left: "31cqw",
          color: `rgba(224,82,82,${isHovered ? 0.07 : 0.04})`,
          opacity: watermarkOpacity,
          transition: "color 0.4s",
        }}
        aria-hidden="true">
        {node.id}
      </motion.div>

      <motion.div style={{ x: fadedDisplaceX, y: combinedY }} className="relative">
        {/* Question — hero text, accent substring highlighted in order phase */}
        <motion.div
          className="mb-[0.5cqh] font-sans text-[clamp(10px,1.6cqh,19px)] leading-[1.3] [text-wrap:balance] sm:font-serif sm:italic"
          style={{
            color: isHovered ? C.cardTitleHover : questionColor,
            transition: "color 0.4s",
          }}>
          {(() => {
            const idx = node.question.indexOf(node.accent);
            if (idx === -1) return node.question;
            const before = node.question.slice(0, idx);
            const after = node.question.slice(idx + node.accent.length);
            return (
              <>
                {before}
                <motion.span style={{ color: isHovered ? C.accentHot : accentColor, transition: "color 0.4s" }}>
                  {node.accent}
                </motion.span>
                {after}
              </>
            );
          })()}
        </motion.div>

        {/* Title — fades in at snap, becomes primary text in stack (hidden on phone) */}
        <motion.div
          className="mb-[0.3cqh] hidden font-sans text-[clamp(9px,1.4cqh,16px)] leading-[1.3] tracking-[-0.01em] [text-wrap:pretty] sm:block"
          style={{
            color: isHovered ? C.cardTitleHover : titleColor,
            opacity: titleOpacity,
            transition: "color 0.4s",
          }}>
          {node.title}
        </motion.div>

        {/* Proof — hover-only collapse, scroll-gated to order phase */}
        <motion.p
          className="hidden font-sans text-[clamp(8px,0.8vw,10px)] font-light leading-[1.7] sm:block"
          style={{
            color: isHovered ? C.cardSecondaryHover : C.cardSecondary,
            opacity: proofOpacity,
            maxHeight: isHovered ? PROOF_MAX_HEIGHT : 0,
            overflow: "hidden",
            transition: "color 0.4s, max-height 0.35s ease",
          }}>
          {node.proof}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
