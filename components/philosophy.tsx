"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { RevealLine, FadeIn } from "./motion"
import { SectionGlow } from "./ui/section-glow"

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"])

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-20 sm:py-28">
      <SectionGlow color="var(--act-gold)" size="sm" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeIn>
          <span className="mb-4 block text-6xl leading-none text-[var(--gold)] sm:text-7xl" style={{ fontFamily: "var(--font-serif)" }}>
            {"\u201C"}
          </span>
        </FadeIn>

        <div className="flex flex-col gap-0">
          <RevealLine delay={0.1}>
            <blockquote className="text-xl leading-snug text-[var(--cream)] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.35 }}>
              Water can be a river.
            </blockquote>
          </RevealLine>

          <RevealLine delay={0.2}>
            <blockquote className="text-xl leading-snug text-[var(--cream)] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.35 }}>
              It can be ice. It can be the ocean.
            </blockquote>
          </RevealLine>

          <RevealLine delay={0.35}>
            <blockquote className="mt-2 text-xl leading-snug text-[var(--cream-muted)] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.35 }}>
              My skills don{"'"}t belong to any one title.
            </blockquote>
          </RevealLine>

          <RevealLine delay={0.45}>
            <blockquote className="text-xl leading-snug text-[var(--cream-muted)] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.35 }}>
              They adapt to whatever container
            </blockquote>
          </RevealLine>

          <RevealLine delay={0.55}>
            <blockquote className="text-xl leading-snug text-[var(--text-dim)] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.35 }}>
              the work demands.
            </blockquote>
          </RevealLine>
        </div>

        {/* Animated underline */}
        <motion.div
          className="mt-8 h-px bg-[var(--gold)]"
          style={{ width: lineWidth, opacity: 0.25 }}
        />
      </div>
    </section>
  )
}
