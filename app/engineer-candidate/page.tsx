"use client";

/**
 * EngineerCandidate — Single-file workstation build.
 *
 * Structure:
 *   Container (2000vh — see CONTAINER_VH)
 *     └─ Sticky viewport (V0's complete scroll: convergence + thesis + beats + crystallize)
 *     └─ Summary panel (inside container, scrolls up over sticky — exactly like V0)
 *   ParticleSection (800vh)
 *     └─ Sticky viewport (explosion + fall + funnel)
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
import { DevNav } from "../dev-nav";
import { smoothstep } from "./math";
import { ACT_BLUE, phaseLabel, CONTENT } from "./engineer-data";
import { BREAKPOINTS } from "@utilities";
import { CONTAINER_VH, CHROME, SCROLL_PHASES } from "./engineer-candidate.types";

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
import { useCrystallize } from "./use-crystallize";
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
/*  Component                                                          */
/* ================================================================== */

export default function EngineerCandidate() {
  const { isLg } = useBreakpointRefs();
  const isStandalone = usePathname() === "/engineer-candidate";

  /* ---- Refs owned by this orchestrator ---- */
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const summaryPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInViewRef = useRef<HTMLDivElement>(null);
  const flashEl = useRef<HTMLDivElement>(null);
  const vignetteEl = useRef<HTMLDivElement>(null);
  const beatGlowEl = useRef<HTMLDivElement>(null);
  const progressBarEl = useRef<HTMLDivElement>(null);
  const phaseEl = useRef<HTMLDivElement>(null);

  /* ---- Animation hooks (each owns its refs + scroll update + JSX) ---- */
  const convergence = useConvergence();
  const crystallize = useCrystallize({ isLgRef: isLg, flashRef: flashEl });
  const terminalReplay = useTerminalReplay({
    scrollContainerRef,
    beatGlowEl,
    vignetteEl,
  });
  const particleFunnel = useParticleFunnel({ isLgRef: isLg });

  /* ---- Title scramble ---- */
  const titleInView = useInView(titleInViewRef, { once: true, amount: 0.5 });
  const [titleActive, setTitleActive] = useState(false);
  useEffect(() => {
    if (titleInView) setTitleActive(true);
  }, [titleInView]);

  /* ---- Scroll progress (V0 — 2000vh) ---- */
  const { scrollYProgress: scrollProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollProgress, "change", (progress) => {
    /* ---- Curtain edge: where the summary panel top is on screen ---- */
    let curtainTop = window.innerHeight; // default: off-screen (no curtain)
    if (summaryPanelRef.current) {
      const summaryTop = summaryPanelRef.current.getBoundingClientRect().top;
      if (summaryTop < window.innerHeight) curtainTop = Math.max(0, summaryTop);
    }

    /* ---- Chrome (debug overlay) ---- */
    if (progressBarEl.current)
      progressBarEl.current.style.width = `${progress * 100}%`;
    if (phaseEl.current) {
      phaseEl.current.textContent = phaseLabel(progress);
      phaseEl.current.style.opacity = String(
        progress > SCROLL_PHASES.TITLE.start && progress < SCROLL_PHASES.CHROME_END ? CHROME.labelOpacity : 0,
      );
    }

    /* ---- Title fade: slow scroll fade + fast erase when panel arrives ---- */
    if (titleRef.current) {
      // Slow fade over a wide scroll range
      const slowFade = 1 - smoothstep(SCROLL_PHASES.TITLE.start, SCROLL_PHASES.TITLE.end * CHROME.titleSlowFadeMult, progress);
      // Fast erase when panel is on-screen — same curtainReveal as fragments
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

    /* ============================================================== */
    /*  MOVEMENT 1: CONVERGENCE — delegated to useConvergence          */
    /* ============================================================== */
    const viewportHeight = window.innerHeight;
    const isDesktop = isLg.current;
    convergence.update(progress, isDesktop, curtainTop, viewportHeight);

    /* ============================================================== */
    /*  PARTICLES → DOTS → RIBBONS + MID NARRATOR                      */
    /*  Delegated to useParticleFunnel hook                             */
    /* ============================================================== */
    particleFunnel.update(progress);

    /* ============================================================== */
    /*  MOVEMENT 2: TERMINAL REPLAY — delegated to useTerminalReplay   */
    /* ============================================================== */
    terminalReplay.update(progress, isDesktop);

    /* ============================================================== */
    /*  MOVEMENT 3: CRYSTALLIZE — delegated to useCrystallize hook     */
    /* ============================================================== */
    crystallize.update(progress);
  });

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      {isStandalone && <DevNav />}

      {/* ============================================================ */}
      {/*  SCROLL CONTAINER (2000vh) — V0's complete sequence           */}
      {/* ============================================================ */}
      <div
        ref={scrollContainerRef}
        data-sticky-zone
        style={{ height: `${CONTAINER_VH}vh` }}
        className="relative">
        <div
          ref={stickyViewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden [container-type:size] [--frag-scale:0.6] sm:[--frag-scale:0.85]"
          style={{ background: "var(--bg)", zIndex: 1 }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20"
            style={{ height: 0, opacity: 0, background: "var(--bg)" }}
          />

          {/* Convergence atmosphere, glow, embers — rendered by useConvergence hook */}
          {convergence.jsx}

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
            ref={flashEl}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "100vh",
              background:
                "radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(240,230,208,0.08) 30%, transparent 60%)",
              opacity: 0,
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

          {/* Convergence fragments + thesis — rendered by useConvergence hook */}

          {/* Particle canvas, funnel SVG, narrator panels, mobile skills, mid narrator — rendered by useParticleFunnel hook */}
          {particleFunnel.jsx}

          {/* Terminal + Narrative + Dot indicator — rendered by useTerminalReplay hook */}
          {terminalReplay.jsx}

          {/* Principles (crystallize) — rendered by useCrystallize hook */}
          {crystallize.jsx}

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
          <div
            ref={phaseEl}
            className="absolute bottom-12 left-8 font-sans tracking-widest uppercase"
            style={{
              color: "var(--gold-dim)",
              fontSize: "0.55rem",
              letterSpacing: "0.25em",
              opacity: 0,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "var(--stroke)" }}>
            <div
              ref={progressBarEl}
              className="h-full"
              style={{
                width: "0%",
                background: "var(--gold-dim)",
                transition: "none",
              }}
            />
          </div>
        </div>

        {/* ---- Post-section summary (INSIDE container, scrolls up over sticky) ---- */}
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

    </>
  );
}
