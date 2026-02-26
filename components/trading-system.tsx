"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { FadeUp, FadeIn } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Indicators with images - organized by category                     */
/* ------------------------------------------------------------------ */

const INDICATORS = [
  {
    name: "MBZ Core",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mbz-core-uM9NWDZi4KLZqvVvT0dqRSIKkSNfJV.png",
    desc: "5 gap types as tradable zones",
    lines: "1,400",
  },
  {
    name: "SIF Core",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sif-core-WckR4OEaHZE5H43lLswpXo6kCxOvhp.png",
    desc: "Institutional trap detection",
    lines: "950",
  },
  {
    name: "Gaps",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gaps-EgRvSfB3NJhPW14tPVbJH1GZBIQZFA.png",
    desc: "NWOG, NDOG, RTH mapping",
    lines: "1,890",
  },
  {
    name: "Pulse",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pulse-l6NqVxnL6oPDYNdDpbqchMJTXYTANM.png",
    desc: "Multi-timeframe sweep levels",
    lines: "1,200",
  },
  {
    name: "HTF Algo",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/htf-algo-WV3WYNaBTqSF8kpxzUgUQxIAn5EjbY.png",
    desc: "Higher timeframe liquidity levels",
    lines: "780",
  },
  {
    name: "LTF Algo",
    category: "Liquidity",
    color: "#5B9EC2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ltf-algo-RoIY3SkuFP9bEaRSCO6Xni65DkVJTb.png",
    desc: "Execution tool for entries",
    lines: "650",
  },
  {
    name: "DTT Weekly",
    category: "Session",
    color: "#C9A84C",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png",
    desc: "4 named sessions with Fibonacci",
    lines: "1,100",
  },
  {
    name: "DTT Intraday",
    category: "Session",
    color: "#C9A84C",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-intraday-2ldNORG9f0rmjvGmqXPKg0cR5JxFgP.png",
    desc: "15-session model with IQR",
    lines: "1,350",
  },
  {
    name: "Deviations",
    category: "Range",
    color: "#5EBB73",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png",
    desc: "Statistical session expansion using IQR",
    lines: "890",
  },
  {
    name: "ADR",
    category: "Range",
    color: "#5EBB73",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adr-K5HcqKaW2wZOjwCt5WY6BQR6h8PzZB.png",
    desc: "Average Daily Range with ceiling/floor",
    lines: "420",
  },
  {
    name: "MBZ Prime",
    category: "Range",
    color: "#5EBB73",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mbz-prime-Yyp04JDi4e2bwQ7xZI0Y95AJkwbAEU.png",
    desc: "Session liquidity pools aggregated",
    lines: "1,050",
  },
  {
    name: "MBZ Relay",
    category: "Range",
    color: "#5EBB73",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mbz-relay-4hYhKT2dJzLJWz5jTrcRLz6oZPNrFV.png",
    desc: "Auto HTF pairing and zone broadcasting",
    lines: "520",
  },
]

const CATEGORIES = ["Liquidity", "Session", "Range"]

/* ------------------------------------------------------------------ */
/*  Progression - shows evolution from naked to full stack             */
/* ------------------------------------------------------------------ */

const PROGRESSION = [
  { 
    step: "01", 
    title: "Naked Price",
    desc: "Where everyone starts. Candlesticks tell a story, but not enough of one.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png",
  },
  { 
    step: "02", 
    title: "+ Statistical Context",
    desc: "Deviations show where price is relative to session norms.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png",
  },
  { 
    step: "03", 
    title: "+ Session Structure",
    desc: "DTT adds the weekly rhythm. Different sessions behave differently.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png",
  },
  { 
    step: "04", 
    title: "+ Full Stack",
    desc: "Zones, sweeps, traps — the complete picture.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png",
  },
]

/* ------------------------------------------------------------------ */
/*  Indicator Detail Modal                                             */
/* ------------------------------------------------------------------ */

