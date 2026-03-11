"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import gsap from "gsap";
import type { Company } from "@data";
import {
  ACT_BLUE,
  BRANCH_LINE,
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
  CREAM,
  CREAM_MUTED,
  GOLD,
  PROMOTED,
  SECTION_BG,
  TAG_ALPHA_BG,
  TEXT_DIM,
  TEXT_FAINT,
} from "./act-ii.constants";

/* ══════════════════════════════════════════════════════════════
 * Scroll breakpoints (normalized 0→1)
 *   0 → 0.35     dissolve: words/meta/borders fade out
 *   0.35 → 1.0   fly: seed words fly to targets, questions fill
 * ══════════════════════════════════════════════════════════════ */

const SCROLL_PHASES = {
  dissolveEnd: 0.35,
  flyStart:    0.35,
} as const;

/* ══════════════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════════════ */

interface WordDistillationProps {
  readonly companies: readonly Company[];
  /** Scroll progress 0→1 driving the entire animation */
  readonly progress: MotionValue<number>;
}

/* ══════════════════════════════════════════════════════════════
 * Component
 * ══════════════════════════════════════════════════════════════ */

export function WordDistillation({ companies, progress }: WordDistillationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef  = useRef<gsap.core.Timeline | null>(null);
  const clonesRef    = useRef<HTMLElement[]>([]);

  const seedRefs   = useRef<Map<string, HTMLSpanElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const prefersReducedMotion = useReducedMotion();

  /* Tracks which seed words have been claimed during this render.
   * Local variable (not ref) — safe in concurrent mode since it's
   * deterministic and scoped to a single render pass. */
  const claimedSeeds = new Set<string>();

  /* ── Build single paused GSAP timeline, scrub via progress ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let frameId: number;

    const buildTimeline = () => {
      /* Clean previous */
      timelineRef.current?.kill();
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];

      /* Wait one frame for refs to populate after render */
      frameId = requestAnimationFrame(() => {
        const timeline = gsap.timeline({ paused: true });
        /* Force total duration = 1 so progress maps directly.
         * addLabel does NOT extend duration — a real tween is required. */
        const durationForcer = { v: 0 };
        timeline.set(durationForcer, { v: 1 }, 1);

        const flyStart = SCROLL_PHASES.flyStart;
        const flyDuration   = 1 - flyStart;

        /* ── DISSOLVE PHASE (0 → 0.35) ── */

        /* Dissolve extends past flyStart due to stagger — that's fine because
         * source div stays visible until flyStart + flyDuration * 0.5 and dissolved
         * elements are already near-invisible by the time targets overlay. */
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
        const sourceDiv = container.querySelector("[data-source]") as HTMLElement;
        const targetDiv = container.querySelector("[data-target]") as HTMLElement;
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
            duration: flyDuration * 0.26,
            stagger: flyDuration * 0.013,
            ease: "power2.out",
          }, flyStart + flyDuration * 0.15);
        }

        clonesRef.current = clones;
        timelineRef.current = timeline;

        /* Sync to current scroll position */
        timeline.progress(Math.max(0, Math.min(1, progress.get())));
      });
    };

    buildTimeline();

    /* Rebuild on resize — clone fly paths bake pixel positions from
     * getBoundingClientRect, so they go stale if the viewport changes.
     * Debounced to avoid thrashing during continuous resize. */
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildTimeline, 200);
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      observer.disconnect();
      timelineRef.current?.kill();
      timelineRef.current = null;
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
    };
  }, [companies, prefersReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scrub timeline on scroll */
  useMotionValueEvent(progress, "change", (v) => {
    timelineRef.current?.progress(Math.max(0, Math.min(1, v)));
  });

  /* ── Reduced motion: show final (questions) state immediately ── */
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full h-full">
        <div className="flex h-full flex-col">
          <div className="my-auto w-full max-w-xl mx-auto px-6">
            <div className="flex flex-col items-center gap-[2.5cqh]">
              {companies.map((company) => {
                const words = company.distillation.question.split(" ");
                return (
                  <p key={company.hash} className="text-center italic tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 2.2cqh, 26px)", lineHeight: 1.5, color: CREAM_MUTED }}>
                    {words.map((word, wordIndex) => (
                      <span key={wordIndex} className="inline-block">
                        {word}{wordIndex < words.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">

      {/* ── Source: commit entries ── */}
      <div data-source="" className="absolute inset-0 flex flex-col">
        <div className="my-auto w-full max-w-2xl mx-auto px-6 shrink-0">
          <div className="flex flex-col">
            {companies.map((company, companyIndex) => {
              const isLast   = companyIndex === companies.length - 1;
              const dotColor = company.promoted ? PROMOTED : ACT_BLUE;
              const seedSet  = new Set(company.distillation.seedWords);

              return (
                <div
                  key={company.hash}
                  data-entry=""
                  className="relative ml-[0.15cqh] py-[1.4cqh] pl-[2.8cqh] pr-[1.6cqh]"
                >
                  {/* Branch line — dot-to-dot: starts at dot for first, ends at dot for last */}
                  <div
                    data-meta=""
                    className="absolute left-0 w-0.5"
                    style={{
                      top: companyIndex === 0 ? "2.2cqh" : 0,
                      bottom: isLast ? `calc(100% - 2.2cqh)` : 0,
                      backgroundColor: BRANCH_LINE,
                    }}
                  />
                  {/* Branch dot */}
                  <div
                    data-meta=""
                    className="absolute -left-1.75 top-[2.2cqh] h-[1.2cqh] w-[1.2cqh] rounded-full border-2"
                    style={{ borderColor: dotColor, backgroundColor: company.promoted ? dotColor : SECTION_BG }}
                  />

                  <div data-meta="" className="mb-[0.3cqh] font-mono text-[clamp(8px,1.0cqh,11px)] tracking-[0.05em]" style={{ color: GOLD }}>
                    {company.hash}
                  </div>
                  <div data-meta="" className="font-bold text-[clamp(12px,1.8cqh,18px)]" style={{ color: CREAM }}>
                    {company.company}
                  </div>
                  <div data-meta="" className="mt-[0.2cqh] font-mono text-[clamp(10px,1.3cqh,14px)]" style={{ color: ACT_BLUE }}>
                    {company.role}
                  </div>
                  <div data-meta="" className="mt-[0.3cqh] font-mono text-[clamp(8px,1.0cqh,11px)]" style={{ color: TEXT_DIM }}>
                    {company.location} · {company.period}
                  </div>

                  <ul className="mt-[0.8cqh] flex flex-col gap-[0.3cqh]">
                    {company.commits.map((commit, commitIndex) => (
                      <li key={commitIndex} className="font-mono text-[clamp(9px,1.05cqh,12px)] leading-[1.7]">
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

                  <div data-meta="" className="mt-[0.8cqh] flex flex-wrap gap-[0.5cqh]">
                    {company.tags.map((tag) => (
                      <span key={tag.text} className="rounded px-[0.8cqh] py-[0.2cqh] font-mono text-[clamp(8px,0.9cqh,10px)]"
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

      {/* ── Target: questions ── */}
      <div data-target="" className="absolute inset-0 flex flex-col" style={{ visibility: "hidden" }}>
        <div className="my-auto w-full max-w-xl mx-auto px-6">
          <div className="flex flex-col items-center gap-[2.5cqh]">
            {companies.map((company) => {
              const seedSet = new Set(company.distillation.seedWords);
              const words   = company.distillation.question.split(" ");

              return (
                <p key={company.hash} className="text-center italic tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 2.2cqh, 26px)", lineHeight: 1.5, color: CREAM_MUTED }}>
                  {words.map((word, wordIndex) => {
                    const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
                    const isSeed   = seedSet.has(stripped);
                    const refKey   = `${company.hash}-${stripped}`;

                    return (
                      <span key={wordIndex}>
                        {isSeed ? (
                          <span ref={(el) => { if (el) targetRefs.current.set(refKey, el); }}
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
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
