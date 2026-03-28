"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function StoryDeskBridge() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center px-6"
      style={{
        paddingTop: "min(160px, 20vh)",
        paddingBottom: "min(160px, 20vh)",
        background: "var(--bg)",
      }}>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, ease: EASE }}
        className="font-serif"
        style={{
          fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
          lineHeight: 1.08,
          letterSpacing: "-0.015em",
          maxWidth: "min(800px, 92vw)",
        }}>
        <span style={{ color: "var(--cream-muted)" }}>Each project was different.</span>
        <br />
        <span style={{ color: "var(--cream)" }}>The patterns were the same.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
        className="font-narrator mt-10 sm:mt-12"
        style={{
          color: "var(--text-dim)",
          fontSize: "clamp(0.88rem, 1.2vw, 1rem)",
          lineHeight: 2,
          fontStyle: "italic",
          maxWidth: "min(480px, 88vw)",
        }}>
        Every company had its own version of the same friction, between what was said and what
        actually shipped.
        <br />
        <br />
        The more I worked across teams and systems, the more my role expanded beyond the code
        itself. I kept stepping into the places where alignment had broken down, where the real
        issue was not technical difficulty, but shared clarity.
        <br />
        <br />
        By DKB, the pattern was clear. Some of the most persistent bugs were in the room, not the
        codebase. Addressing them became the work, and leadership became the natural extension of
        it.
      </motion.p>
    </div>
  )
}
