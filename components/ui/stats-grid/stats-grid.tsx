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
  // `parsed` is derived from `value` — using `value` avoids object-identity churn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, value]);

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

/**
 * Row mode reads the --ps (portrait scale) CSS variable from its parent.
 * If present, all sizing is a multiple of --ps (1svh), making the stats
 * scale identically to the rest of the portrait section.
 * Falls back to reasonable defaults when used outside portrait.
 */
const PS = (n: number) => `calc(${n} * var(--ps, 1vh))`;

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
          ? "flex flex-wrap items-start justify-center"
          : "grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-1 lg:gap-y-8"
      }
      style={isRow ? { gap: PS(3) } : undefined}>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE, delay: i * 0.1 }}>
          <p
            className={
              isRow
                ? "font-serif tracking-tight"
                : "font-serif text-3xl"
            }
            style={isRow ? { color, fontSize: PS(2.8) } : { color }}>
            <AnimatedValue value={stat.value} active={active} color={color} />
          </p>
          <p
            className={
              isRow
                ? "font-ui uppercase tracking-[0.2em] text-[var(--cream-muted)]"
                : "mt-1 font-ui text-[9px] uppercase tracking-wider text-[var(--text-faint)]"
            }
            style={isRow ? { fontSize: PS(1.1), marginTop: PS(0.3) } : undefined}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
