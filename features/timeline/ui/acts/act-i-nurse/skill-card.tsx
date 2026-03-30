"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import type { SkillScenario } from "@data";
import {
  COLORS,
  SNAP_START,
  SNAP_END,
  STACK_START,
  NODE_DELAYS,
  NODE_START_ROTATIONS,
  NODE_WEIGHTS,
  DRIFT_MULTIPLIERS,
  CHAOS_LG,
  CHAOS_SM,
  NUDGE_DELAYS,
  NUDGE_DISPLAY_MS,
  NUDGE_TRIGGER_OFFSET,
  BURST_SPRING,
  BURST_INITIAL_SCALE,
  BURST_OPACITY_SEQUENCE,
  BURST_OPACITY_DURATION,
  PROOF_MAX_HEIGHT,
  WATERMARK_ALPHA,
  WATERMARK_ALPHA_ACTIVE,
  COLOR_TRANSITION,
  PROOF_TRANSITION,
} from "./chaos-to-order.constants";
import { useMouseDisplacement } from "./chaos-to-order.hooks";
import { usePositionTransforms, useChaosDisplacement, useCardColors } from "./use-skill-card-transforms";

interface SkillCardProps {
  node: SkillScenario;
  index: number;
  visible: boolean;
  baseDrift: import("framer-motion").MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: import("framer-motion").MotionValue<number>;
  lgRef: React.RefObject<boolean>;
  /** Render-safe breakpoint flag — mirrors lgRef.current without ref read during render */
  isLg: boolean;
}

export function SkillCard({
  node,
  index,
  visible,
  baseDrift,
  containerRef,
  scrollProgress,
  lgRef,
  isLg,
}: SkillCardProps) {
  const [hovered, setHovered] = useState(false);
  const [burstDone, setBurstDone] = useState(false);
  const [nudged, setNudged] = useState(false);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeDone = useRef(false);
  const inStack = useRef(false);
  const interactive = isLg;

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
    if (p >= SNAP_END + NUDGE_TRIGGER_OFFSET && p < STACK_START && !nudgeTimer.current) {
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

  // Per-card drift: derived from shared baseDrift × this card's multiplier
  const drift = useTransform(baseDrift, (v) => v * DRIFT_MULTIPLIERS[index]);

  // Scroll-driven position, size, and rotation (chaos → order → stack)
  const { left: leftStr, top: topStr, maxWidth, rotate: scrollRotate } =
    usePositionTransforms(scrollProgress, index, lgRef);

  // Fade chaos-only effects (drift + mouse) to hard zero after snap
  const { x: fadedDisplaceX, y: combinedY } =
    useChaosDisplacement(scrollProgress, drift, displaceX, displaceY);

  // Phase-aware colors and opacity
  const { finalOpacity, titleOpacity, titleColor, proofOpacity, questionColor, accentColor, watermarkOpacity } =
    useCardColors(scrollProgress);

  const isHovered = (isLg && hovered) || nudged;
  const chaosTarget = isLg ? CHAOS_LG[index] : CHAOS_SM[index];

  return (
    <motion.div
      role="article"
      tabIndex={isLg ? 0 : undefined}
      aria-label={node.question}
      onMouseEnter={isLg ? () => { if (!inStack.current) { setHovered(true); setNudged(false); } } : undefined}
      onMouseLeave={isLg ? () => setHovered(false) : undefined}
      onFocus={isLg ? () => { if (!inStack.current) setHovered(true); } : undefined}
      onBlur={isLg ? () => setHovered(false) : undefined}
      initial={{
        left: "50%",
        top: "50%",
        opacity: 0,
        scale: BURST_INITIAL_SCALE,
        rotate: NODE_START_ROTATIONS[index],
      }}
      animate={
        visible
          ? {
              left: `${chaosTarget.left}%`,
              top: `${chaosTarget.top}%`,
              opacity: [...BURST_OPACITY_SEQUENCE],
              scale: 1,
            }
          : {}
      }
      transition={{
        ...BURST_SPRING,
        delay: NODE_DELAYS[index],
        opacity: { duration: BURST_OPACITY_DURATION, delay: NODE_DELAYS[index], ease: [0.22, 1, 0.36, 1] },
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
          color: `rgba(224,82,82,${isHovered ? WATERMARK_ALPHA_ACTIVE : WATERMARK_ALPHA})`,
          opacity: watermarkOpacity,
          transition: `color ${COLOR_TRANSITION}`,
        }}
        aria-hidden="true">
        {node.id}
      </motion.div>

      <motion.div style={{ x: fadedDisplaceX, y: combinedY }} className="relative">
        {/* Question — hero text, accent substring highlighted in order phase */}
        <motion.div
          className="mb-[0.5cqh] font-narrator font-bold text-[clamp(13px,1.2vw,17px)] leading-[1.3] text-balance"
          style={{
            color: isHovered ? COLORS.cardTitleHover : questionColor,
            transition: `color ${COLOR_TRANSITION}`,
          }}>
          {(() => {
            if (!node.accentText) return node.question;
            const idx = node.question.indexOf(node.accentText);
            if (idx === -1) return node.question;
            const before = node.question.slice(0, idx);
            const after = node.question.slice(idx + node.accentText.length);
            return (
              <>
                {before}
                <motion.span style={{ color: isHovered ? COLORS.accentHot : accentColor, transition: `color ${COLOR_TRANSITION}` }}>
                  {node.accentText}
                </motion.span>
                {after}
              </>
            );
          })()}
        </motion.div>

        {/* Title — fades in at snap, becomes primary text in stack (hidden on phone) */}
        <motion.div
          className="mb-[0.3cqh] hidden font-sans text-[clamp(10px,0.8vw,12px)] leading-[1.3] tracking-[-0.01em] text-pretty sm:block"
          style={{
            color: isHovered ? COLORS.cardTitleHover : titleColor,
            opacity: titleOpacity,
            transition: `color ${COLOR_TRANSITION}`,
          }}>
          {node.title}
        </motion.div>

        {/* Proof — hover-only collapse, scroll-gated to order phase */}
        <motion.p
          className="hidden font-sans text-[clamp(8px,0.8vw,10px)] font-light leading-[1.7] sm:block"
          style={{
            color: isHovered ? COLORS.cardSecondaryHover : COLORS.cardSecondary,
            opacity: proofOpacity,
            maxHeight: isHovered ? PROOF_MAX_HEIGHT : 0,
            overflow: "hidden",
            transition: `color ${COLOR_TRANSITION}, max-height ${PROOF_TRANSITION}`,
          }}>
          {node.story}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
