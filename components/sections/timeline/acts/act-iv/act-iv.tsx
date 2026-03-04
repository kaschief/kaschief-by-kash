"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { SCROLL_RANGE, GLOW_OPACITY, ActSectionContent, SectionGlow } from "@components";
import { ACT_IV } from "@data";
import { SECTION_ID } from "@utilities";
const { ACT_BUILDER } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const { color } = ACT_IV;

export function ActIV() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(
    scrollYProgress,
    glow,
    GLOW_OPACITY,
  );

  return (
    <div
      id={ACT_BUILDER}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_IV} />
      </div>
    </div>
  );
}
