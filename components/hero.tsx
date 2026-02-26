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

const ROLES = ["Nurse", "Engineer", "Leader", "Builder"]

function AnimatedRoles() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [])
  const colors = ["#E05252", "#5B9EC2", "#C9A84C", "#5EBB73"]
  return (
    <span className="relative inline-block h-[1.15em] w-[5ch] overflow-hidden align-bottom sm:w-[7ch]">
      {ROLES.map((role, i) => (
        <motion.span
          key={role}
          className="absolute inset-0 font-sans font-bold"
          style={{ color: colors[i] }}
          initial={false}
          animate={{
            y: i === index ? 0 : i < index ? "-110%" : "110%",
            opacity: i === index ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {role}
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
          className="absolute left-1/2 top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
        {/* Secondary blue glow - left */}
        <div
          className="absolute left-[15%] bottom-[20%] h-[400px] w-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(91,158,194,0.035) 0%, transparent 65%)",
            animation: "glow-pulse 9s ease-in-out 3s infinite",
          }}
        />
        {/* Red glow - right */}
        <div
          className="absolute right-[15%] top-[25%] h-[350px] w-[350px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(224,82,82,0.025) 0%, transparent 65%)",
            animation: "glow-pulse 11s ease-in-out 5s infinite",
          }}
        />
        {/* Horizontal accent lines */}
        <motion.div
          className="absolute left-0 right-0 top-[28%] h-px"
          style={{ background: "linear-gradient(90deg, transparent 5%, rgba(201,168,76,0.04) 50%, transparent 95%)" }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-0 right-0 top-[72%] h-px"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(201,168,76,0.03) 50%, transparent 90%)" }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        {/* Subtle grid lines for depth */}
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

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.04em]"
          style={{
            background: "linear-gradient(135deg, #F0E6D0 0%, #C9A84C 35%, #F0E6D0 55%, #C9A84C 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 8s linear infinite",
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

        {/* Animated role cycling subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-3 flex items-center justify-center gap-2 text-[clamp(1rem,2.5vw,1.35rem)] font-light"
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
        <div
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 border-t border-[var(--stroke)] px-6 pt-8 sm:gap-10"
        >
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

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-[var(--gold)] to-transparent opacity-40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
