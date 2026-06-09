"use client";

/**
 * Style A — Monumental.
 *
 * One word. Fraunces italic, lowercase, large enough to carry the top of
 * the frame on its own. No meta, no counter, no pill. The name is the
 * headline.
 *
 * Layout note: the container is a fixed-height relative box and each
 * heading is absolutely positioned inside it. Why: AnimatePresence runs
 * old + new in parallel during the fade, and two flow-layout <h2>s would
 * stack vertically — pushing the chart down on every indicator change.
 * Absolute positioning keeps both headings on top of each other so the
 * stage height never shifts as you scroll.
 */

import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "../../../constants";
import type { StageHeaderProps } from "./header.types";

export function HeaderMonumental({ active }: StageHeaderProps) {
  return (
    <header className="relative h-[7rem] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.h2
          key={active?.id ?? "anchor"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.silk }}
          className="absolute inset-0 flex items-end font-(--font-fraunces) text-[clamp(3.5rem,9vw,7rem)] leading-none tracking-[-0.02em] text-(--cream)"
          style={{ fontStyle: "italic", fontWeight: 300 }}
        >
          {active ? active.name.toLowerCase() : "naked"}
        </motion.h2>
      </AnimatePresence>
    </header>
  );
}
