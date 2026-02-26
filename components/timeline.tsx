"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { FadeUp, FadeIn, RevealLine } from "./motion"

/* ------------------------------------------------------------------ */
/*  ACT II - Expandable Job Cards (Apple-style, independent state)     */
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
    deepDive: "This was my first engineering role, and it mattered that it was in health tech. Coming from nursing, I understood the users -- medical students under immense pressure who needed tools that worked flawlessly. I wasn't just writing React components; I was validating whether features actually helped people learn faster. The A/B testing culture here shaped how I think about product decisions: not opinions, but evidence. We shipped features, measured them, and killed what didn't work. That discipline has stayed with me ever since.",
  },
  {
    company: "Compado",
    role: "Frontend Engineer → Senior",
    period: "2019 - 2021",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["Vue", "SEO", "Performance"],
    summary: "Product comparison sites with dynamic content systems",
    deepDive: "Compado was where I learned that performance is a feature. We built product comparison sites where milliseconds mattered for SEO rankings and conversion. I went deep on Core Web Vitals, lazy loading strategies, and how to architect Vue apps that score well on Lighthouse while still being rich and interactive. The promotion to Senior wasn't about tenure -- it came because I took ownership of the entire frontend performance story and delivered measurable business results: 50% faster load times, 25% more organic traffic.",
  },
  {
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    period: "2021",
    location: "Hamburg",
    color: "#5B9EC2",
    tech: ["Vue", "TypeScript", "Fintech"],
    summary: "Fintech platform serving 10,000+ financial advisors",
    deepDive: "Short tenure, deep impact. CAPinside had a legacy frontend that was holding back the entire product. I was brought in specifically to replace it. The challenge wasn't just technical -- it was convincing a fintech company serving 10,000 financial advisors that a full rewrite was safer than continuing to patch. I mapped every feature, built migration paths, and delivered a Vue + TypeScript application that loaded 35% faster. The lesson: sometimes the most senior thing you can do is have the conviction to say 'this needs to be rebuilt' and then prove it.",
  },
  {
    company: "DKB Code Factory",
    role: "Senior → Engineering Manager",
    period: "2021 - 2022",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["React", "TypeScript", "Playwright", "Micro-frontends"],
    summary: "Rebuilt UI/UX of a banking platform for 5M+ users",
    deepDive: "DKB is Germany's largest direct bank -- 5 million users. The frontend needed a complete overhaul, and I was part of the team rebuilding it in React with TypeScript and micro-frontends. But what set me apart wasn't the code. I introduced testing culture: Jest for units, Playwright for e2e. The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them. Within 12 months, I was promoted to Engineering Manager -- not because I asked, but because I was already doing the work: unblocking people, improving processes, and taking responsibility for outcomes beyond my own PRs.",
  },
]

