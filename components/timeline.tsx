"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { X } from "lucide-react"
import { FadeUp, FadeIn, RevealLine } from "./motion"
import { createPortal } from "react-dom"
import { TradingArsenal } from "./trading-system"

/* ------------------------------------------------------------------ */
/*  Modal Component - renders via portal, no layout shifts             */
/* ------------------------------------------------------------------ */

function Modal({ 
  isOpen, 
  onClose, 
  children, 
  color 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  color: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-[#07070A]/80"
            style={{ backdropFilter: "blur(12px)" }}
          />
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 z-[201] overflow-y-auto sm:inset-8 md:inset-16 lg:inset-24"
          >
            <div 
              className="relative min-h-full rounded-2xl border bg-[#0B0B0F] p-6 sm:p-8"
              style={{ borderColor: `${color}20` }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--stroke)] text-[var(--text-dim)] transition-all hover:border-[rgba(255,255,255,0.1)] hover:text-[var(--cream)]"
              >
                <X size={18} />
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ------------------------------------------------------------------ */
/*  ACT II - Job Data                                                  */
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
    deepDive: {
      context: "This was my first engineering role, and it mattered that it was in health tech. Coming from nursing, I understood the users — medical students under immense pressure who needed tools that worked flawlessly.",
      contribution: "I wasn't just writing React components; I was validating whether features actually helped people learn faster. The A/B testing culture here shaped how I think about product decisions: not opinions, but evidence.",
      outcome: "We shipped features, measured them, and killed what didn't work. That discipline has stayed with me ever since.",
      skills: ["Rapid prototyping", "Evidence-based decisions", "User empathy from domain knowledge"],
    },
  },
  {
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
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Fighting the culture of silence",
    summary: "Changed how the team surfaces uncertainty",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    tag: "MENTORSHIP",
    color: "#5EBB73",
    title: "Coaching communication style",
    summary: "Fixed a perceived performance issue through communication",
    text: "Our Product Owner was frustrated a developer seemed slow. I pointed out it might be the message, not the person. She was asking 'Would you mind finishing by tomorrow?' I shared my version: 'We're deploying tomorrow. Will your changes be included?' Same intent, different directness. She tried it. His responsiveness changed immediately.",
  },
  {
    tag: "PROCESS",
    color: "#5B9EC2",
    title: "Monthly to weekly releases",
    summary: "30% fewer bugs through systematic change",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    tag: "TECHNICAL",
    color: "#E05252",
    title: "Catching scope creep in real time",
    summary: "Prevented a feature ticket from becoming a hidden refactor",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    tag: "CULTURE",
    color: "#C9A84C",
    title: "Protecting team culture across stacks",
    summary: "Addressed dismissiveness that was creating a two-tier team",
    text: "Some engineers were openly dismissive of colleagues working on a platform they considered inferior. I raised it directly with the engineering lead. The risk wasn't hurt feelings. It was creating a two-tier team where one group felt like second-class citizens. We agreed that leaders needed to be conscious of how their opinions about tech choices affected the humans working on those technologies.",
  },
  {
    tag: "HIRING",
    color: "#5EBB73",
    title: "Hiring for fit, not speed",
    summary: "Pushed back on HR to get the right candidate",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

/* ------------------------------------------------------------------ */
/*  Job Card - opens modal on click                                    */
/* ------------------------------------------------------------------ */

function JobCard({ job, onClick }: { job: (typeof JOBS)[0]; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative w-full text-left"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-6 transition-all duration-500 hover:border-[rgba(91,158,194,0.15)]">
        {/* Hover glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${job.color}08 0%, transparent 70%)` }}
        />

        <div className="relative z-10">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-base font-semibold text-[var(--cream)]">{job.company}</h4>
            <span className="font-mono text-[10px] text-[var(--text-faint)]">{job.period}</span>
          </div>
          <p className="text-sm text-[var(--cream-muted)]">{job.role}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">{job.summary}</p>

          {/* Tech tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.tech.map((t) => (
              <span key={t} className="rounded-md bg-[rgba(91,158,194,0.06)] px-2 py-0.5 font-mono text-[9px] text-[var(--act-blue)]">{t}</span>
            ))}
          </div>

          {/* Subtle CTA */}
          <p className="mt-4 text-[11px] text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
            Click to read the full story
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Job Modal Content                                                  */
/* ------------------------------------------------------------------ */

function JobModalContent({ job }: { job: (typeof JOBS)[0] }) {
  return (
    <div className="pr-8">
      {/* Header */}
      <div className="mb-8 border-b border-[var(--stroke)] pb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-[10px] text-[var(--text-faint)]">{job.period}</span>
          <span className="text-[var(--text-faint)]">·</span>
          <span className="font-mono text-[10px] text-[var(--text-faint)]">{job.location}</span>
        </div>
        <h2 className="text-3xl font-bold text-[var(--cream)] sm:text-4xl">{job.company}</h2>
        <p className="mt-2 text-lg text-[var(--cream-muted)]">{job.role}</p>
      </div>

      {/* Deep dive sections */}
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--act-blue)]">Context</h3>
          <p className="text-base leading-[1.8] text-[var(--cream-muted)]">{job.deepDive.context}</p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--act-blue)]">What I Did</h3>
          <p className="text-base leading-[1.8] text-[var(--cream-muted)]">{job.deepDive.contribution}</p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--act-blue)]">Outcome</h3>
          <p className="text-base leading-[1.8] text-[var(--cream-muted)]">{job.deepDive.outcome}</p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--act-blue)]">Skills Demonstrated</h3>
          <div className="flex flex-wrap gap-2">
            {job.deepDive.skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--cream-muted)]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Management Story Card - opens modal on click                       */
