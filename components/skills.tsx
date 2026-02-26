"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Skill capabilities - simple flowing text, not grid boxes           */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  { label: "React", detail: "Primary since 2018" },
  { label: "Vue", detail: "Compado, CAPinside" },
  { label: "TypeScript", detail: "Default" },
  { label: "Next.js", detail: "Full-stack" },
  { label: "Playwright", detail: "Built at DKB" },
  { label: "Jest", detail: "Testing patterns" },
  { label: "Pine Script v6", detail: "14 indicators" },
  { label: "AI/LLM", detail: "Daily practice" },
]

const LANGUAGES = [
  { lang: "English", level: "Native" },
  { lang: "French", level: "Conversational" },
  { lang: "Spanish", level: "Conversational" },
  { lang: "German", level: "B2" },
]

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 0.4, 0.4, 0])
  const capabilitiesRef = useRef<HTMLDivElement>(null)
  const capabilitiesInView = useInView(capabilitiesRef, { once: true, margin: "-50px" })

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-24 sm:py-32">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Profile photo + intro text side by side */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-5">
          {/* Photo - smaller, accent border */}
          <FadeUp delay={0.1} className="lg:col-span-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl lg:mx-0">
              <Image
                src="/images/kaschief.jpg"
                alt="Kaschief Johnson"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 280px, 320px"
              />
              {/* Gold accent line on left */}
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-transparent via-[var(--gold)]/40 to-transparent" />
            </div>
          </FadeUp>

          {/* Text */}
          <div className="lg:col-span-3">
            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--gold)]">
                  The Throughline
                </span>
              </div>
            </FadeIn>
            <RevealLine delay={0.1}>
              <h2 className="font-serif text-4xl text-[var(--cream)] sm:text-5xl">
                What I Bring
              </h2>
            </RevealLine>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-lg leading-[1.7] text-[var(--cream-muted)]">
                Four domains. Different syntax, same underlying discipline: understand the system, find the failure point, fix it without breaking something else.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="mt-4 text-sm leading-[1.8] text-[var(--text-dim)]">
                I{"'"}ve worked in ICU wards, core banking systems, and live financial markets. These are environments where being careless is expensive.
              </p>
            </FadeUp>
          </div>
        </div>

        {/* Capabilities - flowing inline tags, not boxes */}
        <div ref={capabilitiesRef} className="border-t border-[var(--stroke)] pt-12">
          <FadeIn>
            <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--gold)]">
              Tools
            </p>
          </FadeIn>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 10 }}
                animate={capabilitiesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group"
              >
                <span className="text-base text-[var(--cream)] transition-colors group-hover:text-[var(--gold)]">
                  {cap.label}
                </span>
                <span className="ml-2 text-xs text-[var(--text-faint)]">
                  {cap.detail}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Languages - simple inline */}
          <FadeUp delay={0.4}>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--text-faint)]">
                Languages
              </span>
              {LANGUAGES.map((l, i) => (
                <span key={l.lang} className="text-sm text-[var(--cream-muted)]">
                  {l.lang}
                  <span className="ml-1.5 text-xs text-[var(--text-faint)]">{l.level}</span>
                  {i < LANGUAGES.length - 1 && <span className="ml-6 text-[var(--stroke)]">·</span>}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
