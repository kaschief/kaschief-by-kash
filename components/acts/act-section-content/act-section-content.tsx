"use client";

import { FadeUp, RevealLine } from "@/components/motion";
import { SectionLabel } from "@/components/ui/section-label";
import { TakeawayBlock } from "@/components/ui/takeaway-block";
import { StatsGrid } from "@/components/ui/stats-grid";
import { SectionProse } from "@/components/ui/section-prose";
import type { ActSectionContentProps } from "./act-section-content.types";

export function ActSectionContent({
  act,
  title,
  period,
  location,
  color,
  lead,
  body,
  takeaway,
  takeawaySerif,
  stats,
  statsColor,
  children,
}: ActSectionContentProps) {
  return (
    <>
      <SectionLabel label={act} color={color} />
      <RevealLine>
        <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
          {title}
        </h3>
      </RevealLine>
      <FadeUp delay={0.2}>
        <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
          {period} · {location}
        </p>
      </FadeUp>

      <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          <SectionProse lead={lead} body={body} delay={0.3} />
          <TakeawayBlock
            text={takeaway}
            color={color}
            delay={0.35}
            serif={takeawaySerif}
            className="mt-12"
          />
        </div>
        <FadeUp delay={0.25}>
          <StatsGrid stats={stats} color={statsColor ?? color} />
        </FadeUp>
      </div>

      {children && (
        <FadeUp delay={0.4}>
          <div className="mx-auto mt-16 max-w-2xl">{children}</div>
        </FadeUp>
      )}
    </>
  );
}
