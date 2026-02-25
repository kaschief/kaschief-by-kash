"use client"

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { Timeline } from "@/components/timeline"
import { Skills } from "@/components/skills"
import { Numbers } from "@/components/numbers"
import { TechStack } from "@/components/tech-stack"
import { CaseStudies } from "@/components/case-studies"
import { Contact } from "@/components/contact"

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Philosophy />
        <Timeline />
        <Skills />
        <Numbers />
        <TechStack />
        <CaseStudies />
        <Contact />
      </main>
    </>
  )
}
