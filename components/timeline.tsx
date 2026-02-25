"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { FadeUp, StaggerContainer, StaggerItem } from "./motion"

/* ------------------------------------------------------------------ */
/*  Management Stories (Act III inline)                                */
/* ------------------------------------------------------------------ */

const MGMT_STORIES = [
  {
    tag: "CULTURE",
    title: "Fighting the culture of silence",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    tag: "MENTORSHIP",
    title: "Coaching communication style",
    text: "Our Product Owner was frustrated a developer seemed slow. I pointed out it might be the message, not the person. She was asking 'Would you mind finishing by tomorrow?' I shared my version: 'We're deploying tomorrow. Will your changes be included?' Same intent, different directness. She tried it. His responsiveness changed immediately.",
  },
  {
    tag: "PROCESS",
    title: "Monthly to weekly releases",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    tag: "TECHNICAL",
    title: "Catching scope creep in real time",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    tag: "CULTURE",
    title: "Protecting team culture across stacks",
    text: "Some engineers were openly dismissive of colleagues working on a platform they considered inferior. I raised it directly with the engineering lead. The risk wasn't hurt feelings. It was creating a two-tier team where one group felt like second-class citizens. We agreed that leaders needed to be conscious of how their opinions about tech choices affected the humans working on those technologies.",
  },
  {
    tag: "HIRING",
    title: "Hiring for fit, not speed",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

function MgmtStoryCard({ story }: { story: typeof MGMT_STORIES[0] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="cursor-pointer border-b border-[#1A1A22] py-5 last:border-b-0"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded bg-[#C9A84C]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#C9A84C]">
            {story.tag}
          </span>
          <span className="text-sm font-medium text-[#F0E6D0]">{story.title}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Plus size={14} className="text-[#8A8478]" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <p className="pt-4 pl-[calc(0.75rem+var(--tag-width,3.5rem))] text-sm leading-relaxed font-light text-[#B0A890]" style={{ paddingLeft: 0, marginTop: "0.75rem" }}>
              {story.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Acts I-III                                                         */
/* ------------------------------------------------------------------ */

interface Act {
  id: string
  act: string
  title: string
  period: string
  location: string
  color: string
  summary: string
  detail: string
  showMgmtStories?: boolean
  mgmtParagraph?: string
}

const ACTS: Act[] = [
  {
    id: "act-1",
    act: "ACT I",
    title: "THE ICU",
    period: "2015 \u2014 2018",
    location: "NYU Langone, New York",
    color: "#C75050",
    summary: "Before I wrote a single line of code, I learned to debug systems where hesitation costs lives.",
    detail: "Neuro ICU. Three to four critical patients per shift. Ventilators, IV drips, medication protocols that had to be exact. A cough doesn't mean a cold. It could be pulmonary effusion, a ventilator issue, a medication reaction. Every shift was differential diagnosis under pressure. CCRN certified, because I chose to be held to the highest standard. This is where I learned systems thinking, crisis communication, and the cost of getting it wrong.",
  },
  {
    id: "act-2",
    act: "ACT II",
    title: "THE CODE",
    period: "2018 \u2014 2022",
    location: "Berlin & Hamburg",
    color: "#5B8DA8",
    summary: "Four companies. Each pushed me deeper technically while keeping me close to users and product.",
    detail: "AMBOSS: React app, 500K+ medical students, A/B tests that lifted engagement 20%. Compado: Vue, 50% page speed improvement, 25% organic traffic growth. Promoted to Senior. CAPinside: Vue/TypeScript fintech, 10K+ advisors, 35% faster loads. DKB: Rebuilt the frontend of a banking app used by 5 million people. Introduced Jest and Playwright. Promoted to Senior in 12 months, then to Engineering Manager.",
  },
  {
    id: "act-3",
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

function ActCard({ act }: { act: Act }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <StaggerItem>
      <div className="border-b border-[#1A1A22]">
        {/* Header row - always visible */}
        <div
          className="group cursor-pointer py-8 sm:py-10"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: act.color }}>
                  {act.act}
                </span>
                <span className="h-px w-6 bg-[#1A1A22]" />
                <span className="font-mono text-[10px] text-[#4A4640]">{act.period}</span>
              </div>
              <h3
                className="mb-1 text-2xl font-bold tracking-[-0.02em] text-[#F0E6D0] sm:text-3xl"
              >
                {act.title}
              </h3>
              <p className="mb-4 text-xs text-[#8A8478]">{act.location}</p>
              <p
                className="max-w-2xl text-sm leading-relaxed text-[#B0A890]"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                {`"${act.summary}"`}
              </p>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 shrink-0"
            >
              <Plus size={18} className="text-[#4A4640] transition-colors group-hover:text-[#C9A84C]" />
            </motion.div>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-10">
                {act.mgmtParagraph && (
                  <p className="mb-8 max-w-2xl text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.8 }}>
                    {act.mgmtParagraph}
                  </p>
                )}

                {act.detail && (
                  <p className="mb-8 max-w-2xl text-sm leading-relaxed font-light text-[#B0A890]" style={{ lineHeight: 1.8 }}>
                    {act.detail}
                  </p>
                )}

                {act.showMgmtStories && (
                  <div>
                    <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B7A3A]">
                      How the real work looked
                    </p>
                    <div className="rounded-lg border border-[#1A1A22] bg-[#0B0B0F] p-5">
                      {MGMT_STORIES.map((story, i) => (
                        <MgmtStoryCard key={i} story={story} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StaggerItem>
  )
}

export function Timeline() {
  return (
    <section id="journey" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A84C]">
            The Journey
          </p>
          <h2
            className="text-3xl text-[#F0E6D0] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Four acts, one thread
          </h2>
        </FadeUp>

        <StaggerContainer className="mt-12" staggerDelay={0.15}>
          {ACTS.map((act) => (
            <ActCard key={act.id} act={act} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
