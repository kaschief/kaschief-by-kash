"use client";

/**
 * EngineerCandidate — Workstation build with integrated lenses.
 *
 * Structure:
 *   Container A (title → convergence → lenses thesis/curtain/crossfade)
 *     └─ Single sticky viewport — fragments converge seamlessly into lenses thesis
 *     └─ Summary panel (scrolls up over sticky)
 *   Shore Desk (normal flow — 8 remaining cards)
 *   Container B (particles → funnel → terminal)
 *     └─ Sticky viewport
 */

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import { ACT_II } from "@data";
import { usePathname } from "next/navigation";
import { LabNav } from "../lab-nav";
import { smoothstep } from "./math";
import { ACT_BLUE, CONTENT } from "./engineer-data";
import { BREAKPOINTS } from "@utilities";
import {
  CONTAINER_VH,
  CHROME,
  SCROLL_PHASES,
  PARTICLES_START,
  THESIS_START,
  CONVERGENCE_GATE,
} from "./engineer-candidate.types";

/* ---- Lenses imports ---- */
import {
  useLenses,
  CONTAINER_HEIGHT_VH as LENSES_SECTION_VH,
  SMOOTH_LERP_FACTOR,
} from "./use-lenses";
import { MAX_CONTENT_WIDTH } from "./lenses.config";
import { StoryDesk } from "./story-desk";
import { useBreakpoint } from "@hooks";

/* ================================================================== */
/*  Breakpoint refs (no-re-render, matches Act I pattern)              */
/* ================================================================== */

function useBreakpointRefs() {
  const isLg = useRef(false);
  useEffect(() => {
    const mqLg = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    isLg.current = mqLg.matches;
    const lgH = (e: MediaQueryListEvent) => {
      isLg.current = e.matches;
    };
    mqLg.addEventListener("change", lgH);
    return () => {
      mqLg.removeEventListener("change", lgH);
    };
  }, []);
  return { isLg };
}

/* Sub-hooks — each owns a scroll section */
import { useTerminalReplay } from "./use-terminal-replay";
import { useConvergence } from "./use-convergence";
import { useParticleFunnel } from "./use-particle-funnel";

/* ================================================================== */
/*  V0: ScrambleText                                                   */
/* ================================================================== */

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function useScramble(
  text: string,
  active: boolean,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) return;
    const resolved = new Array(text.length).fill(false);
    const cycles = new Array(text.length).fill(0);
    const iv = setInterval(() => {
      let done = true;
      const next = text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        const startDelay = i * staggerMs;
        const elapsed = cycles[i] * intervalMs;
        if (elapsed < startDelay) {
          cycles[i]++;
          done = false;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        }
        if (resolved[i]) return ch;
        cycles[i]++;
        if (cycles[i] - Math.floor(startDelay / intervalMs) >= cyclesPerChar) {
          resolved[i] = true;
          return ch;
        }
        done = false;
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      });
      setDisplay(next.join(""));
      if (done) clearInterval(iv);
    }, intervalMs);
    return () => clearInterval(iv);
  }, [active, text, staggerMs, cyclesPerChar, intervalMs]);
  return display;
}

function ScrambleWord({ text, active }: { text: string; active: boolean }) {
  const display = useScramble(text, active, 70, 6, 70);
  return <>{display}</>;
}

/* ================================================================== */
/*  Container height constants                                         */
/* ================================================================== */

/**
 * Container A = convergence + lenses in one sticky viewport.
 *
 * Convergence runs 0 → CONVERGENCE_GATE (fragments fully dissolve).
 * Lenses thesis starts at THESIS_START (during embers, before fragments finish).
 * They overlap, matching the committed version's crossfade between fragments and thesis.
 */
/** Lenses thesis begins slightly before THESIS_START — during embers rising */
const LENSES_EARLY_OFFSET = 0.015;
const LENSES_START_VH = Math.ceil(
  (THESIS_START - LENSES_EARLY_OFFSET) * CONTAINER_VH,
);

/** Container B = particles → funnel → terminal (PARTICLES_START → 1 in EC progress) */
const CONTAINER_B_VH = Math.ceil((1 - PARTICLES_START) * CONTAINER_VH);

