"use client"

import { FadeUp, StaggerContainer, StaggerItem } from "./motion"
import {
  Zap, Search, Globe, Shield, Layers, Sprout, RefreshCw, Target,
} from "lucide-react"

const SKILLS = [
  {
    icon: Zap,
    name: "High-Stakes Decisions",
    description: "ICU triage to production incidents to live market positioning. Different domains, same muscle.",
  },
  {
    icon: Search,
    name: "Systems Debugging",
    description: "Patients, codebases, teams, markets. Finding root cause when the symptom is misleading.",
  },
  {
    icon: Globe,
    name: "Cross-Functional Communication",
    description: "Doctors & families. Product & engineering. Stakeholders & regulators. I translate between worlds.",
  },
  {
    icon: Shield,
    name: "Risk Assessment",
    description: "Medication dosing to tech debt trade-offs to position sizing. Knowing what you can afford to get wrong.",
  },
  {
    icon: Layers,
    name: "Architecture & Product",
    description: "What's possible vs what matters. 14 indicators exist because each solves a real problem.",
  },
  {
    icon: Sprout,
    name: "People Development",
    description: "Weekly 1:1s, coaching to senior, protecting culture. Growing humans, not just shipping code.",
  },
  {
    icon: RefreshCw,
    name: "Radical Adaptability",
    description: "Four career domains. Four countries. Four languages. Zero fear of starting over.",
  },
  {
    icon: Target,
    name: "Precision & Ownership",
    description: "From medication accuracy to trade journal documentation. I own the details.",
  },
]

const TECH = [
  { category: "Frontend", items: ["React", "Vue", "TypeScript", "Next.js"] },
  { category: "Testing", items: ["Playwright", "Jest", "E2E", "A/B"] },
  { category: "Backend & Tools", items: ["Node.js", "REST", "Git", "CI/CD"] },
  { category: "Trading & AI", items: ["Pine Script v6", "LLM Dev", "Agentic"] },
  { category: "Leadership", items: ["Roadmapping", "Hiring", "Mentoring"] },
  { category: "Languages", items: ["English \u{1F1FA}\u{1F1F8}", "French \u{1F1EB}\u{1F1F7}", "Spanish \u{1F1EA}\u{1F1F8}", "German \u{1F1E9}\u{1F1EA}"] },
]

export function Skills() {
  return (
    <section id="skills" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Meta-skills */}
        <FadeUp>
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
            Core Capabilities
          </p>
          <h2
            className="mb-3 text-3xl text-[#F0E6D0] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            8 meta-skills, 4 careers
          </h2>
          <p className="mb-14 max-w-xl text-sm leading-relaxed font-light text-[#8A8478]">
            These aren{"'"}t tied to job titles. They{"'"}re capabilities I{"'"}ve built and pressure-tested across every chapter.
          </p>
        </FadeUp>

        <StaggerContainer className="mb-24 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.06}>
          {SKILLS.map((skill) => {
            const Icon = skill.icon
            return (
              <StaggerItem key={skill.name}>
                <div className="group flex h-full flex-col rounded-lg border border-[#1A1A22] bg-[#131319] p-6 transition-all duration-300 hover:border-[#C9A84C]/20">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-[#0B0B0F]">
                    <Icon size={16} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-[#F0E6D0]">{skill.name}</h3>
                  <p className="text-xs leading-relaxed text-[#8A8478] transition-colors group-hover:text-[#B0A890]">
                    {skill.description}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Tech stack */}
        <FadeUp>
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
            Tools & Technologies
          </p>
          <h2
            className="mb-12 text-3xl text-[#F0E6D0] sm:text-4xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What I work with
          </h2>
        </FadeUp>

        <StaggerContainer className="flex flex-col gap-6" staggerDelay={0.08}>
          {TECH.map((cat) => (
            <StaggerItem key={cat.category}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <span className="w-28 shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#4A4640]">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-[#1A1A22] bg-[#131319] px-3 py-1.5 text-xs text-[#B0A890] transition-colors hover:border-[#C9A84C]/30 hover:text-[#F0E6D0]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
