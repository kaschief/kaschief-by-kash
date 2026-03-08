"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "framer-motion";
import { C } from "./chaos-to-order.constants";

export function ScrollIndicator({
  sectionRef,
  scrollProgress,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const [show, setShow] = useState(false);
  const dismissed = useRef(false);

  // Show when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !dismissed.current) {
          setShow(true);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sectionRef]);

  // Dismiss when narrator text starts appearing (scroll progress ~8%)
  useMotionValueEvent(scrollProgress, "change", (v) => {
    if (v >= 0.08 && !dismissed.current) {
      dismissed.current = true;
      setShow(false);
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
      )}
    </AnimatePresence>
  );
}
