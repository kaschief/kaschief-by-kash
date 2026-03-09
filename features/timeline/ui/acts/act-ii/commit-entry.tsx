"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { COMPANIES } from "@data";
import { EASE } from "@utilities";

import {
  COLOR,
  COLOR_HOVER,
  COLOR_RGBA,
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
  ENTRY_INVIEW_MARGIN,
  ENTRY_STAGGER_DELAY,
  PROMOTED_COLOR,
  SECTION_BG,
} from "./act-ii.constants";
import type { CommitEntryProps } from "./act-ii.types";

export function CommitEntry({
  company,
  index,
  onSelect,
}: CommitEntryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: ENTRY_INVIEW_MARGIN });
  const isLast = index === COMPANIES.length - 1;

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
        backgroundColor: "transparent",
      } as React.CSSProperties}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLOR_RGBA(0.05); }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${COLOR_RGBA(0.4)}`; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
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
        {company.hash}
      </div>

      {/* Company */}
      <div className="flex items-center justify-between text-sm font-bold text-(--cream) transition-colors duration-200 sm:text-base lg:text-lg"
        style={{ "--hover-color": COLOR } as React.CSSProperties}>
        <span className="group-hover:text-(--act-blue)">{company.company}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 text-(--text-faint) transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-(--act-blue)"
          aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Role */}
      <div className="mt-0.5 font-mono text-xs transition-colors duration-200"
        style={{ color: COLOR }}>
        <span className="group-hover:hidden">{company.role}</span>
        <span className="hidden group-hover:inline" style={{ color: COLOR_HOVER }}>{company.role}</span>
      </div>

      {/* Location + period */}
      <div className="mt-1 font-mono text-[11px] text-(--text-dim)">
        {company.location} · {company.period}
      </div>

      {/* Commit messages */}
      <ul className="mt-3 flex list-none flex-col gap-1.5" aria-label="Commits">
        {company.commits.map((commit, i) => (
          <li key={i} className="font-mono text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
            <span
              style={{ color: COMMIT_TYPE_COLORS[commit.type] || COMMIT_TYPE_FALLBACK }}>
              {commit.type}
            </span>
            <span className="text-(--text-faint)">: </span>
            <span className="text-(--cream-muted)">{commit.msg}</span>
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
            {tag.text}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
