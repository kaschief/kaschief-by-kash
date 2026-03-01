"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FadeUp, RevealLine, FadeIn } from "./motion"
import { Mail, ArrowUpRight } from "lucide-react"
import { PERSONAL } from "@/data/site"

export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowScale = useTransform(scrollYProgress, [0.2, 0.7], [0.7, 1.1])
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0, 0.5, 0])

  return (
    <section id="contact" ref={sectionRef} className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Atmospheric glows */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 55%)",
            scale: glowScale,
          }}
        />
        <div className="absolute left-[25%] top-[35%] h-[350px] w-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,158,194,0.025) 0%, transparent 55%)", animation: "glow-drift 20s linear infinite" }}
        />
        <div className="absolute right-[20%] bottom-[25%] h-[350px] w-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(94,187,115,0.025) 0%, transparent 55%)", animation: "glow-drift 25s linear 5s infinite" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--gold-dim)]">
            Next Act
          </p>
        </FadeIn>

        <RevealLine delay={0.15}>
          <h2 className="mb-3 text-4xl text-[var(--cream)] sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-serif)" }}>
            Yours to write.
          </h2>
        </RevealLine>

        <FadeUp delay={0.4}>
          <p className="mx-auto mb-10 max-w-md text-pretty text-sm leading-relaxed text-[var(--text-dim)]" style={{ lineHeight: 1.8 }}>
            Open to engineering, leadership, and roles where range is a feature, not a footnote.
          </p>
        </FadeUp>

        <FadeUp delay={0.5}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${PERSONAL.email}`}
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-[var(--bg)] transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }}
              />
              <Mail size={14} className="relative z-10" />
              <span className="relative z-10">{PERSONAL.email}</span>
            </a>
            <a
              href={PERSONAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--stroke)] px-6 py-3 text-sm font-medium text-[var(--cream-muted)] transition-all duration-300 hover:border-[rgba(201,168,76,0.2)] hover:text-[var(--cream)]"
            >
              LinkedIn <ArrowUpRight size={14} />
            </a>
            <a
              href={PERSONAL.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--stroke)] px-6 py-3 text-sm font-medium text-[var(--cream-muted)] transition-all duration-300 hover:border-[rgba(201,168,76,0.2)] hover:text-[var(--cream)]"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.7}>
          <p className="mt-12 text-xs text-[var(--text-faint)]">
            {PERSONAL.phone} &middot; {PERSONAL.location}
          </p>
        </FadeUp>

        <FadeIn delay={0.9}>
          <div className="mx-auto mt-14 h-px w-14" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
        </FadeIn>
      </div>
    </section>
  )
}
