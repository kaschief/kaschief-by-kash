"use client";

/**
 * Style E — Wordmark.
 *
 * The indicator name as a compact, weighted brand mark in Syne. Tight
 * tracking, uppercase-lowercase mix only when natural. Sits on a thin
 * accent rule so the mark feels anchored without needing a badge.
 */

import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "../../../constants";
import type { StageHeaderProps } from "./header.types";

export function HeaderWordmark({ active }: StageHeaderProps) {
  const accent = active?.accent ?? "rgba(255,255,255,0.4)";
  return (
    <header className="flex items-end gap-5">
      <div className="relative min-h-[5rem]">
        <AnimatePresence initial={false}>
          <motion.h2
            key={active?.id ?? "anchor"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.silk }}
            className="font-(--font-syne) text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-[-0.03em] text-(--cream)"
            style={{ fontWeight: 700 }}
          >
            {active ? active.name : "Naked"}
          </motion.h2>
        </AnimatePresence>
      </div>
      <span
        aria-hidden
        className="mb-2 block h-px flex-1"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
          transition: "background 400ms ease",
        }}
      />
    </header>
  );
}
