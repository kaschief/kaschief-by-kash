"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { FadeUp } from "./motion"
import Image from "next/image"

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
/*  Mac Dock-style Indicator Item                                      */
/* ------------------------------------------------------------------ */

function DockItem({ 
  indicator, 
  mouseX,
  onSelect,
  isSelected
}: { 
  indicator: (typeof INDICATORS)[0]
  mouseX: ReturnType<typeof useMotionValue<number>>
  onSelect: () => void
  isSelected: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)
  
  // Calculate distance from mouse for magnification
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })
  
  // Scale based on distance (closer = larger)
  const scale = useTransform(distance, [-150, 0, 150], [1, 1.25, 1])
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 })
  
  // Y position (lift up when magnified)
  const y = useTransform(springScale, [1, 1.25], [0, -12])

  const categoryColors: Record<string, string> = {
    ZONES: "#5EBB73",
    STATS: "#E05252",
    SWEEPS: "#5B9EC2",
    SESSIONS: "#C9A84C",
    TRAPS: "#E05252",
    RANGE: "#5B9EC2",
  }

  const color = categoryColors[indicator.category] || "#5EBB73"

  return (
    <motion.button
      ref={ref}
      onClick={onSelect}
      style={{ scale: springScale, y }}
      className={`group relative shrink-0 transition-all duration-200 ${
        isSelected ? "z-20" : "z-10"
      }`}
    >
      <div 
        className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-[var(--bg-elevated)] p-2 transition-all duration-300 sm:h-24 sm:w-24 ${
          isSelected 
            ? "border-[var(--gold)] shadow-lg shadow-[var(--gold)]/10" 
            : "border-[var(--stroke)] hover:border-[rgba(255,255,255,0.1)]"
        }`}
      >
        {/* Category color indicator */}
        <div 
          className="absolute left-0 right-0 top-0 h-1 rounded-t-xl" 
          style={{ backgroundColor: color }} 
        />
        
        {/* Icon/Lines count */}
        <div className="flex h-full flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-[var(--cream)] sm:text-xl">{indicator.lines.replace(",", "")}</span>
          <span className="font-mono text-[7px] uppercase tracking-wider text-[var(--text-faint)]">lines</span>
        </div>

        {/* Critical badge */}
        {indicator.importance === "critical" && (
          <div className="absolute right-1 top-3 h-2 w-2 rounded-full bg-[#E05252] animate-pulse" />
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute -top-16 left-1/2 z-30 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-center shadow-xl">
          <p className="text-xs font-semibold text-[var(--cream)]">{indicator.name}</p>
          <p className="mt-0.5 font-mono text-[9px]" style={{ color }}>{indicator.category}</p>
        </div>
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-[var(--stroke)] bg-[var(--bg-elevated)]" />
      </div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Indicator Dock                                                     */
/* ------------------------------------------------------------------ */

function IndicatorDock({ 
  onSelect, 
  selected 
}: { 
  onSelect: (indicator: (typeof INDICATORS)[0] | null) => void
  selected: (typeof INDICATORS)[0] | null
}) {
  const mouseX = useMotionValue(Infinity)
  const dockRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={dockRef}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="flex items-end justify-start gap-3 overflow-x-auto px-6 pb-4 scrollbar-hide lg:justify-center lg:px-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {INDICATORS.map((indicator) => (
        <DockItem
          key={indicator.name}
          indicator={indicator}
          mouseX={mouseX}
          onSelect={() => onSelect(selected?.name === indicator.name ? null : indicator)}
          isSelected={selected?.name === indicator.name}
        />
      ))}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Selected Indicator Detail Panel                                    */
/* ------------------------------------------------------------------ */

function IndicatorDetail({ indicator }: { indicator: (typeof INDICATORS)[0] }) {
  const categoryColors: Record<string, string> = {
    ZONES: "#5EBB73",
    STATS: "#E05252",
    SWEEPS: "#5B9EC2",
    SESSIONS: "#C9A84C",
    TRAPS: "#E05252",
    RANGE: "#5B9EC2",
  }

  const color = categoryColors[indicator.category] || "#5EBB73"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-6 sm:p-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <span 
            className="inline-block rounded-md px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {indicator.category}
          </span>
          <h4 className="mt-3 text-2xl font-bold text-[var(--cream)]">{indicator.name}</h4>
          <p className="mt-1 font-mono text-xs" style={{ color }}>{indicator.lines} lines of Pine Script</p>
        </div>
        {indicator.importance === "critical" && (
          <span className="rounded-full border border-[#E05252]/30 bg-[#E05252]/10 px-3 py-1 font-mono text-[9px] font-semibold text-[#E05252]">
            CORE
          </span>
        )}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-[var(--cream-muted)]">{indicator.desc}</p>
      <p className="mt-4 text-sm leading-[1.8] text-[var(--text-dim)]">{indicator.detail}</p>
    </motion.div>
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
  const [selected, setSelected] = useState<(typeof INDICATORS)[0] | null>(null)

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
            Each indicator is a self-contained piece of engineering. Hover to preview, click to explore.
          </p>
        </FadeUp>

        {/* Visual preview */}
        <div className="mb-16">
          <GalleryReel />
        </div>

        {/* Dock-style indicator selector */}
        <FadeUp delay={0.2}>
          <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--bg-elevated)]/50 p-4 backdrop-blur-sm">
            <IndicatorDock onSelect={setSelected} selected={selected} />
          </div>
        </FadeUp>

        {/* Selected indicator detail */}
        <AnimatePresence mode="wait">
          {selected && (
            <IndicatorDetail key={selected.name} indicator={selected} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// Keep old export name for compatibility
export { TradingArsenal as TradingSystem }
