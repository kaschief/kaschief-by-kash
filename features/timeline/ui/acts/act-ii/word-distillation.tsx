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
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
  COLOR,
  PROMOTED_COLOR,
  SECTION_BG,
} from "./act-ii.constants";

/* ══════════════════════════════════════════════════════════════
 * Colors
 * ══════════════════════════════════════════════════════════════ */

const COLORS = {
  cream:      "#F0E6D0",
  creamMuted: "#B0A890",
  textDim:    "#8A8478",
  textFaint:  "#4A4640",
  gold:       "#C9A84C",
  stroke:     "#16161E",
} as const;

/* ══════════════════════════════════════════════════════════════
 * Scroll breakpoints (normalized 0→1)
 *   0 → 0.35     dissolve: words/meta/borders fade out
 *   0.35 → 1.0   fly: seed words fly to targets, questions fill
 * ══════════════════════════════════════════════════════════════ */

const BP = {
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
  const tlRef        = useRef<gsap.core.Timeline | null>(null);
  const clonesRef    = useRef<HTMLElement[]>([]);

  const seedRefs   = useRef<Map<string, HTMLSpanElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const prefersReducedMotion = useReducedMotion();

  /* Reset per render — tracks which seed words have been claimed */
  const claimedSeeds = useRef(new Set<string>());
  claimedSeeds.current = new Set();

  /* ── Build single paused GSAP timeline, scrub via progress ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    /* Clean previous */
    tlRef.current?.kill();
    clonesRef.current.forEach((c) => c.remove());
    clonesRef.current = [];

    /* Wait one frame for refs to populate after render */
    const raf = requestAnimationFrame(() => {
      const tl = gsap.timeline({ paused: true });
      /* Force total duration = 1 so progress maps directly.
       * addLabel does NOT extend duration — a real tween is required. */
      const _pad = { v: 0 };
      tl.set(_pad, { v: 1 }, 1);

      const fStart = BP.flyStart;
      const fDur   = 1 - fStart;

      /* ── DISSOLVE PHASE (0 → 0.35) ── */

      /* Dissolve extends past fStart due to stagger — that's fine because
       * source div stays visible until fStart + fDur * 0.5 and dissolved
       * elements are already near-invisible by the time targets overlay. */
      tl.to(el.querySelectorAll("[data-dissolve]"), {
        opacity: 0, y: -8, filter: "blur(4px)",
        duration: 0.35,
        stagger: { each: 0.002, from: "random" },
        ease: "power2.in",
      }, 0);

      tl.to(el.querySelectorAll("[data-meta]"), {
        opacity: 0, y: -6, filter: "blur(3px)",
        duration: 0.30,
        stagger: 0.005,
        ease: "power2.in",
      }, 0);

      /* Border fades into section BG — not "transparent" which interpolates through white */
      tl.to(el.querySelectorAll("[data-entry]"), {
        borderLeftColor: SECTION_BG,
        duration: 0.35,
        ease: "power2.in",
      }, 0);

      /* Show target at fly start. Source div stays visible — dissolved
       * content is already fading via tweens. Source hides late to avoid
       * abrupt snap (matches prototype where source hides at "done"). */
      const sourceDiv = el.querySelector("[data-source]") as HTMLElement;
      const targetDiv = el.querySelector("[data-target]") as HTMLElement;
      if (targetDiv) tl.set(targetDiv, { visibility: "visible" }, fStart);
      if (sourceDiv) tl.set(sourceDiv, { visibility: "hidden" }, fStart + fDur * 0.5);

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

        const srcRect       = source.getBoundingClientRect();
        const tgtRect       = target.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();

        const srcX = srcRect.left - containerRect.left;
        const srcY = srcRect.top  - containerRect.top;
        const dx   = (tgtRect.left + tgtRect.width / 2) - (srcRect.left + srcRect.width / 2);
        const dy   = (tgtRect.top  + tgtRect.height / 2) - (srcRect.top  + srcRect.height / 2);

        /* Create clone — starts visibility:hidden, swapped atomically with source */
        const clone = document.createElement("span");
        clone.textContent = word;
        Object.assign(clone.style, {
          position: "absolute", left: `${srcX}px`, top: `${srcY}px`,
          fontFamily: "var(--font-mono)",
          fontSize: window.getComputedStyle(source).fontSize,
          color: COLORS.cream, pointerEvents: "none",
          willChange: "transform, opacity, filter",
          zIndex: "50", transformOrigin: "center center",
          visibility: "hidden",
        });
        el.appendChild(clone);
        clones.push(clone);

        /* Atomic swap: hide source seed word, show clone */
        tl.set(source, { visibility: "hidden" }, fStart);
        tl.set(clone,  { visibility: "visible" }, fStart);

        /* Fly clone to target — duration/timing scaled from prototype
         * (prototype total fly ≈ 1.35s, mapped proportionally to fDur) */
        tl.to(clone, {
          x: dx, y: dy,
          duration: fDur * 0.48,
          ease: "power3.inOut",
        }, fStart);

        /* Clone blurs + fades out as it approaches target (single tween) */
        tl.to(clone, {
          opacity: 0, filter: "blur(6px)",
          duration: fDur * 0.15,
          ease: "power2.in",
        }, fStart + fDur * 0.37);

        /* Target word de-blurs in — overlaps clone fadeout for smooth crossfade */
        tl.set(target, { opacity: 0, filter: "blur(6px)" }, fStart);
        tl.to(target, {
          opacity: 1, filter: "blur(0px)", visibility: "visible",
          duration: fDur * 0.15, ease: "power2.out",
        }, fStart + fDur * 0.41);

        /* Settle target color — long duration matching prototype */
        tl.to(target, {
          color: COLORS.creamMuted,
          duration: fDur * 0.44,
          ease: "power1.inOut",
        }, fStart + fDur * 0.56);
      }

      /* Fill words (non-seed words in the questions).
       * Use set + to (not fromTo) — fromTo is unreliable in paused/scrubbed timelines. */
      const fillEls = Array.from(el.querySelectorAll("[data-fill]"));
      if (fillEls.length) {
        tl.set(fillEls, { opacity: 0, y: 6 }, 0);
        tl.to(fillEls, {
          opacity: 1, y: 0,
          duration: fDur * 0.26,
          stagger: fDur * 0.013,
          ease: "power2.out",
        }, fStart + fDur * 0.15);
      }

      clonesRef.current = clones;
      tlRef.current = tl;

      /* Sync to current scroll position */
      tl.progress(Math.max(0, Math.min(1, progress.get())));
    });

    return () => {
      cancelAnimationFrame(raf);
      tlRef.current?.kill();
      tlRef.current = null;
      clonesRef.current.forEach((c) => c.remove());
      clonesRef.current = [];
    };
  }, [companies, prefersReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scrub timeline on scroll */
  useMotionValueEvent(progress, "change", (v) => {
    tlRef.current?.progress(Math.max(0, Math.min(1, v)));
  });

  /* ── Reduced motion: show final (questions) state immediately ── */
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full h-full">
        <div className="flex h-full flex-col">
          <div className="my-auto w-full max-w-xl mx-auto px-6">
            <div className="flex flex-col items-center gap-[2.5cqh]">
              {companies.map((co) => {
                const words = co.distillation.question.split(" ");
                return (
                  <p key={co.hash} className="text-center italic tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 2.2cqh, 26px)", lineHeight: 1.5, color: COLORS.creamMuted }}>
                    {words.map((word, wi) => (
                      <span key={wi} className="inline-block">
                        {word}{wi < words.length - 1 ? " " : ""}
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
        <div className="my-auto w-full max-w-xl mx-auto px-6 shrink-0">
          <div className="flex flex-col">
            {companies.map((co, ci) => {
              const isLast   = ci === companies.length - 1;
              const dotColor = co.promoted ? PROMOTED_COLOR : COLOR;
              const seedSet  = new Set(co.distillation.seedWords);

              return (
                <div
                  key={co.hash}
                  data-entry=""
                  className="relative ml-[0.15cqh] py-[1.4cqh] pl-[2.8cqh] pr-[1.6cqh]"
                  style={{ borderLeft: isLast ? "none" : `2px solid ${COLORS.stroke}` }}
                >
                  {/* Branch dot */}
                  <div
                    data-meta=""
                    className="absolute -left-[7px] top-[2.2cqh] h-[1.2cqh] w-[1.2cqh] rounded-full border-2"
                    style={{ borderColor: dotColor, backgroundColor: co.promoted ? dotColor : SECTION_BG }}
                  />

                  <div data-meta="" className="mb-[0.3cqh] font-mono text-[clamp(8px,1.0cqh,11px)] tracking-[0.05em]" style={{ color: COLORS.gold }}>
                    {co.hash}
                  </div>
                  <div data-meta="" className="font-bold text-[clamp(12px,1.8cqh,18px)]" style={{ color: COLORS.cream }}>
                    {co.company}
                  </div>
                  <div data-meta="" className="mt-[0.2cqh] font-mono text-[clamp(10px,1.3cqh,14px)]" style={{ color: COLOR }}>
                    {co.role}
                  </div>
                  <div data-meta="" className="mt-[0.3cqh] font-mono text-[clamp(8px,1.0cqh,11px)]" style={{ color: COLORS.textDim }}>
                    {co.location} · {co.period}
                  </div>

                  <ul className="mt-[0.8cqh] flex flex-col gap-[0.3cqh]">
                    {co.commits.map((commit, cmi) => (
                      <li key={cmi} className="font-mono text-[clamp(9px,1.05cqh,12px)] leading-[1.7]">
                        <span data-dissolve="" style={{ color: COMMIT_TYPE_COLORS[commit.type] ?? COMMIT_TYPE_FALLBACK }}>
                          {commit.type}
                        </span>
                        <span data-dissolve="" style={{ color: COLORS.textFaint }}>: </span>
                        {commit.msg.split(/\s+/).map((word, wi) => {
                          const lower   = word.toLowerCase().replace(/[^a-z]/g, "");
                          const refKey  = `${co.hash}-${lower}`;
                          const isSeed  = seedSet.has(lower) && !claimedSeeds.current.has(refKey);
                          const msgWords = commit.msg.split(/\s+/);

                          if (isSeed) {
                            claimedSeeds.current.add(refKey);
                            return (
                              <span key={wi} ref={(el) => { if (el) seedRefs.current.set(refKey, el); }}
                                className="inline-block" style={{ color: COLORS.cream }}>
                                {word}{wi < msgWords.length - 1 ? "\u00A0" : ""}
                              </span>
                            );
                          }
                          return (
                            <span key={wi} data-dissolve="" className="inline-block" style={{ color: COLORS.creamMuted }}>
                              {word}{wi < msgWords.length - 1 ? "\u00A0" : ""}
                            </span>
                          );
                        })}
                      </li>
                    ))}
                  </ul>

                  <div data-meta="" className="mt-[0.8cqh] flex flex-wrap gap-[0.5cqh]">
                    {co.tags.map((tag) => (
                      <span key={tag.text} className="rounded px-[0.8cqh] py-[0.2cqh] font-mono text-[clamp(8px,0.9cqh,10px)]"
                        style={{ backgroundColor: `${tag.color}12`, color: tag.color }}>
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
            {companies.map((co) => {
              const seedSet = new Set(co.distillation.seedWords);
              const words   = co.distillation.question.split(" ");

              return (
                <p key={co.hash} className="text-center italic tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(14px, 2.2cqh, 26px)", lineHeight: 1.5, color: COLORS.creamMuted }}>
                  {words.map((word, wi) => {
                    const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
                    const isSeed   = seedSet.has(stripped);
                    const refKey   = `${co.hash}-${stripped}`;

                    return (
                      <span key={wi}>
                        {isSeed ? (
                          <span ref={(el) => { if (el) targetRefs.current.set(refKey, el); }}
                            className="inline-block" style={{ color: COLORS.cream, visibility: "hidden", opacity: 0 }}>
                            {word}
                          </span>
                        ) : (
                          <span data-fill="" className="inline-block" style={{ opacity: 0 }}>{word}</span>
                        )}
                        {wi < words.length - 1 && " "}
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
