"use client";

import {
  PANEL_BORDER,
  PANEL_HEADER_BG,
  ROW_SEPARATOR,
  STAT_MIN_W,
  getStatColor,
} from "./act-ii.constants";
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
        className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-(--text-dim)"
        style={{ background: PANEL_HEADER_BG, borderColor: PANEL_BORDER }}>
        <span className="text-(--gold)">{hash}</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>impact</span>
      </div>
      {impact.map((metric, i) => (
        <div
          key={metric.label}
          className="flex items-baseline gap-3 px-4 py-2.5 font-mono text-xs"
          style={{
            borderBottom:
              i < impact.length - 1 ? `1px solid ${ROW_SEPARATOR}` : "none",
          }}>
          <span
            className="shrink-0 font-bold"
            style={{ color: getStatColor(metric.stat), minWidth: STAT_MIN_W }}>
            {metric.stat}
          </span>
          <span className="text-(--cream-muted)">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
