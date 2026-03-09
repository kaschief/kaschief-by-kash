"use client";

import { PANEL_BORDER, PANEL_HEADER_BG, getStatColor } from "./act-ii.constants";
import type { ImpactStatsProps } from "./act-ii.types";

export function ImpactStats({
  impact,
  hash,
}: ImpactStatsProps) {
  return (
    <div
      className="mb-7 overflow-hidden rounded-md border"
      style={{ borderColor: PANEL_BORDER }}
      aria-label="Impact metrics">
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-[var(--text-dim)]"
        style={{ background: PANEL_HEADER_BG, borderColor: PANEL_BORDER }}>
        <span className="text-[var(--gold)]">{hash}</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>impact</span>
      </div>
      {impact.map((metric, i) => (
        <div
          key={metric.label}
          className="flex items-baseline gap-3 px-4 py-2.5 font-mono text-xs"
          style={{
            borderBottom:
              i < impact.length - 1 ? "1px solid #111118" : "none",
          }}>
          <span
            className="shrink-0 font-bold"
            style={{ color: getStatColor(metric.stat), minWidth: "5.5rem" }}>
            {metric.stat}
          </span>
          <span className="text-[var(--cream-muted)]">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
