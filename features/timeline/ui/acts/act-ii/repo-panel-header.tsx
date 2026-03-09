"use client";

import { useState } from "react";
import type { Repo } from "@data";
import {
  CLOSE_BORDER,
  COLOR,
  COLOR_RGBA,
  OVERLAY_NAV_BG,
  PANEL_BORDER,
} from "./act-ii.constants";

interface RepoPanelHeaderProps {
  companyName: string;
  repo: Repo;
  onClose: () => void;
}

export function RepoPanelHeader({ companyName, repo, onClose }: RepoPanelHeaderProps) {
  const [backHovered, setBackHovered] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);

  return (
    <nav
      className="sticky top-0 z-10 mb-6 flex items-center justify-between pt-20 pb-4"
      style={{ borderBottom: `1px solid ${PANEL_BORDER}`, background: OVERLAY_NAV_BG }}
      aria-label="Repository navigation">
      <button
        type="button"
        onClick={onClose}
        className="group/back flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors active:scale-[0.97]"
        style={{
          background: "none",
          border: "none",
          backgroundColor: backHovered ? COLOR_RGBA(0.08) : "transparent",
        }}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        aria-label={`Back to career log from ${companyName}`}>
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
        style={{
          background: "none",
          borderColor: CLOSE_BORDER,
          backgroundColor: closeHovered ? "rgba(255,255,255,0.04)" : "transparent",
        }}
        onMouseEnter={() => setCloseHovered(true)}
        onMouseLeave={() => setCloseHovered(false)}>
        Close
      </button>
    </nav>
  );
}
