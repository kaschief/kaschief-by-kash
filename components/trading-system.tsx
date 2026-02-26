"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine, ScaleOnScroll, StaggerContainer, StaggerItem, Counter } from "./motion"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LAYERS = [
  {
    id: "naked",
    label: "Naked",
    shortLabel: "01",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked-VMuu7dsvaVlzWtw8lmDMmS7mVX17V2.png",
    text: "NQ1 futures, 5-minute. Just candles. Where does price want to go, and what\u2019s in its way? Without structure, this is just noise.",
  },
  {
    id: "adr",
    label: "+ ADR",
    shortLabel: "02",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Badr-fs9lGsRFiIshlvbEaM89Inr4CbTgdC.png",
    text: "Daily range boundaries appear. The ceiling and floor of expected movement. The 1/3 ADR level is where early-session sweeps exhaust before the real move begins.",
  },
  {
    id: "deviations",
    label: "+ Deviations",
    shortLabel: "03",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bdeviations-dgmE6WiDyufvSh9Cc0qPdUwJIqpIWy.png",
    text: "13 intraday sessions light up with statistical expansion zones. You can see whether price is at a normal level or at an extreme.",
  },
  {
    id: "dtt",
    label: "+ DTT",
    shortLabel: "04",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bdtt-dylDYara81YRgoTGGlojHaTPMCnh6E.png",
    text: "The week splits into 4 named sessions: Iscariot, Aries, Ash, Icarus. Dynamic Fibonacci projections anchor to developing highs/lows.",
  },
  {
    id: "gaps",
    label: "+ Gaps",
    shortLabel: "05",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bgaps-gazjXWAaR5pwFbjgtcM6FWMHShI3Q1.png",
    text: "NWOG, NDOG, RTH gaps mapped. Fill percentages per gap. Floating mode keeps unfilled gaps visible near price.",
  },
  {
    id: "pulse",
    label: "+ Pulse",
    shortLabel: "06",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/naked%2Bpulse-0VIC5O2b1WbouOo8CZIitJgVU7KDqG.png",
    text: "The full picture. Monthly, weekly, daily sweep levels. Overnight and premarket ranges. All 14 indicators reading the same chart.",
  },
]

const GALLERY = [
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mbz-zd4McYL4UDAyZTWlzo3jzUqce8l9pT.png", label: "MBZ Core", desc: "5 gap types as tradable zones" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sif-19wV1QFs0rRcCK5niQYmOOWhlyA2AE.png", label: "SIF Core", desc: "Institutional trap detection" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-close-sn7E1oBJX36F3N3UkDiE9ea9fb1RxZ.png", label: "Deviations", desc: "Statistical session expansion" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deviations-wide-nixzOfoox1JQvL2d1mxjCky4g8FoXC.png", label: "Deviations Wide", desc: "Multi-session overview" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-intraday-eSUMZqox7TXskbGAVLTvoxbXKRES7k.png", label: "DTT Intraday", desc: "15 micro-sessions with IQR" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dtt-weekly-cHXKyAwK6Sg4fI1HHlfGhNRgqualNj.png", label: "DTT Weekly", desc: "Named session Fibonacci" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gaps-TiAYyuiSKXEn7p2NztThKr3TeCNzJt.png", label: "Gaps", desc: "NWOG, NDOG, RTH mapping" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adr-vWykgdtVdZmT9fwyqfT0VkTKGybF4a.png", label: "ADR", desc: "Range + Judas detection" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adr-with-consolidation-prediction-eLWf1nanOPZk1UkJNVUjykbq9Hftdr.png", label: "ADR + Predict", desc: "Consolidation forecasting" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pulse-MWD-sweeps-bswGrWbwUytK0dwMTLELJaHdNX9nZk.png", label: "Pulse MWD", desc: "Multi-timeframe sweeps" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pulse-pm%2Bons-jpNrYowEYHGAjicEhZ9ULVp9OG4gA9.png", label: "Pulse PM/ONS", desc: "Premarket & overnight" },
]

const INDICATORS = [
  { name: "MBZ Core", lines: "1,400", desc: "5 gap types as tradable zones with real-time fill tracking" },
  { name: "SIF Core", lines: "950", desc: "Detects institutional traps. Gaps that close immediately." },
  { name: "Deviations", lines: "1,200", desc: "Statistical expansion from 13 sessions. My most important." },
  { name: "Pulse", lines: "740", desc: "Multi-TF sweep levels. Monthly/weekly/daily. The ultimate." },
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
  { title: "IQR over averages", desc: "Outlier sessions don\u2019t inflate expected range. Interquartile range used across all statistical tools." },
  { title: "Tick-based precision", desc: "All price comparisons in tick units, not floats. Kills phantom duplicates on forex and crypto." },
  { title: "Provisional mitigation", desc: "Overnight touches flagged provisional until NY session confirms. 2am spikes don\u2019t kill live levels." },
  { title: "Input change hashing", desc: "Settings hashed every bar. Anything changes, state clears instantly. Zero stale data." },
  { title: "Dynamic capacity", desc: "Boost 4x, Ultra 8x, Ultra Pro 12x. Users pick depth vs performance. Nothing dropped silently." },
  { title: "DRY parameterization", desc: "13,500 lines, zero duplicated detection logic. Functions take parameters. State is isolated." },
]

