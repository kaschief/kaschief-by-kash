"use client";

import { motion } from "framer-motion";
import { METHOD_GROUPS } from "@data";
import { CSS_EASE, PULSE_TRANSITION, TOKENS } from "@utilities";
import { NavButton } from "./nav-button";
import { SkillRow } from "./skill-row";
import type { CSSProperties } from "react";
import type { PanelProps } from "./methods.types";
const { cream, gold, textDim } = TOKENS;
export function Panel({
  group,
  index,
  panelProgress,
  activePanelIndex,
  onSkillSelect,
  onScrollToPanel,
}: PanelProps) {
  const isActive = activePanelIndex === index;
  const dist = Math.abs(panelProgress - index);
  const panelOpacity = Math.max(0, 1 - dist);

  const fadeIn = (delay: number): CSSProperties => ({
    opacity: isActive ? 1 : 0,
    transform: isActive ? "translateY(0)" : "translateY(12px)",
    transition: isActive
      ? `opacity 0.4s ${CSS_EASE} ${delay}s, transform 0.4s ${CSS_EASE} ${delay}s`
      : "opacity 0.15s ease-out, transform 0s 0.15s",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        opacity: panelOpacity,
        transition: "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: isActive ? "auto" : "none",
        overflowY: "hidden",
        paddingTop: "18vh",
      }}>
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          paddingLeft: "var(--page-gutter)",
          paddingRight: "var(--page-gutter)",
          width: "100%",
        }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            ...fadeIn(0),
          }}>
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: gold }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={PULSE_TRANSITION}
          />
          <span
            className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]"
            style={{ color: gold }}>
            Methods
          </span>
        </div>

        {/* Responsive grid: stacked on mobile, 3-col on lg+ */}
        <div className="grid items-start gap-y-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] lg:gap-x-12 lg:gap-y-0">
          {/* Left column: group label + description */}
          <div className="lg:border-r lg:border-[var(--stroke)] lg:pr-12">
            <h2
              className="font-serif text-4xl font-normal tracking-[-0.02em] sm:text-5xl lg:text-6xl"
              style={{
                lineHeight: 1.05,
                marginBottom: 20,
                color: cream,
                ...fadeIn(0.02),
              }}>
              {group.label}
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                color: textDim,
                ...fadeIn(0.04),
              }}>
              {group.description}
            </p>
          </div>

          {/* Skills list */}
          <div>
            {group.skills.map((skill, i) => (
              <div key={skill.id} style={fadeIn(0.04 + i * 0.02)}>
                <SkillRow
                  label={skill.label}
                  onSelect={() => onSkillSelect(skill, group.label, index, i)}
                />
              </div>
            ))}
          </div>

          {/* Nav buttons — desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:pt-1" style={fadeIn(0.02)}>
            {METHOD_GROUPS.map((g, i) => (
              <NavButton
                key={g.id}
                label={g.label}
                isActive={activePanelIndex === i}
                onClick={() => onScrollToPanel(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
