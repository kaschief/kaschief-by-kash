"use client";

import { useRef, useState } from "react";
import {
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ACT_II, COMPANIES } from "@data";
import { CONTENT_MAX_W } from "./act-ii.constants";
import {
  DISSOLVE,
  DISTILLATION_DURATION,
  DISTILLATION_HEIGHT,
  REPLAY_SPEED,
  SCROLL_SPREAD_THRESHOLD,
  SPREAD_THRESHOLD,
} from "./distillation.constants";
import { FloatingEntries } from "./floating-entries";

export function Distillation() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start 0.8", "end end"],
  });

  /* ── Time-based progress (0→1) — resets when user scrolls back, faster on replay ── */
  const progress = useMotionValue(0);
  const [started, setStarted] = useState(false);
  const hasPlayedOnce = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0 && !started) {
      setStarted(true);
      if (prefersReducedMotion) {
        progress.set(1);
      } else {
        const duration = hasPlayedOnce.current
          ? DISTILLATION_DURATION * REPLAY_SPEED
          : DISTILLATION_DURATION;
        animRef.current = animate(progress, 1, { duration, ease: "linear" });
      }
      hasPlayedOnce.current = true;
    } else if (v <= 0 && started) {
      animRef.current?.stop();
      progress.set(0);
      setStarted(false);
    }
  });

  /* ── Hidden until pinned ── */
  const pinned = useTransform(scrollYProgress, (v) => (v > 0 ? 1 : 0));

  /* ── Per-company dissolve (local 0–1) ──
   * Explicit calls (not a loop) to satisfy React's rules of hooks.
   * DISSOLVE.length === COMPANIES.length is enforced at the type level below. */
  const d0 = useTransform(progress, [DISSOLVE[0].start, DISSOLVE[0].end], [0, 1]);
  const d1 = useTransform(progress, [DISSOLVE[1].start, DISSOLVE[1].end], [0, 1]);
  const d2 = useTransform(progress, [DISSOLVE[2].start, DISSOLVE[2].end], [0, 1]);
  const d3 = useTransform(progress, [DISSOLVE[3].start, DISSOLVE[3].end], [0, 1]);
  const dissolveProgress = [d0, d1, d2, d3];

  /* ── Spread: toggle layout from stack → grid (time OR scroll) ── */
  const [isSpread, setIsSpread] = useState(false);
  useMotionValueEvent(progress, "change", (v) => {
    const should = v >= SPREAD_THRESHOLD || scrollYProgress.get() >= SCROLL_SPREAD_THRESHOLD;
    setIsSpread((prev) => (prev !== should ? should : prev));
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const should = v >= SCROLL_SPREAD_THRESHOLD || progress.get() >= SPREAD_THRESHOLD;
    setIsSpread((prev) => (prev !== should ? should : prev));
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
      {/* ── Subtle BG darkening — eases toward --bg ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "-10vh",
          bottom: 0,
          background: `linear-gradient(to bottom, transparent 0%, rgba(7,7,10,0.4) 20%, rgba(7,7,10,0.7) 50%, var(--bg) 80%)`,
        }}
      />

      {/* ── Screen 1: Dissolve → Essences (pinned full-screen) ── */}
      <div ref={scrollRef} className="relative" style={{ height: DISTILLATION_HEIGHT }}>
        <motion.div
          className="sticky top-0 flex h-screen items-center justify-center pt-16 pb-8"
          style={{ opacity: pinned, containerType: "size", overflowY: "clip" }}
        >
          <div className="relative z-10 mx-auto w-full px-(--page-gutter)" style={{ maxWidth: CONTENT_MAX_W }}>
            <LayoutGroup>
              <FloatingEntries
                companies={COMPANIES}
                dissolveProgress={dissolveProgress}
                isSpread={isSpread}
              />
            </LayoutGroup>
          </div>
        </motion.div>
      </div>

      {/* ── Screen 2: Takeaway (its own full-screen moment) ── */}
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
