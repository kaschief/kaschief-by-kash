"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { SCROLL_RANGE, GLOW_OPACITY } from "@/components/motion";
import { ActSectionContent } from "@/components/sections/timeline/acts/act-section-content";
import { SectionGlow } from "@/components/ui/section-glow";
import { ACT_IV } from "@/data/timeline";
import { SECTION_ID } from "@/lib/sections";

export function ActIV() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(
    scrollYProgress,
    SCROLL_RANGE.glow,
    GLOW_OPACITY,
  );

  return (
    <div
      id={SECTION_ID.ACT_BUILDER}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={ACT_IV.color} size="lg" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_IV} />
      </div>
    </div>
  );
}
