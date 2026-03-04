"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { SectionGlow } from "@components";
import { ActSectionContent } from "../act-section-content";
import { ACT_IV } from "@data";
import { GLOW_OPACITY, SCROLL_RANGE } from "@utilities";

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
    <div ref={ref} className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_IV} />
      </div>
    </div>
  );
}
