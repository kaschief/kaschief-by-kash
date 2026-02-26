"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { FadeUp } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const INDICATORS = [
  {
    name: "Deviations",
    lines: "1,200",
    category: "STATS",
    color: "#E05252",
    desc: "Statistical session expansion. The foundation of my edge.",
    detail: "Uses IQR (not averages) to prevent outlier sessions from skewing expected range. Shows whether price is at a normal level or at a statistical extreme.",
    importance: "critical",
  },
  {
    name: "MBZ Core",
    lines: "1,400",
    category: "ZONES",
    color: "#5EBB73",
    desc: "5 gap types as tradable zones with real-time fill tracking.",
    detail: "Maps NWOG, NDOG, RTH gaps, BPR, and FVG. Each gap type has fill probability based on historical data.",
    importance: "high",
  },
  {
    name: "Pulse",
    lines: "740",
    category: "SWEEPS",
    color: "#5B9EC2",
    desc: "Multi-timeframe sweep levels. Monthly/weekly/daily.",
    detail: "BSL/SSL from 8 timeframes. Shows where liquidity has been swept and where it remains.",
    importance: "high",
  },
  {
    name: "Gaps",
    lines: "1,890",
    category: "ZONES",
    color: "#5EBB73",
    desc: "NWOG, NDOG, RTH, BPR, FVG with floating mode.",
    detail: "Comprehensive gap mapping with fill percentages. Floating mode keeps unfilled gaps visible.",
    importance: "high",
  },
  {
    name: "DTT Weekly",
    lines: "800",
    category: "SESSIONS",
    color: "#C9A84C",
    desc: "4 named sessions with dynamic Fibonacci projections.",
    detail: "The week splits into named sessions with distinct behavioral patterns. Anchored to developing highs/lows.",
    importance: "medium",
  },
  {
    name: "DTT Intraday",
    lines: "900",
    category: "SESSIONS",
    color: "#C9A84C",
    desc: "15-session model with IQR range projections.",
    detail: "Micro-sessions within the day, each with its own statistical expansion profile.",
    importance: "medium",
  },
  {
    name: "SIF Core",
    lines: "950",
    category: "TRAPS",
    color: "#E05252",
    desc: "Detects institutional traps. Gaps that close immediately.",
    detail: "Identifies fake breakouts where price creates a gap only to reverse immediately.",
    importance: "medium",
  },
  {
    name: "ADR",
    lines: "520",
    category: "RANGE",
    color: "#5B9EC2",
    desc: "Daily range + Judas Swing detection.",
    detail: "Average Daily Range with ceiling/floor. The 1/3 ADR level is where early sweeps exhaust.",
    importance: "medium",
  },
  {
    name: "HTF Algo",
    lines: "1,100",
    category: "SWEEPS",
    color: "#5B9EC2",
    desc: "BSL/SSL from 8 timeframes, ADR-filtered.",
    detail: "Higher timeframe liquidity levels that act as magnets for price.",
    importance: "medium",
  },
  {
    name: "LTF Algo",
    lines: "800",
    category: "SWEEPS",
    color: "#5B9EC2",
    desc: "Liquidity failures with tick-by-tick targets.",
    detail: "Lower timeframe execution tool. Identifies when liquidity grabs fail.",
    importance: "medium",
  },
  {
    name: "MBZ Prime",
    lines: "1,200",
    category: "ZONES",
    color: "#5EBB73",
    desc: "Session liquidity pools across all timeframes.",
    detail: "Aggregates liquidity pools from multiple sessions into a unified view.",
    importance: "high",
  },
  {
    name: "MBZ Relay",
    lines: "900",
    category: "INFRA",
    color: "#888",
    desc: "Auto HTF pairing. Broadcasts zones to any LTF chart.",
    detail: "Infrastructure indicator that broadcasts higher timeframe zones automatically.",
    importance: "medium",
  },
]

const GALLERY = [
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png", label: "Naked Price" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png", label: "Full Stack" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png", label: "Deviations" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png", label: "DTT Weekly" },
]

/* ------------------------------------------------------------------ */
/*  Grayscale-to-Color Indicator Card                                  */
/* ------------------------------------------------------------------ */

