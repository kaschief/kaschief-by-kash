"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import {
  useCurtainThesis,
  CONTAINER_HEIGHT_VH,
  SMOOTH_LERP_FACTOR,
} from "./use-curtain-thesis";
import { MAX_CONTENT_WIDTH } from "./curtain-thesis.config";

export default function LabCurtainThesisPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const smoothedProgress = useRef(0);
  const rawScrollProgress = useRef(0);
  const animationFrameId = useRef(0);

  const { update, fullScreenJsx, contentJsx, recomputePositions } = useCurtainThesis();

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Compute positions from the capped content wrapper (not raw viewport)
  useEffect(() => {
    const el = contentRef.current;
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
          {/* Full-screen layers: thesis text + curtain (need full viewport width) */}
          {fullScreenJsx}

          {/* Content wrapper — max-width cap prevents zoom-out / ultra-wide blowup */}
          <div
            ref={contentRef}
            className="relative h-full mx-auto"
            style={{ maxWidth: MAX_CONTENT_WIDTH }}>
            {contentJsx}
          </div>
        </div>
      </div>
    </>
  );
}
