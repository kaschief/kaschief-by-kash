"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"

const STATS = [
  { value: 7, suffix: "+", label: "Years in Tech" },
  { value: 5, suffix: "M+", label: "Users" },
  { value: 15, suffix: "+", label: "People Led" },
  { value: 13500, suffix: "", label: "Lines Pine Script" },
  { value: 4, suffix: "", label: "Careers" },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  const display = value >= 1000 ? `${(count / 1000).toFixed(count >= value ? 1 : 1)}K` : `${count}`

  return (
    <span ref={ref} className="font-mono text-sm tabular-nums text-[#C9A84C]">
      {value >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
      {suffix}
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0) 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-8 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#8B7A3A]"
        >
          A Portfolio in Four Acts
        </motion.p>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6 font-sans text-5xl font-bold tracking-[-0.03em] sm:text-7xl lg:text-[5.5rem]"
          style={{
            background: "linear-gradient(135deg, #F0E6D0 0%, #C9A84C 50%, #F0E6D0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          KASCHIEF JOHNSON
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mb-8 h-px w-[60px] origin-center bg-[#C9A84C]"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mx-auto mb-4 max-w-2xl text-balance text-lg leading-relaxed font-light text-[#B0A890] sm:text-xl"
          style={{ lineHeight: 1.8 }}
        >
          I build things, solve problems, and adapt. The domain changes. The capability doesn{"'"}t.
        </motion.p>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
        className="absolute bottom-12 left-0 right-0 z-10"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 px-6 sm:gap-10">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-2">
              <Counter value={stat.value} suffix={stat.suffix} />
              <span className="text-xs text-[#4A4640]">{stat.label}</span>
              {i < STATS.length - 1 && (
                <span className="ml-4 hidden h-3 w-px bg-[#1A1A22] sm:block" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="h-12 w-px"
          style={{
            background: "linear-gradient(to bottom, #C9A84C, transparent)",
          }}
          animate={{ opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
