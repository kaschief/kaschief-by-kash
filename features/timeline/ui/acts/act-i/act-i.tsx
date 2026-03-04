"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { FadeUp, RevealLine, SCROLL_RANGE, GLOW_OPACITY, SectionGlow, SectionLabel, TakeawayBlock, SectionProse } from "@components";
import { ACT_I } from "@data";
import { SECTION_ID } from "@utilities";

const { ACT_NURSE } = SECTION_ID;
const { glow } = SCROLL_RANGE;

export function ActI() {
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

  const { act, title, period, location, color, takeaway, intro, detail, features } =
    ACT_I;

  return (
    <div
      id={ACT_NURSE}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
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

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <SectionProse lead={intro} body={detail} delay={0.2} />
          <FadeUp delay={0.3}>
            <div className="space-y-4">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5">
                  <p
                    className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.25em]"
                    style={{ color }}>
                    {f.label}
                  </p>
                  <p className="text-sm text-[var(--cream-muted)]">{f.text}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <TakeawayBlock
          text={takeaway}
          color={color}
          delay={0.4}
          className="mt-20"
        />
      </div>
    </div>
  );
}
