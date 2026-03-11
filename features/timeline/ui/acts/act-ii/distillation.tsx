"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ACT_II, COMPANIES } from "@data";
import { CONTENT_MAX_W } from "./act-ii.constants";
import { WordDistillation } from "./word-distillation";

/** Scroll runway — 300vh gives 200vh of pinned scrub distance */
const DISTILLATION_HEIGHT = "300vh";

export function Distillation() {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Fade in as section enters viewport (before pinning) */
  const { scrollYProgress: entryScroll } = useScroll({
    target: scrollRef,
    offset: ["start end", "start 0.3"],
  });
  const opacity = useTransform(entryScroll, [0, 0.6], [0, 1]);

  /* Animation progress — scrubs 0→1 while sticky is pinned */
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  /* ── Takeaway — separate scroll-driven reveal ── */
  const takeawayRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: takeawayScroll } = useScroll({
    target: takeawayRef,
    offset: ["start end", "start center"],
  });
  const takeawayOpacity = useTransform(takeawayScroll, [0, 1], [0, 1]);
  const takeawayY = useTransform(takeawayScroll, [0, 1], [20, 0]);

  return (
    <>
      {/* ── Subtle BG darkening ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "-10vh",
          bottom: 0,
          background: `linear-gradient(to bottom, transparent 0%, rgba(7,7,10,0.4) 20%, rgba(7,7,10,0.7) 50%, var(--bg) 80%)`,
        }}
      />

      {/* ── Screen 1: Word distillation (pinned full-screen, scroll-driven) ── */}
      <div ref={scrollRef} className="relative" style={{ height: DISTILLATION_HEIGHT }}>
        <motion.div
          className="sticky top-0 flex h-screen flex-col pt-16 pb-8"
          style={{ opacity, overflowY: "clip" }}
        >
          {/* Inner div sized to usable area — cqh resolves from containerType: size */}
          <div
            className="relative z-10 mx-auto w-full flex-1 overflow-hidden"
            style={{ maxWidth: CONTENT_MAX_W, containerType: "size" }}
          >
            <WordDistillation companies={COMPANIES} progress={scrollYProgress} />
          </div>
        </motion.div>
      </div>

      {/* ── Screen 2: Takeaway ── */}
      <div
        ref={takeawayRef}
        className="relative flex min-h-screen items-center justify-center px-(--page-gutter)"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <motion.h3
          className="mx-auto max-w-2xl text-center font-(family-name:--font-spectral) text-[clamp(22px,3vw,36px)] italic leading-[1.35] tracking-[-0.01em] text-(--cream)"
          style={{ opacity: takeawayOpacity, y: takeawayY }}
        >
          {ACT_II.takeaway}
        </motion.h3>
      </div>
    </>
  );
}
