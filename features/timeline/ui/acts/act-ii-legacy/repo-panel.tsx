"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE, Z_INDEX } from "@utilities";

import {
  ACT_BLUE,
  ACT_BLUE_HOVER,
  actBlueRgba,
  PANEL_BORDER,
  PANEL_HEADER_BG,
  PANEL_MAX_W,
  SECTION_BG,
} from "./act-ii.constants";
import type { RepoPanelProps } from "./act-ii.types";
import { RepoPanelHeader } from "./repo-panel-header";
import { RepoMeta } from "./repo-meta";
import { StackPills } from "./stack-pills";
import { ImpactStats } from "./impact-stats";
import { ReadmeContent } from "./readme-content";

export function RepoPanel({ company, onClose }: RepoPanelProps) {
  const repo = company.repo;
  const panelRef = useRef<HTMLDivElement>(null);
  const [linkHovered, setLinkHovered] = useState(false);

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

    /* Only push history if no panel state is already on top — prevents
     * stacking duplicate entries on rapid open/close cycles. */
    if (!window.history.state?.repoPanel) {
      window.history.pushState({ repoPanel: true }, "");
    }
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
        background: SECTION_BG,
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

        <RepoPanelHeader companyName={company.company} repo={repo} onClose={onClose} />
        <RepoMeta repo={repo} />

        {/* Description */}
        <p className="mb-7 max-w-[700px] text-[13px] leading-[1.7] text-(--cream-muted) sm:text-sm">
          {repo.description}
        </p>

        <StackPills stack={repo.stack} />
        <ImpactStats impact={repo.impact} hash={company.hash} />

        {/* README */}
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: PANEL_BORDER }}>
          <div
            className="flex items-center gap-2 border-b px-4 py-2.5 font-ui text-xs text-(--cream-muted)"
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
            className="inline-flex min-h-11 items-center justify-center rounded-md border px-6 py-2.5 font-ui text-xs no-underline transition-all active:scale-[0.97]"
            style={{
              color: linkHovered ? ACT_BLUE_HOVER : ACT_BLUE,
              borderColor: linkHovered ? actBlueRgba(0.5) : actBlueRgba(0.2),
              backgroundColor: linkHovered ? actBlueRgba(0.06) : "transparent",
            }}
            onMouseEnter={() => setLinkHovered(true)}
            onMouseLeave={() => setLinkHovered(false)}
            aria-label={`${repo.url.replace("https://www.", "")} (opens in new tab)`}>
            {repo.url.replace("https://www.", "")}{" "}
            <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