/* ------------------------------------------------------------------ */
/*  Evasion-style Gallery Item                                         */
/* ------------------------------------------------------------------ */

function GalleryCard({ item, index }: { item: (typeof GALLERY)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group shrink-0"
    >
      <div className="relative w-[480px] overflow-hidden rounded-xl border border-[#16161E] transition-all duration-500 hover:border-[#C9A84C33]">
        {/* Glow on hover */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)",
          }}
        />
        <Image
          src={item.src}
          alt={item.label}
          width={960}
          height={540}
          className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#07070A]/90 to-transparent p-5 pt-10">
          <p className="font-sans text-sm font-semibold text-[#F0E6D0]">{item.label}</p>
          <p className="mt-0.5 font-mono text-[10px] text-[#8A8478]">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TradingSystem() {
  const [activeLayer, setActiveLayer] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const bgGlowOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  return (
    <section id="trading" ref={sectionRef} className="relative py-24 sm:py-32">
      {/* Full-section green atmospheric glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: bgGlowOpacity }}
      >
        <div
          className="atmospheric-glow"
          style={{
            width: 1200, height: 1200,
            top: "30%", left: "50%", transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(94,187,115,0.04) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Act IV header */}
        <div className="mb-20">
          <FadeIn>
            <div className="mb-6 flex items-center gap-3">
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-[#5EBB73]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5EBB73]">
                ACT IV
              </span>
              <span className="h-px w-8 bg-[#16161E]" />
              <span className="font-mono text-[11px] text-[#4A4640]">2024 &mdash; Present</span>
            </div>
          </FadeIn>

          <RevealLine>
            <h2 className="text-5xl font-bold tracking-[-0.03em] text-[#F0E6D0] sm:text-6xl lg:text-7xl">
              THE BUILD
            </h2>
          </RevealLine>

          <FadeUp delay={0.3}>
            <p className="mt-2 text-xs text-[#8A8478]">Self-Employed, Berlin</p>
          </FadeUp>

          <FadeUp delay={0.4}>
            <p
              className="mt-6 max-w-xl text-lg text-[#B0A890]"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.5 }}
            >
              {"\u201CI built a production system alone, with real money on the line, and shipped it.\u201D"}
            </p>
          </FadeUp>

          <FadeUp delay={0.5}>
            <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-[#B0A890]" style={{ lineHeight: 1.9 }}>
              An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, all from scratch. No libraries, no wrappers. AI-assisted development as a daily workflow. Managing $50K funded accounts with 60%+ win rate. The market gives feedback instantly, and it doesn{"'"}t care about your feelings.
            </p>
          </FadeUp>

          {/* Quick stats */}
          <FadeUp delay={0.6}>
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { value: 14, suffix: "", label: "Indicators" },
                { value: 13, suffix: ".5K", label: "Lines Pine Script" },
                { value: 60, suffix: "%+", label: "Win Rate" },
                { value: 50, suffix: "K", label: "Funded" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-2xl font-semibold text-[#5EBB73]">
                    <Counter value={s.value} suffix={s.suffix} />
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-widest text-[#4A4640]">{s.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*  Layering Section                                             */}
        {/* ------------------------------------------------------------ */}
        <div className="mb-28">
          <FadeUp>
            <div className="mb-8">
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
                The Layering Concept
              </p>
              <p className="max-w-lg text-sm font-light text-[#8A8478]">
                Raw price action is noise. Each layer reveals structure that was always there.
              </p>
            </div>
          </FadeUp>

          {/* Layer selector - numbered steps */}
          <FadeUp delay={0.1}>
            <div className="mb-10 flex items-center gap-1">
              {LAYERS.map((layer, i) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(i)}
                  className="group relative flex items-center"
                >
                  <div
                    className="flex h-10 items-center gap-2 rounded-lg px-4 font-mono text-xs transition-all duration-300"
                    style={{
                      backgroundColor: activeLayer === i ? "#C9A84C" : activeLayer > i ? "#16161E" : "#0E0E14",
                      color: activeLayer === i ? "#07070A" : activeLayer > i ? "#5EBB73" : "#4A4640",
                      fontWeight: activeLayer === i ? 600 : 400,
                    }}
                  >
                    <span className="text-[10px]">{layer.shortLabel}</span>
                    <span className="hidden sm:inline">{layer.label}</span>
                  </div>
                  {i < LAYERS.length - 1 && (
                    <div
                      className="mx-0.5 h-px w-3 transition-colors duration-300"
                      style={{ backgroundColor: i < activeLayer ? "#5EBB7340" : "#16161E" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Split screen: image + text */}
          <ScaleOnScroll>
            <div className="overflow-hidden rounded-2xl border border-[#16161E] bg-[#0A0A0F]">
              <div className="flex flex-col lg:flex-row">
                {/* Image area */}
                <div className="relative lg:w-2/3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLayer}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative"
                    >
                      {/* Glow overlay on image matching layer progress */}
                      <div
                        className="pointer-events-none absolute inset-0 z-10"
                        style={{
                          background: `radial-gradient(ellipse at 50% 50%, ${activeLayer > 3 ? "rgba(94,187,115,0.04)" : "rgba(201,168,76,0.03)"} 0%, transparent 70%)`,
                        }}
                      />
                      <Image
                        src={LAYERS[activeLayer].image}
                        alt={`Trading chart: ${LAYERS[activeLayer].label}`}
                        width={1600}
                        height={900}
                        className="w-full"
                        priority={activeLayer === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Text panel */}
                <div className="flex flex-col justify-center border-t border-[#16161E] p-8 lg:w-1/3 lg:border-t-0 lg:border-l">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLayer}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="mb-3 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EBB73]">
                        Layer {activeLayer + 1} of {LAYERS.length}
                      </span>
                      <h4 className="mb-4 text-xl font-bold text-[#F0E6D0]">{LAYERS[activeLayer].label}</h4>
                      <p className="text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.8 }}>
                        {LAYERS[activeLayer].text}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  <div className="mt-8 flex gap-2">
                    <button
                      onClick={() => setActiveLayer(Math.max(0, activeLayer - 1))}
                      disabled={activeLayer === 0}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#16161E] text-[#8A8478] transition-all hover:border-[#C9A84C33] hover:text-[#C9A84C] disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button
                      onClick={() => setActiveLayer(Math.min(LAYERS.length - 1, activeLayer + 1))}
                      disabled={activeLayer === LAYERS.length - 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#16161E] text-[#8A8478] transition-all hover:border-[#C9A84C33] hover:text-[#C9A84C] disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScaleOnScroll>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*  Evasion-Style Gallery                                        */}
        {/* ------------------------------------------------------------ */}
        <div className="mb-28">
          <FadeUp>
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
              Indicator Showcase
            </p>
            <p className="mb-8 max-w-lg text-sm font-light text-[#8A8478]">
              Each indicator is a self-contained piece of engineering. Scroll through the full collection.
            </p>
          </FadeUp>

          <div
            ref={galleryRef}
            className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-6"
            style={{ scrollbarWidth: "none" }}
          >
            {GALLERY.map((img, i) => (
              <GalleryCard key={img.label} item={img} index={i} />
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*  Indicator Grid                                               */}
        {/* ------------------------------------------------------------ */}
        <div className="mb-28">
          <FadeUp>
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
              The Arsenal
            </p>
            <p className="mb-10 text-sm font-light text-[#8A8478]">14 indicators. Zero duplicated detection logic.</p>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.04}>
            {INDICATORS.map((ind) => (
              <StaggerItem key={ind.name}>
                <div className="group relative overflow-hidden rounded-xl border border-[#16161E] bg-[#0E0E14] p-6 transition-all duration-400 hover:border-[#C9A84C22]">
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 70%)" }}
                  />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-[#F0E6D0]">{ind.name}</span>
                      <span className="font-mono text-[10px] text-[#5EBB73]">{ind.lines} lines</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#8A8478] transition-colors group-hover:text-[#B0A890]">
                      {ind.desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*  Engineering Patterns                                         */}
        {/* ------------------------------------------------------------ */}
        <div>
          <FadeUp>
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
              Engineering Philosophy
            </p>
            <p className="mb-10 text-sm font-light text-[#8A8478]">
              Patterns that keep 13,500 lines maintainable and fast.
            </p>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.04}>
            {ENG_PATTERNS.map((pat) => (
              <StaggerItem key={pat.title}>
                <div className="rounded-xl border border-[#16161E] bg-[#07070A] p-6">
                  <span className="mb-3 block font-mono text-xs font-semibold text-[#C9A84C]">{pat.title}</span>
                  <p className="text-xs leading-relaxed text-[#8A8478]">{pat.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
