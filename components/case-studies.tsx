"use client"

import { FadeIn, StaggerChildren, StaggerItem } from "./motion"

const cases = [
  {
    color: "var(--career-engineer)",
    tag: "ENGINEERING MANAGEMENT",
    title: "Scaling a Banking App for Millions",
    description:
      "Led 15+ people at DKB Code Factory, rebuilding the frontend of a platform used by 5M+ customers. Grew the team, increased release cadence, and navigated the complexities of a regulated environment.",
    metrics: ["6 → 10 engineers", "Monthly → weekly releases", "30% fewer bugs"],
  },
  {
    color: "var(--career-builder)",
    tag: "INDEPENDENT BUILD",
    title: "Production Trading System",
    description:
      "Designed and deployed a live algorithmic trading system from scratch. 12,000+ lines of custom Pine Script indicators, AI-assisted development workflows, and rigorous risk management for real capital.",
    metrics: ["12K+ lines of logic", "Live capital", "AI-assisted dev"],
  },
  {
    color: "var(--career-nurse)",
    tag: "CAREER TRANSITION",
    title: "From ICU Beds to Codebases",
    description:
      "Pivoted from critical care nursing to software engineering, bringing systematic thinking, crisis management, and human-centered design to every product I've built since.",
    metrics: ["CCRN certified", "500K+ students (AMBOSS)", "3 promotions"],
  },
]

export function CaseStudies() {
  return (
    <section id="work" className="bg-secondary px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-glow">
            Selected Work
          </p>
          <h2
            className="mb-14 text-3xl text-foreground sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Case studies
          </h2>
        </FadeIn>

        <StaggerChildren className="flex flex-col gap-6" staggerDelay={0.15}>
          {cases.map((item) => (
            <StaggerItem key={item.tag}>
              <div
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
                style={{ borderLeftWidth: "3px", borderLeftColor: item.color }}
              >
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: item.color }}
                >
                  {item.tag}
                </p>
                <h3 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-lg bg-surface-dark px-3 py-1 font-mono text-xs text-text-on-dark"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <FadeIn delay={0.3}>
          <p
            className="mt-10 text-center text-sm text-muted-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            Full case studies with visuals and deep-dives coming soon.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
