"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

const ROLES = [
  { label: "Nurse", color: "#E05252" },
  { label: "Engineer", color: "#5B9EC2" },
  { label: "Leader", color: "#C9A84C" },
  { label: "Builder", color: "#5EBB73" },
]

export function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const t = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0E0E14 0%, #07070A 100%)" }}
    >
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[20%] left-[15%] h-[400px] w-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(91,158,194,0.035) 0%, transparent 65%)",
            animation: "glow-pulse 9s ease-in-out 3s infinite",
          }}
        />
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
        style={{ y: contentY, opacity: contentOpacity }}
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

        {/* Clean role display - no a/an issue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-6 flex items-center justify-center gap-3 text-[clamp(1rem,2.5vw,1.35rem)] font-light"
        >
          <span className="text-[var(--cream-muted)]">Four careers. One thread:</span>
          <span className="relative inline-block h-[1.3em] w-[7ch] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROLES[roleIndex].label}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 font-semibold"
                style={{ color: ROLES[roleIndex].color }}
              >
                {ROLES[roleIndex].label}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        {/* Brief intro */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-[var(--text-dim)] sm:text-base"
        >
          From critical care nursing to frontend engineering to engineering management.
          <br className="hidden sm:block" />
          Now building algorithmic trading systems independently in Berlin.
        </motion.p>

        {/* Quick value props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[var(--text-faint)]"
        >
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#E05252]" />
            ICU-trained pattern recognition
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#5B9EC2]" />
            7 years in tech
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#C9A84C]" />
            15+ people led
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
