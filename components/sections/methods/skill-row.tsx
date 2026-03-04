"use client";

import { useState } from "react";
import { TOKENS } from "@/lib/tokens";
import type { SkillRowProps } from "./methods.types";

export function SkillRow({ label, onSelect }: SkillRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        background: "none",
        border: "none",
        borderBottom: `1px solid ${TOKENS.stroke}`,
        opacity: hovered ? 0.5 : 1,
        transition: "opacity 0.15s ease",
        color: TOKENS.creamMuted,
        fontSize: 15,
      }}>
      <span>{label}</span>
      <span className="hidden sm:inline" style={{ color: TOKENS.textFaint, fontSize: 13 }}>→</span>
    </button>
  );
}
