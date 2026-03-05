"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { EASE, TOKENS } from "@utilities";
import type { StatsGridProps } from "./stats-grid.types";

const { gold } = TOKENS;

/**
 * Parse a stat value string into a numeric part and surrounding text.
 * "5M+" → { prefix: "", number: 5, suffix: "M+" }
 * "50%" → { prefix: "", number: 50, suffix: "%" }
 * "-30%" → { prefix: "-", number: 30, suffix: "%" }
 * "Weekly" → null (not animatable)
 */
function parseStatValue(value: string) {
  const match = value.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseFloat(match[2]),
    suffix: match[3],
  };
}

function AnimatedValue({
  value,
  active,
  color,
}: {
  value: string;
  active: boolean;
  color: string;
}) {
  const parsed = parseStatValue(value);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || !parsed) return;

    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out expo for dramatic deceleration
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * parsed.number));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, parsed?.number]);

  if (!parsed) {
    return (
      <motion.span
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={active ? { opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.6, ease: EASE }}>
        {value}
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.5, ease: EASE }}
      style={{ color, display: "inline-block" }}>
      {parsed.prefix}
      {done ? parsed.number : count}
      {parsed.suffix}
    </motion.span>
  );
}

export function StatsGrid({
  stats,
  color = gold,
  layout = "grid",
  forceActive,
}: StatsGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const active = forceActive ?? inView;

  const isRow = layout === "row";

  return (
    <div
      ref={ref}
      className={
        isRow
          ? "flex flex-wrap items-start justify-center gap-8 sm:gap-14"
          : "grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-1 lg:gap-y-8"
      }>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className=""
          initial={{ opacity: 0, y: 12 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE, delay: i * 0.1 }}>
          <p
            className={
              isRow
                ? "font-serif text-2xl tracking-tight sm:text-3xl"
                : "font-serif text-3xl"
            }
            style={{ color }}>
            <AnimatedValue value={stat.value} active={active} color={color} />
          </p>
          <p
            className={
              isRow
                ? "mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cream-muted)]"
                : "mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]"
            }>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
