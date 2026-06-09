"use client";

/**
 * Style B — Terminal readout.
 *
 * A single line of monospaced text, reading like a status bar from a
 * trading terminal. No pills, no tracked small caps. Just what's on the
 * chart, in plain technical shorthand.
 */

import { motion, AnimatePresence } from "framer-motion";
import { MOTION } from "../../../constants";
import type { StageHeaderProps } from "./header.types";

export function HeaderTerminal({ active }: StageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-white/10 pb-3">
      <div className="flex items-baseline gap-6 font-(--font-space-mono) text-sm text-(--text-dim)">
        <span>
          <span className="text-(--cream-muted)">chart</span>{" "}
          <span className="text-(--cream)">nq1! · 15m</span>
        </span>
        <span>
          <span className="text-(--cream-muted)">lens</span>{" "}
          <AnimatePresence initial={false}>
            <motion.span
              key={active?.id ?? "anchor"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.fast }}
              style={{ color: active?.accent ?? "var(--cream)" }}
              className="inline-block"
            >
              {active ? active.name.toLowerCase() : "none"}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <span className="font-(--font-space-mono) text-xs text-(--text-dim)">
        kash/indicators v6
      </span>
    </header>
  );
}
