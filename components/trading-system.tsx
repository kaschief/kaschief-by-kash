"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FadeUp, StaggerContainer, StaggerItem } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Layering steps                                                     */
/* ------------------------------------------------------------------ */

const LAYERS = [
  {
    id: "naked",
    label: "Naked",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png",
    text: "NQ1 futures, 5-minute. Just candles. Where does price want to go, and what's in its way? Without structure, this is just noise.",
  },
  {
    id: "adr",
    label: "+ ADR",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Badr-fs9lGsRFiIshlvbEaM89Inr4CbTgdC.png",
    text: "Daily range boundaries appear. The ceiling and floor of expected movement. The 1/3 ADR level is where early-session sweeps exhaust before the real move begins. Judas Swing detection flags when price reaches a level suspiciously early.",
  },
  {
    id: "deviations",
    label: "+ Deviations",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bdeviations-dgmE6WiDyufvSh9Cc0qPdUwJIqpIWy.png",
    text: "13 intraday sessions light up with statistical expansion zones. You can see whether price is at a normal level or at an extreme. The colored boxes track deviation levels from each session open, with mitigation tracking built in.",
  },
  {
    id: "dtt",
    label: "+ DTT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bdtt-dylDYara81YRgoTGGlojHaTPMCnh6E.png",
    text: "The week splits into 4 named sessions: Iscariot, Aries, Ash, Icarus. Dynamic Fibonacci projections anchor to developing highs/lows. The intraday layer adds 15 micro-sessions with IQR-based range projections. Two time scales at once.",
  },
  {
    id: "gaps",
    label: "+ Gaps",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bgaps-gazjXWAaR5pwFbjgtcM6FWMHShI3Q1.png",
    text: "NWOG, NDOG, RTH gaps mapped. Fill percentages per gap. Floating mode keeps unfilled gaps visible near price. You see which gaps are still open and pulling.",
  },
  {
    id: "pulse",
    label: "+ Pulse",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png",
    text: "The full picture. Monthly, weekly, daily sweep levels. Overnight and premarket ranges. All 14 indicators reading the same chart, integrated into one microstructure engine.",
  },
]

/* ------------------------------------------------------------------ */
/*  Gallery images                                                     */
/* ------------------------------------------------------------------ */

const GALLERY = [
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mbz-zd4McYL4UDAyZTWlzo3jzUqce8l9pT.png", label: "MBZ Core" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sif-19wV1QFs0rRcCK5niQYmOOWhlyA2AE.png", label: "SIF Core" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png", label: "Deviations (Close)" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-wide-nixzOfoox1JQvL2d1mxjCky4g8FoXC.png", label: "Deviations (Wide)" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-intraday-eSUMZqox7TXskbGAVLTvoxbXKRES7k.png", label: "DTT Intraday" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png", label: "DTT Weekly" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gaps-TiAYyuiSKXEn7p2NztThKr3TeCNzJt.png", label: "Gaps" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adr-vWykgdtVdZmT9fwyqfT0VkTKGybF4a.png", label: "ADR" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pulse-MWD-sweeps-bswGrWbwUytK0dwMTLELJaHdNX9nZk.png", label: "Pulse MWD" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pulse-pm%2Bons-jpNrYowEYHGAjicEhZ9ULVp9OG4gA9.png", label: "Pulse PM/ONS" },
]

/* ------------------------------------------------------------------ */
/*  Indicator grid                                                     */
/* ------------------------------------------------------------------ */

const INDICATORS = [
  { name: "MBZ Core", lines: "1,400", desc: "5 gap types as tradable zones with real-time fill tracking" },
  { name: "SIF Core", lines: "950", desc: "Detects institutional traps. Gaps that close immediately." },
  { name: "Deviations", lines: "1,200", desc: "Statistical expansion from 13 sessions. My most important." },
  { name: "Pulse", lines: "740", desc: "Multi-TF sweep levels. Monthly/weekly/daily. My ultimate." },
  { name: "DTT Intraday", lines: "900", desc: "15-session model with IQR range projections" },
  { name: "DTT Weekly", lines: "800", desc: "4 named sessions: Iscariot, Aries, Ash, Icarus" },
  { name: "Gaps", lines: "1,890", desc: "NWOG, NDOG, RTH, BPR, FVG. Floating mode." },
  { name: "ADR", lines: "520", desc: "Daily range + Judas Swing detection" },
  { name: "HTF Algo", lines: "1,100", desc: "BSL/SSL from 8 timeframes, ADR-filtered" },
  { name: "LTF Algo", lines: "800", desc: "Liquidity failures with tick-by-tick targets" },
  { name: "MBZ Prime", lines: "1,200", desc: "Session liquidity pools across all timeframes" },
  { name: "MBZ SIF Relay", lines: "900", desc: "Auto HTF pairing. Broadcasts zones to any LTF chart." },
]

