"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TRANSITION } from "@utilities";
import type { FadeInProps, FadeUpProps, RevealLineProps } from "./motion.types";

/* ------------------------------------------------------------------ */
/*  Components                                                          */
/* ------------------------------------------------------------------ */

export function FadeUp({
  children,
  delay = 0,
  className = "",
  distance = 40,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ ...TRANSITION.base, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: TRANSITION.base.duration,
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
}: RevealLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ ...TRANSITION.slow, delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
