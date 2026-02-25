"use client"

import { FadeIn, StaggerChildren, StaggerItem } from "./motion"
import {
  Zap,
  Search,
  Globe,
  Shield,
  Layers,
  Sprout,
  RefreshCw,
  Target,
} from "lucide-react"

const skills = [
  {
    icon: Zap,
    name: "High-Stakes Decision-Making",
    description:
      "ICU triage → architecture calls → live market positioning. The cost of being wrong is always real.",
  },
  {
    icon: Search,
    name: "Systems Debugging",
    description:
      "Patients, codebases, teams, markets. Tracing symptoms to root causes through systematic elimination.",
  },
  {
    icon: Globe,
    name: "Cross-Functional Communication",
    description:
      "Doctors ↔ families. Product ↔ engineering. Complex ideas made accessible to different minds.",
  },
  {
    icon: Shield,
    name: "Risk Assessment & Mitigation",
    description:
      "Medication management, tech debt, delivery timelines, position sizing. Anticipating before it escalates.",
  },
  {
    icon: Layers,
    name: "Architecture & Product Thinking",
    description:
      "Seeing whole systems. What's possible, what's practical, what actually matters to the end user.",
  },
  {
    icon: Sprout,
    name: "People Development & Advocacy",
    description:
      "Patient advocacy → mentoring engineers → coaching traders. Helping people grow.",
  },
  {
    icon: RefreshCw,
    name: "Adaptability & Learning",
    description:
      "Four career pivots. New domains from scratch. Thriving where things keep changing.",
  },
  {
    icon: Target,
    name: "Precision & Accountability",
    description:
      "Decimal points in dosing. Tests that catch real bugs. Trade journals. Owning outcomes.",
  },
]

export function Skills() {
  return (
    <section id="skills" className="bg-secondary px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-glow">
            Core Capabilities
          </p>
          <h2
            className="mb-3 text-3xl text-foreground sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            8 meta-skills, 4 careers
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {"These aren't tied to job titles. They're capabilities I've built and pressure-tested across every chapter."}
          </p>
        </FadeIn>

        <StaggerChildren
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.08}
        >
          {skills.map((skill) => {
            const Icon = skill.icon
            return (
              <StaggerItem key={skill.name}>
                <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent-glow/30 hover:shadow-lg hover:shadow-accent-glow/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-dark">
                    <Icon className="h-5 w-5 text-accent-glow" />
                  </div>

                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    {skill.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/70">
                    {skill.description}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      </div>
    </section>
  )
}
