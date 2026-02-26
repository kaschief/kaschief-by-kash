"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Tools - Sentence form (per screenshot)                             */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    category: "FRONTEND",
    content: (
      <>
        <strong className="text-[var(--cream)]">React</strong> since 2018, <strong className="text-[var(--cream)]">Vue</strong> at Compado & CAPinside, <strong className="text-[var(--cream)]">TypeScript</strong> as default, Next.js when full-stack is needed.
      </>
    ),
  },
  {
    category: "TESTING",
    content: (
      <>
        <strong className="text-[var(--cream)]">Playwright</strong> — built the E2E infrastructure at DKB. <strong className="text-[var(--cream)]">Jest</strong> for unit patterns. CI/CD with GitHub Actions.
      </>
    ),
  },
  {
    category: "SPECIALIZED",
    content: (
      <>
        <strong className="text-[var(--cream)]">Pine Script v6</strong> — 13,500 lines written from scratch. <strong className="text-[var(--cream)]">AI/LLM workflows</strong> as daily development practice. TradingView platform and ecosystem.
      </>
    ),
  },
  {
    category: "LEADERSHIP",
    content: (
      <>
        Roadmapping, hiring for fit, weekly 1:1s, mentoring into senior roles, cross-functional communication across engineering and product.
      </>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Languages                                                          */
/* ------------------------------------------------------------------ */

const LANGUAGES = [
  { lang: "English", desc: "Native tongue.", level: "NATIVE" },
  { lang: "Français", desc: "Conversational — used daily in Berlin.", level: "C1" },
  { lang: "Español", desc: "Conversational.", level: "B1" },
  { lang: "Deutsch", desc: "Working proficiency in Berlin.", level: "B1" },
]

/* ------------------------------------------------------------------ */
/*  Stagger animation wrapper                                          */
/* ------------------------------------------------------------------ */

function StaggerContainer({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      className={className}
    >
      {children}
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
    <section id="skills" ref={sectionRef} className="relative px-6 py-32 sm:py-40">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Profile photo + intro text side by side */}
        <div className="mb-24 grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
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

        {/* ============================================================ */}
        {/*  TOOLS - Sentence form per screenshot                        */}
        {/* ============================================================ */}
        <div className="mb-20">
          <FadeIn>
            <h3 className="mb-10 font-serif text-lg text-[var(--cream)]">Tools</h3>
          </FadeIn>
          <StaggerContainer>
            {TOOLS.map((tool, i) => (
              <StaggerItem 
                key={tool.category} 
                className={`flex flex-col gap-2 border-b border-[#16161E] py-5 sm:flex-row sm:gap-6 ${i === 0 ? "border-t" : ""}`}
              >
                <span className="w-28 shrink-0 font-mono text-[9px] uppercase tracking-wider text-[#3A3830]">
                  {tool.category}
                </span>
                <p className="text-sm leading-relaxed text-[#C0B898]">
                  {tool.content}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* ============================================================ */}
        {/*  LANGUAGES - per screenshot with level badges                */}
        {/* ============================================================ */}
        <div>
          <FadeIn>
            <h3 className="mb-10 font-serif text-lg text-[var(--cream)]">Languages</h3>
          </FadeIn>
          <StaggerContainer>
            {LANGUAGES.map((l, i) => (
              <StaggerItem 
                key={l.lang} 
                className={`flex items-baseline justify-between gap-4 border-b border-[#16161E] py-5 ${i === 0 ? "border-t" : ""}`}
              >
                <span className="shrink-0 font-serif text-base italic text-[var(--cream)]">{l.lang}</span>
                <span className="flex-1 text-sm text-[#8A8478]">
                  {l.desc}
                </span>
                <span className="shrink-0 font-mono text-[9px] tracking-wider text-[#5A5A50]">
                  {l.level}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
