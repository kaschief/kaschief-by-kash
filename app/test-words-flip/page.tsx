"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { COMPANIES } from "@data";

/* ══════════════════════════════════════════════════════════════
 * Colors — mirrors act-ii.constants + CSS vars
 * ══════════════════════════════════════════════════════════════ */

const COLORS = {
  sectionBg:    "#06060A",
  actBlue:      "#5B9EC2",
  cream:        "#F0E6D0",
  creamMuted:   "#B0A890",
  textDim:      "#8A8478",
  textFaint:    "#4A4640",
  gold:         "#C9A84C",
  stroke:       "#16161E",
  promoted:     "#5EBB73",
} as const;

const COMMIT_TYPE_COLORS: Record<string, string> = {
  feat:     COLORS.actBlue,
  fix:      "#E05252",
  perf:     COLORS.promoted,
  refactor: COLORS.gold,
  test:     "#9B8FCE",
  docs:     "#8B9DC3",
  ship:     COLORS.gold,
  chore:    COLORS.textDim,
  collab:   "#7A8B6E",
};

/* ══════════════════════════════════════════════════════════════
 * Timing constants — all durations / offsets in one place
 * ══════════════════════════════════════════════════════════════ */

const TIMING = {
  /* Idle delay before dissolve starts */
  idleDelay: 2000,

  /* Dissolve phase */
  dissolveWords:        1.0,   // duration for [data-dissolve] words
  dissolveWordsStagger: 0.01,  // stagger between each word
  dissolveMeta:         0.7,   // duration for company/role/hash/tags
  dissolveMetaStagger:  0.02,  // stagger between meta elements
  dissolveLine:         0.7,   // branch line fade

  /* Fly phase */
  flyDuration:    0.65,  // clone travels source → target
  cloneFadeStart: 0.5,   // when clone starts blurring out
  cloneFadeDur:   0.2,   // clone fade-out duration
  targetFadeIn:   0.55,  // when real target word fades in
  targetFadeDur:  0.2,   // target fade-in duration
  seedSettleDur:  0.6,   // seed word settles to question color
  seedSettleAt:   0.75,  // when settle starts

  /* Fill words (non-seed question words) */
  fillStart:   0.2,   // when fill words begin appearing
  fillDur:     0.35,  // each fill word fade-in duration
  fillStagger: 0.018, // stagger between fill words
} as const;

/* ══════════════════════════════════════════════════════════════
 * Phase machine
 * ══════════════════════════════════════════════════════════════ */

type Phase = "idle" | "dissolving" | "flying" | "done";

/* ══════════════════════════════════════════════════════════════ */

