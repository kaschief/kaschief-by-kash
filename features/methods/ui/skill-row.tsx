"use client";

import {
  ListRow,
  ListRowArrow,
  LIST_ROW_ARROW_STYLE,
  LIST_ROW_DENSITY,
} from "@components";
import { TOKENS } from "@utilities";
import type { SkillRowProps } from "./methods.types";

const { cream, creamMuted, gold } = TOKENS;

export function SkillRow({ label, onSelect }: SkillRowProps) {
  return (
    <ListRow
      color={gold}
      onClick={onSelect}
      animated={false}
      density={LIST_ROW_DENSITY.COMPACT}
      className="flex items-center justify-between gap-4">
      {({ hovered }) => (
        <>
          <span
            style={{
              fontSize: 15,
              color: hovered ? cream : creamMuted,
              transition: "color 0.15s ease",
            }}>
            {label}
          </span>
          <ListRowArrow
            hovered={hovered}
            color={gold}
            variant={LIST_ROW_ARROW_STYLE.LINE}
          />
        </>
      )}
    </ListRow>
  );
}
