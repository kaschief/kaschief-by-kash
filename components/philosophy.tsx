"use client"

import { FadeIn } from "./motion"

export function Philosophy() {
  return (
    <section
      id="philosophy"
      className="relative overflow-hidden bg-surface-dark px-6 py-28 sm:py-36"
    >
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-glow/5 blur-3xl" />
        <div className="animate-float absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-accent-warm/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FadeIn>
          <blockquote
            className="mb-8 text-3xl leading-snug text-text-on-dark sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            {"Water can be a river. It can be ice. It can be the ocean."}
          </blockquote>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-text-on-dark-muted sm:text-lg">
            {"My skills don't belong to any one job title. They've been forged across four distinct careers and show up differently depending on the container. The capability stays the same."}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
