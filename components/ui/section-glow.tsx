"use client"

import { motion, type MotionValue } from "framer-motion"
import { TOKENS } from "@/lib/tokens"

const sizes = {
  sm: "h-[500px] w-[500px]",
  md: "h-[600px] w-[600px]",
  lg: "h-[700px] w-[700px]",
}

export interface SectionGlowProps {
  opacity?: MotionValue<number>
  color?: string
  size?: "sm" | "md" | "lg"
}

export function SectionGlow({ opacity, color = TOKENS.gold, size = "md" }: SectionGlowProps) {
  const inner = (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${sizes[size]}`}
      style={{ background: `radial-gradient(circle, color-mix(in srgb, ${color} 4%, transparent) 0%, transparent 60%)` }}
    />
  )

  if (opacity) {
    return (
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity }}>
        {inner}
      </motion.div>
    )
  }

  return <div className="pointer-events-none absolute inset-0">{inner}</div>
}
