"use client";

/**
 * Style C — Margin note.
 *
 * Small italic serif. Reads like a handwritten aside in a trading
 * journal. Deliberately quiet and personal — the chart speaks, the
 * text just names what's on it.
 */

import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "../../../constants";
import type { StageHeaderProps } from "./header.types";

export function HeaderMarginNote({ active }: StageHeaderProps) {
  return (
    <header className="flex items-baseline gap-3 font-(--font-alegreya) text-2xl italic text-(--cream-muted)">
      <span>looking at</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={active?.id ?? "anchor"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.silk }}
          className="font-medium text-(--cream)"
          style={{ color: active ? active.accent : "var(--cream)" }}
        >
          {active ? active.name.toLowerCase() : "the chart"}
        </motion.span>
      </AnimatePresence>
    </header>
  );
}
