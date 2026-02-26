"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Counter } from "./motion"

const STATS = [
  { value: 7, suffix: "+", label: "Years in Tech" },
  { value: 5, suffix: "M+", label: "Users Impacted" },
  { value: 15, suffix: "+", label: "People Led" },
  { value: 13, suffix: ".5K", label: "Lines Pine Script" },
  { value: 4, suffix: "", label: "Careers" },
]

const ROLES = [
  { label: "Nurse", color: "#E05252" },
  { label: "Engineer", color: "#5B9EC2" },
  { label: "Leader", color: "#C9A84C" },
  { label: "Builder", color: "#5EBB73" },
]

function AnimatedRoles() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="relative inline-flex h-[1.2em] w-[7ch] items-center overflow-hidden">
      {ROLES.map((role, i) => (
        <motion.span
          key={role.label}
          className="absolute left-0 font-sans font-bold"
          style={{ color: role.color }}
          initial={false}
          animate={{
            y: i === index ? 0 : i < index || (index === 0 && i === ROLES.length - 1) ? "-120%" : "120%",
            opacity: i === index ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {role.label}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const nameOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const statsY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0E0E14 0%, #07070A 100%)" }}
    >
      {/* Layered atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Primary gold glow */}
        <div
          className="absolute left-1/2 top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
        {/* Secondary blue glow */}
        <div
          className="absolute left-[15%] bottom-[20%] h-[400px] w-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(91,158,194,0.035) 0%, transparent 65%)",
            animation: "glow-pulse 9s ease-in-out 3s infinite",
          }}
        />
        {/* Red glow */}
        <div
          className="absolute right-[15%] top-[25%] h-[350px] w-[350px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(224,82,82,0.025) 0%, transparent 65%)",
            animation: "glow-pulse 11s ease-in-out 5s infinite",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
        style={{ y: nameY, opacity: nameOpacity }}
      >
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-8 font-mono text-[10px] font-medium uppercase text-[var(--gold-dim)]"
        >
          A Portfolio in Four Acts
        </motion.p>

        {/* Name - static gold gradient, no shimmer */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.04em]"
          style={{
            background: "linear-gradient(135deg, #F0E6D0 0%, #C9A84C 50%, #F0E6D0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          KASCHIEF
          <br />
          JOHNSON
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mx-auto my-6 h-px w-16 origin-center"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
        />

        {/* Role cycling subtitle - properly centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-3 flex items-center justify-center gap-3 text-[clamp(1rem,2.5vw,1.35rem)] font-light"
        >
          <span className="text-[var(--cream-muted)]">Currently a</span>
          <AnimatedRoles />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-[var(--text-dim)] sm:text-base"
        >
          I build things, solve problems, and adapt.
          <br />
          The domain changes. The capability doesn{"'"}t.
        </motion.p>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="relative z-10 mt-16 w-full sm:mt-20"
        style={{ y: statsY }}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 border-t border-[var(--stroke)] px-6 pt-8 sm:gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5">
              <span className="font-mono text-lg font-semibold text-[var(--gold)] sm:text-xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-faint)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
