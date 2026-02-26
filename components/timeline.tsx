"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import { TradingArsenal } from "./trading-system"

/* ------------------------------------------------------------------ */
/*  ACT II - Job Data                                                  */
/* ------------------------------------------------------------------ */

const JOBS = [
  {
    id: "amboss",
    company: "AMBOSS",
    role: "Frontend Engineer",
    period: "2018 - 2019",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["React", "A/B Testing", "User Research"],
    summary: "Medical exam platform used by 500K+ students globally",
    url: "https://amboss.com",
    deepDive: {
      context: "This was my first engineering role, and it mattered that it was in health tech. Coming from nursing, I understood the users — medical students under immense pressure who needed tools that worked flawlessly.",
      contribution: "I wasn't just writing React components; I was validating whether features actually helped people learn faster. The A/B testing culture here shaped how I think about product decisions: not opinions, but evidence.",
      outcome: "We shipped features, measured them, and killed what didn't work. That discipline has stayed with me ever since.",
      skills: ["Rapid prototyping", "Evidence-based decisions", "User empathy from domain knowledge"],
    },
  },
  {
    id: "compado",
    company: "Compado",
    role: "Frontend Engineer → Senior",
    period: "2019 - 2021",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["Vue", "SEO", "Performance"],
    summary: "Product comparison sites with dynamic content systems",
    url: "https://compado.com",
    deepDive: {
      context: "Compado was where I learned that performance is a feature. We built product comparison sites where milliseconds mattered for SEO rankings and conversion.",
      contribution: "I went deep on Core Web Vitals, lazy loading strategies, and how to architect Vue apps that score well on Lighthouse while still being rich and interactive.",
      outcome: "The promotion to Senior wasn't about tenure — it came because I took ownership of the entire frontend performance story and delivered measurable business results: 50% faster load times, 25% more organic traffic.",
      skills: ["Performance optimization", "SEO engineering", "Ownership mentality"],
    },
  },
  {
    id: "capinside",
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    period: "2021",
    location: "Hamburg",
    color: "#5B9EC2",
    tech: ["Vue", "TypeScript", "Fintech"],
    summary: "Fintech platform serving 10,000+ financial advisors",
    url: "https://capinside.com",
    deepDive: {
      context: "Short tenure, deep impact. CAPinside had a legacy frontend that was holding back the entire product. I was brought in specifically to replace it.",
      contribution: "The challenge wasn't just technical — it was convincing a fintech company serving 10,000 financial advisors that a full rewrite was safer than continuing to patch. I mapped every feature, built migration paths, and delivered a Vue + TypeScript application that loaded 35% faster.",
      outcome: "The lesson: sometimes the most senior thing you can do is have the conviction to say 'this needs to be rebuilt' and then prove it.",
      skills: ["Technical conviction", "Migration planning", "Stakeholder alignment"],
    },
  },
  {
    id: "dkb",
    company: "DKB Code Factory",
    role: "Senior → Engineering Manager",
    period: "2021 - 2022",
    location: "Berlin",
    color: "#5B9EC2",
    tech: ["React", "TypeScript", "Playwright", "Micro-frontends"],
    summary: "Rebuilt UI/UX of a banking platform for 5M+ users",
    url: "https://dkb.de",
    deepDive: {
      context: "DKB is Germany's largest direct bank — 5 million users. The frontend needed a complete overhaul, and I was part of the team rebuilding it in React with TypeScript and micro-frontends.",
      contribution: "What set me apart wasn't the code. I introduced testing culture: Jest for units, Playwright for e2e. The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them.",
      outcome: "Within 12 months, I was promoted to Engineering Manager — not because I asked, but because I was already doing the work: unblocking people, improving processes, and taking responsibility for outcomes beyond my own PRs.",
      skills: ["Testing infrastructure", "Process improvement", "Leadership through action"],
    },
  },
]

/* ------------------------------------------------------------------ */
/*  ACT III - Management Stories                                       */
/* ------------------------------------------------------------------ */

