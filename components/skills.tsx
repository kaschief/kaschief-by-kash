"use client"

import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"
import { FadeUp, RevealLine } from "./motion"
import { SectionGlow } from "./ui/section-glow"
import { SectionLabel } from "./ui/section-label"
import { SectionProse } from "./ui/section-prose"
import Image from "next/image"

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 0.4, 0.4, 0])

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-32 sm:py-40">
      <SectionGlow opacity={glowOpacity} color="var(--act-gold)" size="md" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <FadeUp delay={0.1} className="lg:col-span-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl lg:mx-0">
              <Image
                src="/images/kaschief.jpg"
                alt="Kaschief Johnson"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 280px, 320px"
              />
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-transparent via-[var(--gold)]/40 to-transparent" />
            </div>
          </FadeUp>

          <div className="lg:col-span-3">
            <SectionLabel label="The Throughline" color="var(--gold)" />
            <RevealLine delay={0.1}>
              <h2 className="font-serif text-4xl text-[var(--cream)] sm:text-5xl">
                What I Bring
              </h2>
            </RevealLine>
            <SectionProse
              lead="Four domains. Different syntax, same underlying discipline: understand the system, find the failure point, fix it without breaking something else."
              body="I've worked in ICU wards, core banking systems, and live financial markets. These are environments where being careless is expensive."
              delay={0.2}
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
