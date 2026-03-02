"use client"

import { useRef, useEffect } from "react"

/*
  Custom cursor — gold arrow with metallic gradient + specular highlight.
  Always rendered so there is never a flash or dual-cursor moment.
  Starts offscreen at opacity 0; direct DOM manipulation on first mousemove.
*/

export function CursorArrow() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let shown = false

    const handleMove = (e: MouseEvent) => {
      const el = cursorRef.current
      if (!el) return
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      if (!shown) {
        el.style.opacity = "1"
        shown = true
      }
    }

    document.addEventListener("mousemove", handleMove, { passive: true })
    return () => document.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "transform",
        transform: "translate(-100px, -100px)",
        opacity: 0,
      }}
    >
      <svg width="21" height="31" viewBox="0 0 21 31" fill="none">
        <defs>
          {/* Diagonal gradient: bright highlight top-left → base gold → deep shadow bottom-right */}
          <linearGradient id="cursorGrad" x1="0" y1="0" x2="21" y2="31" gradientUnits="userSpaceOnUse">
            <stop offset="0%" style={{ stopColor: "var(--cursor-highlight, #F5E080)" }} />
            <stop offset="45%" style={{ stopColor: "var(--gold, #C9A84C)" }} />
            <stop offset="100%" style={{ stopColor: "var(--cursor-shadow, #5C4015)" }} />
          </linearGradient>
        </defs>

        {/* Arrow body */}
        <path
          d="M0 0 L0 28 L7 21 L12 30 L16 28 L11 19 L20 19 Z"
          fill="url(#cursorGrad)"
          stroke="var(--bg)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Specular highlight — thin bright stroke along the upper-left edge */}
        <path
          d="M1 2 L1 13 L5 9"
          stroke="rgba(255,245,200,0.45)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}
