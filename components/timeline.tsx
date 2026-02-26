"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { Plus, ArrowRight, X } from "lucide-react"
import { FadeUp, FadeIn, RevealLine } from "./motion"

/* ------------------------------------------------------------------ */
/*  ACT II - Expandable Job Cards with deep-dive stories               */
/* ------------------------------------------------------------------ */

const JOBS = [
  {
    company: "AMBOSS",
    role: "Frontend Engineer",
    period: "2018 - 2019",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["React", "A/B Testing", "User Research"],
    summary: "Medical exam platform used by 500K+ students globally",
    highlights: [
      "Ran A/B tests that improved user engagement by 20%",
      "Helped take the product out of beta through user research and feature validation",
    ],
    deepDive: "This was my first engineering role, and it mattered that it was in health tech. Coming from nursing, I understood the users -- medical students under immense pressure who needed tools that worked flawlessly. I wasn't just writing React components; I was validating whether features actually helped people learn faster. The A/B testing culture here shaped how I think about product decisions: not opinions, but evidence. We shipped features, measured them, and killed what didn't work. That discipline has stayed with me ever since.",
  },
  {
    company: "Compado",
    role: "Frontend Engineer",
    period: "2019 - 2021",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["Vue", "SEO", "Performance", "Chatbots"],
    summary: "Product comparison sites with dynamic content systems",
    highlights: [
      "Built chatbots, dynamic loading, infinite scroll experiences",
      "Improved page speed by 50%, grew organic traffic 25%",
      "Promoted to Senior Engineer",
    ],
    deepDive: "Compado was where I learned that performance is a feature. We built product comparison sites where milliseconds mattered for SEO rankings and conversion. I went deep on Core Web Vitals, lazy loading strategies, and how to architect Vue apps that score well on Lighthouse while still being rich and interactive. I also built my first chatbot system here. The promotion to Senior wasn't about tenure -- it came because I took ownership of the entire frontend performance story and delivered measurable business results: 50% faster load times, 25% more organic traffic.",
  },
  {
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    period: "2021",
    location: "Hamburg",
    color: "#5B9EC2",
    tech: ["Vue", "TypeScript", "Fintech", "Legacy Migration"],
    summary: "Fintech platform serving 10,000+ financial advisors",
    highlights: [
      "Achieved 35% faster page load times",
      "Replaced struggling legacy application end-to-end",
    ],
    deepDive: "Short tenure, deep impact. CAPinside had a legacy frontend that was holding back the entire product. I was brought in specifically to replace it. The challenge wasn't just technical -- it was convincing a fintech company serving 10,000 financial advisors that a full rewrite was safer than continuing to patch. I mapped every feature, built migration paths, and delivered a Vue + TypeScript application that loaded 35% faster. The lesson: sometimes the most senior thing you can do is have the conviction to say 'this needs to be rebuilt' and then prove it.",
  },
  {
    company: "DKB Code Factory",
    role: "Senior Frontend Engineer",
    period: "2021 - 2022",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["React", "TypeScript", "Playwright", "Jest", "Micro-frontends"],
    summary: "Rebuilt UI/UX of a banking platform for 5M+ users",
    highlights: [
      "Introduced Jest and Playwright testing frameworks across the team",
      "Promoted to Engineering Manager within 12 months",
    ],
    deepDive: "DKB is Germany's largest direct bank -- 5 million users. The frontend needed a complete overhaul, and I was part of the team rebuilding it in React with TypeScript and micro-frontends. But what set me apart wasn't the code. I introduced testing culture: Jest for units, Playwright for e2e. The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them. Within 12 months, I was promoted to Engineering Manager -- not because I asked, but because I was already doing the work: unblocking people, improving processes, and taking responsibility for outcomes beyond my own PRs.",
  },
]