const MGMT_STORIES = [
  {
    id: "releases",
    tags: ["LEADERSHIP", "PROCESS"],
    color: "#C9A84C",
    title: "Monthly to weekly — rebuilding delivery at DKB",
    teaser: "Releases kept breaking. I coordinated readiness across multiple developers, found that support teams weren't testing until deploy day, and made pre-deploy verification standard.",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    id: "playwright",
    tags: ["ENGINEERING", "TESTING"],
    color: "#5B9EC2",
    title: "Introducing Playwright at scale in a banking app",
    teaser: "DKB had no E2E infrastructure. I introduced Playwright, built the testing patterns, and coached the team to own it as a standard — not a nice-to-have.",
    text: "The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them. Introduced Playwright for e2e testing and Jest for unit tests. Made testing culture standard, not optional.",
  },
  {
    id: "trading",
    tags: ["TRADING", "ENGINEERING"],
    color: "#5EBB73",
    title: "Building a production trading system alone",
    teaser: "14 indicators. 13,500 lines. No libraries, no wrappers. Real money on the line from day one. The market is the harshest QA process there is.",
    text: "An algorithmic futures trading system built from scratch. 14 custom indicators, 13,500 lines of Pine Script v6 with AI-assisted development as a daily workflow. No libraries, no wrappers. The market gives feedback instantly, and it doesn't care about your feelings.",
  },
  {
    id: "silence",
    tags: ["CULTURE", "LEADERSHIP"],
    color: "#C9A84C",
    title: "Fighting the culture of silence",
    teaser: "Developers were staying passive during refinements. I changed from 'any questions?' to 'what's the first edge case you'd test here?' — forcing engagement.",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    id: "scope",
    tags: ["TECHNICAL", "PROCESS"],
    color: "#E05252",
    title: "Catching scope creep in real time",
    teaser: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files.",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    id: "hiring",
    tags: ["HIRING", "LEADERSHIP"],
    color: "#5EBB73",
    title: "Hiring for fit, not speed",
    teaser: "HR wanted to close whichever candidate finished first. I pushed back: run both in parallel, give the team a real comparison.",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

/* ------------------------------------------------------------------ */
/*  Shared Act Header                                                  */
/* ------------------------------------------------------------------ */

function ActHeader({
  act, title, period, location, color, takeaway, children
}: {
  act: string
  title: string
  period: string
  location: string
  color: string
  takeaway: string
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-24 sm:py-32">
      {/* Act-colored atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}04 0%, transparent 60%)` }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Act label */}
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

        {/* Title */}
        <RevealLine>
          <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
            {title}
          </h3>
        </RevealLine>

        {/* Period and location */}
        <FadeUp delay={0.2}>
          <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
            {period} · {location}
          </p>
        </FadeUp>

        {/* Content */}
        <div className="mt-16">{children}</div>

        {/* Takeaway */}
        <FadeUp delay={0.4}>
          <div className="mt-20 border-l-2 py-2 pl-6" style={{ borderColor: `${color}30` }}>
            <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]">{takeaway}</p>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT I - The Nurse (simple, clean version)                          */
/* ------------------------------------------------------------------ */

function ActI() {
  return (
    <ActHeader
      act="ACT I"
      title="The Nurse"
      period="2012 - 2017"
      location="Houston, TX"
      color="#E05252"
      takeaway="The ICU taught me that under pressure, process matters more than heroics. You assess, prioritize, and execute — or people die. That discipline never left me."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <FadeUp delay={0.2}>
          <p className="text-lg leading-[1.7] text-[var(--cream-muted)]">
            Five years as a critical care nurse in Houston{"'"}s Texas Medical Center — the largest medical complex in the world. Neuro ICU, Cardiac ICU, ER trauma.
          </p>
          <p className="mt-4 text-sm leading-[1.9] text-[var(--text-dim)]">
            This wasn{"'"}t a stepping stone. It was where I learned to read complex systems under pressure, communicate with precision, and make decisions when the cost of being wrong was someone{"'"}s life.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5">
              <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#E05252]">Pattern Recognition</p>
              <p className="text-sm text-[var(--cream-muted)]">Reading 12-lead EKGs, catching early signs of deterioration, understanding that vital signs tell a story before the patient can.</p>
            </div>
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5">
              <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#E05252]">Systems Thinking</p>
              <p className="text-sm text-[var(--cream-muted)]">The human body is the original complex system. Every intervention has downstream effects. You learn to think in feedback loops.</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </ActHeader>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT II - The Engineer (with Maya Chen-style detail view)          */
/* ------------------------------------------------------------------ */

function JobRow({ job, onSelect }: { job: (typeof JOBS)[0]; onSelect: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={onSelect}
      className="group flex w-full cursor-pointer flex-col gap-3 border-b border-[var(--stroke)] py-8 text-left transition-colors hover:border-[var(--gold-dim)] sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex-1">
        <div className="flex items-baseline gap-4">
          <h4 className="font-serif text-2xl text-[var(--cream)] transition-colors group-hover:text-[var(--gold)] sm:text-3xl">
            {job.company}
          </h4>
          <span className="hidden font-mono text-xs text-[var(--text-faint)] sm:inline">
            {job.period}
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--cream-muted)]">
          {job.role}
        </p>
        <p className="mt-1 text-sm text-[var(--text-dim)]">
          {job.summary}
        </p>
      </div>
      <span className="shrink-0 text-[var(--text-faint)] transition-all group-hover:text-[var(--gold)] group-hover:translate-x-1 sm:mt-2">
        →
      </span>
    </motion.button>
  )
}

function JobDetailView({ job, onBack }: { job: (typeof JOBS)[0]; onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Close on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onBack()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack()
    }
    
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onBack])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Content card */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-8 sm:p-12"
      >
        {/* Header */}
        <div className="mb-8 border-b border-[var(--stroke)] pb-8">
          <p className="mb-2 font-mono text-xs text-[var(--text-faint)]">
            {job.period} · {job.location}
          </p>
          <h2 className="font-serif text-3xl text-[var(--cream)] sm:text-4xl">
            {job.company}
          </h2>
          <p className="mt-2 text-lg text-[var(--cream-muted)]">{job.role}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {job.tech.map((t) => (
              <span key={t} className="rounded-full border border-[var(--stroke)] px-3 py-1 font-mono text-[10px] text-[var(--act-blue)]">{t}</span>
            ))}
          </div>
        </div>

        {/* Flowing narrative */}
        <div className="space-y-6 text-base leading-[1.9] text-[var(--cream-muted)]">
          <p>{job.deepDive.context}</p>
          <p>{job.deepDive.contribution}</p>
          <p className="text-[var(--cream)]">{job.deepDive.outcome}</p>
        </div>

        {/* Company link only - no redundant skill tags */}
        <div className="mt-8 border-t border-[var(--stroke)] pt-6">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
          >
            {job.url.replace("https://", "")}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l6-6M4 3h5v5" />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Floating X below modal - bare gold, no circle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        className="mx-auto mt-6 block cursor-pointer text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l12 12M16 4L4 16" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

function ActII() {
  const [selectedJob, setSelectedJob] = useState<(typeof JOBS)[0] | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-24 sm:py-32">
      {/* Glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,158,194,0.04) 0%, transparent 60%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <AnimatePresence mode="wait">
          {selectedJob ? (
            <JobDetailView key="detail" job={selectedJob} onBack={() => setSelectedJob(null)} />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <FadeIn>
                <div className="mb-4 flex items-center gap-3">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#5B9EC2]"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#5B9EC2]">
                    ACT II
                  </span>
                </div>
              </FadeIn>
              <RevealLine>
                <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
                  The Engineer
                </h3>
              </RevealLine>
              <FadeUp delay={0.2}>
                <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
                  2018 - 2022 · Berlin, Germany
                </p>
              </FadeUp>

              {/* Job list - Maya Chen style */}
              <div className="mt-16">
                {JOBS.map((job) => (
                  <JobRow key={job.id} job={job} onSelect={() => setSelectedJob(job)} />
                ))}
              </div>

              {/* Takeaway */}
              <FadeUp delay={0.4}>
                <div className="mt-16 border-l-2 border-[rgba(91,158,194,0.3)] py-2 pl-6">
                  <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]">
                    Four companies in four years wasn{"'"}t job-hopping. It was following the signal: find the hardest problem, solve it, and when you{"'"}ve learned what you came to learn, move to where you can learn more.
                  </p>
                </div>
              </FadeUp>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT III - The Leader (skills overview + clickable case studies)    */
/* ------------------------------------------------------------------ */



function CaseStudyCard({ 
  story, 
  onSelect 
}: { 
  story: (typeof MGMT_STORIES)[0]
  onSelect: () => void 
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={onSelect}
      className="group w-full cursor-pointer border-b border-[#16161E] py-6 text-left transition-colors hover:border-[var(--gold-dim)]"
    >
      {/* Category tags at top */}
      <div className="mb-2 flex items-center gap-2">
        {story.tags.map((tag, i) => (
          <span key={tag}>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#5A5A50]">{tag}</span>
            {i < story.tags.length - 1 && <span className="mx-2 text-[#3A3830]">·</span>}
          </span>
        ))}
      </div>
      
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-base font-medium text-[var(--cream)] transition-colors group-hover:text-[var(--gold)]">
          {story.title}
        </h4>
        <span className="mt-1 shrink-0 text-[var(--text-faint)] transition-all group-hover:text-[var(--gold)] group-hover:translate-x-1">
          →
        </span>
      </div>
      
      {/* Teaser excerpt - smaller */}
      <p className="mt-2 text-xs leading-relaxed text-[#6A6458]">
        {story.teaser}
      </p>
    </motion.button>
  )
}

function CaseStudyDetail({ story, onBack }: { story: (typeof MGMT_STORIES)[0]; onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onBack()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack()
    }
    
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onBack])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-8 sm:p-12"
      >
        {/* Category tags */}
        <div className="flex items-center gap-2">
          {story.tags.map((tag, i) => (
            <span key={tag}>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#5A5A50]">{tag}</span>
              {i < story.tags.length - 1 && <span className="mx-2 text-[#3A3830]">·</span>}
            </span>
          ))}
        </div>
        <h2 className="mt-4 font-serif text-2xl text-[var(--cream)] sm:text-3xl">
          {story.title}
        </h2>
        <p className="mt-6 text-base leading-[1.9] text-[var(--cream-muted)]">
          {story.text}
        </p>
      </motion.div>

      {/* Floating X below modal - bare gold, no circle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        className="mx-auto mt-6 block cursor-pointer text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l12 12M16 4L4 16" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

/* Stats for Leader section */
const LEADER_STATS = [
  { value: "8", label: "Engineers managed" },
  { value: "6→10", label: "Team growth" },
  { value: "-30%", label: "Bug reduction" },
  { value: "Weekly", label: "Release cadence" },
]

function ActIII() {
  const [selectedStory, setSelectedStory] = useState<(typeof MGMT_STORIES)[0] | null>(null)
  const [showCaseStudies, setShowCaseStudies] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-24 sm:py-32">
      {/* Glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <AnimatePresence mode="wait">
          {selectedStory ? (
            <CaseStudyDetail key="detail" story={selectedStory} onBack={() => setSelectedStory(null)} />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <FadeIn>
                <div className="mb-4 flex items-center gap-3">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#C9A84C]"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#C9A84C]">
                    ACT III
                  </span>
                </div>
              </FadeIn>
              <RevealLine>
                <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
                  The Leader
                </h3>
              </RevealLine>
              <FadeUp delay={0.2}>
                <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
                  2022 - 2024 · DKB Code Factory, Berlin
                </p>
              </FadeUp>

              {/* Two-column layout: Prose left, Stats right */}
              <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
                {/* Left - prose */}
                <div className="lg:col-span-2">
                  <FadeUp delay={0.3}>
                    <p className="text-lg leading-[1.8] text-[var(--cream-muted)]">
                      Eight engineers on one of Germany{"'"}s largest banking apps. Grew the core team from 6 to 10. Drove migration to React/TypeScript and micro-frontends.
                    </p>
                    <p className="mt-6 text-sm leading-[1.9] text-[var(--text-dim)]">
                      Monthly releases became weekly. Bugs dropped 30%. Ran weekly 1:1s. Coached engineers into senior roles. Navigated a regulated banking environment while staying hands-on with code — because I believe the best engineering managers still understand what they{"'"}re managing.
                    </p>
                  </FadeUp>

                  {/* Quote */}
                  <FadeUp delay={0.35}>
                    <div className="mt-12 border-l-2 border-[var(--gold)]/30 py-2 pl-6">
                      <p className="font-serif text-base italic leading-relaxed text-[var(--cream-muted)]">
                        Management isn{"'"}t about being in charge. It{"'"}s about creating the conditions where other people can do their best work.
                      </p>
                    </div>
                  </FadeUp>
                </div>

                {/* Right - stats */}
                <FadeUp delay={0.25}>
                  <div className="space-y-8">
                    {LEADER_STATS.map((stat) => (
                      <div key={stat.label}>
                        <p className="font-serif text-3xl text-[var(--gold)]">{stat.value}</p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>

              {/* VIEW CASE STUDIES link - more spacing */}
              <FadeUp delay={0.4}>
                <button
                  onClick={() => setShowCaseStudies(!showCaseStudies)}
                  className="mt-16 cursor-pointer font-mono text-xs uppercase tracking-wider text-[var(--gold)] transition-colors hover:text-[var(--cream)]"
                >
                  → {showCaseStudies ? "Hide case studies" : "View case studies"}
                </button>

                <AnimatePresence>
                  {showCaseStudies && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Indented container to show visual nesting */}
                      <div className="mt-10 border-l border-[var(--stroke)] pl-6 sm:pl-8">
                        {MGMT_STORIES.map((story) => (
                          <CaseStudyCard
                            key={story.id}
                            story={story}
                            onSelect={() => setSelectedStory(story)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FadeUp>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT IV - The Builder                                               */
/* ------------------------------------------------------------------ */

function ActIV() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-24 sm:py-32">
      {/* Glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(94,187,115,0.04) 0%, transparent 60%)" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Header */}
        <FadeIn>
          <div className="mb-4 flex items-center gap-3">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#5EBB73]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#5EBB73]">
              ACT IV
            </span>
          </div>
        </FadeIn>
        <RevealLine>
          <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
            The Builder
          </h3>
        </RevealLine>
        <FadeUp delay={0.2}>
          <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
            2024 - Present · Self-Employed, Berlin
          </p>
        </FadeUp>

        {/* Two-column layout: Prose left, Stats right */}
        <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Left - prose */}
          <div className="lg:col-span-2">
            <FadeUp delay={0.3}>
              <p className="text-lg leading-[1.8] text-[var(--cream-muted)]">
                An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, written from scratch with AI-assisted development as a daily workflow.
              </p>
              <p className="mt-6 text-sm leading-[1.9] text-[var(--text-dim)]">
                No libraries, no wrappers. The market gives feedback instantly, and it doesn{"'"}t care about your feelings. Managing funded accounts with real money on the line.
              </p>
            </FadeUp>

            {/* Takeaway */}
            <FadeUp delay={0.4}>
              <div className="mt-12 border-l-2 border-[rgba(94,187,115,0.3)] py-2 pl-6">
                <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]">
                  This is where everything converges. ICU pattern recognition, engineering discipline, leadership under pressure. The market doesn{"'"}t care what you{"'"}ve done before. It only cares if you can read it correctly, right now.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Right - stats */}
          <FadeUp delay={0.25}>
            <div className="space-y-8">
              <div>
                <p className="font-serif text-3xl text-[#5EBB73]">14</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">Custom indicators</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-[#5EBB73]">13.5K</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">Lines of Pine Script</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-[#5EBB73]">Live</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">Funded accounts</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export: Journey Timeline                                           */
/* ------------------------------------------------------------------ */

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActI />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIV />
      {/* Arsenal integrated as part of Act IV story */}
      <TradingArsenal />
    </section>
  )
}
