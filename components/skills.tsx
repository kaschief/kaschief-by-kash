"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Tools - organized like Apple spec lists                            */
/* ------------------------------------------------------------------ */

const TOOL_SECTIONS = [
  {
    category: "Frontend Engineering",
    items: [
      { name: "React", note: "Primary framework since 2018" },
      { name: "Vue", note: "Production experience at Compado & CAPinside" },
      { name: "TypeScript", note: "Default for all new projects" },
      { name: "Next.js", note: "Full-stack when needed" },
    ],
  },
  {
    category: "Testing & Quality",
    items: [
      { name: "Playwright", note: "E2E infrastructure I built at DKB" },
      { name: "Jest", note: "Unit testing patterns and coaching" },
      { name: "CI/CD", note: "GitHub Actions, pre-deploy verification" },
    ],
  },
  {
    category: "Specialized",
    items: [
      { name: "Pine Script v6", note: "14 indicators, 13.5K lines" },
      { name: "AI/LLM Workflows", note: "Daily development practice" },
      { name: "TradingView", note: "Platform and ecosystem" },
    ],
  },
  {
    category: "Languages",
    items: [
      { name: "English", note: "Native" },
      { name: "French", note: "Conversational" },
      { name: "Spanish", note: "Conversational" },
      { name: "German", note: "B2 working proficiency" },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Tool Row Component                                                 */
/* ------------------------------------------------------------------ */

function ToolRow({ item, index }: { item: { name: string; note: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex items-baseline justify-between border-b border-[var(--stroke)] py-3 last:border-b-0"
    >
      <span className="text-sm text-[var(--cream)]">{item.name}</span>
      <span className="text-xs text-[var(--text-faint)]">{item.note}</span>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool Section Component                                             */
/* ------------------------------------------------------------------ */

function ToolSection({ section, index }: { section: (typeof TOOL_SECTIONS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h4 className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
        {section.category}
      </h4>
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-card)] px-5">
        {section.items.map((item, i) => (
          <ToolRow key={item.name} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

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

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-24 sm:py-32">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header with profile photo */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Text */}
          <div>
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
                What I bring
              </h2>
            </RevealLine>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-lg leading-[1.7] text-[var(--cream-muted)]">
                Four domains. Different syntax, same underlying discipline: understand the system, find the failure point, fix it without breaking something else.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="mt-4 text-sm leading-[1.8] text-[var(--text-dim)]">
                I{"'"}ve worked in ICU wards, core banking systems, and live financial markets. These are environments where being careless is expensive. My value isn{"'"}t tied to a title — it{"'"}s in the judgment I use to prevent systems from breaking.
              </p>
            </FadeUp>
          </div>

          {/* Right: Profile photo */}
          <FadeUp delay={0.3}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl lg:mx-0">
              <Image
                src="/images/kaschief.jpg"
                alt="Kaschief Johnson"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              {/* Subtle gold border accent */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[var(--gold)]/10" />
            </div>
          </FadeUp>
        </div>

        {/* Tools Grid - Apple spec style */}
        <FadeUp delay={0.4}>
          <div className="grid gap-8 sm:grid-cols-2">
            {TOOL_SECTIONS.map((section, i) => (
              <ToolSection key={section.category} section={section} index={i} />
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
