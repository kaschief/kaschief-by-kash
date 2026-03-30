"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutReady } from "@hooks";
import { ActINurse, ActIIEngineer, ActIIILeader, ActIVBuilder } from "./acts";
import { TradingArsenal } from "./trading-system";
import { SECTION_ID } from "@utilities";

const { ACT_BUILDER, ACT_ENGINEER } = SECTION_ID;

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
  const clearBarrier = useLayoutReady((s) => s.clearBarrier);

  // Signal that Timeline DOM is committed and painted.
  useEffect(() => {
    const id = requestAnimationFrame(() => clearBarrier("timeline-mounted"));
    return () => cancelAnimationFrame(id);
  }, [clearBarrier]);

  return (
    <section id="journey" className="relative">
      <ActINurse />
      <section id={ACT_ENGINEER}>
        <ActIIEngineer />
      </section>
      <ActIIILeader />
      <ActTransition>
        <section id={ACT_BUILDER}>
          <ActIVBuilder />
          <TradingArsenal />
        </section>
      </ActTransition>
    </section>
  );
}
