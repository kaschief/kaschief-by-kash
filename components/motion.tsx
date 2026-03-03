"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Animation constants — single source of truth                       */
/* ------------------------------------------------------------------ */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const TRANSITION = {
  snap: { duration: 0.15, ease: "easeOut" as const }, // backdrop / near-instant covers
  fast: { duration: 0.25, ease: EASE },
  base: { duration: 0.45, ease: EASE },
  slow: { duration: 0.7, ease: EASE },
  page: { duration: 0.9, ease: EASE },
} as const;

/** String form for use in CSS `transition` properties */
export const CSS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Scroll progress input range shared by every act section's glow animation.
 * Pair with GLOW_OPACITY as the output range in useTransform.
 * Typed as number[] (not readonly) to satisfy Framer Motion's InputRange.
 */
export const SCROLL_RANGE: { glow: number[] } = {
  glow: [0, 0.3, 0.7, 1],
};

/** Output opacity values for section glows (paired with SCROLL_RANGE.glow). */
export const GLOW_OPACITY: number[] = [0, 0.5, 0.5, 0];

/** Transition for infinitely repeating pulse animations (dots, eyebrows). */
export const PULSE_TRANSITION = { duration: 3, repeat: Infinity } as const;

/* ------------------------------------------------------------------ */
/*  Components                                                          */
/* ------------------------------------------------------------------ */

export function FadeUp({
  children,
  delay = 0,
  className = "",
  distance = 60,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ ...TRANSITION.page, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: TRANSITION.page.duration,
        delay,
        ease: "easeOut",
      }}
      className={className}>
      {children}
    </motion.div>
  );
}

export function RevealLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ ...TRANSITION.page, delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
