"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { FadeUp, FadeIn } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Indicators Data - grouped by category, no line counts             */
/* ------------------------------------------------------------------ */

const INDICATOR_CATEGORIES = [
  {
    name: "Statistical Foundation",
    color: "#E05252",
    indicators: [
      {
        name: "Deviations",
        desc: "Statistical session expansion. The foundation of my edge.",
        detail: "Uses IQR (not averages) to prevent outlier sessions from skewing expected range. Maps 13 sessions and shows whether price is at a normal level or at a statistical extreme. This is where every trade decision starts.",
      },
      {
        name: "SIF Core",
        desc: "Institutional trap detection.",
        detail: "Identifies fake breakouts where price creates a gap only to reverse immediately. These traps are where retail traders get caught — recognizing them is defensive edge.",
      },
    ],
  },
  {
    name: "Zone Mapping",
    color: "#5EBB73",
    indicators: [
      {
        name: "MBZ Core",
        desc: "5 gap types as tradable zones with real-time fill tracking.",
        detail: "Maps NWOG, NDOG, RTH gaps, BPR, and FVG. Each gap type has fill probability based on historical data. Zones are the areas where I look for entries.",
      },
      {
        name: "Gaps",
        desc: "Comprehensive gap mapping with floating mode.",
        detail: "NWOG, NDOG, RTH, BPR, FVG with fill percentages. Floating mode keeps unfilled gaps visible regardless of timeframe.",
      },
      {
        name: "MBZ Prime",
        desc: "Session liquidity pools across all timeframes.",
        detail: "Aggregates liquidity pools from multiple sessions into a unified view. Shows where larger players are likely positioned.",
      },
    ],
  },
  {
    name: "Session Analysis",
    color: "#C9A84C",
    indicators: [
      {
        name: "DTT Weekly",
        desc: "4 named sessions with dynamic Fibonacci projections.",
        detail: "The week splits into named sessions with distinct behavioral patterns. Each session has its own expansion profile, anchored to developing highs/lows.",
      },
      {
        name: "DTT Intraday",
        desc: "15-session model with IQR range projections.",
        detail: "Micro-sessions within the day, each with its own statistical expansion profile. The intraday rhythm that most traders miss.",
      },
    ],
  },
  {
    name: "Liquidity Sweeps",
    color: "#5B9EC2",
    indicators: [
      {
        name: "Pulse",
        desc: "Multi-timeframe sweep levels. Monthly/weekly/daily.",
        detail: "BSL/SSL from 8 timeframes. Shows where liquidity has been swept and where it remains. The targets that price gravitates toward.",
      },
      {
        name: "HTF Algo",
        desc: "Higher timeframe liquidity levels, ADR-filtered.",
        detail: "The levels that matter most — filtered by average daily range to show only relevant targets for the current session.",
      },
      {
        name: "LTF Algo",
        desc: "Lower timeframe execution with tick-by-tick targets.",
        detail: "The execution tool. Identifies when liquidity grabs fail and provides precise entry targets.",
      },
      {
        name: "ADR",
        desc: "Daily range with Judas Swing detection.",
        detail: "Average Daily Range with ceiling/floor. The 1/3 ADR level is where early sweeps typically exhaust — the Judas Swing.",
      },
    ],
  },
  {
    name: "Infrastructure",
    color: "#888",
    indicators: [
      {
        name: "MBZ Relay",
        desc: "Auto HTF pairing and zone broadcasting.",
        detail: "Infrastructure that broadcasts higher timeframe zones automatically to any lower timeframe chart. Set once, works everywhere.",
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Progression Gallery - shows evolution from naked to full stack     */
/* ------------------------------------------------------------------ */

const PROGRESSION_STEPS = [
  { 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png", 
    step: "01",
    title: "Naked Price",
    desc: "Where everyone starts. Candlesticks tell a story, but not enough of one."
  },
  { 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png", 
    step: "02",
    title: "+ Statistical Context",
    desc: "Deviations show where price is relative to session norms. Now we know if a move is normal or extreme."
  },
  { 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png", 
    step: "03",
    title: "+ Session Structure",
    desc: "DTT adds the weekly rhythm. Different sessions have different behaviors."
  },
  { 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png", 
    step: "04",
    title: "+ Full Stack",
    desc: "Zones, sweeps, traps — the complete picture. Price action with context."
  },
]

function ProgressionGallery() {
  const [activeStep, setActiveStep] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <FadeIn>
        <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#5EBB73]">
          The Progression
        </p>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Steps */}
        <div className="space-y-3">
          {PROGRESSION_STEPS.map((step, i) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(i)}
              className={`group w-full text-left transition-all duration-300 ${
                activeStep === i 
                  ? "rounded-xl border border-[#5EBB73]/30 bg-[var(--bg-elevated)] p-4" 
                  : "rounded-xl border border-transparent p-4 hover:bg-[var(--bg-card)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <span 
                  className={`shrink-0 font-mono text-xs transition-colors ${
                    activeStep === i ? "text-[#5EBB73]" : "text-[var(--text-faint)]"
                  }`}
                >
                  {step.step}
                </span>
                <div>
                  <h4 className={`text-sm font-medium transition-colors ${
                    activeStep === i ? "text-[var(--cream)]" : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"
                  }`}>
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
                    {step.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Image */}
        <div className="relative overflow-hidden rounded-xl border border-[var(--stroke)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={PROGRESSION_STEPS[activeStep].src}
                alt={PROGRESSION_STEPS[activeStep].title}
                width={1600}
                height={900}
                className="w-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Indicator Row - stacked list style, detail expands inline          */
/* ------------------------------------------------------------------ */

function IndicatorRow({ 
  indicator,
  color,
  isExpanded,
  onToggle
}: { 
  indicator: { name: string; desc: string; detail: string }
  color: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const detailRef = useRef<HTMLDivElement>(null)

  return (
    <div className="border-b border-[var(--stroke)] last:border-b-0">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between py-4 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <span 
            className="h-1.5 w-1.5 shrink-0 rounded-full transition-all"
            style={{ backgroundColor: isExpanded ? color : "var(--text-faint)" }}
          />
          <span className={`text-sm transition-colors ${isExpanded ? "text-[var(--cream)]" : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"}`}>
            {indicator.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-[var(--text-dim)] sm:inline">{indicator.desc}</span>
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className={`flex h-5 w-5 items-center justify-center text-xs transition-colors ${
              isExpanded ? "text-[var(--gold)]" : "text-[var(--text-faint)] group-hover:text-[var(--cream)]"
            }`}
          >
            +
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={detailRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-5">
              <p className="text-sm leading-[1.8] text-[var(--cream-muted)]">
                {indicator.detail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Category Section                                                   */
/* ------------------------------------------------------------------ */

function CategorySection({ 
  category, 
  expandedIndicator,
  onToggle
}: { 
  category: (typeof INDICATOR_CATEGORIES)[0]
  expandedIndicator: string | null
  onToggle: (name: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-8 last:mb-0"
    >
      <div className="mb-3 flex items-center gap-3">
        <span 
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: category.color }}>
          {category.name}
        </h4>
      </div>
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-card)] px-4">
        {category.indicators.map((indicator) => (
          <IndicatorRow
            key={indicator.name}
            indicator={indicator}
            color={category.color}
            isExpanded={expandedIndicator === indicator.name}
            onToggle={() => onToggle(indicator.name)}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component - Arsenal (visually nested under Builder)           */
/* ------------------------------------------------------------------ */

export function TradingArsenal() {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null)

  const handleToggle = (name: string) => {
    setExpandedIndicator(expandedIndicator === name ? null : name)
  }

  return (
    <div className="relative pb-20">
      {/* Visual nesting indicator - connects to Act IV above */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-l-2 border-[#5EBB73]/20 pl-8 sm:pl-12">
          {/* Sub-section header */}
          <FadeUp>
            <p className="mb-1 font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-[#5EBB73]/60">
              The Arsenal
            </p>
            <h4 className="mb-2 font-serif text-2xl text-[var(--cream)] sm:text-3xl">
              The Tools I Built
            </h4>
            <p className="mb-12 max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
              14 custom indicators. Each one solves a specific problem in reading price action.
            </p>
          </FadeUp>

          {/* Progression Gallery */}
          <ProgressionGallery />

          {/* Indicator Categories - stacked list style */}
          <FadeUp delay={0.2}>
            <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--cream)]">
              The Indicators
            </p>
          </FadeUp>

          {INDICATOR_CATEGORIES.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              expandedIndicator={expandedIndicator}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Keep old export name for compatibility
export { TradingArsenal as TradingSystem }