/** Mobile: halve the lenses scroll distance */
const LENSES_MOBILE_SCROLL_FACTOR = 0.5;

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function EngineerCandidate() {
  const { isLg } = useBreakpointRefs();
  const isStandalone = usePathname() === "/engineer-candidate";

  /* ---- Refs: Container A (convergence + lenses, one viewport) ---- */
  const containerARef = useRef<HTMLDivElement>(null);
  const stickyViewportARef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInViewRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);

  /* ---- Lenses smoothing refs ---- */
  const lensesSmoothedProgress = useRef(0);
  const lensesRawProgress = useRef(0);
  const lensesAnimFrameId = useRef(0);

  /* ---- Refs: Container B (particles → funnel → terminal) ---- */
  const containerBRef = useRef<HTMLDivElement>(null);
  const vignetteEl = useRef<HTMLDivElement>(null);
  const beatGlowEl = useRef<HTMLDivElement>(null);

  /* ---- Animation hooks ---- */
  const convergence = useConvergence();
  const terminalReplay = useTerminalReplay({
    scrollContainerRef: containerBRef,
    beatGlowEl,
    vignetteEl,
  });
  const particleFunnel = useParticleFunnel({ isLgRef: isLg });
  const lenses = useLenses();

  /* ---- Responsive height for Container A ---- */
  const isSmUp = useBreakpoint(BREAKPOINTS.sm);
  const lensesVh = isSmUp
    ? LENSES_SECTION_VH
    : Math.ceil(LENSES_SECTION_VH * LENSES_MOBILE_SCROLL_FACTOR);
  const containerAHeight = LENSES_START_VH + lensesVh;

  /* ---- Title scramble ---- */
  const titleInView = useInView(titleInViewRef, { once: true, amount: 0.5 });
  const [titleActive, setTitleActive] = useState(false);
  useEffect(() => {
    if (titleInView) setTitleActive(true);
  }, [titleInView]);

  /* ================================================================ */
  /*  Scroll: Container A (convergence + lenses in one viewport)       */
  /* ================================================================ */

  const { scrollYProgress: progressA } = useScroll({
    target: containerARef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(progressA, "change", (p) => {
    // Convert local progress (0→1) to scroll position in vh
    const scrollVh = p * containerAHeight;

    /* ---- Curtain edge from summary panel ---- */
    let curtainTop = window.innerHeight;
    if (summaryPanelRef.current) {
      const summaryTop = summaryPanelRef.current.getBoundingClientRect().top;
      if (summaryTop < window.innerHeight) curtainTop = Math.max(0, summaryTop);
    }

    /* ---- Title fade ---- */
    // Map to EC progress for title phases
    const ecProgress = Math.min(scrollVh / CONTAINER_VH, CONVERGENCE_GATE);
    if (titleRef.current) {
      const slowFade =
        1 -
        smoothstep(
          SCROLL_PHASES.TITLE.start,
          SCROLL_PHASES.TITLE.end * CHROME.titleSlowFadeMult,
          ecProgress,
        );
      const curtainFade =
        curtainTop >= window.innerHeight
          ? 1
          : Math.max(
              0,
              (curtainTop - window.innerHeight * CHROME.titleCurtainThreshold) /
                (window.innerHeight * CHROME.titleCurtainRange),
            );
      titleRef.current.style.opacity = String(Math.min(slowFade, curtainFade));
    }

    /* ---- Convergence (fragments, embers, grid) ---- */
    const viewportHeight = window.innerHeight;
    const isDesktop = isLg.current;
    convergence.update(ecProgress, isDesktop, curtainTop, viewportHeight, true);

    /* ---- Lenses (thesis, curtain, crossfade) ---- */
    // Lenses starts at THESIS_START (during embers), overlapping with convergence tail
    if (scrollVh >= LENSES_START_VH) {
      const lensesLocalProgress = (scrollVh - LENSES_START_VH) / lensesVh;
      lensesRawProgress.current = Math.min(1, Math.max(0, lensesLocalProgress));
    } else {
      lensesRawProgress.current = 0;
    }
  });

  /* ---- RAF loop for smoothed lenses progress ---- */
  const lensesUpdate = lenses.update;
  useEffect(() => {
    const tick = () => {
      lensesSmoothedProgress.current +=
        (lensesRawProgress.current - lensesSmoothedProgress.current) *
        SMOOTH_LERP_FACTOR;
      lensesUpdate(lensesSmoothedProgress.current, stickyViewportARef);
      lensesAnimFrameId.current = requestAnimationFrame(tick);
    };
    lensesAnimFrameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(lensesAnimFrameId.current);
  }, [lensesUpdate]);

  /* ================================================================ */
  /*  Scroll: Container B (particles → funnel → terminal)              */
  /* ================================================================ */

  const { scrollYProgress: progressB } = useScroll({
    target: containerBRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(progressB, "change", (p) => {
    // Map container-local progress (0→1) to EC progress (PARTICLES_START→1)
    const ecProgress = PARTICLES_START + p * (1 - PARTICLES_START);
    const isDesktop = isLg.current;
    particleFunnel.update(ecProgress);
    terminalReplay.update(ecProgress, isDesktop);
  });

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      {isStandalone && <LabNav />}

      {/* ============================================================ */}
      {/*  CONTAINER A: Convergence + Lenses (one sticky viewport)     */}
      {/* ============================================================ */}
      <div
        ref={containerARef}
        data-sticky-zone
        style={{ height: `${containerAHeight}vh` }}
        className="relative">
        <div
          ref={stickyViewportARef}
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size] [--frag-scale:0.6] sm:[--frag-scale:0.85]"
          style={{ background: "var(--bg)", zIndex: 1 }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20"
            style={{ height: 0, opacity: 0, background: "var(--bg)" }}
          />

          {/* Convergence atmosphere, glow, embers, fragments */}
          {convergence.jsx}

          {/* Lenses: thesis sentence, curtain, crossfade cards (fullscreen layer) */}
          {lenses.fullScreenJsx}

          {/* Lenses: crossfade content (cards, pills — constrained width layer) */}
          <div
            className="relative h-full mx-auto"
            style={{ maxWidth: MAX_CONTENT_WIDTH }}>
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
                animate={
                  titleActive ? { opacity: 1, letterSpacing: "0.5em" } : {}
                }
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
                      <ScrambleWord text={word} active={titleActive} />
                    </span>
                  ))}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={titleActive ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
                className="font-serif text-sm italic text-center mt-6 mx-auto sm:text-base"
                style={{
                  color: "var(--cream-muted)",
                  maxWidth: "min(500px, 85vw)",
                }}>
                {ACT_II.splash}
              </motion.p>
            </div>
          </div>

          {/* Chrome — page title only visible on standalone route */}
          {isStandalone && (
            <div
              className="absolute top-8 left-1/2 -translate-x-1/2 font-sans tracking-widest uppercase"
              style={{
                color: "var(--text-dim)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}>
              {CONTENT.pageTitle}
            </div>
          )}
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
          <div
            className="w-12 h-px mb-16"
            style={{ background: "var(--gold-dim)" }}
          />
          <div className="max-w-lg text-center">
            <p
              className="font-narrator"
              style={{
                color: "var(--cream-muted)",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                fontStyle: "italic",
              }}>
              {CONTENT.summary.block1}
            </p>
            <p
              className="font-narrator mt-8"
              style={{
                color: "var(--text-dim)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}>
              {CONTENT.summary.block2}
            </p>
          </div>
          <div
            className="w-12 h-px mt-16"
            style={{ background: "var(--gold-dim)" }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/*  STORY DESK: Normal-flow remaining cards                      */}
      {/* ============================================================ */}
      <StoryDesk />

      {/* ============================================================ */}
      {/*  CONTAINER B: Particles → Funnel → Terminal                   */}
      {/* ============================================================ */}
      <div
        ref={containerBRef}
        data-sticky-zone
        style={{ height: `${CONTAINER_B_VH}vh` }}
        className="relative">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size]"
          style={{ background: "var(--bg)", zIndex: 1 }}>
          <div
            ref={vignetteEl}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, var(--bg) 100%)",
            }}
          />
          <div
            ref={beatGlowEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              opacity: 0,
              willChange: "opacity, background",
            }}
          />

          {/* Particle canvas, funnel SVG, narrator panels, mobile skills, mid narrator */}
          {particleFunnel.jsx}

          {/* Terminal + Narrative + Dot indicator */}
          {terminalReplay.jsx}
        </div>
      </div>
    </>
  );
}
