"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
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
 *
 *   0    → 0.22   dissolve: non-seed words & metadata fade out fully
 *   0.22 → 0.25   seeds stand alone in original positions
 *   0.25 → 0.42   fly: seed clones fly to target positions,
 *                  target words de-blur, fill words appear
 *   0.42 → 0.44   hold: all 4 formed questions visible (linger)
 *   0.44 → 0.50   target fade: centered questions dissolve softly
 *   0.50 → 0.95   sequential crossfade: 4 items cycle one at a time
 *                  (question left, principle+detail right, parallax drift)
 *   0.95 → 1.0    last item fades out, scroll continues to takeaway
 *
 * Mobile: source hidden, seed words float in, then fills appear.
 *
 * Driven by a single GSAP ScrollTrigger timeline — scrub gives
 * immediate feedback. Snap guides users to reading positions
 * so they don't get stuck mid-transition.
 * ══════════════════════════════════════════════════════════════ */

const P = {
  dissolveEnd: 0.22,
  flyStart: 0.25,
  flyEnd: 0.38,
  holdEnd: 0.40,
  targetFadeEnd: 0.45,
  crossfadeStart: 0.45,
  crossfadeEnd: 0.96,
} as const;

/* ══════════════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════════════ */

interface WordDistillationProps {
  readonly companies: readonly Company[];
  readonly scrollTarget: RefObject<HTMLDivElement | null>;
}

/* ══════════════════════════════════════════════════════════════
 * Component
 * ══════════════════════════════════════════════════════════════ */

