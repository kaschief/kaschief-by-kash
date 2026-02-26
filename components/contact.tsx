"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FadeUp, RevealLine, FadeIn } from "./motion"
import { Mail, ArrowUpRight } from "lucide-react"

export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowScale = useTransform(scrollYProgress, [0.2, 0.8], [0.6, 1.2])
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0, 0.6, 0])

  return (
    <section id="contact" ref={sectionRef} className="relative overflow-hidden px-6 py-32 sm:py-44">
      {/* Multi-layer atmospheric glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: glowOpacity }}
      >
        <motion.div
          className="atmospheric-glow"
          style={{
            width: 800, height: 800,
            top: "50%", left: "50%",
            marginTop: -400, marginLeft: -400,
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 60%)",
            scale: glowScale,
          }}
        />
        <div
          className="atmospheric-glow"
          style={{
            width: 500, height: 500,
            top: "30%", left: "30%",
            background: "radial-gradient(circle, rgba(91,158,194,0.03) 0%, transparent 60%)",
            animation: "glow-drift 20s linear infinite",
          }}
        />
        <div
          className="atmospheric-glow"
          style={{
            width: 500, height: 500,
            top: "60%", right: "20%",
            background: "radial-gradient(circle, rgba(94,187,115,0.03) 0%, transparent 60%)",
            animation: "glow-drift 25s linear 5s infinite",
          }}
        />
      </motion.div>

      {/* Scan line */}
      <div className="scan-line" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[#8B7A3A]">
            Next Act
          </p>
        </FadeIn>

        <RevealLine delay={0.15}>
          <h2
            className="mb-3 text-5xl text-[#F0E6D0] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Yours to write.
          </h2>
        </RevealLine>

        <FadeUp delay={0.4}>
          <p className="mx-auto mb-12 max-w-md text-pretty text-sm leading-relaxed font-light text-[#8A8478]" style={{ lineHeight: 1.8 }}>
            Open to engineering, leadership, and roles where range is a feature, not a footnote.
          </p>
        </FadeUp>

        <FadeUp delay={0.5}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:kaschiefj@gmail.com"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-[#07070A] transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #A8893D)",
              }}
            >
              {/* Shimmer overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                }}
              />
              <Mail size={14} className="relative z-10" />
              <span className="relative z-10">kaschiefj@gmail.com</span>
            </a>
            <a
              href="https://linkedin.com/in/kaschief-johnson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#16161E] px-7 py-3.5 text-sm font-medium text-[#B0A890] transition-all duration-300 hover:border-[#C9A84C33] hover:text-[#F0E6D0]"
            >
              LinkedIn
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://github.com/kaschief/kash-indicators"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#16161E] px-7 py-3.5 text-sm font-medium text-[#B0A890] transition-all duration-300 hover:border-[#C9A84C33] hover:text-[#F0E6D0]"
            >
              GitHub
              <ArrowUpRight size={14} />
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.7}>
          <p className="mt-14 text-xs text-[#4A4640]">
            +49 176 204 19325 &middot; Berlin, Germany
          </p>
        </FadeUp>

        {/* Final gold line */}
        <FadeIn delay={0.9}>
          <div
            className="mx-auto mt-20 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
          />
        </FadeIn>
      </div>
    </section>
  )
}