const ENG_PATTERNS = [
  { title: "IQR over averages", desc: "Outlier sessions don't inflate expected range. Interquartile range used across all statistical tools." },
  { title: "Tick-based precision", desc: "All price comparisons in tick units, not floats. Kills phantom duplicates on forex and crypto." },
  { title: "Provisional mitigation", desc: "Overnight touches flagged provisional until NY session confirms. 2am spikes don't kill live levels." },
  { title: "Input change hashing", desc: "Settings hashed every bar. Anything changes, state clears instantly. Zero stale data." },
  { title: "Dynamic capacity", desc: "Boost 4x, Ultra 8x, Ultra Pro 12x. Users pick depth vs performance. Nothing dropped silently." },
  { title: "DRY parameterization", desc: "13,500 lines, zero duplicated detection logic. Functions take parameters. State is isolated." },
]

export function TradingSystem() {
  const [activeLayer, setActiveLayer] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  return (
    <section id="trading" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Act IV header */}
        <FadeUp>
          <div className="mb-16 max-w-4xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#6BAF7B]">
                ACT IV
              </span>
              <span className="h-px w-6 bg-[#1A1A22]" />
              <span className="font-mono text-[10px] text-[#4A4640]">2024 — Present</span>
            </div>
            <h2 className="mb-1 text-3xl font-bold tracking-[-0.02em] text-[#F0E6D0] sm:text-4xl">
              THE BUILD
            </h2>
            <p className="mb-4 text-xs text-[#8A8478]">Self-Employed, Berlin</p>
            <p
              className="mb-6 max-w-2xl text-sm text-[#B0A890]"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
            >
              {'"I built a production system alone, with real money on the line, and shipped it."'}
            </p>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-[#B0A890]" style={{ lineHeight: 1.8 }}>
              An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, all from scratch. No libraries, no wrappers. AI-assisted development as a daily workflow. Managing $50K funded accounts with 60%+ win rate. The market gives feedback instantly, and it doesn{"'"}t care about your feelings.
            </p>
          </div>
        </FadeUp>

        {/* Layering concept */}
        <FadeUp>
          <div className="mb-6">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A84C]">
              The Layering Concept
            </p>
            <p className="max-w-xl text-sm font-light text-[#8A8478]">
              Raw price action is noise. Each indicator layer reveals structure that was always there. Click through to see how the system builds meaning from chaos.
            </p>
          </div>
        </FadeUp>

        {/* Layer buttons */}
        <FadeUp delay={0.1}>
          <div className="mb-8 flex flex-wrap gap-2">
            {LAYERS.map((layer, i) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(i)}
                className="rounded-md px-4 py-2 font-mono text-xs transition-all duration-200"
                style={{
                  backgroundColor: activeLayer === i ? "#C9A84C" : "#131319",
                  color: activeLayer === i ? "#0B0B0F" : "#8A8478",
                  borderWidth: "1px",
                  borderColor: activeLayer === i ? "#C9A84C" : "#1A1A22",
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </FadeUp>

        {/* Split layout: text + image */}
        <FadeUp delay={0.15}>
          <div className="mb-20 flex flex-col gap-8 lg:flex-row">
            {/* Text */}
            <div className="flex items-start lg:w-1/3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeLayer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm leading-relaxed font-light text-[#B0A890]"
                  style={{ lineHeight: 1.8 }}
                >
                  {LAYERS[activeLayer].text}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Image */}
            <div className="relative overflow-hidden rounded-lg border border-[#1A1A22] lg:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLayer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={LAYERS[activeLayer].image}
                    alt={`Trading chart with ${LAYERS[activeLayer].label} layer`}
                    width={1600}
                    height={900}
                    className="w-full"
                    priority={activeLayer === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeUp>

        {/* Horizontal scroll gallery */}
        <FadeUp>
          <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A84C]">
            Indicator Gallery
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            ref={galleryRef}
            className="mb-20 flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#1A1A22 #0B0B0F" }}
          >
            {GALLERY.map((img) => (
              <div key={img.label} className="shrink-0">
                <div className="w-[420px] overflow-hidden rounded-lg border border-[#1A1A22]">
                  <Image
                    src={img.src}
                    alt={img.label}
                    width={840}
                    height={470}
                    className="w-full"
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] text-[#4A4640]">{img.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Indicator grid */}
        <FadeUp>
          <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A84C]">
            14 Indicators
          </p>
        </FadeUp>

        <StaggerContainer className="mb-20 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
          {INDICATORS.map((ind) => (
            <StaggerItem key={ind.name}>
              <div className="rounded-lg border border-[#1A1A22] bg-[#131319] p-5 transition-colors hover:border-[#C9A84C]/20">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-[#F0E6D0]">{ind.name}</span>
                  <span className="font-mono text-[10px] text-[#8B7A3A]">{ind.lines} lines</span>
                </div>
                <p className="text-xs leading-relaxed text-[#8A8478]">{ind.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Engineering patterns */}
        <FadeUp>
          <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A84C]">
            Engineering Patterns
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
          {ENG_PATTERNS.map((pat) => (
            <StaggerItem key={pat.title}>
              <div className="rounded-lg border border-[#1A1A22] bg-[#0B0B0F] p-5">
                <span className="mb-2 block font-mono text-xs font-medium text-[#C9A84C]">{pat.title}</span>
                <p className="text-xs leading-relaxed text-[#8A8478]">{pat.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
