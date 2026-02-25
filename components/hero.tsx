"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

const stats = [
  "7+ Years in Tech",
  "15+ People Led",
  "5M+ Users Served",
  "4 Languages",
]

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent-glow/8 blur-3xl" />
        <div className="animate-float-delayed absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-accent-warm/6 blur-3xl" />
        <div className="animate-float-slow absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent-glow/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-6 text-5xl leading-tight tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span className="font-sans font-light text-foreground">Kaschief</span>{" "}
          <span
            className="font-serif italic text-accent-glow"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Johnson
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto mb-4 max-w-2xl text-balance text-lg leading-relaxed text-foreground/80 sm:text-xl"
        >
          {"I'm not defined by any one thing I've done. I'm the person capable of doing all of them."}
        </motion.p>

        {/* Career path */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mx-auto mb-10 max-w-xl text-pretty text-sm tracking-wide text-muted-foreground sm:text-base"
        >
          {"Nurse → Engineer → Engineering Manager → Independent Builder."}
          <br />
          {"Four careers. One adaptable mind."}
        </motion.p>

        {/* Pill badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm"
            >
              {stat}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#philosophy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.a>
    </section>
  )
}
