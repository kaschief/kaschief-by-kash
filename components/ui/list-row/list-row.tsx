"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { TOKENS, TRANSITION } from "@utilities";

const { textFaint } = TOKENS;

export const LIST_ROW_DENSITY = {
  COMPACT: "compact",
  DEFAULT: "default",
  SPACIOUS: "spacious",
} as const;

export type ListRowDensity =
  (typeof LIST_ROW_DENSITY)[keyof typeof LIST_ROW_DENSITY];

export const LIST_ROW_TONE = {
  DEFAULT: "default",
  MUTED: "muted",
} as const;

export type ListRowTone = (typeof LIST_ROW_TONE)[keyof typeof LIST_ROW_TONE];

export const LIST_ROW_ARROW_STYLE = {
  LINE: "line",
  CHEVRON: "chevron",
} as const;

export type ListRowArrowStyle =
  (typeof LIST_ROW_ARROW_STYLE)[keyof typeof LIST_ROW_ARROW_STYLE];

const DENSITY_CLASS = {
  [LIST_ROW_DENSITY.COMPACT]: "py-4",
  [LIST_ROW_DENSITY.DEFAULT]: "py-6",
  [LIST_ROW_DENSITY.SPACIOUS]: "py-8",
} as const satisfies Record<ListRowDensity, string>;

const TONE_BORDER_COLOR = {
  [LIST_ROW_TONE.DEFAULT]: "var(--stroke)",
  [LIST_ROW_TONE.MUTED]: "color-mix(in srgb, var(--stroke) 72%, transparent)",
} as const satisfies Record<ListRowTone, string>;

export interface ListRowProps {
  /** Accent color applied to the border and passed to children on hover. */
  color: string;
  onClick: () => void;
  /** Render prop receives `hovered` so children can apply accent styles. */
  children: (props: { hovered: boolean }) => ReactNode;
  className?: string;
  /**
   * When true (default) the row fades in via `useInView` once it enters the
   * viewport. Set to false for rows already inside an animated container
   * (e.g. Methods scrollytelling panel).
   */
  animated?: boolean;
  density?: ListRowDensity;
  tone?: ListRowTone;
}

interface ListRowArrowProps {
  hovered: boolean;
  color: string;
  variant?: ListRowArrowStyle;
}

/**
 * Standardised arrow indicator used by all list rows.
 * Hidden on mobile, visible on sm+. Slides right on hover.
 */
export function ListRowArrow({
  hovered,
  color,
  variant = LIST_ROW_ARROW_STYLE.LINE,
}: ListRowArrowProps) {
  const className = "hidden shrink-0 sm:inline-flex";
  const style: CSSProperties = {
    color: hovered ? color : textFaint,
    alignItems: "center",
    transform: hovered ? "translateX(3px)" : "translateX(0)",
    transition: "transform 0.15s ease, color 0.15s ease",
  };

  if (variant === LIST_ROW_ARROW_STYLE.CHEVRON) {
    return (
      <span aria-hidden className={className} style={style}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </span>
    );
  }

  return (
    <span aria-hidden className={className} style={style}>
      →
    </span>
  );
}

/** Base classes shared by every list row — layout-neutral. */
const BASE =
  "group w-full cursor-pointer border-b text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

/**
 * Shared interactive list row used across Companies, Case Studies, and Methods.
 *
 * Owns:
 * - Hover state
 * - Border-bottom with accent colour on hover
 * - Optional `useInView` entrance animation (animated=true by default)
 * - Base padding, cursor, transition
 *
 * Layout (flex direction, alignment, gap) is left to each consumer via
 * `className` or child markup — this keeps the component layout-neutral.
 */
export function ListRow({
  color,
  onClick,
  children,
  className = "",
  animated = true,
  density = LIST_ROW_DENSITY.DEFAULT,
  tone = LIST_ROW_TONE.DEFAULT,
}: ListRowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);
  const borderColor = hovered
    ? `color-mix(in srgb, ${color} 31%, transparent)`
    : TONE_BORDER_COLOR[tone];

  const sharedProps = {
    onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      borderColor,
    },
    className: `${BASE} ${DENSITY_CLASS[density]} ${className}`,
  };

  if (!animated) {
    return (
      <button type="button" {...sharedProps}>
        {children({ hovered })}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={TRANSITION.base}
      {...sharedProps}>
      {children({ hovered })}
    </motion.button>
  );
}
