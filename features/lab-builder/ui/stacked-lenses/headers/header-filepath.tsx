"use client";

/**
 * Style D — Filepath.
 *
 * Treats the header as a source-tree reference: `indicators/pulse.pine`.
 * Monospace, quiet, unmistakably non-marketing. The file is real and the
 * format gestures at that.
 */

import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "../../../constants";
import type { StageHeaderProps } from "./header.types";

export function HeaderFilepath({ active }: StageHeaderProps) {
  return (
    <header className="font-(--font-ibm-plex-mono) text-base text-(--text-dim)">
      <span>indicators/</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={active?.id ?? "anchor"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.duration.fast }}
          className="inline-block"
          style={{ color: active?.accent ?? "var(--cream)" }}
        >
          {active ? active.name.toLowerCase() : "naked"}
        </motion.span>
      </AnimatePresence>
      <span className="text-(--cream-muted)">.pine</span>
    </header>
  );
}
