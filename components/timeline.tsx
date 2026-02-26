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
    id: "silence",
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Fighting the culture of silence",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    id: "communication",
    tag: "MENTORSHIP",
    color: "#5EBB73",
    title: "Coaching communication style",
    text: "Our Product Owner was frustrated a developer seemed slow. I pointed out it might be the message, not the person. She was asking 'Would you mind finishing by tomorrow?' I shared my version: 'We're deploying tomorrow. Will your changes be included?' Same intent, different directness. She tried it. His responsiveness changed immediately.",
  },
  {
    id: "releases",
    tag: "PROCESS",
    color: "#5B9EC2",
    title: "Monthly to weekly releases",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    id: "scope",
    tag: "TECHNICAL",
    color: "#E05252",
    title: "Catching scope creep in real time",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    id: "culture",
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Protecting team culture across stacks",
    text: "Some engineers were openly dismissive of colleagues working on a platform they considered inferior. I raised it directly with the engineering lead. The risk wasn't hurt feelings. It was creating a two-tier team where one group felt like second-class citizens. We agreed that leaders needed to be conscious of how their opinions about tech choices affected the humans working on those technologies.",
  },
  {
    id: "hiring",
    tag: "HIRING",
    color: "#5EBB73",
    title: "Hiring for fit, not speed",
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
    <div ref={ref} className="relative py-20 sm:py-28">
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
        <div className="mt-12">{children}</div>

        {/* Takeaway */}
        <FadeUp delay={0.4}>
          <div className="mt-16 border-l-2 py-2 pl-6" style={{ borderColor: `${color}30` }}>
            <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]">{takeaway}</p>
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
      period="2012 - 2017"
      location="Houston, TX"
      color="#E05252"
      takeaway="The ICU taught me that under pressure, process matters more than heroics. You can't panic. You assess, prioritize, and execute — or people die. That discipline never left me."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <FadeUp delay={0.2}>
          <p className="text-lg leading-[1.7] text-[var(--cream-muted)]">
            I spent five years as a critical care nurse in Houston{"'"}s Texas Medical Center — the largest medical complex in the world. Neuro ICU, Cardiac ICU, ER trauma.
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
      className="group flex w-full flex-col gap-3 border-b border-[var(--stroke)] py-8 text-left transition-colors hover:border-[var(--gold-dim)] sm:flex-row sm:items-start sm:justify-between"
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
      <span className="shrink-0 font-mono text-xs text-[var(--text-faint)] transition-all group-hover:text-[var(--gold)] group-hover:translate-x-1 sm:mt-2">
        Read more
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
    
    // Delay adding listeners to prevent immediate close
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
      {/* Content card - clicking outside this closes */}
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
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tech.map((t) => (
              <span key={t} className="rounded-full border border-[var(--stroke)] px-3 py-1 font-mono text-[10px] text-[var(--act-blue)]">{t}</span>
            ))}
          </div>
        </div>

        {/* Flowing narrative - no repetitive headings */}
        <div className="space-y-6 text-base leading-[1.9] text-[var(--cream-muted)]">
          <p>{job.deepDive.context}</p>
          <p>{job.deepDive.contribution}</p>
          <p className="text-[var(--cream)]">{job.deepDive.outcome}</p>
        </div>

        {/* Skills as subtle tags at bottom */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--stroke)] pt-6">
          {job.deepDive.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-dim)]">
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
      
      {/* Subtle hint */}
      <p className="mt-4 text-center text-xs text-[var(--text-faint)]">
        Click outside or press Esc to close
      </p>
    </motion.div>
  )
}

function ActII() {
  const [selectedJob, setSelectedJob] = useState<(typeof JOBS)[0] | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-20 sm:py-28">
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
/*  ACT III - The Leader (with horizontal scroll stories)             */
/* ------------------------------------------------------------------ */

function StoryCard({ story, isActive, onClick }: { 
  story: (typeof MGMT_STORIES)[0]
  isActive: boolean
  onClick: () => void 
}) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative shrink-0 text-left"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className={`relative w-[280px] overflow-hidden rounded-2xl border bg-[var(--bg-elevated)] p-6 transition-all duration-300 sm:w-[320px] ${
          isActive ? "border-[var(--gold)] ring-1 ring-[var(--gold)]" : "border-[var(--stroke)] hover:border-[rgba(255,255,255,0.1)]"
        }`}
      >
        {/* Tag */}
        <span
          className="inline-block rounded-full px-2.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider"
          style={{ backgroundColor: `${story.color}12`, color: story.color }}
        >
          {story.tag}
        </span>
        
        {/* Title */}
        <h4 className="mt-4 text-base font-medium leading-snug text-[var(--cream)]">
          {story.title}
        </h4>
        
        {/* Full text - show it all, no hiding */}
        <p className="mt-3 text-sm leading-[1.7] text-[var(--text-dim)]">
          {story.text}
        </p>
      </div>
    </motion.button>
  )
}

function ActIII() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])

  return (
    <div ref={ref} className="relative py-20 sm:py-28">
      {/* Glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)" }}
        />
      </motion.div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-6">
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
              2022 - 2024 · Berlin
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--cream-muted)]">
              Engineering management at DKB Code Factory. Leading teams, shipping products, and learning that the hardest problems aren{"'"}t technical — they{"'"}re human.
            </p>
          </FadeUp>
        </div>

        {/* Horizontal scroll carousel - stories show full text, no expansion needed */}
        <FadeUp delay={0.4}>
          <div className="mt-12">
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto px-6 pb-4 sm:gap-6 lg:px-[calc((100vw-64rem)/2+1.5rem)]"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {MGMT_STORIES.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  isActive={false}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Takeaway */}
        <div className="mx-auto max-w-5xl px-6">
          <FadeUp delay={0.5}>
            <div className="mt-12 border-l-2 border-[rgba(201,168,76,0.3)] py-2 pl-6">
              <p className="text-sm italic leading-relaxed text-[var(--cream-muted)]">
                Management isn{"'"}t about being in charge. It{"'"}s about creating the conditions where other people can do their best work.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT IV - The Builder                                               */
/* ------------------------------------------------------------------ */

function ActIV() {
  return (
    <ActHeader
      act="ACT IV"
      title="The Builder"
      period="2024 - Present"
      location="Self-Employed, Berlin"
      color="#5EBB73"
      takeaway="This is where everything converges. ICU pattern recognition, engineering discipline, leadership under pressure. The market doesn't care what you've done before. It only cares if you can read it correctly, right now."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <FadeUp delay={0.2}>
          <p className="text-lg leading-[1.7] text-[var(--cream-muted)]">
            An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, written from scratch with AI-assisted development as a daily workflow.
          </p>
          <p className="mt-4 text-sm leading-[1.9] text-[var(--text-dim)]">
            No libraries, no wrappers. The market gives feedback instantly, and it doesn{"'"}t care about your feelings. Managing funded accounts with real money on the line.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="rounded-2xl bg-[var(--bg-elevated)] p-6">
            <p className="mb-4 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#5EBB73]">
              What this requires
            </p>
            <ul className="space-y-3 text-sm text-[var(--cream-muted)]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#5EBB73]" />
                Pattern recognition under uncertainty
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#5EBB73]" />
                Disciplined execution without emotion
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#5EBB73]" />
                Systems thinking at scale
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#5EBB73]" />
                Rapid iteration and evidence-based decisions
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#5EBB73]" />
                Full ownership of outcomes
              </li>
            </ul>
          </div>
        </FadeUp>
      </div>
    </ActHeader>
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