export function WordDistillation({ companies, scrollTarget }: WordDistillationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const clonesRef = useRef<HTMLElement[]>([]);

  const seedRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const prefersReducedMotion = useReducedMotion();

  /* Tracks which seed words have been claimed during this render pass. */
  const claimedSeeds = new Set<string>();

  /* ── Build ScrollTrigger-driven GSAP timeline ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    const trigger = scrollTarget.current;
    if (!container || !trigger) return;

    let frameId = 0;

    const buildTimeline = () => {
      timelineRef.current?.scrollTrigger?.kill();
      timelineRef.current?.kill();
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
      container.style.visibility = "";

      frameId = requestAnimationFrame(() => {
        const isPhone = container.clientWidth < 640;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            /* No snap — free-scroll throughout. Snap was causing the scrub
             * to fight programmatic scrolls and jump past transition phases. */
          },
        });
        /* Force total duration = 1 so scroll maps to normalized phases */
        const durationForcer = { v: 0 };
        timeline.set(durationForcer, { v: 1 }, 1);

        const targetDiv = container.querySelector("[data-target]") as HTMLElement;
        const entriesDiv = container.querySelector("[data-entries]") as HTMLElement;
        const crossfadeDiv = container.querySelector("[data-crossfade]") as HTMLElement;

        /* ── Responsive fit ──
         * If entries overflow vertically on a wide viewport,
         * switch to a 2-column grid to use horizontal space. */
        if (entriesDiv && !isPhone) {
          const sourceInner = entriesDiv.parentElement as HTMLElement | null;

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
            entriesDiv.style.display = "grid";
            entriesDiv.style.gridTemplateColumns = "repeat(2, 1fr)";
            entriesDiv.style.gap = "0 1.5rem";
            if (sourceInner) sourceInner.style.maxWidth = "64rem";

            branchEls.forEach((el) => { el.style.display = "none"; });
            trimEls.forEach((el) => { el.style.display = "none"; });

            entryEls.forEach((el) => {
              el.style.marginLeft = "0";
              el.style.paddingLeft = "0.75rem";
              el.style.paddingTop = "0.625rem";
              el.style.paddingBottom = "0.625rem";
              el.style.fontSize = "0.8125rem";
            });

            commitLists.forEach((el) => {
              el.style.marginTop = "0.5rem";
              el.style.gap = "0.125rem";
            });
          }
        }

        /* ── PHONE: sequential crossfade only ──
         * Source & target divs are hidden via CSS (sm:flex).
         * Full scroll range is devoted to the crossfade items. */
        if (isPhone) {
          const MP = {
            crossfadeStart: 0.0,
            crossfadeEnd: 1.0,
          } as const;

          /* ── Mobile sequential crossfade ── */
          if (crossfadeDiv) {
            timeline.set(crossfadeDiv, { visibility: "visible" }, MP.crossfadeStart);

            const count = companies.length;
            const totalSpan = MP.crossfadeEnd - MP.crossfadeStart;
            const itemSpan = totalSpan / count;

            for (let i = 0; i < count; i++) {
              const itemEl = crossfadeDiv.querySelector(`[data-crossfade-item="${i}"]`) as HTMLElement;
              if (!itemEl) continue;

              const questionEl = itemEl.querySelector("[data-cf-question]") as HTMLElement;
              const principleEl = itemEl.querySelector("[data-cf-principle]") as HTMLElement;
              const detailEl = itemEl.querySelector("[data-cf-detail]") as HTMLElement;

              const zStart = MP.crossfadeStart + i * itemSpan;

              /* Sub-phase keyframes */
              const questionIn   = zStart;
              const questionDone = zStart + itemSpan * 0.20;
              const principleIn  = zStart + itemSpan * 0.20;
              const principleDone= zStart + itemSpan * 0.40;
              const detailIn     = zStart + itemSpan * 0.40;
              const detailDone   = zStart + itemSpan * 0.55;
              const holdEndItem  = zStart + itemSpan * 0.80;
              const fadeOutEnd   = Math.min(zStart + itemSpan, 1.0);

              /* Initial state */
              gsap.set(itemEl, { opacity: 0, visibility: "hidden" });
              if (questionEl) gsap.set(questionEl, { opacity: 0, y: 20 });
              if (principleEl) gsap.set(principleEl, { opacity: 0, y: 20 });
              if (detailEl) gsap.set(detailEl, { opacity: 0, y: 16 });

              /* Container visible */
              timeline.set(itemEl, { visibility: "visible" }, questionIn);
              timeline.to(itemEl, {
                opacity: 1,
                duration: questionDone - questionIn,
                ease: "power1.out",
              }, questionIn);

              /* Question fades in */
              if (questionEl) {
                timeline.to(questionEl, {
                  opacity: 1, y: 0,
                  duration: questionDone - questionIn,
                  ease: "power1.out",
                }, questionIn);
              }

              /* Principle fades in */
              if (principleEl) {
                timeline.to(principleEl, {
                  opacity: 1, y: 0,
                  duration: principleDone - principleIn,
                  ease: "power1.out",
                }, principleIn);
              }

              /* Detail fades in */
              if (detailEl) {
                timeline.to(detailEl, {
                  opacity: 1, y: 0,
                  duration: detailDone - detailIn,
                  ease: "power1.out",
                }, detailIn);
              }

              /* Last item holds — sticky container unpins naturally.
               * Other items fade out with subtle upward drift. */
              const isLastItem = i === count - 1;
              if (!isLastItem) {
                if (questionEl) {
                  timeline.to(questionEl, {
                    y: -12,
                    duration: fadeOutEnd - holdEndItem,
                    ease: "power1.in",
                  }, holdEndItem);
                }
                if (principleEl) {
                  timeline.to(principleEl, {
                    y: -12,
                    duration: fadeOutEnd - holdEndItem,
                    ease: "power1.in",
                  }, holdEndItem);
                }
                if (detailEl) {
                  timeline.to(detailEl, {
                    y: -12,
                    duration: fadeOutEnd - holdEndItem,
                    ease: "power1.in",
                  }, holdEndItem);
                }

                timeline.to(itemEl, {
                  opacity: 0,
                  duration: fadeOutEnd - holdEndItem,
                  ease: "power1.in",
                }, holdEndItem);
              }
            }
          }

          timelineRef.current = timeline;
          return;
        }

        /* ── TABLET/DESKTOP: dissolve → fly → hold → sequential crossfade ── */

        const { dissolveEnd, flyStart, flyEnd, holdEnd, targetFadeEnd, crossfadeStart, crossfadeEnd } = P;
        const flyDuration = flyEnd - flyStart;

        /* ── DISSOLVE PHASE (0 → dissolveEnd) ──
         * Short per-element duration + tight stagger so EVERYTHING
         * is fully gone before the fly phase begins. */

        /* ── GRAYSCALE FLASH (0 → ~0.06) ──
         * Non-seed text desaturates quickly so the user knows this is
         * a different context from the terminal above. Seed words stay
         * bright — they're the visual anchor for the fly phase.
         * Uses CSS filter: grayscale() to avoid ugly color interpolation. */
        const grayscaleEnd = 0.06;

        timeline.to(container.querySelectorAll("[data-dissolve]"), {
          filter: "grayscale(1)",
          duration: grayscaleEnd,
          ease: "power2.out",
        }, 0);

        timeline.to(container.querySelectorAll("[data-meta]"), {
          filter: "grayscale(1)",
          duration: grayscaleEnd,
          ease: "power2.out",
        }, 0);

        /* ── DISSOLVE (grayscaleEnd → dissolveEnd) ──
         * Already greyed-out elements now fade + blur away. */
        timeline.to(container.querySelectorAll("[data-dissolve]"), {
          opacity: 0, y: -8, filter: "grayscale(1) blur(4px)",
          duration: (dissolveEnd - grayscaleEnd) * 0.6,
          stagger: { each: 0.001, from: "random" },
          ease: "power2.in",
        }, grayscaleEnd);

        timeline.to(container.querySelectorAll("[data-meta]"), {
          opacity: 0, y: -6, filter: "grayscale(1) blur(3px)",
          duration: (dissolveEnd - grayscaleEnd) * 0.65,
          stagger: 0.002,
          ease: "power2.in",
        }, grayscaleEnd);

        /* Source div stays visible — non-seeds are dissolved, and each seed
         * ref is individually hidden when its clone takes over (below).
         * No sourceDiv hide = no blackness gap, seeds never vanish. */

        /* Show target slightly after fly starts (seeds are mid-flight) */
        if (targetDiv) timeline.set(targetDiv, { visibility: "visible" }, flyStart + flyDuration * 0.1);

        /* ── FLY PHASE (flyStart → flyEnd) ── */

        const allSeeds = companies.flatMap((c) =>
          c.distillation.seedWords.map((w) => ({ hash: c.hash, word: w })),
        );
        const clones: HTMLElement[] = [];

        for (const { hash, word } of allSeeds) {
          const key = `${hash}-${word}`;
          const source = seedRefs.current.get(key);
          const target = targetRefs.current.get(key);
          if (!source || !target) continue;

          const sourceRect = source.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const sourceX = sourceRect.left - containerRect.left;
          const sourceY = sourceRect.top - containerRect.top;
          const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
          const deltaY = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);

          const clone = document.createElement("span");
          clone.textContent = word;
          Object.assign(clone.style, {
            position: "absolute", left: `${sourceX}px`, top: `${sourceY}px`,
            fontFamily: "var(--font-ui)",
            fontSize: window.getComputedStyle(source).fontSize,
            color: CREAM, pointerEvents: "none",
            willChange: "transform, opacity, filter",
            zIndex: "50", transformOrigin: "center center",
            visibility: "hidden",
          });
          container.appendChild(clone);
          clones.push(clone);

          timeline.set(source, { visibility: "hidden" }, flyStart);
          timeline.set(clone, { visibility: "visible" }, flyStart);

          timeline.to(clone, {
            x: deltaX, y: deltaY,
            duration: flyDuration * 0.8,
            ease: "power3.inOut",
          }, flyStart);

          timeline.to(clone, {
            opacity: 0, filter: "blur(6px)",
            duration: flyDuration * 0.2,
            ease: "power2.in",
          }, flyStart + flyDuration * 0.65);

          timeline.set(target, { opacity: 0, filter: "blur(6px)" }, flyStart);
          timeline.to(target, {
            opacity: 1, filter: "blur(0px)", visibility: "visible",
            duration: flyDuration * 0.25, ease: "power2.out",
          }, flyStart + flyDuration * 0.7);

          /* Seed words keep their bright color on landing, then slowly
           * fade into the surrounding muted tone through the hold phase */
          timeline.to(target, {
            color: CREAM_MUTED,
            duration: holdEnd - flyEnd,
            ease: "power1.inOut",
          }, flyEnd);
        }

        /* Fill words */
        const fillEls = Array.from(container.querySelectorAll("[data-fill]"));
        if (fillEls.length) {
          timeline.set(fillEls, { opacity: 0, y: 6 }, 0);
          timeline.to(fillEls, {
            opacity: 1, y: 0,
            duration: flyDuration * 0.35,
            stagger: flyDuration * 0.015,
            ease: "power2.out",
          }, flyStart + flyDuration * 0.15);
        }

        /* ── HOLD (flyEnd → holdEnd): all 4 questions visible, brief pause ── */
        /* (nothing to tween — content is just visible) */

        /* ── TARGET FADE (holdEnd → targetFadeEnd): centered questions fade out ── */
        if (targetDiv) {
          timeline.to(targetDiv, {
            opacity: 0,
            duration: targetFadeEnd - holdEnd,
            ease: "sine.inOut",
          }, holdEnd);
        }

        /* ── SEQUENTIAL CROSSFADE (crossfadeStart → crossfadeEnd) ── */
        if (crossfadeDiv) {
          timeline.set(crossfadeDiv, { visibility: "visible" }, crossfadeStart);

          const count = companies.length;
          const totalSpan = crossfadeEnd - crossfadeStart;
          const itemSpan = totalSpan / count;

          for (let i = 0; i < count; i++) {
            const itemEl = crossfadeDiv.querySelector(`[data-crossfade-item="${i}"]`) as HTMLElement;
            if (!itemEl) continue;

            const questionEl = itemEl.querySelector("[data-cf-question]") as HTMLElement;
            const principleEl = itemEl.querySelector("[data-cf-principle]") as HTMLElement;
            const detailEl = itemEl.querySelector("[data-cf-detail]") as HTMLElement;
            const dividerEl = itemEl.querySelector("[data-cf-divider]") as HTMLElement;

            const zStart = crossfadeStart + i * itemSpan;

            /* Sub-phase keyframes — generous entry durations for soft arrivals.
             * With 620vh runway and 51% crossfade zone, each item gets ~80vh
             * of scroll — enough for every transition to breathe. */
            const questionIn   = zStart;
            const questionDone = zStart + itemSpan * 0.26;
            const principleIn  = zStart + itemSpan * 0.34;
            const principleDone= zStart + itemSpan * 0.50;
            const detailIn     = zStart + itemSpan * 0.50;
            const detailDone   = zStart + itemSpan * 0.62;
            const holdEndItem  = zStart + itemSpan * 0.78;
            const fadeOutEnd   = Math.min(zStart + itemSpan, 1.0);

            /* ── Initial state ──
             * 3-phase parallax: FLOAT IN → GENTLE DRIFT → FLOAT OUT.
             * Elements are never fully static — a very slow drift during
             * hold keeps the composition alive and fluid.
             *
             * Question: rises from below, drifts slowly up, exits up.
             * Principle: descends from above, drifts slowly down, exits down.
             * Detail: rises from below to join principle, drifts with it. */
            gsap.set(itemEl, { opacity: 0, visibility: "hidden" });
            if (questionEl) gsap.set(questionEl, { opacity: 0, y: 65 });
            if (principleEl) gsap.set(principleEl, { opacity: 0, y: -60 });
            if (detailEl) gsap.set(detailEl, { opacity: 0, y: 40 });
            if (dividerEl) gsap.set(dividerEl, { opacity: 0, scaleY: 0 });

            /* Container visible */
            timeline.set(itemEl, { visibility: "visible" }, questionIn);
            timeline.to(itemEl, {
              opacity: 1,
              duration: questionDone - questionIn,
              ease: "power1.out",
            }, questionIn);

            /* ── ENTRY: elements float to near-resting positions ──
             * power1.out = very gentle deceleration (less aggressive than sine.out).
             * Each element gradually slows into its reading position. */

            /* Question rises from below */
            if (questionEl) {
              timeline.to(questionEl, {
                opacity: 1, y: 4,
                duration: questionDone - questionIn,
                ease: "power1.out",
              }, questionIn);
            }

            /* Divider scales in during the linger gap */
            if (dividerEl) {
              timeline.to(dividerEl, {
                opacity: 1, scaleY: 1,
                duration: (principleIn - questionDone),
                ease: "sine.inOut",
              }, questionDone);
            }

            /* Principle descends from above */
            if (principleEl) {
              timeline.to(principleEl, {
                opacity: 1, y: -3,
                duration: principleDone - principleIn,
                ease: "power1.out",
              }, principleIn);
            }

            /* Detail rises from below to join the principle */
            if (detailEl) {
              timeline.to(detailEl, {
                opacity: 1, y: 2,
                duration: detailDone - detailIn,
                ease: "power1.out",
              }, detailIn);
            }

            /* ── HOLD: very slow drift keeps composition alive ──
             * Barely perceptible movement — elements continue in their
             * established direction but almost imperceptibly. */
            if (questionEl) {
              timeline.to(questionEl, {
                y: -4,
                duration: holdEndItem - detailDone,
                ease: "none",
              }, detailDone);
            }
            if (principleEl) {
              timeline.to(principleEl, {
                y: 3,
                duration: holdEndItem - detailDone,
                ease: "none",
              }, detailDone);
            }
            if (detailEl) {
              timeline.to(detailEl, {
                y: -2,
                duration: holdEndItem - detailDone,
                ease: "none",
              }, detailDone);
            }

            /* ── EXIT: gentle drift as composition dissolves ──
             * Last item holds — sticky container unpins naturally. */
            const isLastDesktop = i === count - 1;
            if (!isLastDesktop) {
              if (questionEl) {
                timeline.to(questionEl, {
                  y: -22,
                  duration: fadeOutEnd - holdEndItem,
                  ease: "power1.in",
                }, holdEndItem);
              }
              if (principleEl) {
                timeline.to(principleEl, {
                  y: 16,
                  duration: fadeOutEnd - holdEndItem,
                  ease: "power1.in",
                }, holdEndItem);
              }
              if (detailEl) {
                timeline.to(detailEl, {
                  y: 16,
                  duration: fadeOutEnd - holdEndItem,
                  ease: "power1.in",
                }, holdEndItem);
              }

              timeline.to(itemEl, {
                opacity: 0,
                duration: fadeOutEnd - holdEndItem,
                ease: "power1.in",
              }, holdEndItem);
            }
          }
        }

        clonesRef.current = clones;
        timelineRef.current = timeline;
      });
    };

    buildTimeline();

    /* Rebuild on resize — clone fly paths bake pixel positions */
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

    /* Hide during programmatic nav scrolls */
    let navRestoreTimer: ReturnType<typeof setTimeout>;
    const onNavScroll = () => {
      container.style.visibility = "hidden";
      clearTimeout(navRestoreTimer);
      navRestoreTimer = setTimeout(() => {
        container.style.visibility = "";
      }, 1200);
    };
    window.addEventListener(NAVIGATION_SCROLL_EVENT, onNavScroll);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      clearTimeout(navRestoreTimer);
      container.style.visibility = "";
      observer.disconnect();
      window.removeEventListener(NAVIGATION_SCROLL_EVENT, onNavScroll);
      timelineRef.current?.scrollTrigger?.kill();
      timelineRef.current?.kill();
      timelineRef.current = null;
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
    };
  }, [companies, prefersReducedMotion, scrollTarget]);

  /* ── Reduced motion: static crossfade items, no animation ── */
  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col gap-16 py-12 px-(--page-gutter)">
        {companies.map((company) => (
            <div
              key={company.hash}
              className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-8 sm:grid sm:items-center sm:gap-10"
              style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
              <div className="flex flex-col justify-center text-center sm:text-right">
                <p
                  className="italic tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 1.8vw, 19px)", lineHeight: 1.55, color: CREAM_MUTED }}
                >
                  {company.distillation.question}
                </p>
              </div>
              <div className="hidden sm:flex items-center"><div className="h-16 w-px" style={{ backgroundColor: "var(--stroke, #16161E)" }} /></div>
              <div className="flex flex-col items-center justify-center sm:items-start">
                <p style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(18px, 2.5vw, 28px)", lineHeight: 1.35, letterSpacing: "-0.01em", color: GOLD_MUTED }}>
                  {company.distillation.principle}
                </p>
                <p
                  className="mt-10 max-w-md text-center sm:text-left"
                  style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(12px, 1.2vw, 14px)", lineHeight: 1.75, color: TEXT_DIM }}
                >
                  {company.distillation.detail}
                </p>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">

      {/* ── Source: commit entries (desktop only) ── */}
      <div data-source="" className="absolute inset-0 hidden flex-col sm:flex">
        <div className="my-auto w-full max-w-2xl mx-auto px-(--page-gutter) shrink-0">
          <div data-entries="" className="flex flex-col">
            {companies.map((company, companyIndex) => {
              const isLast = companyIndex === companies.length - 1;
              const dotColor = company.promoted ? PROMOTED : ACT_BLUE;
              const seedSet = new Set(company.distillation.seedWords);

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

                  <div data-meta="" data-trim="" className="mb-1 font-ui text-[11px] tracking-[0.05em]" style={{ color: GOLD }}>
                    {company.hash}
                  </div>
                  <div data-meta="" className="text-sm font-bold sm:text-base lg:text-lg" style={{ color: CREAM }}>
                    {company.company}
                  </div>
                  <div data-meta="" className="mt-0.5 font-ui text-xs" style={{ color: ACT_BLUE }}>
                    {company.role}
                  </div>
                  <div data-meta="" data-trim="" className="mt-1 font-ui text-[11px]" style={{ color: TEXT_DIM }}>
                    {company.location} · {company.period}
                  </div>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {company.commits.map((commit, commitIndex) => (
                      <li key={commitIndex} className="font-ui text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
                        <span data-dissolve="" style={{ color: COMMIT_TYPE_COLORS[commit.type] ?? COMMIT_TYPE_FALLBACK }}>
                          {commit.type}
                        </span>
                        <span data-dissolve="" style={{ color: TEXT_FAINT }}>: </span>
                        {commit.msg.split(/\s+/).map((word, wordIndex) => {
                          const lower = word.toLowerCase().replace(/[^a-z]/g, "");
                          const refKey = `${company.hash}-${lower}`;
                          const isSeed = seedSet.has(lower) && !claimedSeeds.has(refKey);
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
                      <span key={tag.text} className="rounded px-2 py-0.5 font-ui text-[10px]"
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

      {/* ── Target: GSAP-driven question words (desktop only) ── */}
      <div
        data-target=""
        className="absolute inset-0 hidden flex-col sm:flex"
        style={{ visibility: "hidden" }}
      >
        <div className="my-auto w-full max-w-xl mx-auto px-(--page-gutter)">
          <div className="flex flex-col items-center gap-[2.5cqh]">
            {companies.map((company) => {
              const seedSet = new Set(company.distillation.seedWords);
              const words = company.distillation.question.split(" ");

              return (
                <div key={company.hash} className="w-full text-center">
                  <p data-question="" className="italic tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 3cqh, 26px)", lineHeight: 1.5, color: CREAM_MUTED }}>
                    {words.map((word, wordIndex) => {
                      const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
                      const isSeed = seedSet.has(stripped);
                      const refKey = `${company.hash}-${stripped}`;

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

      {/* ── Sequential crossfade: one item at a time (question | principle+detail) ── */}
      <div
        data-crossfade=""
        className="absolute inset-0 flex flex-col"
        style={{ visibility: "hidden" }}
      >
        {companies.map((company, i) => {
          return (
            <div
              key={company.hash}
              data-crossfade-item={i}
              className="absolute inset-0 flex items-center justify-center px-8"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:grid sm:items-center sm:gap-10" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
                {/* Left: question */}
                <div data-cf-question="" className="flex flex-col justify-center text-center sm:text-right">
                  <p
                    className="italic tracking-[-0.01em]"
                    style={{
                      fontFamily: "var(--font-spectral)",
                      fontSize: "clamp(14px, 1.8vw, 19px)",
                      lineHeight: 1.55,
                      color: CREAM_MUTED,
                    }}
                  >
                    {company.distillation.question}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden sm:flex items-center">
                  <div data-cf-divider="" className="h-3/4 w-px origin-center" style={{ backgroundColor: "var(--stroke, #16161E)" }} />
                </div>

                {/* Right: principle + detail */}
                <div className="flex flex-col items-center justify-center sm:items-start">
                  <p
                    data-cf-principle=""
                    style={{
                      fontFamily: "var(--font-spectral)",
                      fontSize: "clamp(18px, 2.5vw, 28px)",
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                      color: GOLD_MUTED,
                    }}
                  >
                    {company.distillation.principle}
                  </p>
                  <p
                    data-cf-detail=""
                    className="mt-10 max-w-md text-center line-clamp-5 sm:text-left"
                    style={{
                      fontFamily: "var(--font-spectral)",
                      fontSize: "clamp(12px, 1.2vw, 14px)",
                      lineHeight: 1.75,
                      color: TEXT_DIM,
                    }}
                  >
                    {company.distillation.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
