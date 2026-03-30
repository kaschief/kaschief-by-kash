"use client"

/**
 * Act II — The Engineer.
 *
 * Structure:
 *   Lenses scroll (title → convergence → lenses thesis/curtain/storycards)
 *     └─ Single sticky viewport
 *   Summary panel (normal flow)
 *   Story Desk (normal flow — remaining storycards)
 *   Sankey scroll (particles → funnel → terminal)
 *     └─ Sticky viewport
 */

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useScroll, useMotionValueEvent, useInView, useReducedMotion } from "framer-motion"
import { ACT_II } from "@data"
import { smoothstep } from "./math"
import { ACT_BLUE, CONTENT } from "./act-ii.data"
import { BREAKPOINTS } from "@utilities"
import {
  CONTAINER_VH,
  EC_UI_CONFIG,
  SCROLL_PHASES,
  PARTICLES_START,
  THESIS_START,
  CONVERGENCE_GATE,
  LENSES_INTEGRATION,
} from "./act-ii.types"

/* ---- Lenses imports ---- */
import {
  useLenses,
  CONTAINER_HEIGHT_VH as LENSES_SECTION_VH,
  SMOOTH_LERP_FACTOR,
} from "./lenses/use-lenses"
import { MAX_CONTENT_WIDTH } from "./lenses/lenses.config"
import { StoryDesk } from "./lenses/story-desk"
import { StoryDeskBridge } from "./lenses/story-desk-bridge"
import { useBreakpoint, useLenis, useNavStore } from "@hooks"

/* ================================================================== */
/*  Breakpoint refs (no-re-render, matches Act I pattern)              */
/* ================================================================== */

function useBreakpointRefs() {
  const isLg = useRef(false)
  useEffect(() => {
    const mqLg = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    isLg.current = mqLg.matches
    const lgH = (e: MediaQueryListEvent) => {
      isLg.current = e.matches
    }
    mqLg.addEventListener("change", lgH)
    return () => {
      mqLg.removeEventListener("change", lgH)
    }
  }, [])
  return { isLg }
}

/* Sub-hooks — each owns a scroll section */
import { useRolesCloud } from "./roles/use-roles-cloud"
import { useParticleFunnel } from "./particles/use-particle-funnel"

/* ================================================================== */
/*  V0: ScrambleText                                                   */
/* ================================================================== */

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

function useScramble(
  text: string,
  active: boolean,
  prefersReducedMotion: boolean | null,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
) {
  const [display, setDisplay] = useState(text)
  useEffect(() => {
    if (!active) return
    // Skip scramble animation entirely for reduced-motion users
    if (prefersReducedMotion) {
      // Wrapped in rAF callback so this is not a synchronous setState in an effect body
      requestAnimationFrame(() => setDisplay(text))
      return
    }
    const resolved = new Array(text.length).fill(false)
    const cycles = new Array(text.length).fill(0)
    const iv = setInterval(() => {
      let done = true
      const next = text.split("").map((ch, i) => {
        if (ch === " ") return " "
        const startDelay = i * staggerMs
        const elapsed = cycles[i] * intervalMs
        if (elapsed < startDelay) {
          cycles[i]++
          done = false
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }
        if (resolved[i]) return ch
        cycles[i]++
        if (cycles[i] - Math.floor(startDelay / intervalMs) >= cyclesPerChar) {
          resolved[i] = true
          return ch
        }
        done = false
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      })
      setDisplay(next.join(""))
      if (done) clearInterval(iv)
    }, intervalMs)
    return () => clearInterval(iv)
  }, [active, text, prefersReducedMotion, staggerMs, cyclesPerChar, intervalMs])
  return display
}

function ScrambleWord({
  text,
  active,
  prefersReducedMotion,
}: {
  text: string
  active: boolean
  prefersReducedMotion: boolean | null
}) {
  const display = useScramble(
    text,
    active,
    prefersReducedMotion,
    EC_UI_CONFIG.titleScrambleStaggerMs,
    EC_UI_CONFIG.titleScrambleCycles,
    EC_UI_CONFIG.titleScrambleIntervalMs,
  )
  return <>{display}</>
}

