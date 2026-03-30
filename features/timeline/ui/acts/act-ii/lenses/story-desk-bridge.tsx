"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CONTENT } from "../act-ii.data"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function StoryDeskBridge() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center px-6"
      style={{
        paddingTop: "min(64px, 8vh)",
        paddingBottom: "min(48px, 6vh)",
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
        <span style={{ color: "var(--cream-muted)" }}>{CONTENT.bridge.heading[0]}</span>
        <br />
        <span style={{ color: "var(--cream)" }}>{CONTENT.bridge.heading[1]}</span>
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
        {CONTENT.bridge.narrator.split("\n\n").map((paragraph, i) => (
          <span key={i}>
            {i > 0 && <><br /><br /></>}
            {paragraph}
          </span>
        ))}
      </motion.p>

      {/* Funnel climax text — mobile only (desktop shows these in the funnel merge) */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        className="font-narrator mt-8 sm:hidden"
        style={{
          color: "var(--text-dim)",
          fontSize: "clamp(0.88rem, 1.2vw, 1rem)",
          lineHeight: 2,
          fontStyle: "italic",
          maxWidth: "min(480px, 88vw)",
        }}>
        {CONTENT.funnelClimax.left} {CONTENT.funnelClimax.right}
      </motion.p>
    </div>
  )
}
