"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import type { Company } from "@data";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";
import {
  ACT_BLUE,
  BRANCH_LINE,
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
  CREAM,
  CREAM_MUTED,
  GOLD,
  GOLD_MUTED,
  PROMOTED,
  SECTION_BG,
  TAG_ALPHA_BG,
  TEXT_DIM,
  TEXT_FAINT,
} from "./act-ii.constants";

/* ══════════════════════════════════════════════════════════════
 * Desktop timeline phases (normalized 0→1)
 *   0 → 0.35   dissolve: words/meta fade, seed words remain
 *   0.35 → 1.0  fly + settle: seeds fly to targets, fills appear,
 *                color shifts to final question styling
 *
 * Mobile: source hidden, seed words float in, then fills appear.
 *
 * Driven by GSAP ScrollTrigger — scrub gives immediate feedback,
 * snap (desktop only) prevents parking in intermediate states.
 * ══════════════════════════════════════════════════════════════ */

const SCROLL_PHASES = { flyStart: 0.35 } as const;

/* ── Word reveal hook for principle typing effect ── */
function useWordReveal(text: string, active: boolean, delayMs = 600, wordIntervalMs = 80) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(" ");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const timeout = setTimeout(() => {
      let count = 0;
      intervalRef.current = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= words.length && intervalRef.current) clearInterval(intervalRef.current);
      }, wordIntervalMs);
    }, delayMs);
    return () => { clearTimeout(timeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, words.length, delayMs, wordIntervalMs]);

  return { words, visibleCount };
}

/** Snap points — three stable states:
 *  0    = source entries (start)
 *  0.75 = questions settled, spotlight interactive
 *  1    = unpin, scroll to takeaway */
const SNAP_COMMIT = 0.15;   // below this → snap back to 0
const SNAP_SETTLED = 0.75;  // questions fully formed, stay here for interaction
const SNAP_EXIT = 0.88;     // above this from settled → snap forward to 1

/* ══════════════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════════════ */

interface WordDistillationProps {
  readonly companies: readonly Company[];
  /** Ref to the scroll runway element (the tall div that creates scrub distance) */
  readonly scrollTarget: RefObject<HTMLDivElement | null>;
}

/* ══════════════════════════════════════════════════════════════
 * Component
 * ══════════════════════════════════════════════════════════════ */

