"use client"

import { FadeUp } from "./motion"
import { Mail, ArrowUpRight } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="relative px-6 py-28 sm:py-36">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeUp>
          <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#8B7A3A]">
            Next Act
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2
            className="mb-6 text-4xl text-[#F0E6D0] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Yours to write.
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mx-auto mb-10 max-w-lg text-pretty text-sm leading-relaxed font-light text-[#8A8478]" style={{ lineHeight: 1.8 }}>
            Open to engineering, leadership, and roles where range is a feature, not a footnote.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:kaschiefj@gmail.com"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #8B7A3A)",
                color: "#0B0B0F",
              }}
            >
              <Mail size={14} />
              kaschiefj@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/kaschief-johnson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#1A1A22] px-6 py-3 text-sm font-medium text-[#B0A890] transition-all duration-200 hover:border-[#C9A84C]/30 hover:text-[#F0E6D0]"
            >
              LinkedIn
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://github.com/kaschief/kash-indicators"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#1A1A22] px-6 py-3 text-sm font-medium text-[#B0A890] transition-all duration-200 hover:border-[#C9A84C]/30 hover:text-[#F0E6D0]"
            >
              GitHub
              <ArrowUpRight size={14} />
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <p className="mt-10 text-xs text-[#4A4640]">
            +49 176 204 19325 &middot; Berlin, Germany
          </p>
        </FadeUp>
      </div>
    </section>
  )
}
