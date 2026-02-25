"use client"

import { FadeUp } from "./motion"

export function Philosophy() {
  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <div className="mb-6">
            <span
              className="text-6xl leading-none text-[#C9A84C] sm:text-7xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {"\u201C"}
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <blockquote
            className="mb-8 text-2xl leading-snug text-[#F0E6D0] sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", lineHeight: 1.4 }}
          >
            Water can be a river. It can be ice. It can be the ocean. My skills don{"'"}t belong to any one title. They adapt to whatever container the work demands.
          </blockquote>
        </FadeUp>
      </div>
    </section>
  )
}
