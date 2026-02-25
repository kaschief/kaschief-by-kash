"use client"

import { FadeIn } from "./motion"
import { Mail, ArrowUpRight } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-surface-dark px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-glow/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2
            className="mb-6 text-3xl text-text-on-dark sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {"Let's talk"}
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mx-auto mb-10 max-w-lg text-pretty text-base leading-relaxed text-text-on-dark-muted">
            {"I'm open to engineering roles, leadership positions, and anything where my range of experience is a feature, not a footnote."}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:kaschiefj@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-accent-glow px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-accent-glow/90 hover:shadow-lg hover:shadow-accent-glow/20"
            >
              <Mail className="h-4 w-4" />
              kaschiefj@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/kaschief-johnson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-text-on-dark-muted/30 px-6 py-3 text-sm font-medium text-text-on-dark transition-all duration-200 hover:border-text-on-dark/60 hover:bg-text-on-dark/5"
            >
              LinkedIn
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.45}>
          <p className="mt-10 text-sm text-text-on-dark-muted">
            {"+49 176 204 19325 · Berlin, Germany"}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
