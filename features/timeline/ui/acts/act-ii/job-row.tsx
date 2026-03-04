"use client";

import {
  ListRow,
  ListRowArrow,
  LIST_ROW_DENSITY,
  LIST_ROW_TONE,
} from "@components";
import { TOKENS } from "@utilities";
import type { JobRowProps } from "./act-ii.types";

const { gold } = TOKENS;

export function JobRow({ job, onSelect, color = gold }: JobRowProps) {
  return (
    <ListRow
      color={color}
      onClick={onSelect}
      density={LIST_ROW_DENSITY.SPACIOUS}
      tone={LIST_ROW_TONE.MUTED}
      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      {({ hovered }) => (
        <>
          <div className="flex-1">
            <div className="flex items-baseline gap-4">
              <h4
                style={{ color: hovered ? color : undefined }}
                className="font-serif text-2xl text-[var(--cream)] transition-colors sm:text-3xl">
                {job.company}
              </h4>
              <span className="hidden font-mono text-xs text-[var(--text-faint)] sm:inline">
                {job.period}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--cream-muted)]">{job.role}</p>
            <p className="mt-1 text-sm text-[var(--text-dim)]">{job.summary}</p>
          </div>
          <ListRowArrow hovered={hovered} color={color} />
        </>
      )}
    </ListRow>
  );
}
