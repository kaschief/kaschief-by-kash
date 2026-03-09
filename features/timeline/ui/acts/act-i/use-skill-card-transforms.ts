"use client";

import { useTransform, type MotionValue } from "framer-motion";
import {
  COLORS,
  BREAKPOINTS,
  SNAP_START,
  SNAP_END,
  STACK_START,
  STACK_END,
  MOBILE_FADEOUT_START,
  MOBILE_FADEOUT_END,
  NODE_END_ROTATIONS,
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
  CHAOS_OPACITY,
  ORDER_OPACITY,
  PROOF_FADEOUT_MARGIN,
  FOCUS_START,
  FOCUS_END,
} from "./chaos-to-order.constants";

// ─── Position & sizing ──────────────────────────────────────────────────────

/** Three-phase position interpolation: chaos → order → stack */
export function usePositionTransforms(
  scrollProgress: MotionValue<number>,
  index: number,
  lgRef: React.RefObject<boolean>,
) {
  const left = useTransform(scrollProgress, (p) => {
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

  const top = useTransform(scrollProgress, (p) => {
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
    const scatteredPx = lg
      ? Math.min(MAX_W_LG_PX[index], MAX_W_LG_VW[index] * vw)
      : MAX_W_SM_VW * vw;
    if (p < STACK_START) return scatteredPx;
    const isMd = !lg && typeof window !== "undefined" && window.innerWidth >= BREAKPOINTS.sm;
    const stackPx = lg
      ? Math.min(MAX_W_STACK_LG_PX, MAX_W_STACK_LG_VW * vw)
      : isMd
        ? Math.min(MAX_W_STACK_MD_PX, MAX_W_STACK_MD_VW * vw)
        : MAX_W_STACK_SM_VW * vw;
    const t = Math.min(1, Math.max(0, (p - STACK_START) / (STACK_END - STACK_START)));
    return scatteredPx + (stackPx - scatteredPx) * t;
  });

  const rotate = useTransform(
    scrollProgress,
    [0, SNAP_START, SNAP_END],
    [NODE_END_ROTATIONS[index], NODE_END_ROTATIONS[index], 0],
  );

  return { left, top, maxWidth, rotate };
}

// ─── Chaos displacement fade ────────────────────────────────────────────────

/** Fades chaos-only effects (drift + mouse) to hard zero after snap */
export function useChaosDisplacement(
  scrollProgress: MotionValue<number>,
  drift: MotionValue<number>,
  displaceX: MotionValue<number>,
  displaceY: MotionValue<number>,
) {
  const chaosFade = useTransform(scrollProgress, (p) =>
    p >= SNAP_END ? 0 : p <= SNAP_START ? 1 : 1 - (p - SNAP_START) / (SNAP_END - SNAP_START),
  );
  const fadedDrift = useTransform([drift, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedX = useTransform([displaceX, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedY = useTransform([displaceY, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const combinedY = useTransform([fadedY, fadedDrift], ([dy, d]) => (dy as number) + (d as number));

  return { x: fadedX, y: combinedY };
}

// ─── Color & opacity transforms ─────────────────────────────────────────────

export function useCardColors(scrollProgress: MotionValue<number>) {
  const finalOpacity = useTransform(scrollProgress, (p) => {
    const mobile = typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.sm;
    const chaosVal = mobile ? CHAOS_OPACITY.mobile : CHAOS_OPACITY.desktop;
    const orderVal = mobile ? ORDER_OPACITY.mobile : ORDER_OPACITY.desktop;
    if (p < SNAP_START) return chaosVal;
    if (p < SNAP_END) return chaosVal + (orderVal - chaosVal) * ((p - SNAP_START) / (SNAP_END - SNAP_START));
    if (mobile && p >= MOBILE_FADEOUT_START) {
      const t = Math.min(1, (p - MOBILE_FADEOUT_START) / (MOBILE_FADEOUT_END - MOBILE_FADEOUT_START));
      return orderVal - orderVal * t;
    }
    return orderVal;
  });

  const titleOpacity = useTransform(scrollProgress, [SNAP_START, SNAP_END], [0, 1]);

  const titleColor = useTransform(scrollProgress, (p) => {
    if (p < STACK_START) return COLORS.cardTitle;
    const t = Math.min(1, (p - STACK_START) / (STACK_END - STACK_START));
    return t > 0.5 ? COLORS.narrator : COLORS.cardTitle;
  });

  const proofOpacity = useTransform(
    scrollProgress,
    [SNAP_START, SNAP_END, STACK_START - PROOF_FADEOUT_MARGIN, STACK_START],
    [0, 1, 1, 0],
  );

  const questionColor = useTransform(scrollProgress, (p) => {
    if (p < SNAP_START) return COLORS.narrator;
    if (p < STACK_START) return COLORS.cardTitle;
    return COLORS.narrator;
  });

  const accentColor = useTransform(scrollProgress, (p) => {
    if (p < SNAP_START) return COLORS.narrator;
    return COLORS.accentMuted;
  });

  // Watermark: fades in during stack, stays bright, gradually dims through focus phase
  const watermarkOpacity = useTransform(
    scrollProgress,
    [STACK_START, STACK_END, FOCUS_START, FOCUS_END],
    [0, 1, 1, 0.5],
  );

  return { finalOpacity, titleOpacity, titleColor, proofOpacity, questionColor, accentColor, watermarkOpacity };
}