function JobCard({ job, index }: { job: (typeof JOBS)[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[rgba(91,158,194,0.2)]"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${job.color}, transparent)` }}
      />
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${job.color}08 0%, transparent 70%)` }}
      />

      <div className="relative z-10 p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[var(--cream)]">{job.company}</h4>
            <p className="mt-0.5 text-xs text-[var(--cream-muted)]">{job.role}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <span className="font-mono text-[10px] text-[var(--text-dim)]">{job.period}</span>
              <p className="mt-0.5 font-mono text-[10px] text-[var(--text-faint)]">{job.location}</p>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 shrink-0"
            >
              <Plus size={14} className="text-[var(--text-faint)] transition-colors group-hover:text-[var(--act-blue)]" />
            </motion.div>
          </div>
        </div>

        {/* Summary line */}
        <p className="mb-3 text-xs leading-relaxed text-[var(--text-dim)]">{job.summary}</p>

        {/* Tech tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {job.tech.map((t) => (
            <span key={t} className="rounded-md bg-[rgba(91,158,194,0.08)] px-2 py-0.5 font-mono text-[9px] text-[var(--act-blue)]">{t}</span>
          ))}
        </div>

        {/* Quick highlights */}
        <ul className="flex flex-col gap-1.5">
          {job.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-xs leading-relaxed text-[var(--text-dim)]">
              <ArrowRight size={10} className="mt-1 shrink-0 text-[rgba(91,158,194,0.4)]" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Expanded deep-dive */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-t border-[var(--stroke)] pt-4">
                <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--act-blue)]">
                  The Full Story
                </p>
                <p className="text-sm leading-[1.9] text-[var(--cream-muted)]">
                  {job.deepDive}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        {!expanded && (
          <p className="mt-3 font-mono text-[9px] text-[var(--text-faint)] transition-colors group-hover:text-[var(--act-blue)]">
            Click to read the full story
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT III - Management Stories                                       */
/* ------------------------------------------------------------------ */

const MGMT_STORIES = [
  {
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Fighting the culture of silence",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what\u2019s the first edge case you\u2019d test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    tag: "MENTORSHIP",
    color: "#5EBB73",
    title: "Coaching communication style",
    text: "Our Product Owner was frustrated a developer seemed slow. I pointed out it might be the message, not the person. She was asking 'Would you mind finishing by tomorrow?' I shared my version: 'We\u2019re deploying tomorrow. Will your changes be included?' Same intent, different directness. She tried it. His responsiveness changed immediately.",
  },
  {
    tag: "PROCESS",
    color: "#5B9EC2",
    title: "Monthly to weekly releases",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren\u2019t testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    tag: "TECHNICAL",
    color: "#E05252",
    title: "Catching scope creep in real time",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person\u2019s side quest buried in an unrelated PR.",
  },
  {
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Protecting team culture across stacks",
    text: "Some engineers were openly dismissive of colleagues working on a platform they considered inferior. I raised it directly with the engineering lead. The risk wasn\u2019t hurt feelings. It was creating a two-tier team where one group felt like second-class citizens. We agreed that leaders needed to be conscious of how their opinions about tech choices affected the humans working on those technologies.",
  },
  {
    tag: "HIRING",
    color: "#5EBB73",
    title: "Hiring for fit, not speed",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

function MgmtStoryCard({ story, index }: { story: (typeof MGMT_STORIES)[0]; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] transition-all duration-400"
      style={{ borderColor: open ? `${story.color}30` : undefined }}
      onClick={() => setOpen(!open)}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-300"
        style={{ backgroundColor: open ? story.color : "transparent" }}
      />

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${story.color}06 0%, transparent 60%)` }}
      />

      <div className="relative z-10 p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span
              className="w-fit rounded-md px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `${story.color}12`, color: story.color }}
            >
              {story.tag}
            </span>
            <span className="text-sm font-medium text-[var(--cream)] transition-colors group-hover:text-[var(--gold)]">
              {story.title}
            </span>
          </div>
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 shrink-0"
          >
            <Plus size={14} style={{ color: open ? story.color : "var(--text-faint)" }} />
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-4 border-t border-[var(--stroke)] pt-4 text-sm leading-[1.8] text-[var(--cream-muted)]">
                {story.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared Act Header                                                  */
/* ------------------------------------------------------------------ */

function ActHeader({
  act, title, period, location, color, children
}: {
  act: string; title: string; period: string; location: string; color: string; children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.6, 0.6, 0])

  return (
    <div ref={ref} className="relative py-20">
      {/* Act-colored atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}06 0%, transparent 65%)` }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Act label */}
        <FadeIn>
          <div className="mb-5 flex items-center gap-3">
            <motion.span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em]" style={{ color }}>
              {act}
            </span>
            <span className="h-px w-6 bg-[var(--stroke)]" />
            <span className="font-mono text-[10px] text-[var(--text-faint)]">{period}</span>
            <span className="hidden font-mono text-[10px] text-[var(--text-faint)] sm:inline">
              &middot; {location}
            </span>
          </div>
        </FadeIn>

        {/* Title */}
        <RevealLine>
          <h3 className="text-4xl font-bold tracking-[-0.03em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
            {title}
          </h3>
        </RevealLine>

        {/* Content */}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT I - The Nurse                                                  */
/* ------------------------------------------------------------------ */

function ActI() {
  return (
    <ActHeader act="ACT I" title="THE NURSE" period="2015 - 2018" location="NYU Langone, New York" color="#E05252">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
        <FadeUp delay={0.2} className="lg:w-2/5">
          <p className="text-lg text-[var(--cream-muted)]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.5 }}>
            {"\u201CBefore I wrote a single line of code, I learned to debug systems where hesitation costs lives.\u201D"}
          </p>
        </FadeUp>
        <FadeUp delay={0.3} className="lg:w-3/5">
          <p className="text-sm leading-[1.9] text-[var(--cream-muted)]">
            Neuro ICU. Three to four critical patients per shift. Ventilators, IV drips, medication protocols that had to be exact. A cough doesn{"'"}t mean a cold. It could be pulmonary effusion, a ventilator issue, a medication reaction. Every shift was differential diagnosis under pressure.
          </p>
          <p className="mt-4 text-sm leading-[1.9] text-[var(--text-dim)]">
            CCRN certified, because I chose to be held to the highest standard. This is where I learned systems thinking, crisis communication, and the cost of getting it wrong.
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              { value: "3-4", label: "ICU patients per shift" },
              { value: "CCRN", label: "Certified" },
              { value: "3 yrs", label: "Critical care" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm font-semibold text-[#E05252]">{m.value}</span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-faint)]">{m.label}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT II - The Engineer (expandable job cards)                       */
/* ------------------------------------------------------------------ */

function ActII() {
  return (
    <ActHeader act="ACT II" title="THE ENGINEER" period="2018 - 2022" location="Berlin & Hamburg" color="#5B9EC2">
      <FadeUp delay={0.2}>
        <p className="mb-4 text-lg text-[var(--cream-muted)]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.5 }}>
          {"\u201CFour companies. Each one pushed me deeper technically while keeping me close to users and product.\u201D"}
        </p>
        <p className="mb-8 max-w-2xl text-sm leading-[1.9] text-[var(--text-dim)]">
          From medical education to product comparison, from fintech to banking. Every role meant a new codebase, new users, new constraints. The constant: shipping features that people actually use, and earning promotions through impact not tenure.
        </p>
      </FadeUp>

      {/* Expandable job cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {JOBS.map((job, i) => (
          <JobCard key={job.company} job={job} index={i} />
        ))}
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT III - The Leader                                               */
/* ------------------------------------------------------------------ */

function ActIII() {
  return (
    <ActHeader act="ACT III" title="THE LEADER" period="2022 - 2024" location="DKB Code Factory, Berlin" color="#C9A84C">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Left: Summary + metrics */}
        <FadeUp delay={0.2} className="lg:w-2/5">
          <p className="mb-4 text-lg text-[var(--cream-muted)]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.5 }}>
            {"\u201CLeading people turned out to be the hardest kind of debugging. And the most rewarding.\u201D"}
          </p>
          <p className="mb-6 text-sm leading-[1.9] text-[var(--cream-muted)]">
            Eight engineers on one of Germany{"'"}s largest banking apps. Grew the core team from 6 to 10. Drove migration to React/TypeScript and micro-frontends. Monthly releases became weekly. Bugs dropped 30%. Ran weekly 1:1s. Coached engineers into senior roles.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              { value: "15+", label: "People managed" },
              { value: "6 \u2192 10", label: "Team growth" },
              { value: "-30%", label: "Bug reduction" },
              { value: "Weekly", label: "Release cadence" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm font-semibold text-[var(--gold)]">{m.value}</span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-faint)]">{m.label}</span>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Right: Management stories */}
        <div className="lg:w-3/5">
          <FadeUp delay={0.3}>
            <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-dim)]">
              How the real work looked
            </p>
          </FadeUp>
          <div className="flex flex-col gap-3">
            {MGMT_STORIES.map((story, i) => (
              <MgmtStoryCard key={story.title} story={story} index={i} />
            ))}
          </div>
        </div>
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  Divider                                                            */
/* ------------------------------------------------------------------ */

function ActDivider({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scaleX = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])

  return (
    <div ref={ref} className="relative py-2">
      <motion.div
        className="mx-auto h-px max-w-md origin-center"
        style={{
          scaleX,
          background: `linear-gradient(90deg, transparent, ${color}25, transparent)`,
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Timeline Export                                                     */
/* ------------------------------------------------------------------ */

export function Timeline() {
  return (
    <section id="journey">
      {/* Section header */}
      <div className="relative px-6 py-16 text-center">
        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 60%)" }}
        />
        <FadeUp className="relative z-10">
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--gold-dim)]">
            The Journey
          </p>
          <h2 className="text-3xl text-[var(--cream)] sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>
            Four acts, one thread
          </h2>
        </FadeUp>
      </div>

      <ActI />
      <ActDivider color="#E05252" />
      <ActII />
      <ActDivider color="#5B9EC2" />
      <ActIII />
    </section>
  )
}
