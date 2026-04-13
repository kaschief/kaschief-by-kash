"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FadeUp, SectionGlow } from "@components";
import { ActIIITitle } from "./act-iii-title";
import { ACT_III_LEADER } from "@data";
import {
  EASE,
  GLOW_OPACITY,
  SCROLL_RANGE,
  SECTION_ID,
} from "@utilities";

const { ACT_LEADER } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const {
  annotations,
  closing,
  color: COLOR,
  headline,
  institution,
  location,
  period,
  proof,
  scenarios,
  subhead,
} = ACT_III_LEADER;

// ─── Splash ──────────────────────────────────────────────────────────────────

function Splash() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div
      ref={ref}
      className="relative flex min-h-[85svh] flex-col justify-between px-(--page-gutter) pb-16 pt-10 md:pb-24 md:pt-16">
      {/* Top bar — institution/place/time. The "ACT III · The Leader" label
          is rendered by ActIIITitle directly above this section, so repeating
          it here would be self-referential. The institution name carries the
          brightness, with location and period stepping down in hierarchy. */}
      <motion.div
        className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1 font-ui text-[12px] uppercase tracking-[0.28em] sm:text-[13px]"
        initial={{ opacity: 0, y: -6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}>
        <span className="font-medium text-(--cream-muted)">{institution}</span>
        <span className="text-(--text-dim)">·</span>
        <span className="text-(--text-dim)">{location}</span>
        <span className="text-(--text-dim)">·</span>
        <span className="text-(--text-dim)">{period}</span>
      </motion.div>

      {/* Headline block */}
      <div className="mt-auto pt-20 md:pt-0">
        <div className="overflow-hidden">
          <motion.h2
            className="max-w-[1100px] font-sans text-[clamp(36px,8vw,140px)] font-black uppercase leading-[0.84] tracking-[-0.05em] text-(--cream)"
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE }}>
            {headline.split(" ").map((word: string, i: number) => (
              <span key={i} className="block">{word}</span>
            ))}
          </motion.h2>
        </div>

        <motion.p
          className="mt-8 max-w-2xl font-serif text-lg leading-[1.5] text-(--cream-muted) md:ml-[10%] md:mt-10 md:text-[26px] md:leading-[1.35]"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}>
          {subhead}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Scenario Montage ────────────────────────────────────────────────────────

function ScenarioMontage() {
  return (
    <div className="border-t border-(--stroke) px-(--page-gutter) py-16 md:py-24">
      <FadeUp>
        <p className="mb-3 font-ui text-[10px] uppercase tracking-[0.35em] text-(--text-faint)">
          Selected scenarios
        </p>
        <h3 className="max-w-3xl font-sans text-3xl font-black uppercase leading-[0.88] tracking-[-0.03em] text-(--cream) md:text-6xl lg:text-7xl">
          A few moments that show how I operated.
        </h3>
      </FadeUp>

      <div className="mt-14 space-y-0 md:mt-20">
        {scenarios.map((scenario, index) => (
          <FadeUp key={scenario.id} delay={index * 0.1}>
            <div
              className="grid items-start gap-4 border-t border-(--stroke) py-8 md:gap-8 md:py-10"
              style={{
                marginLeft: `${index * 6}%`,
                gridTemplateColumns: "minmax(0, 1fr)",
              }}>
              {/* Mobile: stacked, Desktop: 3-col */}
              <div className="grid items-start gap-4 md:grid-cols-[60px_1.1fr_0.9fr] md:gap-8">
                <span
                  className="font-sans text-3xl font-black leading-none md:text-5xl"
                  style={{ color: `${COLOR}30` }}>
                  {scenario.id}
                </span>
                <h4 className="max-w-xl font-serif text-xl leading-[1.15] text-(--cream) md:text-3xl lg:text-4xl">
                  {scenario.situation}
                </h4>
                <p className="max-w-md font-sans text-sm leading-[1.8] text-(--text-dim) md:pt-1 md:text-base">
                  {scenario.response}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

// ─── Core Capabilities ───────────────────────────────────────────────────────

function Annotation({
  label,
  text,
  delay,
}: {
  label: string;
  text: string;
  delay: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div className="border-l border-(--stroke) py-1 pl-5">
        <p
          className="mb-2 font-ui text-[10px] uppercase tracking-[0.25em]"
          style={{ color: COLOR }}>
          {label}
        </p>
        <p className="font-sans text-sm leading-[1.7] text-(--text-dim)">{text}</p>
      </div>
    </FadeUp>
  );
}

function CoreCapabilities() {
  return (
    <div className="border-t border-(--stroke) px-(--page-gutter) py-16 md:py-24">
      <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* Left column — headline + prose */}
        <div>
          <FadeUp>
            <p className="mb-3 font-ui text-[10px] uppercase tracking-[0.35em] text-(--text-faint)">
              What I actually did
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h3 className="max-w-2xl font-sans text-3xl font-black uppercase leading-[0.88] tracking-[-0.03em] text-(--cream) md:text-5xl lg:text-6xl">
              I made complex teams move with more clarity.
            </h3>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mt-8 max-w-xl font-serif text-lg leading-[1.5] text-(--cream-muted) md:text-2xl md:leading-[1.3]">
              My role sat at the intersection of people, systems, and delivery.
              I helped teams move through ambiguity without losing momentum or
              creating unnecessary friction.
            </p>
          </FadeUp>
        </div>

        {/* Right column — floating annotations */}
        <div className="flex flex-col gap-10 md:gap-14 lg:pt-8">
          {annotations.map((annotation, index) => (
            <Annotation
              key={annotation.label}
              label={annotation.label}
              text={annotation.text}
              delay={0.15 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Proof ───────────────────────────────────────────────────────────────────

function Proof() {
  return (
    <div className="border-t border-(--stroke) px-(--page-gutter) py-16 md:py-24">
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Left — heading */}
        <FadeUp>
          <p className="mb-3 font-ui text-[10px] uppercase tracking-[0.35em] text-(--text-faint)">
            In practice
          </p>
          <h3 className="max-w-lg font-sans text-3xl font-black uppercase leading-[0.88] tracking-[-0.03em] text-(--cream) md:text-5xl lg:text-6xl">
            What I was able to improve.
          </h3>
        </FadeUp>

        {/* Right — proof list + closing */}
        <div>
          {proof.map((line, index) => (
            <FadeUp key={index} delay={index * 0.08}>
              <div className="grid items-start gap-4 border-t border-(--stroke) py-5 md:grid-cols-[50px_1fr] md:gap-6">
                <span className="font-ui text-[11px] uppercase tracking-[0.25em] text-(--text-faint)">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-sans text-sm leading-[1.75] text-(--text-dim) md:text-base">
                  {line}
                </p>
              </div>
            </FadeUp>
          ))}

          <FadeUp delay={0.4}>
            <p className="mt-10 max-w-lg border-l-2 pl-5 font-serif text-lg leading-[1.4] text-(--cream-muted) md:text-xl"
              style={{ borderColor: COLOR }}>
              {closing}
            </p>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function ActIIILeader() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  return (
    <section id={ACT_LEADER} ref={ref} className="relative" aria-label="Act III — Leadership career" style={{ backgroundColor: "#0A0A0F", zIndex: 2 }}>
      {/* Top fog — smooth transition from Act II */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
        style={{ background: "linear-gradient(to bottom, #0A0A0F, transparent)" }}
      />
      <ActIIITitle />

      <SectionGlow opacity={glowOpacity} color={COLOR} size="lg" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Splash />
        <ScenarioMontage />
        <CoreCapabilities />
        <Proof />
      </div>
    </section>
  );
}
