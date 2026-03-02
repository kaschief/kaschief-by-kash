"use client"

import { FadeUp } from "../motion"

export interface TakeawayBlockProps {
  text: string
  color?: string
  delay?: number
  serif?: boolean
  className?: string
}

export function TakeawayBlock({
  text,
  color = "var(--gold)",
  delay = 0.4,
  serif = false,
  className,
}: TakeawayBlockProps) {
  return (
    <FadeUp delay={delay}>
      <div
        className={`border-l-2 py-2 pl-6 ${className ?? ""}`}
        style={{ borderColor: `color-mix(in srgb, ${color} 19%, transparent)` }}
      >
        <p
          className={`${serif ? "font-serif text-base" : "text-sm"} italic leading-relaxed text-[var(--cream-muted)]`}
        >
          {text}
        </p>
      </div>
    </FadeUp>
  )
}