function IndicatorCard({ 
  indicator, 
  isSelected,
  onClick 
}: { 
  indicator: (typeof INDICATORS)[0]
  isSelected: boolean
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const isActive = isHovered || isSelected

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative text-left"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-500 ${
          isSelected 
            ? "border-[var(--gold)] bg-[var(--bg-elevated)]" 
            : "border-[var(--stroke)] bg-[var(--bg-card)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[var(--bg-elevated)]"
        }`}
      >
        {/* Top accent bar - grayscale until hover */}
        <div 
          className="absolute left-0 right-0 top-0 h-0.5 transition-all duration-500"
          style={{ 
            backgroundColor: isActive ? indicator.color : "rgba(255,255,255,0.1)"
          }} 
        />
        
        {/* Name and lines */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 
              className="text-sm font-medium transition-colors duration-500"
              style={{ color: isActive ? indicator.color : "var(--cream-muted)" }}
            >
              {indicator.name}
            </h4>
            <p className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">
              {indicator.lines} lines
            </p>
          </div>
          
          {/* Critical badge */}
          {indicator.importance === "critical" && (
            <span 
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase transition-all duration-500"
              style={{ 
                backgroundColor: isActive ? `${indicator.color}20` : "rgba(255,255,255,0.05)",
                color: isActive ? indicator.color : "var(--text-faint)"
              }}
            >
              Core
            </span>
          )}
        </div>
        
        {/* Description - fades in on hover */}
        <p 
          className="mt-3 text-xs leading-relaxed transition-all duration-500"
          style={{ 
            color: isActive ? "var(--cream-muted)" : "var(--text-faint)",
            opacity: isActive ? 1 : 0.6
          }}
        >
          {indicator.desc}
        </p>
      </div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Selected Indicator Detail Panel                                    */
/* ------------------------------------------------------------------ */

function IndicatorDetail({ indicator, onClose }: { indicator: (typeof INDICATORS)[0]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-6"
    >
      <div className="flex items-start gap-4">
        <div 
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: indicator.color }}
        />
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <h4 className="text-lg font-medium text-[var(--cream)]">{indicator.name}</h4>
            <span className="font-mono text-xs text-[var(--text-faint)]">{indicator.lines} lines</span>
          </div>
          <p className="mt-3 text-sm leading-[1.8] text-[var(--cream-muted)]">{indicator.detail}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Gallery Thumbnails                                                 */
/* ------------------------------------------------------------------ */

function GalleryStrip() {
  const [activeIndex, setActiveIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Main image */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--stroke)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
        
        {/* Label */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-[#07070A]/80 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-sm font-medium text-[var(--cream)]">{GALLERY[activeIndex].label}</p>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-3 flex gap-2">
        {GALLERY.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveIndex(i)}
            className={`relative overflow-hidden rounded-lg border transition-all duration-300 ${
              i === activeIndex 
                ? "border-[#5EBB73] ring-1 ring-[#5EBB73]/30" 
                : "border-[var(--stroke)] opacity-50 hover:opacity-100"
            }`}
          >
            <Image
              src={item.src}
              alt={item.label}
              width={120}
              height={68}
              className="h-14 w-24 object-cover"
            />
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component - Arsenal (visually nested under Builder)           */
/* ------------------------------------------------------------------ */

export function TradingArsenal() {
  const [selected, setSelected] = useState<(typeof INDICATORS)[0] | null>(null)

  return (
    <div className="relative">
      {/* Visual nesting indicator - connects to Act IV above */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-l-2 border-[#5EBB73]/20 pl-8 sm:pl-12">
          {/* Sub-section header */}
          <FadeUp>
            <p className="mb-1 font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-[#5EBB73]/60">
              Act IV · The Arsenal
            </p>
            <h4 className="mb-2 font-serif text-2xl text-[var(--cream)] sm:text-3xl">
              The Tools I Built
            </h4>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
              14 indicators. 13,500 lines of Pine Script. Each one solves a specific problem.
            </p>
          </FadeUp>

          {/* Gallery */}
          <div className="mb-12">
            <GalleryStrip />
          </div>

          {/* Indicator grid - grayscale to color on hover */}
          <FadeUp delay={0.2}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INDICATORS.map((indicator) => (
                <IndicatorCard
                  key={indicator.name}
                  indicator={indicator}
                  isSelected={selected?.name === indicator.name}
                  onClick={() => setSelected(selected?.name === indicator.name ? null : indicator)}
                />
              ))}
            </div>
          </FadeUp>

          {/* Selected indicator detail */}
          <AnimatePresence mode="wait">
            {selected && (
              <IndicatorDetail 
                key={selected.name} 
                indicator={selected} 
                onClose={() => setSelected(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  )
}

// Keep old export name for compatibility
export { TradingArsenal as TradingSystem }
