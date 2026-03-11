"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Company } from "@data";
import { COLOR } from "./act-ii.constants";
import {
  BG_HEX,
  CREAM_HEX,
  ENTRY_CONTRACT,
  ESSENCE_BLOOM,
  NAME_DRAIN,
  ROLE_FADE,
  TEXT_FAINT_HEX,
} from "./distillation.constants";
import { DissolvingWords } from "./dissolving-words";

/** Per-essence spread transitions — staggered durations so they arrive at different times */
const SPREAD_TRANSITIONS = [
  { type: "tween", duration: 0.45, ease: "circOut" },
  { type: "tween", duration: 0.55, ease: "circOut", delay: 0.03 },
  { type: "tween", duration: 0.4, ease: "circOut", delay: 0.08 },
  { type: "tween", duration: 0.5, ease: "circOut", delay: 0.05 },
] as const;

/** Per-essence float parameters — alternating directions, staggered durations */
const FLOAT_PARAMS = [
  { y: "-6px", duration: "8s", delay: "0s" },
  { y: "5px", duration: "9s", delay: "1.5s" },
  { y: "-5px", duration: "10s", delay: "0.8s" },
  { y: "6px", duration: "8.5s", delay: "2s" },
] as const;

/** Shuffled grid order — essences travel to unexpected positions */
const GRID_ORDER = [2, 0, 3, 1] as const;

/** Mouse displacement config — gentler than chaos-to-order */
const MOUSE_RADIUS = 300;
const MOUSE_STRENGTH = 40;
const MAX_DISPLACEMENT = 30;
const SPRING_CONFIG = { stiffness: 125, damping: 65, mass: 1.5 };

/* ─── Per-company dissolve arc (local 0→1) ───
 *   Words dissolve (DissolvingWords) ........... throughout
 *   Company name color drains .................. 0.18 → 0.40
 *   Role opacity fades ......................... 0.28 → 0.50
 *   Essence blooms (blur→sharp, scale, drift) .. 0.15 → 0.70
 *   Entry padding contracts .................... 0.30 → 0.70
 * ─────────────────────────────────────────────────────────── */

interface FloatingEntriesProps {
  readonly companies: readonly Company[];
  readonly dissolveProgress: readonly MotionValue<number>[];
  readonly isSpread: boolean;
}

export function FloatingEntries({
  companies,
  dissolveProgress,
  isSpread,
}: FloatingEntriesProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ── Floating entries (dissolving view) ── */}
      {!isSpread && (
        <div className="flex flex-col gap-[2cqh]">
          {companies.map((company, i) => (
            <FloatingEntry
              key={company.hash}
              company={company}
              index={i}
              wordProgress={dissolveProgress[i]}
            />
          ))}
        </div>
      )}

      {/* ── Grid essences (spread view) — shuffled so essences travel to unexpected spots ── */}
      {isSpread && (
        <div
          ref={gridRef}
          className="mx-auto grid max-w-2xl grid-cols-2 gap-x-12 gap-y-10 sm:gap-x-16 sm:gap-y-12">
          {GRID_ORDER.map((srcIdx, gridIdx) => (
            <DisplaceableEssence
              key={companies[srcIdx].hash}
              company={companies[srcIdx]}
              gridIdx={gridIdx}
              containerRef={gridRef}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Grid essence with mouse-driven displacement (x/y only, no rotation) ── */

interface DisplaceableEssenceProps {
  readonly company: Company;
  readonly gridIdx: number;
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
}

function DisplaceableEssence({
  company,
  gridIdx,
  containerRef,
}: DisplaceableEssenceProps) {
  const elRef = useRef<HTMLParagraphElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = elRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const t = 1 - dist / MOUSE_RADIUS;
          const force = Math.min(t * t * MOUSE_STRENGTH, MAX_DISPLACEMENT);
          rawX.set((dx / dist) * force);
          rawY.set((dy / dist) * force);
        } else {
          rawX.set(0);
          rawY.set(0);
        }
      });
    };

    const handleLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef, rawX, rawY]);

  return (
    <motion.p
      ref={elRef}
      layoutId={`essence-${company.hash}`}
      className="font-sans leading-[1.4] text-[clamp(14px,2.2cqh,20px)] text-(--cream)"
      transition={SPREAD_TRANSITIONS[gridIdx]}
      style={{
        x,
        y,
        animation: `essence-float ${FLOAT_PARAMS[gridIdx].duration} ease-in-out ${FLOAT_PARAMS[gridIdx].delay} infinite`,
        ["--float-y" as string]: FLOAT_PARAMS[gridIdx].y,
      }}>
      {company.distillation.principle}
    </motion.p>
  );
}

/* ── Dissolving entry with company/role/words/essence ── */

interface FloatingEntryProps {
  readonly company: Company;
  readonly index: number;
  readonly wordProgress: MotionValue<number>;
}

function FloatingEntry({ company, index, wordProgress }: FloatingEntryProps) {
  /* Color drain — cream → dim → bg, like ink absorbed into paper */
  const nameColor = useTransform(
    wordProgress,
    [...NAME_DRAIN],
    [CREAM_HEX, TEXT_FAINT_HEX, BG_HEX],
  );
  const roleOpacity = useTransform(wordProgress, [...ROLE_FADE], [1, 0]);

  /* Essence: slow bloom — sharpens into focus (opposite of header) */
  const essenceOpacity = useTransform(wordProgress, [...ESSENCE_BLOOM.opacity], [0, 0.15, 1]);
  const essenceBlur = useTransform(wordProgress, [...ESSENCE_BLOOM.blur], [6, 0]);
  const essenceFilter = useTransform(essenceBlur, (b) => `blur(${b}px)`);
  const essenceY = useTransform(wordProgress, [...ESSENCE_BLOOM.y], [12, 0]);
  const essenceScale = useTransform(wordProgress, [...ESSENCE_BLOOM.scale], [0.97, 1]);

  /* Entries contract — gap closes as content dissolves */
  const entryPadding = useTransform(wordProgress, [...ENTRY_CONTRACT], [0.5, 0]);
  const paddingStr = useTransform(entryPadding, (v) => `${v}cqh`);

  return (
    <motion.div style={{ paddingBlock: paddingStr }}>
      {/* Company name — color drains into background */}
      <motion.div className="font-bold text-[clamp(13px,1.8cqh,18px)]" style={{ color: nameColor }}>
        {company.company}
      </motion.div>
      {/* Role — simple fade */}
      <motion.div
        className="mt-[0.2cqh] font-mono text-[clamp(10px,1.3cqh,14px)]"
        style={{ opacity: roleOpacity, color: COLOR }}>
        {company.role}
      </motion.div>

      {/* Dissolving words */}
      <div className="mt-[0.6cqh]">
        <DissolvingWords commits={company.commits} progress={wordProgress} />
      </div>

      {/* Essence — drifts up, scales in, sharpens from blur */}
      <motion.p
        layoutId={`essence-${company.hash}`}
        className="mt-[0.5cqh] font-sans leading-[1.4] text-[clamp(14px,2cqh,20px)] text-(--cream)"
        style={{ opacity: essenceOpacity, filter: essenceFilter, y: essenceY, scale: essenceScale }}
        transition={SPREAD_TRANSITIONS[index]}>
        {company.distillation.principle}
      </motion.p>
    </motion.div>
  );
}
