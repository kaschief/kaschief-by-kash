"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn, FadeUp, RevealLine, SectionGlow, SectionLabel } from "@components";
import { TOKENS, SECTION_ID } from "@utilities";
import { PHILOSOPHY } from "@data";
const { cream, creamMuted, fontSerif, gold, textDim } = TOKENS;
const { PHILOSOPHY: PHILOSOPHY_SECTION } = SECTION_ID;

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"]);

  return (
    <section
      id={PHILOSOPHY_SECTION}
      ref={ref}
      className="relative overflow-hidden px-6 py-20 sm:py-28">
      <SectionGlow color={gold} size="sm" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeUp delay={0.05}>
          <span
            className="mb-4 block text-6xl leading-none text-[var(--gold)] sm:text-7xl"
            style={{ fontFamily: fontSerif }}>
            {"\u201C"}
          </span>
        </FadeUp>

        <div className="flex flex-col gap-0">
          {PHILOSOPHY.lines.map((line, i) => (
            <RevealLine key={i} delay={0.1 + i * 0.1}>
              <blockquote
                className="text-xl leading-snug sm:text-3xl lg:text-4xl"
                style={{
                  fontFamily: fontSerif,
                  fontStyle: "italic",
                  lineHeight: 1.35,
                  color:
                    i < 2
                      ? cream
                      : i < 4
                        ? creamMuted
                        : textDim,
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
