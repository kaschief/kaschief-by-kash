"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState, type ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Animation constants — single source of truth                       */
/* ------------------------------------------------------------------ */

export const EASE = [0.22, 1, 0.36, 1] as const

export const TRANSITION = {
  snap:    { duration: 0.15, ease: "easeOut" as const }, // backdrop / near-instant covers
  fast:    { duration: 0.25, ease: EASE },
  base:    { duration: 0.45, ease: EASE },
  slow:    { duration: 0.7,  ease: EASE },
  page:    { duration: 0.9,  ease: EASE },
} as const

/** String form for use in CSS `transition` properties */
export const CSS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/* ------------------------------------------------------------------ */
/*  Components                                                          */
/* ------------------------------------------------------------------ */

export function FadeUp({
  children,
  delay = 0,
  className = "",
  distance = 60,
}: {
  children: ReactNode
  delay?: number
  className?: string
  distance?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ ...TRANSITION.page, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: TRANSITION.page.duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ ...TRANSITION.page, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function ParallaxSection({
  children,
  className = "",
  speed = 0.15,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

export function ScaleOnScroll({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
  distance = 40,
}: {
  children: ReactNode
  className?: string
  distance?: number
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: TRANSITION.slow,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2200
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

  const display = value >= 1000 ? `${(count / 1000).toFixed(1)}K` : `${count}`

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  )
}


export { motion, useScroll, useTransform, useInView }