/* ------------------------------------------------------------------ */

function MgmtStoryCard({ story, onClick }: { story: (typeof MGMT_STORIES)[0]; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative w-full text-left"
    >
      <div className="relative overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] transition-all duration-400 hover:border-[rgba(255,255,255,0.06)]">
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-1"
          style={{ backgroundColor: story.color }}
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
          </div>
          <p className="mt-2 text-xs text-[var(--text-dim)]">{story.summary}</p>
        </div>
      </div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Management Story Modal Content                                     */
/* ------------------------------------------------------------------ */

function MgmtStoryModalContent({ story }: { story: (typeof MGMT_STORIES)[0] }) {
  return (
    <div className="pr-8">
      <div className="mb-6">
        <span
          className="mb-4 inline-block rounded-md px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider"
          style={{ backgroundColor: `${story.color}15`, color: story.color }}
        >
          {story.tag}
        </span>
        <h2 className="text-2xl font-bold text-[var(--cream)] sm:text-3xl">{story.title}</h2>
      </div>
      <p className="text-base leading-[1.9] text-[var(--cream-muted)]">{story.text}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared Act Header                                                  */
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
          <h3 className="text-4xl font-bold tracking-[-0.03em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
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
        <div className="mt-10">{children}</div>

        {/* Takeaway */}
        <FadeUp delay={0.4}>
          <div className="mt-14 border-l-2 pl-5" style={{ borderColor: `${color}30` }}>
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
            A cough doesn{"'"}t mean a cold. It could be pulmonary effusion, a ventilator issue, a medication reaction. Every shift was differential diagnosis under pressure — rapid pattern recognition with incomplete information.
          </p>
        </FadeUp>
        <FadeUp delay={0.3} className="lg:w-1/2">
          <div className="rounded-2xl bg-[var(--bg-elevated)] p-6">
            <p className="mb-4 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#E05252]">
              What this built
            </p>
            <ul className="space-y-3 text-sm text-[var(--cream-muted)]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E05252]" />
                Thinking quickly under pressure
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E05252]" />
                Diagnosing with incomplete information
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E05252]" />
                Cross-disciplinary communication
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E05252]" />
                Systems management under constraints
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E05252]" />
                Patient advocacy — educating for important issues
              </li>
            </ul>
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
  const [selectedJob, setSelectedJob] = useState<(typeof JOBS)[0] | null>(null)

  return (
    <>
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
            Four companies in four years. Each one pushed me deeper technically while keeping me close to users and product.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {JOBS.map((job) => (
            <JobCard key={job.company} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      </ActHeader>

      {/* Job modal - renders via portal, no layout shift */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} color="#5B9EC2">
        {selectedJob && <JobModalContent job={selectedJob} />}
      </Modal>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT III - The Leader                                               */
/* ------------------------------------------------------------------ */

function ActIII() {
  const [selectedStory, setSelectedStory] = useState<(typeof MGMT_STORIES)[0] | null>(null)

  return (
    <>
      <ActHeader
        act="ACT III"
        title="The Leader"
        period="2021 - 2022"
        location="DKB Code Factory, Berlin"
        color="#C9A84C"
        takeaway="Leadership is the work you do when no one is watching. It's in how you handle uncertainty, how you protect your team's focus, and how you make it safe to surface problems early."
      >
        <FadeUp delay={0.2}>
          <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-[var(--cream-muted)]">
            Promoted to Engineering Manager not because I asked — because I was already doing the work. These are the moments that defined what kind of leader I became.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MGMT_STORIES.map((story) => (
            <MgmtStoryCard key={story.title} story={story} onClick={() => setSelectedStory(story)} />
          ))}
        </div>
      </ActHeader>

      {/* Story modal - renders via portal, no layout shift */}
      <Modal isOpen={!!selectedStory} onClose={() => setSelectedStory(null)} color={selectedStory?.color || "#C9A84C"}>
        {selectedStory && <MgmtStoryModalContent story={selectedStory} />}
      </Modal>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  ACT IV - The Builder (Trading)                                     */
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
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <FadeUp delay={0.2} className="lg:w-1/2">
          <p className="text-lg leading-[1.7] text-[var(--cream-muted)]">
            An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, written from scratch with AI-assisted development as a daily workflow.
          </p>
          <p className="mt-4 text-sm leading-[1.9] text-[var(--text-dim)]">
            No libraries, no wrappers. The market gives feedback instantly, and it doesn{"'"}t care about your feelings. Managing funded accounts with real money on the line.
          </p>
        </FadeUp>
        <FadeUp delay={0.3} className="lg:w-1/2">
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
      {/* Arsenal integrated into journey as part of Act IV */}
      <TradingArsenal />
    </section>
  )
}
