"use client";

/**
 * Lab Lenses — Prologue + Crossfade Highlights + Shore Desk
 *
 * 1. Scroll-gated: thesis → keywords → curtain → 4 highlight card crossfade
 * 2. Normal flow: Shore desk with remaining 8 cards (hover/click to explore)
 */

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import {
  useLenses,
  CONTAINER_HEIGHT_VH,
  SMOOTH_LERP_FACTOR,
} from "./use-lenses";
import { MAX_CONTENT_WIDTH } from "./lenses.config";
import { ShoreDesk } from "./shore-desk";
import { useBreakpoint } from "@hooks";
import { BREAKPOINTS } from "@utilities";

/** Mobile: halve the scroll distance so 4 cards don't take 17 screen-heights */
const MOBILE_SCROLL_FACTOR = 0.5;

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */

export default function LabLensesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);

  const smoothedProgress = useRef(0);
  const rawScrollProgress = useRef(0);
  const animationFrameId = useRef(0);

  const isSmUp = useBreakpoint(BREAKPOINTS.sm);
  const scrollHeight = isSmUp ? CONTAINER_HEIGHT_VH : Math.ceil(CONTAINER_HEIGHT_VH * MOBILE_SCROLL_FACTOR);

  const { update, fullScreenJsx, contentJsx } = useLenses();

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothedProgress.current +=
        (rawScrollProgress.current - smoothedProgress.current) *
        SMOOTH_LERP_FACTOR;
      update(smoothedProgress.current, stickyViewportRef);
      animationFrameId.current = requestAnimationFrame(tick);
    };
    animationFrameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [update]);

  useMotionValueEvent(scrollYProgress, "change", (latestValue) => {
    rawScrollProgress.current = latestValue;
  });

  return (
    <>
      <LabNav />

      {/* Scroll-gated section: prologue + crossfade highlights */}
      <div
        ref={scrollContainerRef}
        style={{
          height: `${scrollHeight}vh`,
          background: "var(--bg, #07070A)",
        }}>
        <div
          ref={stickyViewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ containerType: "size" }}>
          {fullScreenJsx}
          <div
            className="relative h-full mx-auto"
            style={{ maxWidth: MAX_CONTENT_WIDTH }}>
            {contentJsx}
          </div>
        </div>
      </div>

      {/* Normal-flow Shore desk */}
      <ShoreDesk />
    </>
  );
}
