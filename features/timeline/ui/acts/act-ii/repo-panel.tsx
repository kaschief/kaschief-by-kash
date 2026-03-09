"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EASE, Z_INDEX } from "@utilities";

import {
  CLOSE_BORDER,
  COLOR,
  COLOR_HOVER,
  COLOR_RGBA,
  OVERLAY_BG,
  OVERLAY_NAV_BG,
  PANEL_BORDER,
  PANEL_HEADER_BG,
  PANEL_MAX_W,
} from "./act-ii.constants";
import type { RepoPanelProps } from "./act-ii.types";
import { ImpactStats } from "./impact-stats";
import { ReadmeContent } from "./readme-content";

export function RepoPanel({
  company,
  onClose,
}: RepoPanelProps) {
  const repo = company.repo;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    // Browser back closes the panel
    window.history.pushState({ repoPanel: true }, "");
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);

    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${company.company} — ${repo.name} repository details`}
      className="fixed inset-0 cursor-default overflow-y-auto overscroll-contain outline-none"
      style={{
        zIndex: Z_INDEX.repoPanel,
        background: OVERLAY_BG,
        backdropFilter: "blur(12px)",
        WebkitOverflowScrolling: "touch",
      }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-auto cursor-auto px-6 pt-4 pb-20"
        style={{ maxWidth: PANEL_MAX_W }}
        onClick={(e) => e.stopPropagation()}>

        {/* Top bar */}
        <nav
          className="sticky top-0 z-10 mb-6 flex items-center justify-between pt-20 pb-4"
          style={{ borderBottom: `1px solid ${PANEL_BORDER}`, background: OVERLAY_NAV_BG, backdropFilter: "blur(8px)" }}
          aria-label="Repository navigation">
          <button
            type="button"
            onClick={onClose}
            className="group/back flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors active:scale-[0.97]"
            style={{ background: "none", border: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLOR_RGBA(0.08); }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            aria-label={`Back to career log from ${company.company}`}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill={COLOR}
              className="shrink-0"
              aria-hidden="true">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" />
            </svg>
            <span className="truncate font-mono text-xs sm:text-sm">
              <span style={{ color: COLOR }}>{repo.org}</span>
              <span className="text-(--text-faint) transition-colors group-hover/back:text-(--text-dim)"> / </span>
              <span className="font-bold text-(--cream) transition-colors group-hover/back:text-white">{repo.name}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex shrink-0 min-h-11 cursor-pointer items-center whitespace-nowrap rounded-md border px-3.5 py-1.5 font-mono text-xs text-(--cream-muted) transition-all hover:border-(--text-faint) hover:text-(--cream) active:scale-[0.97]"
            style={{ background: "none", borderColor: CLOSE_BORDER }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            Close
          </button>
        </nav>

        {/* Meta bar */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4 font-mono text-xs"
          aria-label="Repository metadata">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: repo.languageColor }}
              aria-hidden="true"
            />
            <span className="text-(--cream-muted)">{repo.language}</span>
          </span>
          <span className="text-(--text-dim)">
            <span aria-hidden="true">{"\u2605"} </span>
            {repo.stars}
          </span>
          <span className="text-(--text-dim)">
            <span aria-hidden="true">{"\u2387"} </span>
            {repo.branch}
          </span>
        </div>

        {/* Description */}
        <p className="mb-7 max-w-[700px] text-[13px] leading-[1.7] text-(--cream-muted) sm:text-sm">
          {repo.description}
        </p>

        {/* Stack pills */}
        <div className="mb-8 flex flex-wrap gap-1.5">
          {repo.stack.map((tag) => (
            <span
              key={tag.text}
              className="rounded-full border font-mono text-[10px]"
              style={{
                padding: "3px 10px",
                background: `${tag.color}14`,
                color: tag.color,
                borderColor: `${tag.color}26`,
              }}>
              {tag.text}
            </span>
          ))}
        </div>

        {/* Impact stats */}
        <ImpactStats impact={repo.impact} hash={company.hash} />

        {/* README */}
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: PANEL_BORDER }}>
          <div
            className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-(--cream-muted)"
            style={{ background: PANEL_HEADER_BG, borderColor: PANEL_BORDER }}>
            {"\uD83D\uDCC4"} README.md
          </div>
          <ReadmeContent lines={repo.readme} />
        </div>

        {/* External link */}
        <div className="mt-8 text-center">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border px-6 py-2.5 font-mono text-xs no-underline transition-all active:scale-[0.97]"
            style={{ color: COLOR, borderColor: COLOR_RGBA(0.2) }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLOR_HOVER;
              e.currentTarget.style.borderColor = COLOR_RGBA(0.5);
              e.currentTarget.style.backgroundColor = COLOR_RGBA(0.06);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLOR;
              e.currentTarget.style.borderColor = COLOR_RGBA(0.2);
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label={`${repo.url.replace("https://www.", "")} (opens in new tab)`}>
            {repo.url.replace("https://www.", "")}{" "}
            <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
