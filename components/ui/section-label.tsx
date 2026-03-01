"use client"

import { motion } from "framer-motion"
import { FadeIn } from "../motion"

export interface SectionLabelProps {
  label: string
  color: string
}

export function SectionLabel({ label, color }: SectionLabelProps) {
  return (
    <FadeIn>
      <div className="mb-4 flex items-center gap-3">
        <motion.span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </FadeIn>
  )
}
