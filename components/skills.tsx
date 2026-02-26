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
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-xl border border-[#16161E] bg-[#0E0E14] p-6 transition-all duration-500 hover:border-[#ffffff10]"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${skill.color}, transparent)` }}
      />
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${skill.color}08 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${skill.color}10` }}
        >
          <Icon size={18} style={{ color: skill.color }} />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-[#F0E6D0]">{skill.name}</h3>
        <p className="text-xs leading-relaxed text-[#8A8478] transition-colors duration-300 group-hover:text-[#B0A890]">
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
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0])

  return (
    <section id="skills" ref={sectionRef} className="relative px-6 py-28 sm:py-36">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="atmospheric-glow"
          style={{
            width: 900, height: 900,
            top: "30%", left: "50%", transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(201,168,76,0.035) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Meta-skills */}
        <div className="mb-16 text-center">
          <FadeUp>
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[#8B7A3A]">
              Core Capabilities
            </p>
          </FadeUp>
          <RevealLine delay={0.1}>
            <h2
              className="mb-4 text-4xl text-[#F0E6D0] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              8 meta-skills, 4 careers
            </h2>
          </RevealLine>
          <FadeUp delay={0.3}>
            <p className="mx-auto max-w-lg text-sm font-light text-[#8A8478]">
              These aren{"'"}t tied to job titles. They{"'"}re capabilities I{"'"}ve built and pressure-tested across every chapter.
            </p>
          </FadeUp>
        </div>

        <div className="mb-28 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((skill, i) => (
            <SkillCard key={skill.name} skill={skill} index={i} />
          ))}
        </div>

        {/* Tech stack */}
        <FadeUp>
          <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
            Tools & Technologies
          </p>
          <h3
            className="mb-14 text-3xl text-[#F0E6D0] sm:text-4xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What I work with
          </h3>
        </FadeUp>

        <StaggerContainer className="flex flex-col gap-8" staggerDelay={0.06}>
          {TECH.map((cat) => (
            <StaggerItem key={cat.category}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
                <span className="w-28 shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#4A4640]">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="group relative overflow-hidden rounded-lg border border-[#16161E] bg-[#0E0E14] px-4 py-2 text-xs text-[#B0A890] transition-all duration-300 hover:border-[#C9A84C33] hover:text-[#F0E6D0]"
                    >
                      <span className="relative z-10">{item}</span>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05), transparent)" }}
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