export function WordDistillation({ companies, scrollTarget }: WordDistillationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef  = useRef<gsap.core.Timeline | null>(null);
  const clonesRef    = useRef<HTMLElement[]>([]);

  const seedRefs   = useRef<Map<string, HTMLSpanElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const prefersReducedMotion = useReducedMotion();

  /** true once GSAP scrub reaches ~0.70 and questions are fully formed */
  const [settled, setSettled] = useState(false);
  const settledRef = useRef(false);

  /** Full Takeover interaction state */
  const [focused, setFocused] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const revealDoneRef = useRef(false);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = useCallback((i: number) => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setHovered(i);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      revealDoneRef.current = false;
      setHovered(null);
      setFocused(i);
    }, 400);
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
    if (commitTimer.current) { clearTimeout(commitTimer.current); commitTimer.current = null; }
    leaveTimer.current = setTimeout(() => {
      setFocused((prev) => {
        if (prev !== null && (revealDoneRef.current || answered.has(prev))) {
          setAnswered((a) => new Set(a).add(prev));
        }
        revealDoneRef.current = false;
        return null;
      });
    }, 80);
  }, [answered]);

  /* Tracks which seed words have been claimed during this render.
   * Local variable (not ref) — safe in concurrent mode since it's
   * deterministic and scoped to a single render pass. */
  const claimedSeeds = new Set<string>();

  /* ── Build ScrollTrigger-driven GSAP timeline ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    const trigger = scrollTarget.current;
    if (!container || !trigger) return;

    let frameId: number;

    const buildTimeline = () => {
      /* Clean previous timeline + ScrollTrigger */
      timelineRef.current?.scrollTrigger?.kill();
      timelineRef.current?.kill();
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
      /* Ensure container is visible — nav scroll handler may have hidden it */
      container.style.visibility = "";

      /* Wait one frame for refs to populate after render */
      frameId = requestAnimationFrame(() => {
        const isPhone = container.clientWidth < 640;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger,
            /* Mobile: start scrub early so words build while container
             * is still scrolling up — eliminates dead empty screen.
             * Desktop: start at pin point (top top) as before. */
            start: isPhone ? "top 40%" : "top top",
            end: "bottom bottom",
            scrub: 0.5,
            /* Desktop: snap prevents parking in ugly mid-dissolve states.
             * Mobile: no snap — simple fade animation, no intermediate states to hide.
             * Snapping to 1 on mobile unpins the sticky container too early. */
            onUpdate: (self) => {
              const done = self.progress >= 0.70;
              if (done !== settledRef.current) {
                settledRef.current = done;
                setSettled(done);
                if (!done) {
                  setFocused(null);
                  setHovered(null);
                  /* Keep answered state — principles persist across scroll cycles */
                }
              }
            },
            ...(isPhone ? {} : {
              snap: {
                snapTo: (end: number) => {
                  if (end < SNAP_COMMIT) return 0;
                  if (end < SNAP_EXIT) return SNAP_SETTLED;
                  return 1;
                },
                duration: { min: 0.8, max: 2.0 },
                ease: "power2.inOut",
              },
            }),
          },
        });
        /* Force total duration = 1 so scroll maps to normalized phases */
        const durationForcer = { v: 0 };
        timeline.set(durationForcer, { v: 1 }, 1);

        const sourceDiv = container.querySelector("[data-source]") as HTMLElement;
        const targetDiv = container.querySelector("[data-target]") as HTMLElement;
        const entriesDiv = container.querySelector("[data-entries]") as HTMLElement;

        /* ── Responsive fit ──
         * If entries overflow vertically on a wide viewport,
         * switch to a 2-column grid to use horizontal space.
         * Branch lines/dots are hidden in grid mode since
         * the vertical connector metaphor doesn't apply. */
        if (entriesDiv && !isPhone) {
          const sourceInner = entriesDiv.parentElement as HTMLElement | null;

          /* Reset previous layout adjustments so we measure natural size */
          entriesDiv.style.display = "";
          entriesDiv.style.gridTemplateColumns = "";
          entriesDiv.style.gap = "";
          if (sourceInner) sourceInner.style.maxWidth = "";

          const entryEls = entriesDiv.querySelectorAll<HTMLElement>("[data-entry]");
          const branchEls = entriesDiv.querySelectorAll<HTMLElement>("[data-branch]");
          const trimEls = entriesDiv.querySelectorAll<HTMLElement>("[data-trim]");
          const commitLists = entriesDiv.querySelectorAll<HTMLElement>("ul");
          entryEls.forEach((el) => {
            el.style.marginLeft = ""; el.style.paddingLeft = "";
            el.style.paddingTop = ""; el.style.paddingBottom = "";
            el.style.fontSize = "";
          });
          branchEls.forEach((el) => { el.style.display = ""; });
          trimEls.forEach((el) => { el.style.display = ""; });
          commitLists.forEach((el) => { el.style.marginTop = ""; el.style.gap = ""; });

          const entriesHeight = entriesDiv.scrollHeight;
          const containerHeight = container.clientHeight;

          if (entriesHeight > containerHeight * 0.92 && container.clientWidth >= 768) {
            /* 2-column grid using horizontal space */
            entriesDiv.style.display = "grid";
            entriesDiv.style.gridTemplateColumns = "repeat(2, 1fr)";
            entriesDiv.style.gap = "0 1.5rem";
            if (sourceInner) sourceInner.style.maxWidth = "64rem";

            /* Hide branch visuals (no vertical connector in grid) */
            branchEls.forEach((el) => { el.style.display = "none"; });

            /* Hide decorative metadata: hash, location/period, tags */
            trimEls.forEach((el) => { el.style.display = "none"; });

            /* Tighten entry padding & shrink text one notch */
            entryEls.forEach((el) => {
              el.style.marginLeft = "0";
              el.style.paddingLeft = "0.75rem";
              el.style.paddingTop = "0.625rem";
              el.style.paddingBottom = "0.625rem";
              el.style.fontSize = "0.8125rem"; /* 13px base — company names */
            });

            /* Tighten commit list spacing */
            commitLists.forEach((el) => {
              el.style.marginTop = "0.5rem";
              el.style.gap = "0.125rem";
            });
          }
        }

        /* ── PHONE: seed words float in, then fill words complete questions ──
         * Users already see commit entries in the terminal above.
         * On mobile, seed words arrive first (the "essence"), then the
         * surrounding words fade in to form the full questions. */
        if (isPhone) {
          /* Hide source immediately — not in the timeline — so it's
           * never visible before GSAP scrub starts. */
          if (sourceDiv) sourceDiv.style.visibility = "hidden";
          if (targetDiv) {
            targetDiv.style.visibility = "visible";

            /* All words start hidden — applied immediately, not via timeline */
            const seeds = targetDiv.querySelectorAll<HTMLElement>("[data-seed]");
            const fills = targetDiv.querySelectorAll<HTMLElement>("[data-fill]");
            seeds.forEach((el) => { gsap.set(el, { opacity: 0, visibility: "visible", y: 16, filter: "blur(4px)" }); });
            fills.forEach((el) => { gsap.set(el, { opacity: 0, y: 6 }); });

            /* Phase 1 (0.02 → 0.17): Seed words float up quickly */
            timeline.to(seeds, {
              opacity: 1, y: 0, filter: "blur(0px)",
              duration: 0.15,
              stagger: { each: 0.008, from: "random" },
              ease: "power2.out",
            }, 0.02);

            /* Phase 2 (0.15 → 0.30): Fill words appear immediately after */
            timeline.to(fills, {
              opacity: 1, y: 0,
              duration: 0.15,
              stagger: { each: 0.004, from: "random" },
              ease: "power2.out",
            }, 0.15);
          }

          timelineRef.current = timeline;
          return;
        }

        /* ── TABLET/DESKTOP: full dissolve + fly animation ── */

        const { flyStart } = SCROLL_PHASES;
        const flyDuration = 1 - flyStart;   // 0.65

        /* ── DISSOLVE PHASE (0 → 0.35) ── */

        timeline.to(container.querySelectorAll("[data-dissolve]"), {
          opacity: 0, y: -8, filter: "blur(4px)",
          duration: 0.35,
          stagger: { each: 0.002, from: "random" },
          ease: "power2.in",
        }, 0);

        timeline.to(container.querySelectorAll("[data-meta]"), {
          opacity: 0, y: -6, filter: "blur(3px)",
          duration: 0.30,
          stagger: 0.005,
          ease: "power2.in",
        }, 0);

        /* Branch lines fade via [data-meta] above — no separate border tween needed */

        /* Show target at fly start. Source div stays visible — dissolved
         * content is already fading via tweens. Source hides late to avoid
         * abrupt snap (matches prototype where source hides at "done"). */
        if (targetDiv) timeline.set(targetDiv, { visibility: "visible" }, flyStart);
        if (sourceDiv) timeline.set(sourceDiv, { visibility: "hidden" }, flyStart + flyDuration * 0.5);

        /* ── FLY PHASE (0.35 → 1.0) ──
         * Clone flies from source → target while blurring out.
         * Target fades in from blur — the overlap masks the mono→spectral font switch.
         * All seeds fly simultaneously (no per-company stagger) matching prototype. */

        const allSeeds = companies.flatMap((c) =>
          c.distillation.seedWords.map((w) => ({ hash: c.hash, word: w })),
        );
        const clones: HTMLElement[] = [];

        for (const { hash, word } of allSeeds) {
          const key    = `${hash}-${word}`;
          const source = seedRefs.current.get(key);
          const target = targetRefs.current.get(key);
          if (!source || !target) continue;

          const sourceRect    = source.getBoundingClientRect();
          const targetRect    = target.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const sourceX = sourceRect.left - containerRect.left;
          const sourceY = sourceRect.top  - containerRect.top;
          const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
          const deltaY = (targetRect.top  + targetRect.height / 2) - (sourceRect.top  + sourceRect.height / 2);

          /* Create clone — starts visibility:hidden, swapped atomically with source */
          const clone = document.createElement("span");
          clone.textContent = word;
          Object.assign(clone.style, {
            position: "absolute", left: `${sourceX}px`, top: `${sourceY}px`,
            fontFamily: "var(--font-mono)",
            fontSize: window.getComputedStyle(source).fontSize,
            color: CREAM, pointerEvents: "none",
            willChange: "transform, opacity, filter",
            zIndex: "50", transformOrigin: "center center",
            visibility: "hidden",
          });
          container.appendChild(clone);
          clones.push(clone);

          /* Atomic swap: hide source seed word, show clone */
          timeline.set(source, { visibility: "hidden" }, flyStart);
          timeline.set(clone,  { visibility: "visible" }, flyStart);

          /* Fly clone to target — duration/timing scaled from prototype
           * (prototype total fly ≈ 1.35s, mapped proportionally to flyDuration) */
          timeline.to(clone, {
            x: deltaX, y: deltaY,
            duration: flyDuration * 0.48,
            ease: "power3.inOut",
          }, flyStart);

          /* Clone blurs + fades out as it approaches target (single tween) */
          timeline.to(clone, {
            opacity: 0, filter: "blur(6px)",
            duration: flyDuration * 0.15,
            ease: "power2.in",
          }, flyStart + flyDuration * 0.37);

          /* Target word de-blurs in — overlaps clone fadeout for smooth crossfade */
          timeline.set(target, { opacity: 0, filter: "blur(6px)" }, flyStart);
          timeline.to(target, {
            opacity: 1, filter: "blur(0px)", visibility: "visible",
            duration: flyDuration * 0.15, ease: "power2.out",
          }, flyStart + flyDuration * 0.41);

          /* Settle target color — long duration matching prototype */
          timeline.to(target, {
            color: CREAM_MUTED,
            duration: flyDuration * 0.44,
            ease: "power1.inOut",
          }, flyStart + flyDuration * 0.56);
        }

        /* Fill words (non-seed words in the questions).
         * Use set + to (not fromTo) — fromTo is unreliable in paused/scrubbed timelines. */
        const fillEls = Array.from(container.querySelectorAll("[data-fill]"));
        if (fillEls.length) {
          timeline.set(fillEls, { opacity: 0, y: 6 }, 0);
          timeline.to(fillEls, {
            opacity: 1, y: 0,
            duration: flyDuration * 0.20,
            stagger: flyDuration * 0.008,
            ease: "power2.out",
          }, flyStart + flyDuration * 0.08);
        }

        clonesRef.current = clones;
        timelineRef.current = timeline;
        /* ScrollTrigger auto-syncs to current scroll position */
      });
    };

    buildTimeline();

    /* Rebuild on resize — clone fly paths bake pixel positions from
     * getBoundingClientRect, so they go stale if the viewport changes.
     * Debounced to avoid thrashing during continuous resize.
     * Guard: only rebuild if the viewport actually changed size —
     * ignore dimension shifts from overlay mount/unmount (settled toggle). */
    let resizeTimer: ReturnType<typeof setTimeout>;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const observer = new ResizeObserver(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildTimeline, 200);
    });
    observer.observe(container);

    /* Disable snap during programmatic nav scrolls so ScrollTrigger
     * doesn't fight the scroll-to and leave content "stuck" visible.
     * Scrub stays active so the timeline follows the scroll naturally. */
    let snapRestore: ReturnType<typeof setTimeout>;
    const onNavScroll = () => {
      const st = timelineRef.current?.scrollTrigger;
      if (!st) return;
      /* Immediately hide so nothing flashes during nav scroll */
      container.style.visibility = "hidden";
      st.vars.snap = undefined;
      clearTimeout(snapRestore);
      snapRestore = setTimeout(() => {
        container.style.visibility = "";
        if (!timelineRef.current?.scrollTrigger) return;
        timelineRef.current.scrollTrigger.vars.snap = {
          snapTo: (end: number) => {
            if (end < SNAP_COMMIT) return 0;
            if (end < SNAP_EXIT) return SNAP_SETTLED;
            return 1;
          },
          duration: { min: 0.8, max: 2.0 },
          ease: "power2.inOut",
        };
      }, 1200);
    };
    window.addEventListener(NAVIGATION_SCROLL_EVENT, onNavScroll);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      clearTimeout(snapRestore);
      container.style.visibility = "";
      observer.disconnect();
      window.removeEventListener(NAVIGATION_SCROLL_EVENT, onNavScroll);
      timelineRef.current?.scrollTrigger?.kill();
      timelineRef.current?.kill();
      timelineRef.current = null;
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
    };
  }, [companies, prefersReducedMotion, scrollTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Reduced motion: show final state with Full Takeover interaction ── */
  if (prefersReducedMotion) {
    return (
      <FullTakeoverOverlay
        companies={companies}
        focused={focused}
        hovered={hovered}
        answered={answered}
        onHover={handleHover}
        onLeave={handleLeave}
        onRevealDone={() => { revealDoneRef.current = true; }}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">

      {/* ── Source: commit entries ── */}
      <div data-source="" className="absolute inset-0 flex flex-col">
        <div className="my-auto w-full max-w-2xl mx-auto px-(--page-gutter) shrink-0">
          <div data-entries="" className="flex flex-col">
            {companies.map((company, companyIndex) => {
              const isLast   = companyIndex === companies.length - 1;
              const dotColor = company.promoted ? PROMOTED : ACT_BLUE;
              const seedSet  = new Set(company.distillation.seedWords);

              return (
                <div
                  key={company.hash}
                  data-entry=""
                  className="relative ml-1.5 py-5 pl-7 pr-4"
                >
                  {/* Branch line */}
                  <div
                    data-meta="" data-branch=""
                    className="absolute left-0 w-0.5"
                    style={{
                      top: companyIndex === 0 ? "26px" : 0,
                      bottom: isLast ? "calc(100% - 26px)" : 0,
                      backgroundColor: BRANCH_LINE,
                    }}
                  />
                  {/* Branch dot */}
                  <div
                    data-meta="" data-branch=""
                    className="absolute -left-[7px] top-[26px] h-3 w-3 rounded-full border-2"
                    style={{ borderColor: dotColor, backgroundColor: company.promoted ? dotColor : SECTION_BG }}
                  />

                  <div data-meta="" data-trim="" className="mb-1 font-mono text-[11px] tracking-[0.05em]" style={{ color: GOLD }}>
                    {company.hash}
                  </div>
                  <div data-meta="" className="text-sm font-bold sm:text-base lg:text-lg" style={{ color: CREAM }}>
                    {company.company}
                  </div>
                  <div data-meta="" className="mt-0.5 font-mono text-xs" style={{ color: ACT_BLUE }}>
                    {company.role}
                  </div>
                  <div data-meta="" data-trim="" className="mt-1 font-mono text-[11px]" style={{ color: TEXT_DIM }}>
                    {company.location} · {company.period}
                  </div>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {company.commits.map((commit, commitIndex) => (
                      <li key={commitIndex} className="font-mono text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
                        <span data-dissolve="" style={{ color: COMMIT_TYPE_COLORS[commit.type] ?? COMMIT_TYPE_FALLBACK }}>
                          {commit.type}
                        </span>
                        <span data-dissolve="" style={{ color: TEXT_FAINT }}>: </span>
                        {commit.msg.split(/\s+/).map((word, wordIndex) => {
                          const lower   = word.toLowerCase().replace(/[^a-z]/g, "");
                          const refKey  = `${company.hash}-${lower}`;
                          const isSeed  = seedSet.has(lower) && !claimedSeeds.has(refKey);
                          const msgWords = commit.msg.split(/\s+/);

                          if (isSeed) {
                            claimedSeeds.add(refKey);
                            return (
                              <span key={wordIndex} ref={(el) => { if (el) seedRefs.current.set(refKey, el); }}
                                className="inline-block" style={{ color: CREAM }}>
                                {word}{wordIndex < msgWords.length - 1 ? "\u00A0" : ""}
                              </span>
                            );
                          }
                          return (
                            <span key={wordIndex} data-dissolve="" className="inline-block" style={{ color: CREAM_MUTED }}>
                              {word}{wordIndex < msgWords.length - 1 ? "\u00A0" : ""}
                            </span>
                          );
                        })}
                      </li>
                    ))}
                  </ul>

                  <div data-meta="" data-trim="" className="mt-3 flex flex-wrap gap-2">
                    {company.tags.map((tag) => (
                      <span key={tag.text} className="rounded px-2 py-0.5 font-mono text-[10px]"
                        style={{ backgroundColor: `${tag.color}${TAG_ALPHA_BG}`, color: tag.color }}>
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Target: GSAP-driven question words (seeds fly in, fills appear) ── */}
      <div
        data-target=""
        className="absolute inset-0 flex flex-col"
        style={{ visibility: "hidden", opacity: settled ? 0 : undefined, transition: "opacity 0.4s ease" }}
      >
        <div className="my-auto w-full max-w-xl mx-auto px-(--page-gutter)">
          <div className="flex flex-col items-center gap-[2.5cqh]">
            {companies.map((company) => {
              const seedSet = new Set(company.distillation.seedWords);
              const words   = company.distillation.question.split(" ");

              return (
                <div key={company.hash} className="w-full text-center">
                  <p data-question="" className="italic tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 3cqh, 26px)", lineHeight: 1.5, color: CREAM_MUTED }}>
                    {words.map((word, wordIndex) => {
                      const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
                      const isSeed  = seedSet.has(stripped);
                      const refKey  = `${company.hash}-${stripped}`;

                      return (
                        <span key={wordIndex}>
                          {isSeed ? (
                            <span data-seed="" ref={(el) => { if (el) targetRefs.current.set(refKey, el); }}
                              className="inline-block" style={{ color: CREAM, visibility: "hidden", opacity: 0 }}>
                              {word}
                            </span>
                          ) : (
                            <span data-fill="" className="inline-block" style={{ opacity: 0 }}>{word}</span>
                          )}
                          {wordIndex < words.length - 1 && " "}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Full Takeover overlay — appears once settled ── */}
      {settled && (
        <FullTakeoverOverlay
          companies={companies}
          focused={focused}
          hovered={hovered}
          answered={answered}
          onHover={handleHover}
          onLeave={handleLeave}
          onRevealDone={() => { revealDoneRef.current = true; }}
        />
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * Mouse repulsion — same physics as Act I chaos-to-order.
 * Questions push away from cursor like water, spring-settle back.
 * ══════════════════════════════════════════════════════════════ */

const REPULSE_RADIUS = 400;
const REPULSE_STRENGTH = 60;
const REPULSE_MAX = 50;
const REPULSE_SPRING = { stiffness: 35, damping: 10, mass: 2 };
const REPULSE_WEIGHTS = [0.9, 1.2, 0.75, 1.05];

function useMouseRepulsion(
  containerRef: React.RefObject<HTMLDivElement | null>,
  itemRef: React.RefObject<HTMLDivElement | null>,
  weight: number,
) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, REPULSE_SPRING);
  const y = useSpring(rawY, REPULSE_SPRING);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const el = itemRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPULSE_RADIUS && dist > 0) {
        const t = 1 - dist / REPULSE_RADIUS;
        const force = Math.min(t * t * REPULSE_STRENGTH * weight, REPULSE_MAX);
        rawX.set((dx / dist) * force);
        rawY.set((dy / dist) * force);
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };

    const onLeave = () => { rawX.set(0); rawY.set(0); };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef, itemRef, rawX, rawY, weight]);

  return { x, y };
}

function RepulsiveQuestion({
  company, index, isAns, isHov, isDimmed, containerRef, onHover, onLeave,
}: {
  company: Company; index: number; isAns: boolean; isHov: boolean; isDimmed: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHover: () => void; onLeave: () => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMouseRepulsion(containerRef, itemRef, REPULSE_WEIGHTS[index] ?? 1);

  return (
    <motion.div ref={itemRef} style={{ x, y }}>
      <motion.p
        role="button"
        tabIndex={0}
        aria-label={isAns
          ? `${company.distillation.principle} — hover to see the question and detail`
          : `${company.distillation.question} — hover to reveal the answer`}
        className={isAns ? "text-center tracking-[-0.01em]" : "text-center italic tracking-[-0.01em]"}
        style={{
          fontFamily: "var(--font-spectral)",
          fontSize: "clamp(14px, 3cqh, 26px)",
          lineHeight: 1.5,
          letterSpacing: isAns ? "0.01em" : undefined,
          cursor: "pointer",
        }}
        animate={{
          color: isHov ? CREAM : isAns ? GOLD_MUTED : CREAM_MUTED,
          opacity: isDimmed ? 0.35 : 1,
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onFocus={onHover}
        onBlur={onLeave}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHover(); } }}
      >
        {isAns ? company.distillation.principle : company.distillation.question}
      </motion.p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * Full Takeover — post-settled interaction
 *
 * The entire view is one AnimatePresence. Idle = list of questions.
 * Hover highlights one (400ms delay), then the whole view crossfades
 * to that item's reveal (question → word-by-word principle → detail).
 * Answered items show as gold principles in the idle list.
 * Questions repel from cursor (chaos-to-order style spring physics).
 * ══════════════════════════════════════════════════════════════ */

function FullTakeoverOverlay({
  companies,
  focused,
  hovered,
  answered,
  onHover,
  onLeave,
  onRevealDone,
}: {
  companies: readonly Company[];
  focused: number | null;
  hovered: number | null;
  answered: Set<number>;
  onHover: (i: number) => void;
  onLeave: () => void;
  onRevealDone: () => void;
}) {
  const activeCompany = focused !== null ? companies[focused] : null;
  const repulseContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={repulseContainerRef} className="absolute inset-0 z-20 flex flex-col" style={{ backgroundColor: "var(--bg, #07070A)" }}>
      <div className="my-auto w-full max-w-xl mx-auto px-(--page-gutter)">
        <AnimatePresence mode="wait">
          {focused === null ? (
            <motion.div
              key="list"
              className="flex flex-col items-center gap-[2.5cqh]"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
            >
              {companies.map((company, i) => (
                <RepulsiveQuestion
                  key={company.hash}
                  company={company}
                  index={i}
                  isAns={answered.has(i)}
                  isHov={hovered === i}
                  isDimmed={hovered !== null && hovered !== i}
                  containerRef={repulseContainerRef}
                  onHover={() => onHover(i)}
                  onLeave={onLeave}
                />
              ))}
            </motion.div>
          ) : (
            <TakeoverReveal
              key={`reveal-${focused}`}
              company={activeCompany!}
              isAnswered={answered.has(focused)}
              onDone={onRevealDone}
              onLeave={onLeave}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TakeoverReveal({
  company,
  isAnswered,
  onDone,
  onLeave,
}: {
  company: Company;
  isAnswered: boolean;
  onDone: () => void;
  onLeave: () => void;
}) {
  const delay = isAnswered ? 100 : 400;
  const interval = isAnswered ? 35 : 65;
  const { words, visibleCount } = useWordReveal(company.distillation.principle, true, delay, interval);
  const allRevealed = visibleCount >= words.length;
  const notified = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allRevealed && !notified.current) { notified.current = true; onDone(); }
  }, [allRevealed, onDone]);

  /* Click anywhere outside text → dismiss */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) onLeave();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onLeave]);

  /* ESC → dismiss */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onLeave(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLeave]);

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.5 }}
    >
      <div ref={contentRef} className="w-fit" onMouseLeave={onLeave}>
        {/* Question */}
        <motion.p
          className="italic tracking-[-0.01em] text-center"
          style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 3cqh, 26px)", lineHeight: 1.5, color: CREAM }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {company.distillation.question}
        </motion.p>

        {/* Principle — word by word */}
        <p
          className="mt-[2cqh] text-center"
          style={{
            fontFamily: "var(--font-spectral)",
            fontSize: "clamp(16px, 3.5cqh, 32px)",
            lineHeight: 1.4,
            color: isAnswered ? GOLD_MUTED : CREAM,
            letterSpacing: "-0.01em",
          }}
        >
          {words.map((w, wi) => (
            <motion.span
              key={wi}
              className="inline-block"
              initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
              animate={{
                opacity: wi < visibleCount ? 1 : 0,
                y: wi < visibleCount ? 0 : 5,
                filter: wi < visibleCount ? "blur(0px)" : "blur(4px)",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {w}{wi < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </p>

        {/* Detail */}
        <motion.p
          className="mx-auto mt-[1.5cqh] max-w-lg text-center"
          style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(11px, 1.8cqh, 15px)", lineHeight: 1.75, color: TEXT_DIM }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: allRevealed ? 1 : 0, y: allRevealed ? 0 : 8 }}
          transition={{ duration: 0.5 }}
        >
          {company.distillation.detail}
        </motion.p>
      </div>
    </motion.div>
  );
}
