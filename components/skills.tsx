"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, RevealLine } from "./motion"

/* ------------------------------------------------------------------ */
/*  Curated tools - not a compliance list                              */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    category: "Daily drivers",
    items: ["React", "TypeScript", "Next.js", "Vue"],
    note: "What I reach for when building production UIs",
  },
  {
    category: "Testing",
    items: ["Playwright", "Jest", "E2E pipelines"],
    note: "The infrastructure I introduced at DKB",
  },
  {
    category: "Specialized",
    items: ["Pine Script v6", "TradingView", "AI/LLM workflows"],
    note: "14 indicators, 13.5K lines, daily AI-assisted development",
  },
  {
    category: "Languages",
    items: ["English", "French", "Spanish", "German"],
    note: "Four countries, four languages",
  },
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

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-24 sm:py-32">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.025) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <FadeUp>
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--gold-dim)]">
              What I bring
            </p>
          </FadeUp>
          <RevealLine delay={0.1}>
            <h2 className="mb-4 text-3xl text-[var(--cream)] sm:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
              The throughline
            </h2>
          </RevealLine>
          <FadeUp delay={0.2}>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
              Four domains. Different syntax, same underlying discipline: understand the system, find the failure point, fix it without breaking something else.
            </p>
          </FadeUp>
        </div>

        {/* Narrative statement */}
        <FadeUp delay={0.3}>
          <div className="mb-20 rounded-2xl bg-[var(--bg-elevated)] p-8 sm:p-10">
            <p className="text-lg leading-[1.8] text-[var(--cream-muted)]" style={{ fontFamily: "var(--font-serif)" }}>
              I{"'"}ve worked in ICU wards, core banking systems, and live financial markets. These are environments where being careless is expensive.
            </p>
            <p className="mt-4 text-base leading-[1.8] text-[var(--text-dim)]">
              My value isn{"'"}t tied to a title. It{"'"}s in the judgment I use to prevent systems from breaking — and the clarity I bring when they do.
            </p>
          </div>
        </FadeUp>

        {/* Tools - curated, with context */}
        <div className="space-y-8">
          <FadeUp>
            <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--gold)]">
              Tools I work with
            </p>
          </FadeUp>

          {TOOLS.map((cat, index) => (
            <ToolCategory key={cat.category} category={cat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolCategory({ category, index }: { category: (typeof TOOLS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className="sm:w-32 shrink-0">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-faint)]">
            {category.category}
          </span>
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            {category.items.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--cream-muted)] transition-all duration-300 hover:border-[rgba(201,168,76,0.15)] hover:text-[var(--cream)]"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-faint)]">{category.note}</p>
        </div>
      </div>
    </motion.div>
  )
}
