"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ActI, ActIIGitLog, /* ActIII, */ ActIIILeader, ActIV } from "./acts";
import { TradingArsenal } from "./trading-system";
import { SECTION_ID } from "@utilities";

const { ACT_BUILDER } = SECTION_ID;

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
      <ActIIILeader />
      <ActTransition>
        <section id={ACT_BUILDER}>
          <ActIV />
          <TradingArsenal />
        </section>
      </ActTransition>
    </section>
  );
}
