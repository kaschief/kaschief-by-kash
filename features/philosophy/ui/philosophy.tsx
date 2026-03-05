"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn, SectionGlow } from "@components";
import { TOKENS, SECTION_ID } from "@utilities";
import { PHILOSOPHY } from "@data";
const { cream, creamMuted, fontSerif, gold, textDim } = TOKENS;
const { PHILOSOPHY: PHILOSOPHY_SECTION } = SECTION_ID;

// Hex needed for gradient alpha interpolation
const GOLD_HEX = "#C9A84C";

/** Individual word that fades/slides in based on scroll progress */
function ScrollWord({
  word,
  progress,
  range,
  color,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  color: string;
}) {
  const opacity = useTransform(progress, range, [0.08, 1]);
  const y = useTransform(progress, range, [8, 0]);

  return (
    <motion.span
      className="inline-block transition-colors duration-300"
      style={{ opacity, y, color, marginRight: "0.3em" }}>
      {word}
    </motion.span>
  );
}

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "100%"]);

  // Flatten all lines into words with color metadata
  const allWords: { word: string; color: string }[] = [];
  PHILOSOPHY.lines.forEach((line, lineIdx) => {
    const color =
      lineIdx < 2 ? cream : lineIdx < 4 ? creamMuted : textDim;
    line.split(" ").forEach((w) => allWords.push({ word: w, color }));
  });

  // Each word gets a slice of the scroll range
  const wordCount = allWords.length;
  const startAt = 0.05;
  const endAt = 0.75;
  const span = (endAt - startAt) / wordCount;

  return (
    <section
      id={PHILOSOPHY_SECTION}
      ref={ref}
      className="relative overflow-hidden px-[var(--page-gutter)] py-20 sm:py-28">
      <SectionGlow color={gold} size="sm" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Opening quotation mark */}
        <motion.span
          className="mb-4 block text-6xl leading-none text-[var(--gold)] sm:text-7xl"
          style={{
            fontFamily: fontSerif,
            opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1]),
          }}>
          {"\u201C"}
        </motion.span>

        {/* Scroll-revealed words */}
        <blockquote
          className="text-xl leading-snug sm:text-3xl lg:text-4xl"
          style={{ fontFamily: fontSerif, fontStyle: "italic", lineHeight: 1.5 }}>
          {allWords.map(({ word, color }, i) => (
            <ScrollWord
              key={i}
              word={word}
              progress={scrollYProgress}
              range={[startAt + i * span, startAt + (i + 2) * span]}
              color={color}
            />
          ))}
        </blockquote>

        <FadeIn delay={0.7}>
          <motion.div
            className="mt-8 h-px"
            style={{
              width: lineWidth,
              opacity: 0.25,
              background: `linear-gradient(to right, ${GOLD_HEX}, ${GOLD_HEX}40, transparent)`,
            }}
          />
        </FadeIn>
      </div>
    </section>
  );
}