export default function TestWordsFlipPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const seedRefs   = useRef<Map<string, HTMLSpanElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  /* Start after idle delay */
  useEffect(() => {
    const t = setTimeout(() => setPhase("dissolving"), TIMING.idleDelay);
    return () => clearTimeout(t);
  }, []);

  /* ── Dissolve ── */
  useEffect(() => {
    if (phase !== "dissolving") return;
    const el = containerRef.current;
    if (!el) return;

    const tl = gsap.timeline({ onComplete: () => setPhase("flying") });

    tl.to(el.querySelectorAll("[data-dissolve]"), {
      opacity: 0, y: -8, filter: "blur(4px)",
      duration: TIMING.dissolveWords,
      stagger: { each: TIMING.dissolveWordsStagger, from: "random" },
      ease: "power2.in",
    }, 0);

    tl.to(el.querySelectorAll("[data-meta]"), {
      opacity: 0, y: -6, filter: "blur(3px)",
      duration: TIMING.dissolveMeta,
      stagger: TIMING.dissolveMetaStagger,
      ease: "power2.in",
    }, 0);

    tl.to(el.querySelectorAll("[data-entry]"), {
      borderLeftColor: "transparent",
      duration: TIMING.dissolveLine,
      ease: "power2.in",
    }, 0);

    return () => { tl.kill(); };
  }, [phase]);

  /* ── Fly ── */
  useEffect(() => {
    if (phase !== "flying") return;
    const el = containerRef.current;
    if (!el) return;

    const allSeeds = COMPANIES.flatMap((c) =>
      c.distillation.seedWords.map((w) => ({ hash: c.hash, word: w })),
    );
    const clones: HTMLElement[] = [];

    const tl = gsap.timeline({
      onComplete: () => { clones.forEach((c) => c.remove()); setPhase("done"); },
    });

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
      const dx   = (tgtRect.left + tgtRect.width  / 2) - (srcRect.left + srcRect.width  / 2);
      const dy   = (tgtRect.top  + tgtRect.height / 2) - (srcRect.top  + srcRect.height / 2);

      source.style.visibility = "hidden";
      target.style.visibility = "hidden";

      /* Clone flies from source to target */
      const clone = document.createElement("span");
      clone.textContent = word;
      Object.assign(clone.style, {
        position: "absolute", left: `${srcX}px`, top: `${srcY}px`,
        fontFamily: "var(--font-mono)",
        fontSize: window.getComputedStyle(source).fontSize,
        color: COLORS.cream, pointerEvents: "none",
        willChange: "transform, opacity, filter",
        zIndex: "50", transformOrigin: "center center",
      });
      el.appendChild(clone);
      clones.push(clone);

      tl.to(clone, { x: dx, y: dy, duration: TIMING.flyDuration, ease: "power3.inOut" }, 0);
      tl.to(clone, { opacity: 0, filter: "blur(6px)", duration: TIMING.cloneFadeDur, ease: "power2.in" }, TIMING.cloneFadeStart);

      /* Real target word blooms in at destination */
      tl.fromTo(target,
        { opacity: 0, filter: "blur(6px)" },
        { opacity: 1, filter: "blur(0px)", visibility: "visible", duration: TIMING.targetFadeDur, ease: "power2.out",
          onComplete: () => { target.style.visibility = "visible"; },
        }, TIMING.targetFadeIn);

      /* Seed word settles to question color */
      tl.to(target, { color: COLORS.creamMuted, duration: TIMING.seedSettleDur, ease: "power1.inOut" }, TIMING.seedSettleAt);
    }

    /* Fill words stagger in during the flight */
    tl.fromTo(el.querySelectorAll("[data-fill]"),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: TIMING.fillDur, stagger: TIMING.fillStagger, ease: "power2.out" },
      TIMING.fillStart,
    );

    return () => { tl.kill(); clones.forEach((c) => c.remove()); };
  }, [phase]);

  /* Claimed seeds — reset per render */
  const claimedSeeds = useRef(new Set<string>());
  claimedSeeds.current = new Set();

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center py-20"
      style={{ backgroundColor: COLORS.sectionBg }}
    >
      {/* ── Source: all 4 commit entries ── */}
      <div
        className="absolute w-full max-w-xl px-6"
        style={{ visibility: phase === "done" ? "hidden" : "visible" }}
      >
        <div className="flex flex-col">
          {COMPANIES.map((co, ci) => {
            const isLast   = ci === COMPANIES.length - 1;
            const dotColor = co.promoted ? COLORS.promoted : COLORS.actBlue;
            const seedSet  = new Set(co.distillation.seedWords);

            return (
              <div
                key={co.hash}
                data-entry=""
                className="relative ml-1.5 py-5 pl-7 pr-4"
                style={{ borderLeft: isLast ? "none" : `2px solid ${COLORS.stroke}` }}
              >
                {/* Branch dot */}
                <div
                  data-meta=""
                  className="absolute -left-[7px] top-[26px] h-3 w-3 rounded-full border-2"
                  style={{ borderColor: dotColor, backgroundColor: co.promoted ? dotColor : COLORS.sectionBg }}
                />

                {/* Hash */}
                <div data-meta="" className="mb-1 font-mono text-[11px] tracking-[0.05em]" style={{ color: COLORS.gold }}>
                  {co.hash}
                </div>

                {/* Company */}
                <div data-meta="" className="text-sm font-bold sm:text-base lg:text-lg" style={{ color: COLORS.cream }}>
                  {co.company}
                </div>

                {/* Role */}
                <div data-meta="" className="mt-0.5 font-mono text-xs" style={{ color: COLORS.actBlue }}>
                  {co.role}
                </div>

                {/* Location · period */}
                <div data-meta="" className="mt-1 font-mono text-[11px]" style={{ color: COLORS.textDim }}>
                  {co.location} · {co.period}
                </div>

                {/* Commits */}
                <ul className="mt-3 flex flex-col gap-1.5">
                  {co.commits.map((commit, cmi) => (
                    <li key={cmi} className="font-mono text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
                      <span data-dissolve="" style={{ color: COMMIT_TYPE_COLORS[commit.type] ?? COLORS.textFaint }}>
                        {commit.type}
                      </span>
                      <span data-dissolve="" style={{ color: COLORS.textFaint }}>: </span>
                      {commit.msg.split(/\s+/).map((word, wi) => {
                        const lower  = word.toLowerCase().replace(/[^a-z]/g, "");
                        const refKey = `${co.hash}-${lower}`;
                        const isSeed = seedSet.has(lower) && !claimedSeeds.current.has(refKey);
                        const words  = commit.msg.split(/\s+/);

                        if (isSeed) {
                          claimedSeeds.current.add(refKey);
                          return (
                            <span key={wi} ref={(el) => { if (el) seedRefs.current.set(refKey, el); }}
                              className="inline-block" style={{ color: COLORS.cream }}>
                              {word}{wi < words.length - 1 ? "\u00A0" : ""}
                            </span>
                          );
                        }
                        return (
                          <span key={wi} data-dissolve="" className="inline-block" style={{ color: COLORS.creamMuted }}>
                            {word}{wi < words.length - 1 ? "\u00A0" : ""}
                          </span>
                        );
                      })}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div data-meta="" className="mt-3 flex flex-wrap gap-2">
                  {co.tags.map((tag) => (
                    <span key={tag.text} className="rounded px-2 py-0.5 font-mono text-[10px]"
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

      {/* ── Target: all 4 questions ── */}
      <div
        className="absolute w-full max-w-xl px-6"
        style={{ visibility: phase === "flying" || phase === "done" ? "visible" : "hidden" }}
      >
        <div className="flex flex-col items-center gap-8">
          {COMPANIES.map((co) => {
            const seedSet = new Set(co.distillation.seedWords);
            const words   = co.distillation.question.split(" ");

            return (
              <p key={co.hash} className="text-center italic tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-spectral)", fontSize: "clamp(16px, 2.2vw, 26px)", lineHeight: 1.5, color: COLORS.creamMuted }}>
                {words.map((word, wi) => {
                  const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
                  const isSeed   = seedSet.has(stripped);
                  const refKey   = `${co.hash}-${stripped}`;

                  return (
                    <span key={wi}>
                      {isSeed ? (
                        <span ref={(el) => { if (el) targetRefs.current.set(refKey, el); }}
                          className="inline-block" style={{ color: COLORS.cream, visibility: "hidden" }}>
                          {word}
                        </span>
                      ) : (
                        <span data-fill="" className="inline-block" style={{ opacity: 0 }}>
                          {word}
                        </span>
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
  );
}
