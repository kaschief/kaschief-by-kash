"use client";

import { motion, useTransform } from "framer-motion";
import { C } from "./chaos-to-order.constants";

export function ScrollIndicator({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, [0, 0.01, 0.12], [0, 1, 0]);

  return (
    <motion.div
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      style={{ opacity }}>
      <motion.div
        className="font-mono text-[9px] uppercase tracking-[0.3em]"
        style={{ color: C.narrator, opacity: 0.8 }}>
        Scroll
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 5L7 10L12 5"
            stroke={C.narrator}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
