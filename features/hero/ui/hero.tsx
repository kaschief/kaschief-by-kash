"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PERSONAL, ROLES } from "@data";
import { EASE, SECTION_ID } from "@utilities";

const { PORTRAIT } = SECTION_ID;
import { useSectionScroll } from "@hooks";

/**
 * Split text into words, each wrapped in an overflow-hidden span
 * so each word can reveal independently with a y-clip effect.
 */
function WordReveal({
  word,
  delay,
}: {
  word: string;
  delay: number;
}) {
  return (
    <motion.span
      className="inline-block"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: EASE }}>
      {word}
    </motion.span>
  );
}

function SplitReveal({
  text,
  baseDelay,
  stagger,
  className,
  style,
}: {
  text: string;
  baseDelay: number;
  stagger: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <span key={i}>
          <WordReveal word={word} delay={baseDelay + i * stagger} />
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { name } = PERSONAL;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll-driven parallax: content drifts up + fades + blurs as you scroll away
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.75], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0.35, 0.8], [0, 12]);
  const contentFilter = useTransform(contentBlur, (v) => `blur(${v}px)`);
  const glowScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.6]);
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.55], [0.4, 0]);

  const { scrollToSection } = useSectionScroll();

  // Split name into first/last for staggered reveal
  const nameParts = name.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #0E0E14 0%, #07070A 100%)",
      }}>
      {/* Animated ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ scale: glowScale, opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 40%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-[var(--page-gutter)] text-center"
        style={{
          y: contentY,
          opacity: contentOpacity,
          filter: contentFilter,
        }}>
        {/* Name — word-by-word reveal with subtle 3D rotation */}
        <h1>
          <motion.button
            type="button"
            onClick={() => scrollToSection(PORTRAIT)}
            className="cursor-pointer font-serif text-[clamp(3.5rem,10vw,8rem)] font-normal leading-[0.9] tracking-[-0.02em] text-[var(--cream)] underline decoration-[var(--gold)]/20 underline-offset-[0.12em] decoration-1 sm:no-underline sm:transition-opacity sm:duration-300 sm:hover:opacity-80"
            animate={{ y: [0, 0, -6, 0] }}
            transition={{ duration: 0.5, delay: 2.2, ease: "easeInOut" }}>
            {nameParts.map((part, i) => (
              <span key={part}>
                {i > 0 && " "}
                <SplitReveal
                  text={part}
                  baseDelay={0.3 + i * 0.15}
                  stagger={0.06}
                />
              </span>
            ))}
          </motion.button>
        </h1>

        {/* Divider line that grows from center */}
        <motion.div
          className="mx-auto mt-6 mb-6 h-px bg-[var(--gold)]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 0.3 }}
          transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
        />

        {/* Roles — staggered fade-in with blur-to-focus */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {ROLES.map(({ label, color, sectionId }, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 1.0 + i * 0.12, ease: EASE }}
              className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-[var(--text-faint)] opacity-40">/</span>
              )}
              <button
                type="button"
                onClick={() => scrollToSection(sectionId)}
                className="group relative cursor-pointer px-0.5 py-2 text-xs font-light tracking-wide sm:text-sm md:text-base"
                style={{ color }}>
                <span className="transition-opacity duration-200 group-hover:opacity-80">
                  {label}
                </span>
                <span
                  className="absolute -bottom-0.5 left-1 right-1 h-px w-0 transition-all duration-300 group-hover:w-[calc(100%-8px)]"
                  style={{ backgroundColor: color, opacity: 0.5 }}
                />
              </button>
            </motion.span>
          ))}
          {/* TODO: temporary — remove before production */}
          <motion.span
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 1.0 + ROLES.length * 0.12, ease: EASE }}
            className="flex items-center gap-2">
            <span className="text-[var(--text-faint)] opacity-40">/</span>
            <a
              href="/lab"
              className="group relative px-0.5 py-2 text-xs font-light tracking-wide sm:text-sm md:text-base"
              style={{ color: "var(--text-faint)" }}>
              <span className="transition-opacity duration-200 group-hover:opacity-80">
                Lab
              </span>
              <span
                className="absolute -bottom-0.5 left-1 right-1 h-px w-0 transition-all duration-300 group-hover:w-[calc(100%-8px)]"
                style={{ backgroundColor: "var(--text-faint)", opacity: 0.5 }}
              />
            </a>
          </motion.span>
        </motion.div>

      </motion.div>


    </section>
  );
}
