"use client"

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { Timeline } from "@/components/timeline"
import { TradingSystem } from "@/components/trading-system"
import { Skills } from "@/components/skills"
import { Contact } from "@/components/contact"

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Philosophy />
        <Timeline />
        <TradingSystem />
        <Skills />
        <Contact />
      </main>
    </>
  )
}
