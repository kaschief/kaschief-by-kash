"use client";

/**
 * Lab — Roles: Cloud → Grid (scroll-driven)
 *
 * Single container, single sticky viewport. All phases driven by
 * Framer Motion useScroll. No GSAP.
 *
 * Phase 1: Fragments + seeds visible, drifting. Non-seeds dissolve.
 * Phase 2: Seeds fly from cloud positions to grid positions.
 *          Fill words stagger in. Seed targets appear via visibility swap.
 * Phase 3: Seeds fade cream → cream-muted. Hold for reading.
 */

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { COMPANIES } from "@data";
import { LabNav } from "../lab-nav";
import {
  createFragments,
  createEmbers,
  fcExt,
  CC_EXT,
  LOGOS,
  hashToUnit,
} from "../../../features/timeline/ui/acts/act-ii/act-ii.data";
import { smoothstep, lerp } from "../../../features/timeline/ui/acts/act-ii/math";
import {
  SEED,
  FRAGMENTS as FRAG_CONFIG,
  EMBER,
  EMBERS_START,
  SEED_FADE_IN_START,
  SEED_FADE_IN_END,
  SEED_DRIFT_START,
  FRAG_FADE_IN_START,
  FRAG_FADE_IN_END,
} from "../../../features/timeline/ui/acts/act-ii/act-ii.types";
import {
  ACT_BLUE,
  CREAM,
  CREAM_MUTED,
  TEXT_DIM,
  TEXT_FAINT,
  COMMIT_TYPE_COLORS,
  COMMIT_TYPE_FALLBACK,
} from "../../../features/timeline/ui/acts/act-ii-legacy/act-ii.constants";

/* ── Layout ── */
const TOTAL_VH = 1000;

/* ── Phases (normalized 0→1 of total scroll) ── */
const DISSOLVE_END = 0.34;
const FLY_START = 0.34;     // no gap — fly begins immediately as dissolve ends
const FLY_END = 0.56;
const HOLD_END = 0.66;
const DRAIN_START = 0.70;
const DRAIN_END = 0.83;

/* ── Seed mapping ── */

interface SeedMapping {
  fragIdx: number;
  companyIdx: number;
  commitIdx: number;
  wordIdx: number;
  word: string;
  refKey: string;
}

function buildSeedMappings(fragments: ReturnType<typeof createFragments>): SeedMapping[] {
  const mappings: SeedMapping[] = [];
  const seedFrags = fragments.map((f, i) => ({ frag: f, idx: i })).filter((x) => x.frag.isSeed);

  const fragByWord = new Map<string, number>();
  let cursor = 0;
  COMPANIES.forEach((company, ci) => {
    company.distillation.seedWords.forEach((w) => {
      if (cursor < seedFrags.length) {
        fragByWord.set(`${ci}-${w.toLowerCase()}`, seedFrags[cursor]!.idx);
        cursor++;
      }
    });
  });

  COMPANIES.forEach((company, ci) => {
    const seedSet = new Set(company.distillation.seedWords.map((w) => w.toLowerCase()));
    const claimed = new Set<string>();
    company.commits.forEach((commit, commitIdx) => {
      commit.msg.split(/\s+/).forEach((word, wordIdx) => {
        const lower = word.toLowerCase().replace(/[^a-z]/g, "");
        const claimKey = `${ci}-${lower}`;
        if (seedSet.has(lower) && !claimed.has(claimKey)) {
          claimed.add(claimKey);
          const fragIndex = fragByWord.get(claimKey);
          if (fragIndex !== undefined) {
            mappings.push({ fragIdx: fragIndex, companyIdx: ci, commitIdx, wordIdx, word, refKey: `${ci}-${commitIdx}-${wordIdx}` });
          }
        }
      });
    });
  });
  return mappings;
}

/* ── Component ── */

