"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { FadeIn, StaggerChildren, StaggerItem } from "./motion"

interface CareerCard {
  id: string
  year: string
  title: string
  place: string
  dateRange: string
  brief: string
  color: string
  details: string[]
  insight: string
}

const careers: CareerCard[] = [
  {
    id: "nurse",
    year: "2015",
    title: "Critical Care Nurse",
    place: "NYU Langone Health, New York",
    dateRange: "2015 – 2018",
    brief: "Neuro ICU. 3–4 patients per shift. High-stakes decisions where hesitation wasn't an option.",
    color: "var(--career-nurse)",
    details: [
      "Managed critically ill patients on ventilators, IV drips, and complex medication protocols",
      "Differential diagnosis under pressure — a cough isn't always a cold, it could be pulmonary effusion",
      "Cross-disciplinary communication with doctors, pharmacists, respiratory therapists, PTs, and families",
      "CCRN certified — voluntarily held to the highest standard in critical care",
    ],
    insight: "Taught me that when people depend on your system, it has to work.",
  },
  {
    id: "engineer",
    year: "2018",
    title: "Frontend → Senior Engineer",
    place: "AMBOSS → Compado → CAPinside → DKB",
    dateRange: "2018 – 2022",
    brief: "Built products used by millions. React, Vue, TypeScript. Promoted twice. Shipped what mattered.",
    color: "var(--career-engineer)",
    details: [
      "AMBOSS: React app for 500K+ medical students — A/B tests that improved engagement, helped take product out of beta",
      "Compado: Vue product comparison sites — 50% page speed improvement, 25% organic traffic growth",
      "CAPinside: Vue/TypeScript fintech platform for 10,000+ financial advisors — 35% faster page loads",
      "DKB: Rebuilt UI/UX of banking platform in React/TypeScript for 5M+ users. Introduced Jest & Playwright testing",
    ],
    insight: "Learned to think in systems, debug across layers, and ship code that handles real-world complexity.",
  },
  {
    id: "manager",
    year: "2022",
    title: "Engineering Manager",
    place: "DKB Code Factory, Berlin",
    dateRange: "2022 – 2024",
    brief: "Led 15+ people. Grew the team. Increased release cadence from monthly to weekly.",
    color: "var(--career-manager)",
    details: [
      "Grew core engineering team from 6 to 10 through structured hiring — 12 interviewed, 4 hired",
      "Coached engineers into senior positions through weekly 1:1s and intentional mentoring",
      "Increased release cadence from monthly to weekly through process improvements",
      "Navigated competing priorities in a regulated banking environment across Product, Design, and Platform",
    ],
    insight: "Discovered that the hardest bugs to debug are human ones — and the most rewarding to fix.",
  },
  {
    id: "builder",
    year: "2024",
    title: "Independent Product Builder",
    place: "Self-Employed, Berlin",
    dateRange: "2024 – 2025",
    brief: "Built a production trading system from scratch. 12,000+ lines of custom logic. Real money, real stakes.",
    color: "var(--career-builder)",
    details: [
      "Designed and deployed an algorithmic trading system handling live NQ/MNQ futures contracts",
      "12,000+ lines of custom Pine Script — MBZ and SIF indicators based on ICT methodology",
      "AI-assisted development workflows for architecture design, implementation, and debugging",
      "Rigorous risk management and edge-case testing to ensure 24/7 financial solvency",
    ],
    insight: "Proved I can learn an entirely new domain, build production systems alone, and ship under real pressure.",
  },
]

function TimelineCard({ career, index }: { career: CareerCard; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <StaggerItem>
      <motion.div
        layout
        className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 sm:p-8"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Color indicator + year */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: career.color }}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {career.year}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-foreground sm:text-xl">
                {career.title}
              </h3>
              <p className="mb-1 text-sm text-muted-foreground">{career.place}</p>
              <p className="text-xs tracking-wide text-muted-foreground/70">
                {career.dateRange}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {career.brief}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="overflow-hidden"
            >
              <div className="mt-6 border-t border-border pt-6">
                <ul className="mb-6 flex flex-col gap-3">
                  {career.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm leading-relaxed text-foreground/70"
                    >
                      <span
                        className="mt-2 block h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: career.color }}
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                <div
                  className="rounded-xl px-5 py-4"
                  style={{ backgroundColor: `color-mix(in srgb, ${career.color} 8%, transparent)` }}
                >
                  <p
                    className="text-sm leading-relaxed text-foreground/80"
                    style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                  >
                    {`"${career.insight}"`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </StaggerItem>
  )
}

export function Timeline() {
  return (
    <section id="journey" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-glow">
            The Journey
          </p>
          <h2
            className="mb-4 text-3xl text-foreground sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Four careers, one thread
          </h2>
        </FadeIn>

        <StaggerChildren className="mt-12 flex flex-col gap-4" staggerDelay={0.15}>
          {careers.map((career, index) => (
            <TimelineCard key={career.id} career={career} index={index} />
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