function JobCard({ job, isExpanded, onToggle }: { job: (typeof JOBS)[0]; isExpanded: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <button
        onClick={onToggle}
        className="relative w-full text-left"
      >
        {/* Main card */}
        <div className={`
          relative overflow-hidden rounded-2xl border bg-[var(--bg-elevated)] p-6 transition-all duration-500
          ${isExpanded ? "border-[rgba(91,158,194,0.2)]" : "border-[var(--stroke)] hover:border-[rgba(255,255,255,0.06)]"}
        `}>
          {/* Subtle hover glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${job.color}05 0%, transparent 70%)` }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <h4 className="text-base font-semibold text-[var(--cream)]">{job.company}</h4>
                  <span className="font-mono text-[10px] text-[var(--text-faint)]">{job.period}</span>
                </div>
                <p className="text-sm text-[var(--cream-muted)]">{job.role}</p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="mt-1 shrink-0"
              >
                <ChevronDown size={16} className="text-[var(--text-faint)] transition-colors group-hover:text-[var(--act-blue)]" />
              </motion.div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">{job.summary}</p>

            {/* Tech tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tech.map((t) => (
                <span key={t} className="rounded-md bg-[rgba(91,158,194,0.06)] px-2 py-0.5 font-mono text-[9px] text-[var(--act-blue)]">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded deep-dive - outside the button for accessibility */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">
              <div className="rounded-xl bg-[rgba(91,158,194,0.03)] p-5">
                <p className="text-sm leading-[1.9] text-[var(--cream-muted)]">
                  {job.deepDive}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    tag: "MENTORSHIP",
    color: "#5EBB73",
    title: "Coaching communication style",
    text: "Our Product Owner was frustrated a developer seemed slow. I pointed out it might be the message, not the person. She was asking 'Would you mind finishing by tomorrow?' I shared my version: 'We're deploying tomorrow. Will your changes be included?' Same intent, different directness. She tried it. His responsiveness changed immediately.",
  },
  {
    tag: "PROCESS",
    color: "#5B9EC2",
    title: "Monthly to weekly releases",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    tag: "TECHNICAL",
    color: "#E05252",
    title: "Catching scope creep in real time",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Protecting team culture across stacks",
    text: "Some engineers were openly dismissive of colleagues working on a platform they considered inferior. I raised it directly with the engineering lead. The risk wasn't hurt feelings. It was creating a two-tier team where one group felt like second-class citizens. We agreed that leaders needed to be conscious of how their opinions about tech choices affected the humans working on those technologies.",
  },
  {
    tag: "HIRING",
    color: "#5EBB73",
    title: "Hiring for fit, not speed",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

function MgmtStoryCard({ story, isOpen, onToggle }: { story: (typeof MGMT_STORIES)[0]; isOpen: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <button
        onClick={onToggle}
        className="relative w-full text-left"
      >
        <div className={`
          relative overflow-hidden rounded-xl border bg-[var(--bg-elevated)] transition-all duration-400
          ${isOpen ? "border-[rgba(255,255,255,0.08)]" : "border-[var(--stroke)] hover:border-[rgba(255,255,255,0.04)]"}
        `}>
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300"
            style={{ backgroundColor: isOpen ? story.color : "transparent" }}
          />

          <div className="p-5 pl-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span
                  className="w-fit rounded-md px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider"
                  style={{ backgroundColor: `${story.color}10`, color: story.color }}
                >
                  {story.tag}
                </span>
                <span className="text-sm font-medium text-[var(--cream)] transition-colors group-hover:text-[var(--gold)]">
                  {story.title}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="mt-0.5 shrink-0"
              >
                <ChevronDown size={14} style={{ color: isOpen ? story.color : "var(--text-faint)" }} />
              </motion.div>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-1">
              <p className="text-sm leading-[1.8] text-[var(--cream-muted)]">
                {story.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared Act Header - Title anchors, date is secondary               */
/* ------------------------------------------------------------------ */

function ActHeader({
  act, title, period, location, color, takeaway, children
}: {
  act: string; title: string; period: string; location: string; color: string; takeaway: string; children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-24 sm:py-32">
      {/* Act-colored atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}05 0%, transparent 60%)` }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Act label - small, subtle */}
        <FadeIn>
          <div className="mb-4 flex items-center gap-3">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color }}>
              {act}
            </span>
          </div>
        </FadeIn>

        {/* Title - the anchor */}
        <RevealLine>
          <h3 className="text-4xl font-bold tracking-[-0.03em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
            {title}
          </h3>
        </RevealLine>

        {/* Period and location - secondary, below title */}
        <FadeUp delay={0.2}>
          <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
            {period} · {location}
          </p>
        </FadeUp>

        {/* Content */}
        <div className="mt-10">{children}</div>

        {/* Thematic takeaway - what this era forged */}
        <FadeUp delay={0.4}>
          <div className="mt-16 border-l-2 pl-5" style={{ borderColor: `${color}30` }}>
            <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]" style={{ fontFamily: "var(--font-serif)" }}>
              {takeaway}
            </p>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT I - The Nurse                                                  */
/* ------------------------------------------------------------------ */

function ActI() {
  return (
    <ActHeader
      act="ACT I"
      title="The Nurse"
      period="2015 - 2018"
      location="NYU Langone, New York"
      color="#E05252"
      takeaway="This is where I learned that systems fail in silence, and that the person who notices first carries the weight. I learned to debug under pressure, long before I ever touched code."
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <FadeUp delay={0.2} className="lg:w-1/2">
          <p className="text-lg leading-[1.7] text-[var(--cream-muted)]">
            Neuro ICU. Surgical ICU. Cardiothoracic ICU. Three to four critical patients per shift. Ventilators, IV drips, medication protocols that had to be exact.
          </p>
          <p className="mt-4 text-sm leading-[1.9] text-[var(--text-dim)]">
            A cough doesn{"'"}t mean a cold. It could be pulmonary effusion, a ventilator issue, a medication reaction. Every shift was differential diagnosis under pressure.
          </p>
        </FadeUp>
        <FadeUp delay={0.3} className="lg:w-1/2">
          <div className="rounded-2xl bg-[var(--bg-elevated)] p-6">
            <p className="mb-4 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#E05252]">
              In numbers
            </p>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--stroke)] pb-3">
                <span className="text-sm text-[var(--cream-muted)]">Patients per shift</span>
                <span className="font-mono text-lg font-semibold text-[#E05252]">3-4</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--stroke)] pb-3">
                <span className="text-sm text-[var(--cream-muted)]">ICU specialties</span>
                <span className="font-mono text-lg font-semibold text-[#E05252]">3</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--cream-muted)]">Certification</span>
                <span className="font-mono text-sm font-semibold text-[#E05252]">CCRN</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT II - The Engineer                                              */
/* ------------------------------------------------------------------ */

function ActII() {
  const [expandedJob, setExpandedJob] = useState<number | null>(null)

  const handleToggle = useCallback((index: number) => {
    setExpandedJob(prev => prev === index ? null : index)
  }, [])

  return (
    <ActHeader
      act="ACT II"
      title="The Engineer"
      period="2018 - 2022"
      location="Berlin & Hamburg"
      color="#5B9EC2"
      takeaway="I learned that syntax is cheap. What matters is whether you can ship something that works, measure whether it helped, and have the judgment to know when to rebuild vs patch."
    >
      <FadeUp delay={0.2}>
        <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-[var(--cream-muted)]">
          Four companies in four years. Each one pushed me deeper technically while keeping me close to users and product. The promotions came because I delivered results, not because I asked.
        </p>
      </FadeUp>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {JOBS.map((job, index) => (
          <JobCard
            key={job.company}
            job={job}
            isExpanded={expandedJob === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT III - The Leader                                               */
/* ------------------------------------------------------------------ */

function ActIII() {
  const [openStory, setOpenStory] = useState<number | null>(null)

  const handleToggle = useCallback((index: number) => {
    setOpenStory(prev => prev === index ? null : index)
  }, [])

  return (
    <ActHeader
      act="ACT III"
      title="The Leader"
      period="2022 - 2024"
      location="DKB Code Factory, Berlin"
      color="#C9A84C"
      takeaway="Leadership isn't a title. It's noticing what's broken before it becomes a crisis, and having the courage to name it. The best managers I've seen protect their team's ability to do deep work. I tried to be that."
    >
      <FadeUp delay={0.2}>
        <p className="mb-6 max-w-2xl text-lg leading-[1.7] text-[var(--cream-muted)]">
          15 direct reports across 3 squads. Weekly 1:1s. Hiring. Performance reviews. The work shifted from writing code to creating the conditions for others to do their best work.
        </p>
        <p className="mb-10 max-w-2xl text-sm leading-[1.8] text-[var(--text-dim)]">
          These are real situations I navigated. Not case studies. Not hypotheticals. Each one taught me something about the gap between managing tasks and leading people.
        </p>
      </FadeUp>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MGMT_STORIES.map((story, index) => (
          <MgmtStoryCard
            key={story.title}
            story={story}
            isOpen={openStory === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function Timeline() {
  return (
    <section id="journey" className="relative">
      {/* Vertical line connecting acts */}
      <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--stroke)] to-transparent" />

      <ActI />
      <ActII />
      <ActIII />
    </section>
  )
}
