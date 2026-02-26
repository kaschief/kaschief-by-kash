"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Counter } from "./motion"

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-px rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 3 === 0 ? "#C9A84C" : "#F0E6D0",
          }}
          animate={{
            y: [0, -300 - Math.random() * 400],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

const STATS = [
  { value: 7, suffix: "+", label: "Years in Tech" },
  { value: 5, suffix: "M+", label: "Users" },
  { value: 15, suffix: "+", label: "People Led" },
  { value: 13, suffix: ".5K", label: "Lines Pine Script" },
  { value: 4, suffix: "", label: "Careers" },
]

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const nameOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Multi-layered atmospheric background */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ scale: bgScale }}>
        {/* Primary glow - gold */}
        <div
          className="atmospheric-glow"
          style={{
            width: 800, height: 800,
            top: "30%", left: "50%", transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
        {/* Secondary glow - blue */}
        <div
          className="atmospheric-glow"
          style={{
            width: 600, height: 600,
            bottom: "10%", left: "20%",
            background: "radial-gradient(circle, rgba(91,158,194,0.04) 0%, transparent 70%)",
            animation: "glow-pulse 8s ease-in-out 2s infinite",
          }}
        />
        {/* Tertiary glow - red */}
        <div
          className="atmospheric-glow"
          style={{
            width: 500, height: 500,
            top: "20%", right: "10%",
            background: "radial-gradient(circle, rgba(224,82,82,0.03) 0%, transparent 70%)",
            animation: "glow-pulse 10s ease-in-out 4s infinite",
          }}
        />
        {/* Scan line */}
        <div className="scan-line" />
      </motion.div>

      {/* Particles */}
      {mounted && <FloatingParticles />}

      {/* Horizontal divider lines */}
      <motion.div
        className="pointer-events-none absolute top-[30%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.06), transparent)" }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute top-[70%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.04), transparent)" }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mb-10 font-mono text-[10px] font-medium uppercase text-[#8B7A3A]"
        >
          A Portfolio in Four Acts
        </motion.p>

        {/* Name with parallax */}
        <motion.div style={{ y: nameY, opacity: nameOpacity }}>
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2 font-sans text-5xl font-bold tracking-[-0.04em] sm:text-7xl lg:text-[6rem]"
            style={{
              background: "linear-gradient(135deg, #F0E6D0 0%, #C9A84C 40%, #F0E6D0 60%, #C9A84C 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 6s linear infinite",
            }}
          >
            KASCHIEF
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 font-sans text-5xl font-bold tracking-[-0.04em] sm:text-7xl lg:text-[6rem]"
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #F0E6D0 40%, #C9A84C 60%, #F0E6D0 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 6s linear infinite",
              animationDelay: "0.5s",
            }}
          >
            JOHNSON
          </motion.h1>
        </motion.div>

        {/* Gold expanding divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 h-px w-20 origin-center"
          style={{
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
          }}
        />

        {/* Subtitle */}
        <motion.div style={{ y: subtitleY }}>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mx-auto mb-2 max-w-2xl text-pretty text-lg leading-relaxed font-light text-[#B0A890] sm:text-xl"
          >
            I build things, solve problems, and adapt.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3 }}
            className="mx-auto max-w-2xl text-pretty text-lg font-light text-[#8A8478] sm:text-xl"
          >
            The domain changes. The capability doesn{"'"}t.
          </motion.p>
        </motion.div>
      </div>

      {/* Stats strip with glow backing */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.6 }}
        className="absolute bottom-16 left-0 right-0 z-10"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 sm:gap-12">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="font-mono text-lg font-medium text-[#C9A84C]">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#4A4640]">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="h-16 w-px"
          style={{
            background: "linear-gradient(to bottom, #C9A84C, transparent)",
          }}
          animate={{ opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
