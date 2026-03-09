"use client";

import { motion } from "framer-motion";
import { COLOR_RGBA, LOCK_BREATHE, LOCK_TRANSITION } from "./act-ii.constants";

interface LockToChevronProps {
  unlocked: boolean;
}

/**
 * Animated icon: lock → chevron.
 * Lock body + shackle morph into a ">" chevron on unlock.
 */
export function LockToChevron({ unlocked }: LockToChevronProps) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
      animate={unlocked ? "unlocked" : LOCK_BREATHE}
      initial="locked">
      {/* Shackle → top arm of chevron */}
      <motion.path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        fill="none"
        variants={{
          locked: {
            d: "M5.5 6.5V4.5C5.5 3.12 6.62 2 8 2C9.38 2 10.5 3.12 10.5 4.5V6.5",
            opacity: 1,
          },
          unlocked: {
            d: "M6 4L10 8L10 8L10 8L10 8L10 8",
            opacity: 1,
          },
        }}
        transition={LOCK_TRANSITION}
      />
      {/* Lock body → bottom arm of chevron */}
      <motion.path
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        fill="none"
        variants={{
          locked: {
            d: "M4.5 6.5H11.5V13H4.5V6.5Z",
            opacity: 1,
          },
          unlocked: {
            d: "M6 12L10 8L10 8L10 8L10 8L10 8",
            opacity: 1,
          },
        }}
        transition={LOCK_TRANSITION}
      />
      {/* Keyhole — fades out on unlock */}
      <motion.circle
        cx="8"
        cy="9.5"
        r="1"
        fill="currentColor"
        variants={{
          locked: { opacity: 0.6, scale: 1 },
          unlocked: { opacity: 0, scale: 0 },
        }}
        transition={LOCK_TRANSITION}
      />
      {/* Subtle glow behind chevron on unlock */}
      <motion.circle
        cx="9"
        cy="8"
        r="6"
        fill="none"
        variants={{
          locked: { opacity: 0 },
          unlocked: { opacity: 1 },
        }}
        style={{ filter: "blur(4px)" }}
        stroke={COLOR_RGBA(0.15)}
        strokeWidth="1"
        transition={{ ...LOCK_TRANSITION, delay: 0.15 }}
      />
    </motion.svg>
  );
}
