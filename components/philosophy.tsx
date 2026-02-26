"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { RevealLine, FadeIn } from "./motion"

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"])

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-32 sm:py-44">
      {/* Ambient background */}
      <div
        className="atmospheric-glow"
        style={{
          width: 700, height: 700,
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <FadeIn>
          <span
            className="mb-6 block text-7xl leading-none text-[#C9A84C] sm:text-8xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {"\u201C"}
          </span>
        </FadeIn>

        <RevealLine delay={0.15}>
          <blockquote
            className="text-2xl leading-snug text-[#F0E6D0] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.3 }}
          >
            Water can be a river.
          </blockquote>
        </RevealLine>

        <RevealLine delay={0.3}>
          <blockquote
            className="text-2xl leading-snug text-[#F0E6D0] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.3 }}
          >
            It can be ice. It can be the ocean.
          </blockquote>
        </RevealLine>

        <RevealLine delay={0.45}>
          <blockquote
            className="mt-2 text-2xl leading-snug text-[#B0A890] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.3 }}
          >
            My skills don{"'"}t belong to any one title.
          </blockquote>
        </RevealLine>

        <RevealLine delay={0.6}>
          <blockquote
            className="text-2xl leading-snug text-[#B0A890] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.3 }}
          >
            They adapt to whatever container
          </blockquote>
        </RevealLine>

        <RevealLine delay={0.75}>
          <blockquote
            className="text-2xl leading-snug text-[#8A8478] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.3 }}
          >
            the work demands.
          </blockquote>
        </RevealLine>

        {/* Animated underline */}
        <motion.div
          className="mt-10 h-px bg-[#C9A84C]"
          style={{ width: lineWidth, opacity: 0.3 }}
        />
      </div>
    </section>
  )
}
