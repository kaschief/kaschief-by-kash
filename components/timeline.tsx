"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Plus } from "lucide-react"
import { FadeUp, FadeIn, RevealLine, ScaleOnScroll } from "./motion"

/* ------------------------------------------------------------------ */
/*  Management Stories (Act III)                                       */
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

function MgmtStoryCard({
  story,
  index,
}: {
  story: (typeof MGMT_STORIES)[0]
  index: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative cursor-pointer border-l-2 py-5 pl-6 transition-all duration-300"
      style={{
        borderColor: open ? story.color : "#16161E",
      }}
      onClick={() => setOpen(!open)}
    >
      {/* Glow on hover */}
      <div
        className="pointer-events-none absolute -left-px top-0 bottom-0 w-[2px] opacity-0 blur-[3px] transition-opacity duration-300 group-hover:opacity-60"
        style={{ backgroundColor: story.color }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="rounded px-2 py-0.5 font-mono text-[10px] font-medium"
            style={{ backgroundColor: `${story.color}15`, color: story.color }}
          >
            {story.tag}
          </span>
          <span className="text-sm font-medium text-[#F0E6D0] transition-colors group-hover:text-[#C9A84C]">
            {story.title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-0.5 shrink-0"
        >
          <Plus size={14} style={{ color: open ? story.color : "#4A4640" }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.8 }}>
              {story.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cinematic Act Scene                                                */
/* ------------------------------------------------------------------ */

interface ActData {
  act: string
  title: string
  period: string
  location: string
  color: string
  summary: string
  detail: string
  mgmtParagraph?: string
  showMgmtStories?: boolean
}

const ACTS: ActData[] = [
  {
    act: "ACT I",
    title: "THE ICU",
    period: "2015 \u2014 2018",
    location: "NYU Langone, New York",
    color: "#E05252",
    summary: "Before I wrote a single line of code, I learned to debug systems where hesitation costs lives.",
    detail: "Neuro ICU. Three to four critical patients per shift. Ventilators, IV drips, medication protocols that had to be exact. A cough doesn't mean a cold. It could be pulmonary effusion, a ventilator issue, a medication reaction. Every shift was differential diagnosis under pressure. CCRN certified, because I chose to be held to the highest standard. This is where I learned systems thinking, crisis communication, and the cost of getting it wrong.",
  },
  {
    act: "ACT II",
    title: "THE CODE",
    period: "2018 \u2014 2022",
    location: "Berlin & Hamburg",
    color: "#5B9EC2",
    summary: "Four companies. Each pushed me deeper technically while keeping me close to users and product.",
    detail: "AMBOSS: React app, 500K+ medical students, A/B tests that lifted engagement 20%. Compado: Vue, 50% page speed improvement, 25% organic traffic growth. Promoted to Senior. CAPinside: Vue/TypeScript fintech, 10K+ advisors, 35% faster loads. DKB: Rebuilt the frontend of a banking app used by 5 million people. Introduced Jest and Playwright. Promoted to Senior in 12 months, then to Engineering Manager.",
  },
  {
    act: "ACT III",
    title: "THE TEAM",
    period: "2022 \u2014 2024",
    location: "DKB Code Factory, Berlin",
    color: "#C9A84C",
    summary: "Leading people turned out to be the hardest kind of debugging. And the most rewarding.",
    mgmtParagraph: "Eight engineers on one of Germany's largest banking apps. Grew the core team from 6 to 10. Drove migration to React/TypeScript and micro-frontends. Monthly releases became weekly. Bugs dropped 30%. Ran weekly 1:1s. Coached engineers into senior roles. Navigated a regulated banking environment while staying hands-on with code.",
    detail: "",
    showMgmtStories: true,
  },
]

function ActScene({ act, index }: { act: ActData; index: number }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  })
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0])
  const contentY = useTransform(scrollYProgress, [0.1, 0.4], [60, 0])

  const [expanded, setExpanded] = useState(false)

  return (
    <div ref={sceneRef} className="relative min-h-screen py-24 sm:py-32">
      {/* Act-colored atmospheric glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: glowOpacity }}
      >
        <div
          className="atmospheric-glow"
          style={{
            width: 900, height: 900,
            top: "40%",
            left: index % 2 === 0 ? "20%" : "70%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${act.color}08 0%, transparent 70%)`,
          }}
        />
        {/* Horizontal accent line */}
        <div
          className="absolute top-[45%] h-px"
          style={{
            left: index % 2 === 0 ? "0" : "50%",
            right: index % 2 === 0 ? "50%" : "0",
            background: `linear-gradient(${index % 2 === 0 ? "to right" : "to left"}, transparent, ${act.color}15, transparent)`,
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-5xl px-6"
      >
        <div className={`flex flex-col gap-12 lg:flex-row ${index % 2 === 1 ? "lg:flex-row-reverse" : ""} lg:items-start lg:gap-20`}>
          {/* Left: Act header */}
          <div className="lg:w-2/5">
            <FadeIn>
              <div className="mb-6 flex items-center gap-3">
                <motion.span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: act.color }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <span
                  className="font-mono text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: act.color }}
                >
                  {act.act}
                </span>
              </div>
            </FadeIn>

            <RevealLine delay={0.1}>
              <h3
                className="text-5xl font-bold tracking-[-0.03em] text-[#F0E6D0] sm:text-6xl lg:text-7xl"
              >
                {act.title}
              </h3>
            </RevealLine>

            <FadeUp delay={0.3}>
              <div className="mt-6 flex items-center gap-3">
                <span className="font-mono text-[11px] text-[#4A4640]">{act.period}</span>
                <span className="h-px w-4" style={{ backgroundColor: `${act.color}40` }} />
                <span className="font-mono text-[11px] text-[#4A4640]">{act.location}</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <p
                className="mt-6 text-lg text-[#B0A890]"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.5 }}
              >
                {`\u201C${act.summary}\u201D`}
              </p>
            </FadeUp>
          </div>

          {/* Right: Detail content */}
          <div className="lg:w-3/5">
            {act.mgmtParagraph && (
              <FadeUp delay={0.5}>
                <p className="mb-8 text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.9 }}>
                  {act.mgmtParagraph}
                </p>
              </FadeUp>
            )}

            {act.detail && (
              <FadeUp delay={0.5}>
                <p className="text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.9 }}>
                  {act.detail}
                </p>
              </FadeUp>
            )}

            {act.showMgmtStories && (
              <FadeUp delay={0.6}>
                <div className="mt-2">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="group mb-6 flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#8B7A3A] transition-colors group-hover:text-[#C9A84C]">
                      {expanded ? "Hide" : "Show"} the real stories
                    </span>
                    <motion.div
                      animate={{ rotate: expanded ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus size={14} className="text-[#8B7A3A] transition-colors group-hover:text-[#C9A84C]" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-[#16161E] bg-[#0A0A0F] p-6">
                          {MGMT_STORIES.map((story, i) => (
                            <MgmtStoryCard key={i} story={story} index={i} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            )}
          </div>
        </div>

        {/* Bottom separator with act color */}
        <FadeIn delay={0.8}>
          <div
            className="mx-auto mt-20 h-px max-w-lg"
            style={{
              background: `linear-gradient(90deg, transparent, ${act.color}20, transparent)`,
            }}
          />
        </FadeIn>
      </motion.div>
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
      <div className="relative px-6 py-20 text-center">
        <div
          className="atmospheric-glow"
          style={{
            width: 600, height: 600,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)",
          }}
        />
        <FadeUp className="relative z-10">
          <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-[#8B7A3A]">
            The Journey
          </p>
          <h2
            className="text-4xl text-[#F0E6D0] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Four acts, one thread
          </h2>
        </FadeUp>
      </div>

      {/* Each Act is a full scene */}
      {ACTS.map((act, i) => (
        <ActScene key={act.act} act={act} index={i} />
      ))}
    </section>
  )
}
