"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { X } from "lucide-react"
import { FadeUp } from "./motion"
import Image from "next/image"
import { createPortal } from "react-dom"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const INDICATORS = [
  {
    name: "MBZ Core",
    lines: "1,400",
    category: "ZONES",
    desc: "5 gap types as tradable zones with real-time fill tracking",
    detail: "Maps NWOG, NDOG, RTH gaps, BPR, and FVG. Each gap type has fill probability based on historical data. Floating mode keeps unfilled gaps visible near current price.",
    importance: "high",
  },
  {
    name: "Deviations",
    lines: "1,200",
    category: "STATS",
    desc: "Statistical expansion from 13 sessions. My most important indicator.",
    detail: "Uses IQR (not averages) to prevent outlier sessions from skewing expected range. Shows whether price is at a normal level or at a statistical extreme. This is the foundation of my edge.",
    importance: "critical",
  },
  {
    name: "Pulse",
    lines: "740",
    category: "SWEEPS",
    desc: "Multi-TF sweep levels. Monthly/weekly/daily. The ultimate.",
    detail: "BSL/SSL from 8 timeframes. Shows where liquidity has been swept and where it remains. ADR-filtered to prevent false signals in ranging conditions.",
    importance: "high",
  },
  {
    name: "DTT Weekly",
    lines: "800",
    category: "SESSIONS",
    desc: "4 named sessions: Iscariot, Aries, Ash, Icarus",
    detail: "The week splits into named sessions with distinct behavioral patterns. Dynamic Fibonacci projections anchor to developing highs and lows within each session.",
    importance: "medium",
  },
  {
    name: "DTT Intraday",
    lines: "900",
    category: "SESSIONS",
    desc: "15-session model with IQR range projections",
    detail: "Micro-sessions within the day, each with its own statistical expansion profile. Allows precise timing of entries based on when price typically moves.",
    importance: "medium",
  },
  {
    name: "SIF Core",
    lines: "950",
    category: "TRAPS",
    desc: "Detects institutional traps. Gaps that close immediately.",
    detail: "Identifies fake breakouts where price creates a gap only to reverse immediately. These are high-probability setups when combined with other confluence.",
    importance: "medium",
  },
  {
    name: "Gaps",
    lines: "1,890",
    category: "ZONES",
    desc: "NWOG, NDOG, RTH, BPR, FVG. Floating mode.",
    detail: "Comprehensive gap mapping with fill percentages per gap type. Floating mode keeps unfilled gaps visible regardless of how far price has moved.",
    importance: "high",
  },
  {
    name: "ADR",
    lines: "520",
    category: "RANGE",
    desc: "Daily range + Judas Swing detection",
    detail: "Average Daily Range with ceiling/floor of expected movement. The 1/3 ADR level is where early-session sweeps exhaust before the real move begins.",
    importance: "medium",
  },
  {
    name: "HTF Algo",
    lines: "1,100",
    category: "SWEEPS",
    desc: "BSL/SSL from 8 timeframes, ADR-filtered",
    detail: "Higher timeframe liquidity levels that act as magnets for price. Filtered by ADR to prevent signals in low-volatility conditions.",
    importance: "medium",
  },
  {
    name: "LTF Algo",
    lines: "800",
    category: "SWEEPS",
    desc: "Liquidity failures with tick-by-tick targets",
    detail: "Lower timeframe execution tool. Identifies when liquidity grabs fail and price reverses. All price comparisons in tick units to eliminate phantom duplicates.",
    importance: "medium",
  },
  {
    name: "MBZ Prime",
    lines: "1,200",
    category: "ZONES",
    desc: "Session liquidity pools across all timeframes",
    detail: "Aggregates liquidity pools from multiple sessions and timeframes into a unified view. Shows where the biggest pools of stops are sitting.",
    importance: "high",
  },
  {
    name: "MBZ SIF Relay",
    lines: "900",
    category: "ZONES",
    desc: "Auto HTF pairing. Broadcasts zones to any LTF chart.",
    detail: "Infrastructure indicator that broadcasts higher timeframe zones to lower timeframe charts automatically. Keeps multi-TF analysis seamless.",
    importance: "medium",
  },
]

const GALLERY = [
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png", label: "Naked Price", desc: "Just candles. Where does price want to go?" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png", label: "Full Stack", desc: "All 14 indicators reading the same chart" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png", label: "Deviations", desc: "Statistical session expansion" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png", label: "DTT Weekly", desc: "Named session Fibonacci" },
]

/* ------------------------------------------------------------------ */
/*  Modal for indicator detail                                         */
/* ------------------------------------------------------------------ */

