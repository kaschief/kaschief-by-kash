"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "framer-motion";
import { C } from "./chaos-to-order.constants";

export function ScrollIndicator({
  scrollProgress,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const [show, setShow] = useState(false);
  const dismissed = useRef(false);
  const narratorReached = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollProgress, "change", (v) => {
    if (dismissed.current) return;

    // Dismiss when narrator text is visible (chaos narrator fades in 0.08→0.15)
    if (v >= 0.14) {
      narratorReached.current = true;
      dismissed.current = true;
      if (showTimer.current) clearTimeout(showTimer.current);
      setShow(false);
      return;
    }

    // Show with a slight delay so burst animation plays first
    if (v > 0.005 && !showTimer.current) {
      showTimer.current = setTimeout(() => {
        if (!dismissed.current) setShow(true);
      }, 300);
    }

    // User scrolled back above — only re-show if narrator was never reached
    if (v <= 0) {
      if (showTimer.current) clearTimeout(showTimer.current);
      showTimer.current = null;
      if (!narratorReached.current) {
        setShow(false);
      }
    }
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <motion.div
            className="font-sans text-[9px] font-medium uppercase tracking-[0.15em]"
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
      )}
    </AnimatePresence>
  );
}
