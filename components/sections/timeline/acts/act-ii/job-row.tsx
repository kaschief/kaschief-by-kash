"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TRANSITION } from "@/components/motion";
import { TOKENS } from "@/lib/tokens";
import type { JobRowProps } from "./act-ii.types";

export function JobRow({ job, onSelect, color = TOKENS.gold }: JobRowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={TRANSITION.base}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered
          ? `color-mix(in srgb, ${color} 31%, transparent)`
          : undefined,
      }}
      className="group flex w-full cursor-pointer flex-col gap-3 border-b border-[var(--stroke)] py-8 text-left transition-colors sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <div className="flex items-baseline gap-4">
          <h4
            style={{ color: hovered ? color : undefined }}
            className="font-serif text-2xl text-[var(--cream)] transition-colors sm:text-3xl">
            {job.company}
          </h4>
          <span className="hidden font-mono text-xs text-[var(--text-faint)] sm:inline">
            {job.period}
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--cream-muted)]">{job.role}</p>
        <p className="mt-1 text-sm text-[var(--text-dim)]">{job.summary}</p>
      </div>
      <span
        style={{ color: hovered ? color : undefined }}
        className="shrink-0 text-[var(--text-faint)] transition-all group-hover:translate-x-1 sm:mt-2">
        →
      </span>
    </motion.button>
  );
}
