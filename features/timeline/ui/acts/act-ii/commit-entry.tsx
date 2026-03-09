"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { COMPANIES } from "@data";
import { EASE } from "@utilities";

import {
  COLOR,
  COLOR_RGBA,
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
  ENTRY_DECODE_STAGGER,
  ENTRY_INVIEW_MARGIN,
  ENTRY_STAGGER_DELAY,
  PROMOTED_COLOR,
  SCRAMBLE_CONFIG,
  SECTION_BG,
} from "./act-ii.constants";
import type { CommitEntryProps } from "./act-ii.types";
import { LockToChevron } from "./lock-to-chevron";
import { ScrambleText } from "./scramble-text";

export function CommitEntry({
  company,
  index,
  onSelect,
}: CommitEntryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: ENTRY_INVIEW_MARGIN });
  const isLast = index === COMPANIES.length - 1;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const decoded = hovered || inView;
  const delay = index * ENTRY_DECODE_STAGGER;

  return (
    <motion.article
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`View ${company.company} — ${company.role}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * ENTRY_STAGGER_DELAY, ease: EASE }}
      className={`group relative ml-1.5 cursor-pointer pl-7 pr-4 py-5 outline-none transition-all duration-200 active:scale-[0.99] rounded-r-2xl focus-visible:rounded-r-2xl ${!isLast ? "border-l-2 border-(--stroke)" : ""}`}
      style={{
        "--dot-color": company.promoted ? PROMOTED_COLOR : COLOR,
        backgroundColor: hovered ? COLOR_RGBA(0.05) : "transparent",
        boxShadow: focused ? `inset 0 0 0 1px ${COLOR_RGBA(0.4)}` : "none",
      } as React.CSSProperties}
      onMouseEnter={() => { setHovered(true); setUnlocked(true); }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => { setHovered(true); setFocused(true); }}
      onBlur={() => setFocused(false)}
      onClick={onSelect}>
      {/* Branch dot */}
      <div
        className="absolute -left-[7px] top-[26px] h-3 w-3 rounded-full border-2 transition-shadow duration-300 group-hover:shadow-[0_0_8px_var(--dot-color)]"
        style={{
          borderColor: company.promoted ? PROMOTED_COLOR : COLOR,
          backgroundColor: company.promoted ? PROMOTED_COLOR : SECTION_BG,
        }}
      />

      {/* Hash */}
      <div className="mb-1 font-mono text-[11px] tracking-[0.05em] text-(--gold)">
        <ScrambleText text={company.hash} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
      </div>

      {/* Company */}
      <div className="flex items-center justify-between text-sm font-bold text-(--cream) transition-colors duration-200 sm:text-base lg:text-lg">
        <span className="group-hover:text-(--act-blue)">
          <ScrambleText text={company.company} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
        </span>
        <span className="text-(--text-faint) transition-colors duration-200 group-hover:text-(--act-blue)">
          <LockToChevron unlocked={unlocked} />
        </span>
      </div>

      {/* Role */}
      <div className="mt-0.5 font-mono text-xs transition-colors duration-200"
        style={{ color: COLOR }}>
        <ScrambleText text={company.role} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
      </div>

      {/* Location + period */}
      <div className="mt-1 font-mono text-[11px] text-(--text-dim)">
        <ScrambleText text={`${company.location} · ${company.period}`} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
      </div>

      {/* Commit messages */}
      <ul className="mt-3 flex list-none flex-col gap-1.5" aria-label="Commits">
        {company.commits.map((commit, i) => (
          <li key={i} className="font-mono text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
            <span
              style={{ color: COMMIT_TYPE_COLORS[commit.type] || COMMIT_TYPE_FALLBACK }}>
              <ScrambleText text={commit.type} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
            </span>
            <span className="text-(--text-faint)">: </span>
            <span className="text-(--cream-muted)">
              <ScrambleText text={commit.msg} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
            </span>
          </li>
        ))}
      </ul>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
        {company.tags.map((tag) => (
          <span
            key={tag.text}
            className="rounded px-2 py-0.5 font-mono text-[10px]"
            style={{
              backgroundColor: `${tag.color}12`,
              color: tag.color,
            }}>
            <ScrambleText text={tag.text} active={decoded} delayMs={delay} {...SCRAMBLE_CONFIG} />
          </span>
        ))}
      </div>
    </motion.article>
  );
}
