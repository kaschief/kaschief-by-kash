"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ActI, ActIIGitLog, /* ActIII, */ ActIIILeader, ActIV } from "./acts";
import { TradingArsenal } from "./trading-system";
import { SECTION_ID } from "@utilities";

const { ACT_BUILDER } = SECTION_ID;

// Hex needed for gradient alpha interpolation (CSS vars can't append alpha)
const GOLD_HEX = "#C9A84C";

/** Animated divider that expands on scroll */
function ScrollDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.5"],
  });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.4, 0.15]);

  return (
    <div ref={ref} className="mx-auto max-w-5xl py-4">
      <motion.div
        className="mx-auto h-px"
        style={{
          width,
          opacity,
          background: `linear-gradient(to right, transparent, ${GOLD_HEX}40, transparent)`,
        }}
      />
    </div>
  );
}

/** Each act rises into view with scroll-driven parallax */
function ActTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActI />
      <ActTransition>
        <ActIIGitLog />
      </ActTransition>
      <ScrollDivider />
      <ActIIILeader />
      <ScrollDivider />
      {/* <ActTransition>
        <ActIII />
      </ActTransition>
      <ScrollDivider /> */}
      <ActTransition>
        <section id={ACT_BUILDER}>
          <ActIV />
          <TradingArsenal />
        </section>
      </ActTransition>
    </section>
  );
}
