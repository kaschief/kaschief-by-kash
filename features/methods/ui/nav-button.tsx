"use client";

import { useState } from "react";
import { TOKENS, TRANSITION } from "@utilities";
import type { NavButtonProps } from "./methods.types";
const { creamMuted, fontMono, gold, stroke, textDim, textFaint } = TOKENS;

export function NavButton({ label, isActive, onClick }: NavButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}>
      <span
        style={{
          fontFamily: fontMono,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: isActive
            ? creamMuted
            : hovered
              ? textDim
              : textFaint,
          transition: `color ${TRANSITION.base.duration}s ease`,
        }}>
        {label}
      </span>
      <span
        style={{
          position: "relative",
          width: 20,
          height: 1,
          flexShrink: 0,
          display: "inline-block",
        }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 1,
            width: isActive ? 20 : hovered ? 8 : 4,
            background: isActive
              ? gold
              : hovered
                ? textDim
                : stroke,
            transition: `all ${TRANSITION.base.duration}s ease`,
          }}
        />
      </span>
    </button>
  );
}