function IndicatorDetail({ 
  indicator, 
  onClose 
}: { 
  indicator: (typeof INDICATORS)[0]
  onClose: () => void 
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-deep)]/80 p-6 backdrop-blur-sm"
    >
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)]"
      >
        {/* Large image */}
        <div className="relative aspect-video w-full">
          <Image
            src={indicator.image}
            alt={indicator.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
        
        {/* Info */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span 
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: indicator.color }}
            />
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
              {indicator.category}
            </span>
          </div>
          <h3 className="mt-3 font-serif text-2xl text-[var(--cream)]">
            {indicator.name}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-[var(--cream-muted)]">
            {indicator.desc}
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--gold)]">
            {indicator.lines} lines
          </p>
        </div>
      </motion.div>

      {/* Floating X below - bare gold */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onClose}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TradingArsenal() {
  const [selectedIndicator, setSelectedIndicator] = useState<(typeof INDICATORS)[0] | null>(null)
  const [activeCategory, setActiveCategory] = useState("Liquidity")
  const [activeProgression, setActiveProgression] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const progressionRef = useRef<HTMLDivElement>(null)
  const progressionInView = useInView(progressionRef, { once: true, margin: "-50px" })
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filteredIndicators = INDICATORS.filter(ind => ind.category === activeCategory)

  return (
    <div className="relative pb-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Visual nesting under Act IV */}
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

          {/* Progression - clickable to enlarge */}
          <div ref={progressionRef} className="mb-16">
            <FadeIn>
              <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#5EBB73]">
                The Progression
              </p>
            </FadeIn>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Steps */}
              <div className="space-y-2">
                {PROGRESSION.map((step, i) => (
                  <motion.button
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={progressionInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    onClick={() => setActiveProgression(i)}
                    className={`group w-full cursor-pointer text-left transition-all duration-300 ${
                      activeProgression === i 
                        ? "rounded-lg border border-[#5EBB73]/30 bg-[var(--bg-elevated)] p-4" 
                        : "rounded-lg border border-transparent p-4 hover:bg-[var(--bg-card)]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span 
                        className={`shrink-0 font-mono text-xs transition-colors ${
                          activeProgression === i ? "text-[#5EBB73]" : "text-[var(--text-faint)]"
                        }`}
                      >
                        {step.step}
                      </span>
                      <div>
                        <h5 className={`text-sm font-medium transition-colors ${
                          activeProgression === i ? "text-[var(--cream)]" : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"
                        }`}>
                          {step.title}
                        </h5>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Image - clickable to enlarge */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={progressionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={() => setLightboxImage(PROGRESSION[activeProgression].image)}
                className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-[var(--stroke)] transition-all hover:border-[var(--gold)]/30"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProgression}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={PROGRESSION[activeProgression].image}
                      alt={PROGRESSION[activeProgression].title}
                      fill
                      className="object-cover object-top transition-transform group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 600px"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Expand hint */}
                <div className="absolute bottom-3 right-3 rounded-full bg-[var(--bg-deep)]/70 px-2 py-1 text-[10px] text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                  Click to expand
                </div>
              </motion.button>
            </div>
          </div>

          {/* ============================================================ */}
          {/*  INDICATORS - Category tabs + horizontal scroll strip        */}
          {/* ============================================================ */}
          <FadeUp delay={0.2}>
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--cream)]">
              The Indicators
            </p>
          </FadeUp>

          {/* Category Tabs */}
          <div className="mb-6 flex gap-6 border-b border-[#16161E]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer pb-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeCategory === cat 
                    ? "border-b-2 border-[var(--gold)] text-[var(--cream)]" 
                    : "text-[var(--text-faint)] hover:text-[var(--cream-muted)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Strip */}
          <div 
            ref={scrollContainerRef}
            className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <AnimatePresence mode="wait">
              {filteredIndicators.map((indicator, i) => (
                <motion.button
                  key={indicator.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => setSelectedIndicator(indicator)}
                  className="group w-64 shrink-0 cursor-pointer text-left"
                >
                  {/* Image card */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-card)] transition-all group-hover:border-[var(--gold)]/30">
                    <Image
                      src={indicator.image}
                      alt={indicator.name}
                      fill
                      className="object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                      sizes="256px"
                    />
                  </div>
                  
                  {/* Info below */}
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-[var(--cream)] transition-colors group-hover:text-[var(--gold)]">
                      {indicator.name}
                    </h5>
                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                      {indicator.desc}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--gold)]">
                      {indicator.lines} lines
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Indicator Detail Modal */}
      <AnimatePresence>
        {selectedIndicator && (
          <IndicatorDetail
            indicator={selectedIndicator}
            onClose={() => setSelectedIndicator(null)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox for progression images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-[var(--bg-deep)]/90 p-6 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
            >
              <Image
                src={lightboxImage}
                alt="Progression step"
                width={1920}
                height={1080}
                className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
              />
            </motion.div>
            {/* Floating X */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { TradingArsenal as TradingSystem }