function IndicatorModal({ 
  indicator, 
  onClose 
}: { 
  indicator: (typeof INDICATORS)[0] | null
  onClose: () => void 
}) {
  const [mounted, setMounted] = useState(false)

  useState(() => {
    setMounted(true)
  })

  if (!mounted || !indicator) return null

  return createPortal(
    <AnimatePresence>
      {indicator && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-[#07070A]/85"
            style={{ backdropFilter: "blur(16px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[201] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-[rgba(94,187,115,0.2)] bg-[#0B0B0F] p-6 sm:p-8">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--stroke)] text-[var(--text-dim)] transition-all hover:text-[var(--cream)]"
              >
                <X size={16} />
              </button>

              <span className="mb-3 inline-block rounded-md bg-[rgba(94,187,115,0.1)] px-2 py-0.5 font-mono text-[9px] font-medium text-[#5EBB73]">
                {indicator.category}
              </span>

              <h3 className="mb-2 text-2xl font-bold text-[var(--cream)]">{indicator.name}</h3>
              <p className="mb-4 font-mono text-xs text-[#5EBB73]">{indicator.lines} lines of Pine Script</p>
              
              <p className="mb-4 text-sm leading-relaxed text-[var(--cream-muted)]">{indicator.desc}</p>
              <p className="text-sm leading-[1.8] text-[var(--text-dim)]">{indicator.detail}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ------------------------------------------------------------------ */
/*  Bento Grid Item                                                    */
/* ------------------------------------------------------------------ */

function BentoItem({ 
  indicator, 
  onClick,
  size = "normal"
}: { 
  indicator: (typeof INDICATORS)[0]
  onClick: () => void
  size?: "normal" | "large" | "wide"
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  const sizeClasses = {
    normal: "col-span-1 row-span-1",
    large: "col-span-1 row-span-2 sm:col-span-1",
    wide: "col-span-1 sm:col-span-2 row-span-1",
  }

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`group relative text-left ${sizeClasses[size]}`}
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5 transition-all duration-500 hover:border-[rgba(94,187,115,0.2)] hover:scale-[1.02]">
        {/* Hover glow effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: indicator.importance === "critical" 
              ? "radial-gradient(ellipse at 50% 50%, rgba(94,187,115,0.08) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 50%, rgba(94,187,115,0.04) 0%, transparent 70%)"
          }}
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-3 flex items-start justify-between">
            <span className="rounded-md bg-[rgba(94,187,115,0.08)] px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wider text-[#5EBB73]">
              {indicator.category}
            </span>
            {indicator.importance === "critical" && (
              <span className="rounded-full bg-[rgba(94,187,115,0.15)] px-2 py-0.5 font-mono text-[8px] font-semibold text-[#5EBB73]">
                CORE
              </span>
            )}
          </div>

          <h4 className="mb-1 text-base font-semibold text-[var(--cream)] transition-colors group-hover:text-[#5EBB73]">
            {indicator.name}
          </h4>
          
          <p className="mb-3 flex-1 text-xs leading-relaxed text-[var(--text-dim)] transition-colors group-hover:text-[var(--cream-muted)]">
            {indicator.desc}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#5EBB73]">{indicator.lines} lines</span>
            <span className="text-[10px] text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
              Click to explore
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Gallery Reel                                                       */
/* ------------------------------------------------------------------ */

function GalleryReel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Main image */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--stroke)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={GALLERY[activeIndex].src}
              alt={GALLERY[activeIndex].label}
              width={1600}
              height={900}
              className="w-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Caption overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07070A]/90 to-transparent p-6 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-lg font-semibold text-[var(--cream)]">{GALLERY[activeIndex].label}</p>
              <p className="mt-1 text-sm text-[var(--cream-muted)]">{GALLERY[activeIndex].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {GALLERY.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveIndex(i)}
            className={`group relative shrink-0 overflow-hidden rounded-lg border transition-all duration-300 ${
              i === activeIndex 
                ? "border-[#5EBB73] ring-1 ring-[#5EBB73]/30" 
                : "border-[var(--stroke)] hover:border-[rgba(94,187,115,0.3)]"
            }`}
          >
            <Image
              src={item.src}
              alt={item.label}
              width={160}
              height={90}
              className="h-16 w-28 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {i !== activeIndex && (
              <div className="absolute inset-0 bg-[#07070A]/40 transition-opacity group-hover:opacity-0" />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component - Arsenal Section                                   */
/* ------------------------------------------------------------------ */

export function TradingArsenal() {
  const [selectedIndicator, setSelectedIndicator] = useState<(typeof INDICATORS)[0] | null>(null)

  const handleClose = useCallback(() => setSelectedIndicator(null), [])

  // Split indicators into bento layout
  const criticalIndicators = INDICATORS.filter(i => i.importance === "critical")
  const highIndicators = INDICATORS.filter(i => i.importance === "high")
  const mediumIndicators = INDICATORS.filter(i => i.importance === "medium")

  return (
    <section className="relative px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <FadeUp>
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#5EBB73]">
            The Arsenal
          </p>
          <h3 className="mb-3 text-2xl font-bold text-[var(--cream)] sm:text-3xl">
            14 indicators. 13,500 lines. Zero duplicated logic.
          </h3>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
            Each indicator is a self-contained piece of engineering. Click any to explore what it does and why it matters.
          </p>
        </FadeUp>

        {/* Visual preview */}
        <div className="mb-12">
          <GalleryReel />
        </div>

        {/* Bento grid - dynamic sizes based on importance */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Critical indicators get prominence */}
          {criticalIndicators.map((ind) => (
            <BentoItem
              key={ind.name}
              indicator={ind}
              onClick={() => setSelectedIndicator(ind)}
              size="wide"
            />
          ))}
          {/* High importance */}
          {highIndicators.map((ind) => (
            <BentoItem
              key={ind.name}
              indicator={ind}
              onClick={() => setSelectedIndicator(ind)}
              size="normal"
            />
          ))}
          {/* Medium importance */}
          {mediumIndicators.map((ind) => (
            <BentoItem
              key={ind.name}
              indicator={ind}
              onClick={() => setSelectedIndicator(ind)}
              size="normal"
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <IndicatorModal indicator={selectedIndicator} onClose={handleClose} />
    </section>
  )
}

// Keep old export name for compatibility
export { TradingArsenal as TradingSystem }
