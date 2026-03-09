"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EASE, Z_INDEX } from "@utilities";

import { COLOR, PANEL_BORDER, PANEL_HEADER_BG } from "./act-ii.constants";
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
        background: "rgba(4,4,8,0.92)",
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
        style={{ maxWidth: 860 }}
        onClick={(e) => e.stopPropagation()}>

        {/* Top bar */}
        <nav
          className="sticky top-0 z-10 mb-6 flex items-center justify-between pt-20 pb-4"
          style={{ borderBottom: `1px solid ${PANEL_BORDER}`, background: "rgba(4,4,8,0.98)", backdropFilter: "blur(8px)" }}
          aria-label="Repository navigation">
          <button
            type="button"
            onClick={onClose}
            className="group/back flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-[rgba(91,158,194,0.08)] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            aria-label={`Back to career log from ${company.company}`}
            style={{ background: "none", border: "none" }}>
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
              <span className="text-[var(--text-faint)] transition-colors group-hover/back:text-[var(--text-dim)]"> / </span>
              <span className="font-bold text-[var(--cream)] transition-colors group-hover/back:text-white">{repo.name}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex shrink-0 min-h-11 cursor-pointer items-center whitespace-nowrap rounded-md border border-[#2A2A34] px-3.5 py-1.5 font-mono text-xs text-[var(--cream-muted)] transition-all hover:border-[var(--text-faint)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--cream)] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            style={{ background: "none" }}>
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
            <span className="text-[var(--cream-muted)]">{repo.language}</span>
          </span>
          <span className="text-[var(--text-dim)]">
            <span aria-hidden="true">{"\u2605"} </span>
            {repo.stars}
          </span>
          <span className="text-[var(--text-dim)]">
            <span aria-hidden="true">{"\u2387"} </span>
            {repo.branch}
          </span>
        </div>

        {/* Description */}
        <p className="mb-7 max-w-[700px] text-[13px] leading-[1.7] text-[var(--cream-muted)] sm:text-sm">
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
            className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-[var(--cream-muted)]"
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
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[rgba(91,158,194,0.2)] px-6 py-2.5 font-mono text-xs text-[#5B9EC2] no-underline transition-all hover:border-[rgba(91,158,194,0.5)] hover:bg-[rgba(91,158,194,0.06)] hover:text-[#8ECAE6] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            aria-label={`${repo.url.replace("https://www.", "")} (opens in new tab)`}>
            {repo.url.replace("https://www.", "")}{" "}
            <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
