"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import {
  useCurtainThesis,
  CONTAINER_HEIGHT_VH,
  SMOOTH_LERP_FACTOR,
} from "./use-curtain-thesis";

export default function LabCurtainThesisPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);

  const smoothedProgress = useRef(0);
  const rawScrollProgress = useRef(0);
  const animationFrameId = useRef(0);

  const { update, jsx, recomputePositions } = useCurtainThesis();

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Compute d3-force positions on mount + resize
  useEffect(() => {
    const el = stickyViewportRef.current;
    if (!el) return;
    recomputePositions(el);
    const onResize = () => recomputePositions(el);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recomputePositions]);

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
      <div
        ref={scrollContainerRef}
        style={{
          height: `${CONTAINER_HEIGHT_VH}vh`,
          background: "var(--bg, #07070A)",
        }}>
        <div
          ref={stickyViewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ containerType: "size" }}>
          {jsx}
        </div>
      </div>
    </>
  );
}
