"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn, FadeUp, RevealLine } from "./motion";
import { TOKENS } from "@/lib/tokens";
import { SectionGlow } from "./ui/section-glow";
import { SectionLabel } from "./ui/section-label";
import { PHILOSOPHY } from "@/data/site";
import { SECTION_ID } from "@/lib/sections";

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"]);

  return (
    <section
      id={SECTION_ID.PHILOSOPHY}
      ref={ref}
      className="relative overflow-hidden px-6 py-20 sm:py-28">
      <SectionGlow color={TOKENS.gold} size="sm" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeUp delay={0.05}>
          <span
            className="mb-4 block text-6xl leading-none text-[var(--gold)] sm:text-7xl"
            style={{ fontFamily: TOKENS.fontSerif }}>
            {"\u201C"}
          </span>
        </FadeUp>

        <div className="flex flex-col gap-0">
          {PHILOSOPHY.lines.map((line, i) => (
            <RevealLine key={i} delay={0.1 + i * 0.1}>
              <blockquote
                className="text-xl leading-snug sm:text-3xl lg:text-4xl"
                style={{
                  fontFamily: TOKENS.fontSerif,
                  fontStyle: "italic",
                  lineHeight: 1.35,
                  color:
                    i < 2
                      ? TOKENS.cream
                      : i < 4
                        ? TOKENS.creamMuted
                        : TOKENS.textDim,
                }}>
                {line}
              </blockquote>
            </RevealLine>
          ))}
        </div>

        <FadeIn delay={0.7}>
          <motion.div
            className="mt-8 h-px bg-[var(--gold)]"
            style={{ width: lineWidth, opacity: 0.25 }}
          />
        </FadeIn>
      </div>
    </section>
  );
}
