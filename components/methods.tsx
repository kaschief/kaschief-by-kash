"use client"

import { useState, useRef, useEffect, type CSSProperties } from "react"
import { SECTION_ID } from "@/lib/sections"
import { motion, useInView } from "framer-motion"
import { METHOD_GROUPS, type MethodSkill } from "@/data/methods"
import { TRANSITION, EASE, CSS_EASE, PULSE_TRANSITION } from "@/components/motion"
import { TOKENS } from "@/lib/tokens"
import { Z_INDEX } from "@/lib/constants"
import { SectionGlow } from "./ui/section-glow"

const N = METHOD_GROUPS.length

/* ------------------------------------------------------------------ */
/*  Skill takeover                                                      */
/* ------------------------------------------------------------------ */

function SkillTakeover({
  skill,
  groupLabel,
  onClose,
}: {
  skill: MethodSkill
  groupLabel: string
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    history.pushState({ takeover: true }, "", location.href)
    const t = setTimeout(() => setVisible(true), 20)
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") history.back() }
    document.addEventListener("keydown", handleKey)
    const handlePop = () => onClose()
    window.addEventListener("popstate", handlePop, { once: true } as AddEventListenerOptions)
    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
      document.removeEventListener("keydown", handleKey)
      window.removeEventListener("popstate", handlePop)
    }
  }, [onClose])

  const item = (delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 16}px)`,
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  })

  return (
    <div
      onClick={(e) => { e.stopPropagation(); history.back() }}
      style={{ position: "fixed", inset: 0, zIndex: Z_INDEX.takeover, background: TOKENS.bg, display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px", width: "100%", position: "relative" }}>
        <p style={{ position: "absolute", top: -56, fontFamily: TOKENS.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: TOKENS.textFaint, ...item(0) }}>
          ← tap anywhere to return
        </p>
        <p style={{ fontFamily: TOKENS.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.28em", color: TOKENS.goldDim, marginBottom: 24, ...item(0.08) }}>
          {groupLabel}
        </p>
        <h2 style={{ fontFamily: TOKENS.fontSerif, fontWeight: 400, fontSize: "clamp(44px, 7vw, 96px)", color: TOKENS.cream, lineHeight: 1, marginBottom: 36, ...item(0.04) }}>
          {skill.label}
        </h2>
        <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.85, color: TOKENS.textDim, maxWidth: 580, ...item(0.12) }}>
          {skill.detail}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Skill row                                                           */
/* ------------------------------------------------------------------ */

function SkillRow({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        background: "none",
        border: "none",
        borderBottom: `1px solid ${TOKENS.stroke}`,
        opacity: hovered ? 0.5 : 1,
        transition: "opacity 0.15s ease",
        color: TOKENS.creamMuted,
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <span style={{ color: TOKENS.textFaint, fontSize: 13 }}>→</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Nav button — fixed outer width prevents grid column from resizing  */
/* ------------------------------------------------------------------ */

function NavButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: TOKENS.fontMono,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: isActive ? TOKENS.creamMuted : hovered ? TOKENS.textDim : TOKENS.textFaint,
          transition: `color ${TRANSITION.base.duration}s ease`,
        }}
      >
        {label}
      </span>
      {/*
        Outer span is always 20px — the auto grid column never changes size.
        Inner span is absolutely positioned so width animation doesn't affect layout.
      */}
      <span style={{ position: "relative", width: 20, height: 1, flexShrink: 0, display: "inline-block" }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 1,
            width: isActive ? 20 : hovered ? 8 : 4,
            background: isActive ? TOKENS.gold : hovered ? TOKENS.textDim : TOKENS.stroke,
            transition: `all ${TRANSITION.base.duration}s ease`,
          }}
        />
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/*  Nav sits as column 3 of the grid — literally next to the skill     */
/*  rows. All panels receive the same activePanelIndex so the nav      */
/*  always shows the correct active state during crossfades.           */
/* ------------------------------------------------------------------ */

function Panel({
  group,
  index,
  panelProgress,
  activePanelIndex,
  onSkillSelect,
  onScrollToPanel,
}: {
  group: (typeof METHOD_GROUPS)[number]
  index: number
  panelProgress: number
  activePanelIndex: number
  onSkillSelect: (skill: MethodSkill, groupLabel: string) => void
  onScrollToPanel: (i: number) => void
}) {
  const isActive = activePanelIndex === index
  const dist = Math.abs(panelProgress - index)
  const panelOpacity = Math.max(0, 1 - dist)

  // Content fades in with stagger on entrance; resets instantly on exit
  const fadeIn = (delay: number): CSSProperties => ({
    opacity: isActive ? 1 : 0,
    transition: isActive
      ? `opacity ${TRANSITION.page.duration}s ${CSS_EASE} ${delay}s`
      : "opacity 0s",
  })

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: panelOpacity,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      {/* Fixed paddingTop anchors the title to the same Y for every panel */}
      <div style={{ maxWidth: 1024, margin: "0 auto", paddingTop: "18vh", paddingLeft: 24, paddingRight: 24, width: "100%" }}>

        {/* Eyebrow — exact SectionLabel style */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, ...fadeIn(0) }}>
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: TOKENS.gold }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={PULSE_TRANSITION}
          />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: TOKENS.gold }}>
            Methods
          </span>
        </div>

        {/* Three-column grid: title | skill rows | section nav */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr) auto",
            gap: "0 48px",
            alignItems: "start",
          }}
        >
          {/* Col 1: title + description */}
          <div style={{ borderRight: `1px solid ${TOKENS.stroke}`, paddingRight: 48 }}>
            <h2
              className="font-serif text-4xl font-normal tracking-[-0.02em] sm:text-5xl lg:text-6xl"
              style={{ lineHeight: 1.05, marginBottom: 20, color: TOKENS.cream, ...fadeIn(0.06) }}
            >
              {group.label}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: TOKENS.textDim, ...fadeIn(0.16) }}>
              {group.description}
            </p>
          </div>

          {/* Col 2: skill rows */}
          <div>
            {group.skills.map((skill, i) => (
              <div key={skill.id} style={fadeIn(0.2 + i * 0.05)}>
                <SkillRow
                  label={skill.label}
                  onSelect={() => onSkillSelect(skill, group.label)}
                />
              </div>
            ))}
          </div>

          {/* Col 3: vertical section nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            {METHOD_GROUPS.map((g, i) => (
              <NavButton
                key={g.id}
                label={g.label}
                isActive={activePanelIndex === i}
                onClick={() => onScrollToPanel(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main export                                                         */
/* ------------------------------------------------------------------ */

export function Methods() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeSkill, setActiveSkill] = useState<{
    skill: MethodSkill
    groupLabel: string
  } | null>(null)

  const inView = useInView(outerRef, { once: true, amount: 0.05 })

  const scrollToPanel = (panelIndex: number) => {
    if (!outerRef.current) return
    const outerTop = window.scrollY + outerRef.current.getBoundingClientRect().top
    const scrollable = outerRef.current.offsetHeight - window.innerHeight
    const panelScrollHeight = scrollable / (N - 1)
    window.scrollTo({ top: outerTop + panelIndex * panelScrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    let snapTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      if (!outerRef.current) return
      const rect = outerRef.current.getBoundingClientRect()
      const scrollable = outerRef.current.offsetHeight - window.innerHeight
      if (scrollable <= 0) return

      const p = Math.max(0, Math.min(1, -rect.top / scrollable))
      setProgress(p)

      clearTimeout(snapTimeout)
      if (p > 0.05 && p < 0.95) {
        snapTimeout = setTimeout(() => {
          if (!outerRef.current) return
          const targetPanel = Math.round(p * (N - 1))
          const outerTop = window.scrollY + outerRef.current.getBoundingClientRect().top
          const scrollable2 = outerRef.current.offsetHeight - window.innerHeight
          const panelScrollHeight = scrollable2 / (N - 1)
          window.scrollTo({ top: outerTop + targetPanel * panelScrollHeight, behavior: "smooth" })
        }, 150)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(snapTimeout)
    }
  }, [])

  const panelProgress = progress * (N - 1)
  const activePanelIndex = Math.round(panelProgress)

  return (
    <div id={SECTION_ID.METHODS} ref={outerRef} style={{ height: `${N * 60}vh`, position: "relative" }}>
      <SectionGlow color={TOKENS.gold} size="lg" />
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <motion.div
          style={{ position: "relative", width: "100%", height: "100%" }}
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {METHOD_GROUPS.map((group, i) => (
            <Panel
              key={group.id}
              group={group}
              index={i}
              panelProgress={panelProgress}
              activePanelIndex={activePanelIndex}
              onSkillSelect={(skill, groupLabel) => setActiveSkill({ skill, groupLabel })}
              onScrollToPanel={scrollToPanel}
            />
          ))}
        </motion.div>
      </div>

      {activeSkill && (
        <SkillTakeover
          skill={activeSkill.skill}
          groupLabel={activeSkill.groupLabel}
          onClose={() => setActiveSkill(null)}
        />
      )}
    </div>
  )
}
