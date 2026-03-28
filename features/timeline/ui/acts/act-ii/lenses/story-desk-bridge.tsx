"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CHIPS = ["notice", "clarify", "align", "safeguard"] as const;

export function StoryDeskBridge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center px-6"
      style={{
        paddingTop: "min(120px, 16vh)",
        paddingBottom: "min(120px, 16vh)",
        background: "var(--bg)",
      }}>
      <div
        className="w-12 h-px mb-14"
        style={{ background: "var(--gold-dim)" }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="font-serif"
        style={{
          color: "var(--cream)",
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          lineHeight: 1.18,
          maxWidth: "min(640px, 88vw)",
        }}>
        The verbs underneath the job titles
      </motion.h2>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {CHIPS.map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.45,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.35 + i * 0.07,
            }}
            className="rounded-full border font-ui px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
            style={{
              borderColor: "rgba(139,122,58,0.35)",
              color: "var(--gold-dim)",
              background: "rgba(139,122,58,0.07)",
            }}>
            {chip}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.65 }}
        className="font-narrator mt-10"
        style={{
          color: "var(--text-dim)",
          fontSize: "0.95rem",
          lineHeight: 1.8,
          maxWidth: "min(480px, 88vw)",
          fontStyle: "italic",
        }}>
        The stories compress into four verbs. The funnel ahead is not a new
        idea — it is a map of how those verbs expanded from feature work into
        system work.
      </motion.p>

      <div
        className="w-12 h-px mt-14"
        style={{ background: "var(--gold-dim)" }}
      />
    </div>
  );
}
