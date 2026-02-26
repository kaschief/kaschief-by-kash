"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, StaggerContainer, StaggerItem, RevealLine } from "./motion"
import {
  Zap, Search, Globe, Shield, Layers, Sprout, RefreshCw, Target,
} from "lucide-react"

const SKILLS = [
  {
    icon: Zap,
    color: "#E05252",
    name: "High-Stakes Decisions",
    description: "ICU triage to production incidents to live market positioning. Different domains, same muscle.",
  },
  {
    icon: Search,
    color: "#5B9EC2",
    name: "Systems Debugging",
    description: "Patients, codebases, teams, markets. Finding root cause when the symptom is misleading.",
  },
  {
    icon: Globe,
    color: "#C9A84C",
    name: "Cross-Functional Communication",
    description: "Doctors & families. Product & engineering. Stakeholders & regulators. I translate between worlds.",
  },
  {
    icon: Shield,
    color: "#5EBB73",
    name: "Risk Assessment",
    description: "Medication dosing to tech debt trade-offs to position sizing. Knowing what you can afford to get wrong.",
  },
  {
    icon: Layers,
    color: "#5B9EC2",
    name: "Architecture & Product",
    description: "What's possible vs what matters. 14 indicators exist because each solves a real problem.",
  },
  {
    icon: Sprout,
    color: "#C9A84C",
    name: "People Development",
    description: "Weekly 1:1s, coaching to senior, protecting culture. Growing humans, not just shipping code.",
  },
  {
    icon: RefreshCw,
    color: "#E05252",
    name: "Radical Adaptability",
    description: "Four career domains. Four countries. Four languages. Zero fear of starting over.",
  },
  {
    icon: Target,
    color: "#5EBB73",
    name: "Precision & Ownership",
    description: "From medication accuracy to trade journal documentation. I own the details.",
  },
]

const TECH = [
  { category: "Frontend", items: ["React", "Vue", "TypeScript", "Next.js"] },
  { category: "Testing", items: ["Playwright", "Jest", "E2E", "A/B"] },
  { category: "Backend", items: ["Node.js", "REST", "Git", "CI/CD"] },
  { category: "Trading / AI", items: ["Pine Script v6", "LLM Dev", "Agentic AI"] },
  { category: "Leadership", items: ["Roadmapping", "Hiring", "Mentoring"] },
  { category: "Languages", items: ["English", "French", "Spanish", "German"] },
]

function SkillCard({ skill, index }: { skill: (typeof SKILLS)[0]; index: number }) {
  const Icon = skill.icon
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5 transition-all duration-500 hover:border-[rgba(255,255,255,0.06)]"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${skill.color}, transparent)` }}
      />
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${skill.color}06 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${skill.color}0D` }}>
          <Icon size={16} style={{ color: skill.color }} />
        </div>
        <h3 className="mb-1.5 text-sm font-semibold text-[var(--cream)]">{skill.name}</h3>
        <p className="text-xs leading-relaxed text-[var(--text-dim)] transition-colors duration-300 group-hover:text-[var(--cream-muted)]">
          {skill.description}
        </p>
      </div>
    </motion.div>
  )
}

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0])

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-20 sm:py-28">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[30%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <FadeUp>
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--gold-dim)]">
              Core Capabilities
            </p>
          </FadeUp>
          <RevealLine delay={0.1}>
            <h2 className="mb-3 text-3xl text-[var(--cream)] sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>
              8 meta-skills, 4 careers
            </h2>
          </RevealLine>
          <FadeUp delay={0.3}>
            <p className="mx-auto max-w-lg text-sm text-[var(--text-dim)]">
              These aren{"'"}t tied to job titles. They{"'"}re capabilities I{"'"}ve built and pressure-tested across every chapter.
            </p>
          </FadeUp>
        </div>

        {/* Skills grid */}
        <div className="mb-20 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((skill, i) => (
            <SkillCard key={skill.name} skill={skill} index={i} />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-16 h-px max-w-sm" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)" }} />

        {/* Tech stack */}
        <FadeUp>
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--gold)]">
            Tools & Technologies
          </p>
          <h3 className="mb-10 text-2xl text-[var(--cream)] sm:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
            What I work with
          </h3>
        </FadeUp>

        <StaggerContainer className="flex flex-col gap-6" staggerDelay={0.05}>
          {TECH.map((cat) => (
            <StaggerItem key={cat.category}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <span className="w-24 shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="group relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs text-[var(--cream-muted)] transition-all duration-300 hover:border-[rgba(201,168,76,0.2)] hover:text-[var(--cream)]"
                    >
                      <span className="relative z-10">{item}</span>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.04), transparent)" }}
                      />
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
