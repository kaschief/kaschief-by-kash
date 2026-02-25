"use client"

import { FadeIn, StaggerChildren, StaggerItem } from "./motion"

const categories = [
  {
    name: "Frontend",
    items: ["React", "Vue.js", "TypeScript", "JavaScript", "Next.js"],
  },
  {
    name: "Testing",
    items: ["Playwright", "Jest", "E2E", "A/B Testing"],
  },
  {
    name: "Backend & APIs",
    items: ["Node.js", "REST APIs", "Git", "System Architecture"],
  },
  {
    name: "AI & Tools",
    items: ["LLM-Assisted Dev", "Pine Script", "Agentic Workflows"],
  },
  {
    name: "Leadership",
    items: ["Roadmapping", "Hiring", "Mentoring", "Stakeholder Mgmt"],
  },
  {
    name: "Languages",
    items: ["English \u{1F1FA}\u{1F1F8}", "French \u{1F1EB}\u{1F1F7}", "Spanish \u{1F1EA}\u{1F1F8}", "German \u{1F1E9}\u{1F1EA}"],
  },
]

export function TechStack() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-glow">
            Tools & Technologies
          </p>
          <h2
            className="mb-14 text-3xl text-foreground sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What I work with
          </h2>
        </FadeIn>

        <StaggerChildren className="flex flex-col gap-8" staggerDelay={0.1}>
          {categories.map((category) => (
            <StaggerItem key={category.name}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
                <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {category.name}
                </span>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground transition-all duration-200 hover:border-accent-glow/40 hover:bg-accent-glow/5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
