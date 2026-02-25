"use client"

import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"
import { FadeIn } from "./motion"

interface StatProps {
  value: number
  suffix: string
  label: string
  sub: string
}

const stats: StatProps[] = [
  { value: 7, suffix: "+", label: "Years in Tech", sub: "Frontend to Leadership" },
  { value: 5, suffix: "M+", label: "Users Served", sub: "Banking, Healthtech, Fintech" },
  { value: 15, suffix: "+", label: "People Led", sub: "Engineers, Designers, QA" },
  { value: 12, suffix: "K+", label: "Lines of Pine Script", sub: "Custom Trading System" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref} className="font-mono text-4xl font-bold text-accent-glow sm:text-5xl lg:text-6xl">
      {count}
      {suffix}
    </span>
  )
}

export function Numbers() {
  return (
    <section className="relative overflow-hidden bg-surface-dark px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute -top-32 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-glow/5 blur-3xl" />
        <div className="animate-float-delayed absolute -bottom-32 left-1/4 h-[300px] w-[300px] rounded-full bg-accent-warm/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="mt-2 text-sm font-medium text-text-on-dark sm:text-base">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-text-on-dark-muted">{stat.sub}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