/* ================================================================== */
/*  Container height constants                                         */
/* ================================================================== */

/**
 * Lenses scroll = convergence + lenses in one sticky viewport.
 *
 * Convergence runs 0 → CONVERGENCE_GATE (fragments fully dissolve).
 * Lenses thesis starts at THESIS_START (during embers, before fragments finish).
 * They overlap, matching the committed version's crossfade between fragments and thesis.
 */
/** Lenses thesis begins slightly before THESIS_START — during embers rising */
const LENSES_START_VH = Math.ceil((THESIS_START - LENSES_INTEGRATION.earlyOffset) * CONTAINER_VH)

/** Sankey scroll = particles → funnel → terminal (PARTICLES_START → 1 in EC progress) */
const SANKEY_SCROLL_VH = Math.ceil((1 - PARTICLES_START) * CONTAINER_VH)

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function ActIIEngineer() {
  const { isLg } = useBreakpointRefs()
  const prefersReducedMotion = useReducedMotion()

  /* ---- Refs: Lenses scroll (convergence + lenses, one viewport) ---- */
  const lensesScrollRef = useRef<HTMLDivElement>(null)
  const stickyViewportARef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInViewRef = useRef<HTMLDivElement>(null)
  const summaryPanelRef = useRef<HTMLDivElement>(null)

  /* ---- Lenses smoothing refs ---- */
  const lensesSmoothedProgress = useRef(0)
  const lensesRawProgress = useRef(0)
  const lensesAnimFrameId = useRef(0)

  /* ---- Refs: Sankey scroll (particles → funnel) ---- */
  const sankeyScrollRef = useRef<HTMLDivElement>(null)

  /* ---- Animation hooks ---- */
  const rolesCloud = useRolesCloud()
  const particleFunnel = useParticleFunnel({ isLgRef: isLg })
  const lenses = useLenses()

  /* ---- Responsive height for Lenses scroll ---- */
  const isSmUp = useBreakpoint(BREAKPOINTS.sm)
  const lensesVh = isSmUp
    ? LENSES_SECTION_VH
    : Math.ceil(LENSES_SECTION_VH * LENSES_INTEGRATION.mobileScrollFactor)
  const lensesScrollVh = LENSES_START_VH + lensesVh

  /* ---- Title scramble + Lenis hold ---- */
  const getLenis = useLenis()
  const titleInView = useInView(titleInViewRef, { once: true, amount: 0.5 })
  const [titleActive, setTitleActive] = useState(false)
  const titleHoldFired = useRef(false)
  useEffect(() => {
    if (!titleInView) return
    // Wrapped in rAF so this is an async callback, not synchronous setState in effect
    requestAnimationFrame(() => setTitleActive(true))
    // Lenis hold — freeze scroll then release after configured duration
    if (titleHoldFired.current) return
    titleHoldFired.current = true
    const lenis = getLenis()
    if (!lenis) return
    lenis.stop()
    const timer = setTimeout(() => lenis.start(), EC_UI_CONFIG.titleHoldMs)
    return () => {
      clearTimeout(timer)
      lenis.start()
    }
  }, [titleInView, getLenis])

  /* ================================================================ */
  /*  Scroll: Lenses scroll (convergence + lenses in one viewport)       */
  /* ================================================================ */

  const { scrollYProgress: progressA } = useScroll({
    target: lensesScrollRef,
    offset: ["start start", "end end"],
  })

  /** Apply all Lenses scroll scroll-driven state for a given local progress. */
  const applyContainerAProgress = useCallback(
    (p: number) => {
      // Convert local progress (0→1) to scroll position in vh
      const scrollVh = p * lensesScrollVh

      /* ---- Curtain edge from summary panel ---- */
      let curtainTop = window.innerHeight
      if (summaryPanelRef.current) {
        const summaryTop = summaryPanelRef.current.getBoundingClientRect().top
        if (summaryTop < window.innerHeight) curtainTop = Math.max(0, summaryTop)
      }

      /* ---- Title fade ---- */
      // ecProgress: full EC progress (unclamped) — roles phases need values beyond CONVERGENCE_GATE
      const ecProgressFull = scrollVh / CONTAINER_VH
      // ecProgress: clamped for title fade and convergence-era logic
      const ecProgress = Math.min(ecProgressFull, CONVERGENCE_GATE)
      if (titleRef.current) {
        const slowFade =
          1 -
          smoothstep(
            SCROLL_PHASES.TITLE.start,
            SCROLL_PHASES.TITLE.end * EC_UI_CONFIG.titleSlowFadeMult,
            ecProgress,
          )
        const curtainFade =
          curtainTop >= window.innerHeight
            ? 1
            : Math.max(
                0,
                (curtainTop - window.innerHeight * EC_UI_CONFIG.titleCurtainThreshold) /
                  (window.innerHeight * EC_UI_CONFIG.titleCurtainRange),
              )
        titleRef.current.style.opacity = String(Math.min(slowFade, curtainFade))
      }

      /* ---- Roles cloud (fragments, embers, grid, roles grid) ---- */
      const viewportHeight = window.innerHeight
      const isDesktop = isLg.current
      // Pass unclamped progress so the hook can drive roles phases beyond CONVERGENCE_GATE.
      // During convergence (< gate), the hook's smoothsteps are authored against
      // the same thresholds so clamped vs unclamped makes no difference.
      // Beyond the gate, the roles dissolve/fly/hold/drain phases activate.
      rolesCloud.update(ecProgressFull, isDesktop, curtainTop, viewportHeight, true)

      /* ---- Lenses (thesis, curtain, crossfade) ---- */
      // Lenses starts at THESIS_START (during embers), overlapping with convergence tail
      if (scrollVh >= LENSES_START_VH) {
        const lensesLocalProgress = (scrollVh - LENSES_START_VH) / lensesVh
        lensesRawProgress.current = Math.min(1, Math.max(0, lensesLocalProgress))
      } else {
        lensesRawProgress.current = 0
      }
    },
    [lensesScrollVh, lensesVh, rolesCloud, isLg],
  )

  useMotionValueEvent(progressA, "change", applyContainerAProgress)

  /* ---- RAF loop for smoothed lenses progress ---- */
  const lensesUpdate = lenses.update
  useEffect(() => {
    const tick = () => {
      // During programmatic navigation, snap immediately — LERP smoothing
      // would leave stale intermediate state visible when the fade-jump
      // restores visibility after only a few frames.
      const navigating = useNavStore.getState().isNavigating
      if (navigating) {
        lensesSmoothedProgress.current = lensesRawProgress.current
      } else {
        lensesSmoothedProgress.current +=
          (lensesRawProgress.current - lensesSmoothedProgress.current) * SMOOTH_LERP_FACTOR
      }
      lensesUpdate(lensesSmoothedProgress.current, stickyViewportARef)
      lensesAnimFrameId.current = requestAnimationFrame(tick)
    }
    lensesAnimFrameId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(lensesAnimFrameId.current)
  }, [lensesUpdate])

  /* ================================================================ */
  /*  Scroll: Sankey scroll (particles → funnel → terminal)              */
  /* ================================================================ */

  const { scrollYProgress: sankeyProgress } = useScroll({
    target: sankeyScrollRef,
    offset: ["start start", "end end"],
  })

  /** Apply all Sankey scroll scroll-driven state for a given local progress. */
  const applySankeyProgress = useCallback(
    (p: number) => {
      // Map container-local progress (0→1) to EC progress (PARTICLES_START→1)
      const ecProgress = PARTICLES_START + p * (1 - PARTICLES_START)
      particleFunnel.update(ecProgress)
    },
    [particleFunnel],
  )

  useMotionValueEvent(sankeyProgress, "change", (p) => {
    applySankeyProgress(p)
  })

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      {/* ============================================================ */}
      {/*  CONTAINER A: Convergence + Lenses (one sticky viewport)     */}
      {/* ============================================================ */}
      <div
        ref={lensesScrollRef}
        data-sticky-zone
        style={{ height: `${lensesScrollVh}vh` }}
        className="relative">
        <div
          ref={(el) => {
            stickyViewportARef.current = el
            rolesCloud.setStickyViewport(el)
          }}
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size] [--frag-scale:0.6] sm:[--frag-scale:0.85]"
          style={{ background: "var(--bg)", zIndex: 1, willChange: "transform" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20"
            style={{ height: 0, opacity: 0, background: "var(--bg)" }}
          />

          {/* Roles cloud: atmosphere, glow, embers, fragments, company grid */}
          {rolesCloud.jsx}

          {/* Lenses: thesis sentence, curtain, crossfade cards (fullscreen layer) */}
          {lenses.fullScreenJsx}

          {/* Lenses: crossfade content (cards, pills — constrained width layer) */}
          <div className="relative h-full mx-auto" style={{ maxWidth: MAX_CONTENT_WIDTH }}>
            {lenses.contentJsx}
          </div>

          {/* Title */}
          <div
            ref={titleRef}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ willChange: "transform, opacity" }}>
            <div ref={titleInViewRef}>
              <motion.div
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={titleActive ? { opacity: 1, letterSpacing: "0.5em" } : {}}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="mb-6 text-xs sm:text-sm md:text-base text-center"
                style={{ color: ACT_BLUE }}>
                {ACT_II.act}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={titleActive ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
                className="font-sans text-4xl font-bold tracking-[-0.03em] text-center sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]"
                style={{ color: "var(--cream)" }}>
                {ACT_II.title
                  .toUpperCase()
                  .replace(/I/, "1")
                  .split(" ")
                  .map((word, i) => (
                    <span key={i} className="block">
                      <ScrambleWord
                        text={word}
                        active={titleActive}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </span>
                  ))}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={titleActive ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
                className="font-narrator text-sm text-center mt-6 mx-auto sm:text-base md:text-xl leading-relaxed"
                style={{
                  color: "var(--cream-muted)",
                  maxWidth: "min(500px, 85vw)",
                }}>
                {ACT_II.splash}
              </motion.p>
            </div>
          </div>
        </div>

        {/* ---- Summary panel (INSIDE container A, scrolls up over sticky) ---- */}
        <div
          ref={summaryPanelRef}
          className="relative flex flex-col items-center justify-center py-32 px-6 sm:px-8"
          style={{
            background: "var(--bg)",
            zIndex: 10,
            paddingTop: "min(150px, 20vh)",
            paddingBottom: "min(150px, 20vh)",
          }}>
          <div className="w-12 h-px mb-16" style={{ background: "var(--gold-dim)" }} />
          <div className="max-w-lg text-center">
            <p
              className="font-narrator"
              style={{
                color: "var(--cream-muted)",
                fontSize: "1.25rem",
                lineHeight: 1.625,
              }}>
              {CONTENT.summary.block1}
            </p>
            <p
              className="font-narrator mt-8"
              style={{
                color: "var(--text-cream)",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}>
              {CONTENT.summary.block2}
            </p>
          </div>
          <div className="w-12 h-px mt-16" style={{ background: "var(--gold-dim)" }} />
        </div>
      </div>

      {/* ============================================================ */}
      {/*  STORY DESK: Normal-flow remaining cards                      */}
      {/* ============================================================ */}
      <StoryDesk />

      <StoryDeskBridge />

      {/* ============================================================ */}
      {/*  CONTAINER B: Particles → Funnel                   */}
      {/* ============================================================ */}
      <div
        ref={sankeyScrollRef}
        data-sticky-zone
        style={{ height: `${SANKEY_SCROLL_VH}vh` }}
        className="relative hidden sm:block">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size]"
          style={{ background: "var(--bg)", zIndex: 1, willChange: "transform" }}>
          {/* Particle canvas, funnel SVG, narrator panels, mobile skills, mid narrator */}
          {particleFunnel.jsx}
        </div>
      </div>
    </>
  )
}