export default function LabRoles() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const fragments = useMemo(() => createFragments(), []);
  const embers = useMemo(() => createEmbers(), []);
  const seedMappings = useMemo(() => buildSeedMappings(fragments), [fragments]);
  const seedFragIndices = useMemo(() => new Set(seedMappings.map((m) => m.fragIdx)), [seedMappings]);

  const fragEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const gridEl = useRef<HTMLDivElement>(null);
  const gridSeedRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const gridFillEls = useRef<(HTMLElement | null)[]>([]);

  /* Measured target positions (px from viewport center) */
  const targetPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  const measureTargets = useCallback(() => {
    if (!stickyRef.current) return;
    const vp = stickyRef.current.getBoundingClientRect();
    const cx = vp.left + vp.width / 2;
    const cy = vp.top + vp.height / 2;
    gridSeedRefs.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      targetPositions.current.set(key, {
        x: r.left + r.width / 2 - cx,
        y: r.top + r.height / 2 - cy,
      });
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureTargets, 200);
    window.addEventListener("resize", measureTargets);
    return () => { clearTimeout(timer); window.removeEventListener("resize", measureTargets); };
  }, [measureTargets]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const onScroll = useCallback(
    (p: number) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const flyDur = FLY_END - FLY_START;

      /* ═══ NON-SEED FRAGMENTS: drift + dissolve ═══ */
      fragments.forEach((frag, i) => {
        if (seedFragIndices.has(i)) return;
        const el = fragEls.current[i];
        if (!el) return;

        if (p > DISSOLVE_END + 0.03) { el.style.opacity = "0"; return; }

        const fadeIn = smoothstep(FRAG_FADE_IN_START, FRAG_FADE_IN_END, p);
        const drift = smoothstep(FRAG_FADE_IN_START, DISSOLVE_END + 0.05, p);

        // Dissolve: each fragment staggered in the final portion of cloud
        const dissolveWindowStart = DISSOLVE_END * 0.55;
        const dissolve = smoothstep(
          lerp(dissolveWindowStart, DISSOLVE_END * 0.80, frag.dissolveStart),
          lerp(DISSOLVE_END * 0.85, DISSOLVE_END, frag.dissolveEnd),
          p,
        );

        const tx = frag.x0 + frag.dx * drift;
        const ty = frag.y0 + frag.dy * drift;
        const rot = frag.rot * (1 + drift * FRAG_CONFIG.rotDriftFactor);

        let alpha: number;
        switch (frag.type) {
          case "code": case "command": alpha = FRAG_CONFIG.alphaCode; break;
          case "logo": alpha = FRAG_CONFIG.alphaLogo; break;
          default: alpha = FRAG_CONFIG.alphaDefault;
        }

        el.style.transform = `translate(calc(-50% + ${tx}vw), calc(-50% + ${ty}vh)) rotate(${rot}deg)`;
        el.style.opacity = String(fadeIn * (1 - dissolve) * alpha);
        el.style.filter = `blur(${lerp(0, SEED.maxDissolveBlur, dissolve)}px)`;
      });

      /* ═══ SEED FRAGMENTS: one continuous arc from cloud → grid ═══
       *
       * No separate drift/fly phases. One smooth motion:
       *   - Starts at initial scattered position (frag.x0, frag.y0)
       *   - Ends at grid target position
       *   - Single smoothstep from SEED_DRIFT_START → FLY_END
       *   - Early scroll: slow drift (mostly cloud motion)
       *   - Late scroll: accelerates toward target (fly)
       *   - No velocity discontinuity
       */
      seedMappings.forEach((mapping) => {
        const frag = fragments[mapping.fragIdx]!;
        const el = fragEls.current[mapping.fragIdx];
        if (!el) return;

        const target = targetPositions.current.get(mapping.refKey);
        const [cr, cg, cb] = CC_EXT[frag.companyIdx % CC_EXT.length]!;

        const fadeIn = smoothstep(SEED_FADE_IN_START, SEED_FADE_IN_END, p);

        // One continuous progress: 0 at SEED_DRIFT_START, 1 at FLY_END
        const totalP = smoothstep(SEED_DRIFT_START, FLY_END, p);

        // Start position (initial scatter, in px)
        const startXpx = (frag.x0 / 100) * vw;
        const startYpx = (frag.y0 / 100) * vh;

        // End position (grid target, in px from center)
        const tgtX = target ? target.x : startXpx;
        const tgtY = target ? target.y : startYpx;

        // Position: cubic ease — slow start, smooth acceleration, gentle arrival
        // t^2 * (3 - 2t) is already smoothstep; applying it again gives a flatter
        // start and end with stronger mid-acceleration
        const posP = totalP * totalP * (3 - 2 * totalP);
        const finalX = lerp(startXpx, tgtX, posP);
        const finalY = lerp(startYpx, tgtY, posP);
        const rot = lerp(frag.rot, 0, totalP);

        // Color: company → cream during fly
        const colorP = smoothstep(FLY_START, FLY_START + (FLY_END - FLY_START) * 0.6, p);
        const r = Math.round(lerp(cr, 0xF0, colorP));
        const g = Math.round(lerp(cg, 0xE6, colorP));
        const b = Math.round(lerp(cb, 0xD0, colorP));

        // Handoff: seed fades + blurs in last 30% of fly
        const flyLocalP = smoothstep(FLY_START, FLY_END, p);
        const handoffFade = 1 - smoothstep(0.70, 0.92, flyLocalP);
        const handoffBlur = smoothstep(0.70, 0.88, flyLocalP) * 6;

        // Scale: seed font size → grid font size during fly for smooth handoff
        // Grid uses ~12px, seed uses frag.size rem * frag-scale
        const scaleP = smoothstep(0.3, 0.7, flyLocalP);
        const seedSize = el.offsetHeight;
        const targetSize = 14; // approximate grid line height
        const scale = seedSize > 0 ? lerp(1, targetSize / seedSize, scaleP) : 1;

        el.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) rotate(${rot}deg) scale(${scale})`;
        el.style.opacity = String(fadeIn * handoffFade);
        el.style.filter = handoffBlur > 0.1 ? `blur(${handoffBlur}px)` : "none";
        el.style.color = `rgb(${r},${g},${b})`;
      });

      /* ═══ EMBERS ═══ */
      embers.forEach((e, i) => {
        const el = emberEls.current[i];
        if (!el) return;
        const heat = smoothstep(EMBERS_START + e.delay, EMBERS_START + EMBER.heatDuration, p);
        const cool = smoothstep(DISSOLVE_END - 0.02, DISSOLVE_END, p);
        const active = heat * (1 - cool);
        const rise = smoothstep(EMBERS_START + EMBER.riseDelay + e.delay, DISSOLVE_END, p);
        el.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
        el.style.opacity = String(active * (EMBER.baseOpacity + Math.sin(p * EMBER.flickerFreq + i) * EMBER.flickerAmp));
      });

      /* ═══ GRID ═══ */

      // Grid container — always present, individual words control visibility
      // After hold: entire grid drains to grayscale on continued scroll
      if (gridEl.current) {
        gridEl.current.style.opacity = "1";
        const drain = smoothstep(DRAIN_START, DRAIN_END, p);
        gridEl.current.style.filter = drain > 0.01 ? `grayscale(${drain})` : "none";
      }

      // Seed placeholders: appear as flying seed fades (based on fly phase)
      const flyLocalP = smoothstep(FLY_START, FLY_END, p);
      gridSeedRefs.current.forEach((el) => {
        const appear = smoothstep(0.75, 0.95, flyLocalP);
        el.style.opacity = String(appear);
        el.style.visibility = appear > 0.01 ? "visible" : "hidden";
        el.style.filter = "none";

        // Color: cream → cream-muted after full landing
        const muteP = smoothstep(FLY_END, HOLD_END, p);
        const mr = Math.round(lerp(0xF0, 0xB0, muteP));
        const mg = Math.round(lerp(0xE6, 0xA8, muteP));
        const mb = Math.round(lerp(0xD0, 0x90, muteP));
        el.style.color = `rgb(${mr},${mg},${mb})`;
      });

      // Fill words: each has its own random-ish stagger (like old engineer's "from: random")
      // Each word gets a hash-based delay so nearby words don't appear simultaneously
      const fillSpreadStart = FLY_START + flyDur * 0.15;
      const fillSpreadEnd = FLY_END + 0.02; // extends slightly past fly end
      const fillWordDur = flyDur * 0.25;
      gridFillEls.current.forEach((el, i) => {
        if (!el) return;
        // Hash-based random offset (0→1) spreads words across the fill window
        const randOffset = hashToUnit(i * 7.3 + 42);
        const wordStart = lerp(fillSpreadStart, fillSpreadEnd - fillWordDur, randOffset);
        const wordEnd = wordStart + fillWordDur;
        const wordP = smoothstep(wordStart, wordEnd, p);
        el.style.opacity = String(wordP);
        el.style.transform = `translateY(${lerp(6, 0, wordP)}px)`;
      });
    },
    [fragments, embers, seedMappings, seedFragIndices],
  );

  useMotionValueEvent(scrollYProgress, "change", onScroll);

  /* ── JSX ── */
  let fillIdx = 0;
  const setFillRef = (el: HTMLElement | null) => {
    const idx = fillIdx++;
    gridFillEls.current[idx] = el;
  };

  return (
    <>
      <LabNav />
      <div ref={outerRef} style={{ height: `${TOTAL_VH}vh`, background: "var(--bg)" }}>
        <div
          ref={stickyRef}
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [container-type:size] [--frag-scale:0.6] sm:[--frag-scale:0.85]"
          style={{ background: "var(--bg)" }}>

          {/* Embers */}
          {embers.map((e, i) => (
            <div key={`ember-${i}`} ref={(el) => { emberEls.current[i] = el; }} aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{ width: e.size, height: e.size,
                background: "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 70%, transparent 100%)",
                opacity: 0, willChange: "transform, opacity" }} />
          ))}

          {/* Fragments */}
          {fragments.map((frag, i) => {
            const setRef = (el: HTMLElement | null) => { fragEls.current[i] = el; };
            const base = "absolute left-1/2 top-1/2 select-none pointer-events-none";

            if (frag.isSeed && frag.type === "seed") {
              return (
                <span key={`seed-${frag.text}-${i}`} ref={setRef as (el: HTMLSpanElement | null) => void}
                  aria-hidden className={`${base} whitespace-nowrap font-sans`}
                  style={{ fontSize: `calc(${frag.size}rem * var(--frag-scale))`, fontWeight: frag.weight,
                    opacity: 0, letterSpacing: "0.04em", willChange: "transform, opacity, filter" }}>
                  {frag.text}
                </span>
              );
            }
            switch (frag.type) {
              case "code":
                return (
                  <div key={`code-${i}`} ref={setRef} aria-hidden className={`${base} whitespace-nowrap`}
                    style={{ opacity: 0, padding: "6px 12px", borderRadius: "6px",
                      background: "rgba(14,14,20,0.85)", border: `1px solid ${fcExt(frag.companyIdx, 0.25)}`,
                      fontSize: `calc(${frag.size}rem * var(--frag-scale))`, fontFamily: "var(--font-sans)",
                      color: fcExt(frag.companyIdx, 0.95), letterSpacing: "0.02em", willChange: "transform, opacity, filter" }}>
                    <span style={{ color: "rgba(198,120,221,0.9)" }}>
                      {frag.code.match(/^(const |let |var |export |async |await |function |interface |import )/)?.[0] ?? ""}
                    </span>
                    <span style={{ color: fcExt(frag.companyIdx, 0.85) }}>
                      {frag.code.replace(/^(const |let |var |export |async |await |function |interface |import )/, "")}
                    </span>
                  </div>
                );
              case "logo":
                return (
                  <div key={`logo-${frag.logoKey}-${i}`} ref={setRef} aria-hidden className={base}
                    style={{ opacity: 0, willChange: "transform, opacity, filter" }}>
                    <svg viewBox={frag.label ? "0 0 24 36" : "0 0 24 24"} fill="none"
                      style={{ overflow: "visible",
                        width: `calc(${frag.logoSize}px * var(--frag-scale))`,
                        height: `calc(${frag.label ? frag.logoSize * 1.5 : frag.logoSize}px * var(--frag-scale))` }}>
                      {LOGOS[frag.logoKey]}
                      {frag.label && (
                        <text x="12" y="31" textAnchor="middle" fill="var(--cream-muted)"
                          fontSize="5" fontFamily="var(--font-sans)" letterSpacing="0.06em"
                          style={{ textTransform: "uppercase" }}>{frag.label}</text>
                      )}
                    </svg>
                  </div>
                );
              case "command":
                return (
                  <div key={`cmd-${i}`} ref={setRef} aria-hidden className={`${base} whitespace-nowrap`}
                    style={{ opacity: 0, padding: "5px 10px", borderRadius: "4px",
                      background: "rgba(7,7,10,0.9)", border: `1px solid ${fcExt(frag.companyIdx, 0.2)}`,
                      fontSize: `calc(${frag.size}rem * var(--frag-scale))`, fontFamily: "var(--font-sans)",
                      letterSpacing: "0.01em", willChange: "transform, opacity, filter" }}>
                    <span style={{ color: fcExt(frag.companyIdx, 0.85) }}>$ </span>
                    <span style={{ color: fcExt(frag.companyIdx, 0.7) }}>{frag.cmd}</span>
                  </div>
                );
              default:
                return (
                  <span key={`${frag.type}-${frag.text}-${i}`}
                    ref={setRef as (el: HTMLSpanElement | null) => void} aria-hidden
                    className={`${base} whitespace-nowrap font-sans`}
                    style={{ fontSize: `calc(${frag.size}rem * var(--frag-scale))`, fontWeight: frag.weight,
                      color: fcExt(frag.companyIdx, 0.95), opacity: 0,
                      letterSpacing: frag.type === "tag" ? "0.06em" : "0.02em",
                      willChange: "transform, opacity, filter",
                      ...(frag.type === "tag" ? { padding: "2px 8px", borderRadius: "3px",
                        border: `1px solid ${fcExt(frag.companyIdx, 0.2)}`, background: fcExt(frag.companyIdx, 0.05) } : {}) }}>
                    {frag.text}
                  </span>
                );
            }
          })}

          {/* Company grid (2×2) */}
          <div ref={gridEl} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0 }}>
            <div className="grid grid-cols-2" style={{ gap: "0 1.5rem", maxWidth: "64rem", width: "100%", padding: "0 2rem" }}>
              {COMPANIES.map((company, ci) => {
                const seedSet = new Set(company.distillation.seedWords.map((w) => w.toLowerCase()));
                const claimed = new Set<string>();
                return (
                  <div key={company.hash}
                    style={{ paddingLeft: "0.75rem", paddingTop: "0.625rem", paddingBottom: "0.625rem", fontSize: "0.8125rem" }}>
                    <div ref={setFillRef} className="text-sm font-bold sm:text-base lg:text-lg" style={{ color: CREAM, opacity: 0 }}>
                      {company.company}
                    </div>
                    <div ref={setFillRef} className="mt-0.5 font-ui text-xs" style={{ color: ACT_BLUE, opacity: 0 }}>
                      {company.role}
                    </div>
                    <div ref={setFillRef} className="mt-1 font-ui text-[11px]" style={{ color: TEXT_DIM, opacity: 0 }}>
                      {company.location} · {company.period}
                    </div>
                    <ul className="flex flex-col" style={{ marginTop: "0.5rem", gap: "0.125rem" }}>
                      {company.commits.map((commit, commitIdx) => {
                        const typeColor = COMMIT_TYPE_COLORS[commit.type] ?? COMMIT_TYPE_FALLBACK;
                        return (
                          <li key={commitIdx} className="font-ui text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
                            <span ref={setFillRef} style={{ color: typeColor, opacity: 0 }}>{commit.type}</span>
                            <span ref={setFillRef} style={{ color: TEXT_FAINT, opacity: 0 }}>:{" "}</span>
                            {commit.msg.split(/\s+/).map((word, wordIdx) => {
                              const lower = word.toLowerCase().replace(/[^a-z]/g, "");
                              const claimKey = `${ci}-${lower}`;
                              const isSeed = seedSet.has(lower) && !claimed.has(claimKey);
                              const msgWords = commit.msg.split(/\s+/);
                              const space = wordIdx < msgWords.length - 1 ? "\u00A0" : "";
                              if (isSeed) {
                                claimed.add(claimKey);
                                const refKey = `${ci}-${commitIdx}-${wordIdx}`;
                                return (
                                  <span key={wordIdx}
                                    ref={(el) => { if (el) gridSeedRefs.current.set(refKey, el); }}
                                    className="inline-block"
                                    style={{ color: CREAM, opacity: 0, visibility: "hidden" }}>
                                    {word}{space}
                                  </span>
                                );
                              }
                              return (
                                <span key={wordIdx} ref={setFillRef} className="inline-block"
                                  style={{ color: CREAM_MUTED, opacity: 0 }}>{word}{space}</span>
                              );
                            })}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
