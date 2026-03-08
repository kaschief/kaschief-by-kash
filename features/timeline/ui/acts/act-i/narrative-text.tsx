"use client";

import { motion, useTransform } from "framer-motion";
import {
  C,
  SNAP_START,
  SNAP_END,
  STACK_START,
} from "./chaos-to-order.constants";

export function NarrativeText({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const chaosOpacity = useTransform(
    scrollProgress,
    [0.08, 0.15, 0.45, 0.53],
    [0, 1, 1, 0],
  );
  const orderOpacity = useTransform(
    scrollProgress,
    [SNAP_START, SNAP_END, STACK_START - 0.05, STACK_START],
    [0, 1, 1, 0],
  );

  // Desktop narrator shifts from center (50%) to sit between grid rows (48%)
  const narratorTop = useTransform(
    scrollProgress,
    [SNAP_START, SNAP_END],
    [50, 48],
  );
  const narratorTopStr = useTransform(narratorTop, (v) => `${v}%`);

  const narratorBg = `radial-gradient(ellipse, ${C.narratorBgCenter} 0%, ${C.narratorBgEdge} 50%, transparent 100%)`;

  const chaosBlock = (
    <motion.div
      className="rounded-lg px-6 py-4"
      style={{ opacity: chaosOpacity, background: narratorBg }}>
      <p
        className="font-serif text-[clamp(20px,2.8vw,22px)] italic leading-relaxed lg:text-[clamp(16px,1.6vw,22px)]"
        style={{ color: C.narrator }}>
        Every shift began in the middle of something — competing signals,
        incomplete information, all at once.
      </p>
    </motion.div>
  );

  const orderBlock = (
    <motion.div
      className="rounded-lg px-6 py-4"
      style={{ opacity: orderOpacity, background: narratorBg }}>
      <p
        className="font-serif text-[clamp(20px,2.8vw,22px)] italic leading-relaxed lg:text-[clamp(16px,1.6vw,22px)]"
        style={{ color: C.narrator }}>
        The job was never to eliminate the chaos. It was to use my skills to
        make order from it.
      </p>
    </motion.div>
  );

  return (
    <>
      {/* Desktop — scroll-driven vertical position */}
      <motion.div
        className="pointer-events-none absolute left-1/2 z-20 hidden w-72 -translate-x-1/2 -translate-y-1/2 text-center lg:block"
        style={{ top: narratorTopStr }}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          {chaosBlock}
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          {orderBlock}
        </div>
      </motion.div>

      {/* Mobile — fixed between rows 2 & 3 */}
      <div className="pointer-events-none absolute left-1/2 top-[54%] z-20 w-[80vw] -translate-x-1/2 -translate-y-1/2 text-center lg:hidden">
        <div className="relative">
          {chaosBlock}
          <div className="absolute inset-0">{orderBlock}</div>
        </div>
      </div>
    </>
  );
}
