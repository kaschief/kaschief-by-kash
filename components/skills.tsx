"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import Image from "next/image"
import { 
  Code2, 
  Layers, 
  TestTube, 
  GitBranch, 
  Cpu, 
  Users, 
  TrendingUp, 
  MessageSquare 
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Meta-skills with icons                                             */
/* ------------------------------------------------------------------ */

const META_SKILLS = [
  { 
    icon: Code2, 
    color: "#5B9EC2",
    name: "Systems Architecture", 
    desc: "Building maintainable frontends that scale. 13,500 lines of Pine Script without chaos proves the discipline." 
  },
  { 
    icon: Layers, 
    color: "#C9A84C",
    name: "Pattern Recognition", 
    desc: "From EKG rhythms to market structure. Finding signal in noise is the same skill in different syntax." 
  },
  { 
    icon: TestTube, 
    color: "#5EBB73",
    name: "Testing Culture", 
    desc: "Built Playwright infrastructure at DKB from scratch. Pre-deploy verification became standard." 
  },
  { 
    icon: GitBranch, 
    color: "#E05252",
    name: "Process Design", 
    desc: "Monthly releases to weekly. Found the friction points, fixed the handoffs, measured the results." 
  },
  { 
    icon: Cpu, 
    color: "#8B7355",
    name: "Performance Engineering", 
    desc: "Core Web Vitals, lazy loading, Lighthouse scores. 50% faster loads at Compado, 35% at CAPinside." 
  },
  { 
    icon: Users, 
    color: "#9B8AC4",
    name: "Team Leadership", 
    desc: "Managing engineers, unblocking people, protecting culture across tech stacks." 
  },
  { 
    icon: TrendingUp, 
    color: "#5B9EC2",
    name: "Evidence-Based Decisions", 
    desc: "A/B testing at AMBOSS. Backtesting trading systems. Opinions are cheap; data is expensive." 
  },
  { 
    icon: MessageSquare, 
    color: "#C9A84C",
    name: "Technical Communication", 
    desc: "Translating between engineers, product, and stakeholders. Making the complex clear." 
  },
]

/* ------------------------------------------------------------------ */
/*  Tools & Technologies by category                                   */
/* ------------------------------------------------------------------ */

const TOOL_CATEGORIES = [
  { category: "Frontend", items: ["React", "Vue", "TypeScript", "Next.js"] },
  { category: "Testing", items: ["Playwright", "Jest", "Cypress"] },
  { category: "Specialized", items: ["Pine Script v6", "TradingView", "AI/LLM workflows"] },
  { category: "Infrastructure", items: ["GitHub Actions", "CI/CD", "Micro-frontends"] },
]

/* ------------------------------------------------------------------ */
/*  Languages                                                          */
/* ------------------------------------------------------------------ */

const LANGUAGES = [
  { lang: "English", level: "Native" },
  { lang: "French", level: "Conversational" },
  { lang: "Spanish", level: "Conversational" },
  { lang: "German", level: "B2 working proficiency" },
]

/* ------------------------------------------------------------------ */
/*  Stagger animation wrapper                                          */
/* ------------------------------------------------------------------ */

function StaggerContainer({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

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
    <section id="skills" ref={sectionRef} className="relative px-6 py-24 sm:py-32">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div className="absolute left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 55%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Profile photo + intro text side by side */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-5">
          {/* Photo - smaller, accent border */}
          <FadeUp delay={0.1} className="lg:col-span-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl lg:mx-0">
              <Image
                src="/images/kaschief.jpg"
                alt="Kaschief Johnson"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 280px, 320px"
              />
              {/* Gold accent line on left */}
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-transparent via-[var(--gold)]/40 to-transparent" />
            </div>
          </FadeUp>

          {/* Text */}
          <div className="lg:col-span-3">
            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--gold)]">
                  The Throughline
                </span>
              </div>
            </FadeIn>
            <RevealLine delay={0.1}>
              <h2 className="font-serif text-4xl text-[var(--cream)] sm:text-5xl">
                What I Bring
              </h2>
            </RevealLine>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-lg leading-[1.7] text-[var(--cream-muted)]">
                Four domains. Different syntax, same underlying discipline: understand the system, find the failure point, fix it without breaking something else.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="mt-4 text-sm leading-[1.8] text-[var(--text-dim)]">
                I{"'"}ve worked in ICU wards, core banking systems, and live financial markets. These are environments where being careless is expensive.
              </p>
            </FadeUp>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  META-SKILLS - Ruled list with icons                         */}
        {/* ============================================================ */}
        <div className="mb-16">
          <FadeIn>
            <p className="mb-8 font-mono text-[9px] font-medium uppercase tracking-[0.25em] text-[#3A3830]">
              Core Capabilities
            </p>
          </FadeIn>
          <StaggerContainer>
            {META_SKILLS.map((skill, i) => {
              const Icon = skill.icon
              return (
                <StaggerItem 
                  key={skill.name} 
                  className={`flex gap-5 border-b border-[#16161E] py-5 ${i === 0 ? "border-t" : ""}`}
                >
                  <Icon size={14} style={{ color: skill.color }} className="mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F0E6D0]">{skill.name}</h4>
                    <p className="mt-1.5 text-sm font-light leading-relaxed text-[#8A8478]">{skill.desc}</p>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>

        {/* ============================================================ */}
        {/*  TOOLS & TECHNOLOGIES - Ruled rows, inline items             */}
        {/* ============================================================ */}
        <div className="mb-16">
          <FadeIn>
            <p className="mb-8 font-mono text-[9px] font-medium uppercase tracking-[0.25em] text-[#3A3830]">
              Tools & Technologies
            </p>
          </FadeIn>
          <StaggerContainer>
            {TOOL_CATEGORIES.map((cat, i) => (
              <StaggerItem 
                key={cat.category} 
                className={`flex items-baseline gap-6 border-b border-[#16161E] py-4 ${i === 0 ? "border-t" : ""}`}
              >
                <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-wider text-[#3A3830]">
                  {cat.category}
                </span>
                <span className="text-sm text-[#C0B898]">
                  {cat.items.map((item, j) => (
                    <span key={item}>
                      {item}
                      {j < cat.items.length - 1 && <span className="mx-2 text-[#2A2820]">·</span>}
                    </span>
                  ))}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* ============================================================ */}
        {/*  LANGUAGES - Ruled rows                                      */}
        {/* ============================================================ */}
        <div>
          <FadeIn>
            <p className="mb-8 font-mono text-[9px] font-medium uppercase tracking-[0.25em] text-[#3A3830]">
              Languages
            </p>
          </FadeIn>
          <StaggerContainer>
            {LANGUAGES.map((l, i) => (
              <StaggerItem 
                key={l.lang} 
                className={`flex items-baseline justify-between border-b border-[#16161E] py-4 ${i === 0 ? "border-t" : ""}`}
              >
                <span className="font-serif text-base italic text-[#F0E6D0]">{l.lang}</span>
                <span className="text-sm text-[#8A8478]">{l.level}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
