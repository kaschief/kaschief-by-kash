"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { EASE, TRANSITION } from "@utilities";
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
      initial={{ opacity: 0, y: distance, filter: "blur(4px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: distance, filter: "blur(4px)" }
      }
      transition={{ duration: 0.5, ease: EASE, delay }}
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
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={
        inView
          ? { opacity: 1, filter: "blur(0px)" }
          : { opacity: 0, filter: "blur(4px)" }
      }
      transition={{
        duration: TRANSITION.base.duration,
        delay,
        ease: EASE,
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
        initial={{ y: "110%", opacity: 0.3 }}
        animate={inView ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0.3 }}
        transition={{ duration: 0.7, ease: EASE, delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
