"use client";

import { useState } from "react";
import { TOKENS } from "@utilities";
import type { SkillRowProps } from "./methods.types";
const { cream, creamMuted, gold, stroke, textFaint } = TOKENS;

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
        borderBottom: `1px solid ${hovered ? `color-mix(in srgb, ${gold} 35%, transparent)` : stroke}`,
        transition: "border-color 0.15s ease, color 0.15s ease",
        color: hovered ? cream : creamMuted,
        fontSize: 15,
      }}>
      <span>{label}</span>
      <span
        className="hidden sm:inline"
        style={{
          color: hovered ? gold : textFaint,
          fontSize: 13,
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.15s ease, color 0.15s ease",
          display: "inline-block",
        }}>
        →
      </span>
    </button>
  );
}
