"use client";

/**
 * Roles Cloud hook — unified lifecycle for fragments, embers, and the
 * 2x2 company roles grid.
 *
 * Replaces the old `useConvergence` hook. A single `update(progress, ...)`
 * call drives every element from birth to grid drain:
 *
 *   1. Fragments + seeds appear, drift (convergence phase)
 *   2. Non-seeds dissolve (convergence → roles-dissolve)
 *   3. Seeds fly from cloud positions to grid targets (roles-fly)
 *   4. Fill words stagger in (roles-fly)
 *   5. Grid holds for reading (roles-hold)
 *   6. Grayscale drain (roles-drain)
 *   7. Grid fades out
 *
 * Seeds use ONE continuous smoothstep from SEED_DRIFT_START → ROLES_FLY_END
 * so there is never a velocity discontinuity or handoff stutter.
 */

import { useRef, useMemo, useCallback, useEffect } from "react";
import { COMPANIES } from "@data";
import { smoothstep, lerp } from "../math";
import {
  fcExt,
  CC_EXT,
  LOGOS,
  createFragments,
  createEmbers,
  hashToUnit,
  CONTENT,
} from "../act-ii.data";
import {
  SEED,
  FRAGMENTS,
  EMBER,
  GRID,
  THESIS,
  EC_UI_CONFIG,
  PHASES,
  EMBERS_START,
  EMBERS_END,
  GLOW_START,
  GLOW_END,
  SEED_FADE_IN_START,
  SEED_FADE_IN_END,
  SEED_DRIFT_START,
  FRAG_FADE_IN_START,
  FRAG_FADE_IN_END,
  THESIS_START,
  THESIS_END,
  ROLES_DISSOLVE_START,
  ROLES_DISSOLVE_END,
  ROLES_FLY_START,
  ROLES_FLY_END,
  ROLES_HOLD_END,
  ROLES_DRAIN_END,
} from "../act-ii.types";
/* ── Roles cloud color config ── */
const COLORS = {
  actBlue: "#5B9EC2",
  cream: "#F0E6D0",
  creamMuted: "#B0A890",
  textDim: "#8A8478",
  textFaint: "#4A4640",
  gold: "#C9A84C",
  promoted: "#5EBB73",
  commitTypes: {
    feat: "#5B9EC2",
    fix: "#E05252",
    perf: "#5EBB73",
    refactor: "#C9A84C",
    test: "#9B8FCE",
    docs: "#8B9DC3",
    ship: "#C9A84C",
    chore: "#8A8478",
    collab: "#7A8B6E",
    fallback: "#4A4640",
  },
} as const;

/* ── Seed mapping ── */

interface SeedMapping {
  fragIdx: number;
  companyIdx: number;
  commitIdx: number;
  wordIdx: number;
  word: string;
  refKey: string;
}

function buildSeedMappings(
  fragments: ReturnType<typeof createFragments>,
): SeedMapping[] {
  const mappings: SeedMapping[] = [];
  const seedFrags = fragments
    .map((f, i) => ({ frag: f, idx: i }))
    .filter((x) => x.frag.isSeed);

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
    const seedSet = new Set(
      company.distillation.seedWords.map((w) => w.toLowerCase()),
    );
    const claimed = new Set<string>();
    company.commits.forEach((commit, commitIdx) => {
      commit.msg.split(/\s+/).forEach((word, wordIdx) => {
        const lower = word.toLowerCase().replace(/[^a-z]/g, "");
        const claimKey = `${ci}-${lower}`;
        if (seedSet.has(lower) && !claimed.has(claimKey)) {
          claimed.add(claimKey);
          const fragIndex = fragByWord.get(claimKey);
          if (fragIndex !== undefined) {
            mappings.push({
              fragIdx: fragIndex,
              companyIdx: ci,
              commitIdx,
              wordIdx,
              word,
              refKey: `${ci}-${commitIdx}-${wordIdx}`,
            });
          }
        }
      });
    });
  });
  return mappings;
}

/* ── Hook ── */

export function useRolesCloud() {
  /* ---- Refs ---- */
  const fragmentEls = useRef<(HTMLElement | null)[]>([]);
  const emberEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisEls = useRef<(HTMLDivElement | null)[]>([]);
  const thesisWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glowEl = useRef<HTMLDivElement>(null);
  const innerGlowEl = useRef<HTMLDivElement>(null);
  const atmosphereGridEl = useRef<HTMLDivElement>(null);
  const rolesGridEl = useRef<HTMLDivElement>(null);
  const gridSeedRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const gridFillEls = useRef<(HTMLElement | null)[]>([]);
  /** Commit line elements (blur out during drain) */
  const commitLineEls = useRef<(HTMLElement | null)[]>([]);
  /** Impact metric elements (fade in during drain) */
  const impactLineEls = useRef<(HTMLElement | null)[]>([]);
  const stickyViewportRef = useRef<HTMLDivElement | null>(null);

  /** Measured target positions (px from viewport center) */
  const targetPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  /* ---- Data ---- */
  const fragments = useMemo(() => createFragments(), []);
  const embers = useMemo(() => createEmbers(), []);
  const seedMappings = useMemo(() => buildSeedMappings(fragments), [fragments]);
  const seedFragIndices = useMemo(
    () => new Set(seedMappings.map((m) => m.fragIdx)),
    [seedMappings],
  );

  /* ---- Measure grid target positions ---- */
  const measureTargets = useCallback(() => {
    const vp = stickyViewportRef.current;
    if (!vp) return;
    const vpRect = vp.getBoundingClientRect();
    const cx = vpRect.left + vpRect.width / 2;
    const cy = vpRect.top + vpRect.height / 2;
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
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureTargets);
    };
  }, [measureTargets]);

  /* ---- Scroll update ---- */
  /**
   * Called per-frame by the orchestrator.
   *
   * @param progress  EC progress (0→1). For the convergence phase this is
   *                  clamped to CONVERGENCE_GATE. For roles phases the
   *                  orchestrator passes unclamped progress so the hook can
   *                  drive animations beyond the gate.
   * @param isDesktop true when viewport >= lg breakpoint
   * @param curtainTop summary panel top edge (px) — clips fragments from below
   * @param viewportHeight window.innerHeight
   * @param skipThesis when true, thesis sentence is hidden (lenses replaces it)
   */
  function update(
    progress: number,
    isDesktop: boolean,
    curtainTop: number,
    viewportHeight: number,
    skipThesis = false,
  ) {
    const CURTAIN_FADE = EC_UI_CONFIG.curtainFadePx;
    const vh = viewportHeight;
    const vw = window.innerWidth;

    // Re-measure targets every frame if we have none yet
    // (handles late mount / layout shift)
    if (targetPositions.current.size === 0) {
      measureTargets();
    }

    /* ═══ NON-SEED FRAGMENTS: drift + dissolve ═══ */
    fragments.forEach((fragment, i) => {
      if (seedFragIndices.has(i)) return;
      const element = fragmentEls.current[i];
      if (!element) return;

      // Past dissolve: hide completely
      if (progress > ROLES_DISSOLVE_END + 0.01) {
        element.style.opacity = "0";
        return;
      }

      const fadeIn = smoothstep(FRAG_FADE_IN_START, FRAG_FADE_IN_END, progress);
      const drift = smoothstep(
        FRAG_FADE_IN_START,
        ROLES_DISSOLVE_END + 0.02,
        progress,
      );

      // Dissolve: per-fragment stagger across the dissolve window
      const dissolveWindowStart = ROLES_DISSOLVE_START * 0.85;
      const dissolve = smoothstep(
        lerp(
          dissolveWindowStart,
          ROLES_DISSOLVE_END * 0.85,
          fragment.dissolveStart,
        ),
        lerp(ROLES_DISSOLVE_END * 0.88, ROLES_DISSOLVE_END, fragment.dissolveEnd),
        progress,
      );

      const tx = fragment.x0 + fragment.dx * drift;
      const ty = fragment.y0 + fragment.dy * drift;
      const rot = fragment.rot * (1 + drift * FRAGMENTS.rotDriftFactor);

      let baseAlpha: number;
      switch (fragment.type) {
        case "code":
        case "command":
          baseAlpha = FRAGMENTS.alphaCode;
          break;
        case "logo":
          baseAlpha = FRAGMENTS.alphaLogo;
          break;
        default:
          baseAlpha = FRAGMENTS.alphaDefault;
      }

      const fragScreenY = vh * 0.5 + (ty * vh) / 100;
      const curtainReveal =
        curtainTop >= vh
          ? 1
          : Math.max(0, Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE));

      element.style.transform = `translate(calc(-50% + ${tx}vw), calc(-50% + ${ty}vh)) rotate(${rot}deg)`;
      element.style.opacity = String(
        fadeIn * (1 - dissolve) * baseAlpha * curtainReveal,
      );
      element.style.filter = `blur(${lerp(0, SEED.maxDissolveBlur, dissolve)}px)`;
    });

    /* ═══ SEED FRAGMENTS: one continuous arc from cloud → grid ═══
     *
     * Single smoothstep from SEED_DRIFT_START → ROLES_FLY_END.
     * No separate phases. No handoff. No velocity discontinuity.
     */
    seedMappings.forEach((mapping) => {
      const frag = fragments[mapping.fragIdx]!;
      const el = fragmentEls.current[mapping.fragIdx];
      if (!el) return;

      const target = targetPositions.current.get(mapping.refKey);
      const [cr, cg, cb] = CC_EXT[frag.companyIdx % CC_EXT.length]!;

      const fadeIn = smoothstep(SEED_FADE_IN_START, SEED_FADE_IN_END, progress);

      // One continuous progress: 0 at SEED_DRIFT_START, 1 at ROLES_FLY_END
      const totalP = smoothstep(SEED_DRIFT_START, ROLES_FLY_END, progress);

      // Start position (initial scatter, in px)
      const startXpx = (frag.x0 / 100) * vw;
      const startYpx = (frag.y0 / 100) * vh;

      // End position (grid target, in px from center)
      const tgtX = target ? target.x : startXpx;
      const tgtY = target ? target.y : startYpx;

      // Position: double smoothstep for flatter start/end, stronger mid-acceleration
      const posP = totalP * totalP * (3 - 2 * totalP);
      const finalX = lerp(startXpx, tgtX, posP);
      const finalY = lerp(startYpx, tgtY, posP);
      const rot = lerp(frag.rot, 0, totalP);

      // Color: company → cream during fly
      const colorP = smoothstep(
        ROLES_FLY_START,
        ROLES_FLY_START + (ROLES_FLY_END - ROLES_FLY_START) * 0.6,
        progress,
      );
      const r = Math.round(lerp(cr, 0xf0, colorP));
      const g = Math.round(lerp(cg, 0xe6, colorP));
      const b = Math.round(lerp(cb, 0xd0, colorP));

      // Handoff: seed fades + blurs in last 30% of fly
      const flyLocalP = smoothstep(ROLES_FLY_START, ROLES_FLY_END, progress);
      const handoffFade = 1 - smoothstep(0.7, 0.92, flyLocalP);
      const handoffBlur = smoothstep(0.7, 0.88, flyLocalP) * 6;

      // Scale: seed font → grid font during fly for smooth handoff
      const scaleP = smoothstep(0.3, 0.7, flyLocalP);
      const seedSize = el.offsetHeight;
      const targetSize = 14; // approximate grid line height
      const scale = seedSize > 0 ? lerp(1, targetSize / seedSize, scaleP) : 1;

      // Curtain reveal (fragments clip against summary panel)
      const fragScreenY = vh * 0.5 + finalY;
      const curtainReveal =
        curtainTop >= vh
          ? 1
          : Math.max(
              0,
              Math.min(1, (fragScreenY - curtainTop) / CURTAIN_FADE),
            );

      el.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) rotate(${rot}deg) scale(${scale})`;
      el.style.opacity = String(fadeIn * handoffFade * curtainReveal);
      el.style.filter = handoffBlur > 0.1 ? `blur(${handoffBlur}px)` : "none";
      el.style.color = `rgb(${r},${g},${b})`;
    });

    /* ═══ EMBERS ═══ */
    embers.forEach((e, i) => {
      const element = emberEls.current[i];
      if (!element) return;
      const heat = smoothstep(
        EMBERS_START + e.delay,
        EMBERS_START + EMBER.heatDuration,
        progress,
      );
      const cool = smoothstep(EMBERS_END - EMBER.coolLead, EMBERS_END, progress);
      const active = heat * (1 - cool);
      const rise = smoothstep(
        EMBERS_START + EMBER.riseDelay + e.delay,
        EMBERS_END,
        progress,
      );
      element.style.transform = `translate(calc(-50% + ${e.x0 + e.dx * rise}vw), calc(-50% + ${lerp(e.y0, -e.speed, rise)}vh))`;
      element.style.opacity = String(
        active *
          (EMBER.baseOpacity +
            Math.sin(progress * EMBER.flickerFreq + i) * EMBER.flickerAmp),
      );
    });

    /* ═══ ATMOSPHERE — convergence grid + glows ═══ */
    if (glowEl.current) glowEl.current.style.opacity = "0";
    if (innerGlowEl.current) innerGlowEl.current.style.opacity = "0";
    if (atmosphereGridEl.current) {
      const appear = smoothstep(
        GLOW_START,
        GLOW_START + GRID.appearDuration,
        progress,
      );
      const fade =
        1 - smoothstep(GLOW_END - GRID.fadeLead, GLOW_END, progress);
      atmosphereGridEl.current.style.opacity = String(
        appear * fade * GRID.maxOpacity,
      );
    }

    /* ═══ ROLES GRID ═══ */
    const flyDur = ROLES_FLY_END - ROLES_FLY_START;

    if (rolesGridEl.current) {
      // Grid visible from fly start through drain
      const gridAppear = smoothstep(
        ROLES_FLY_START,
        ROLES_FLY_START + flyDur * 0.2,
        progress,
      );

      // Drain: commits blur out, impacts fade in, then whole grid fades
      const drainP = smoothstep(ROLES_HOLD_END, ROLES_DRAIN_END, progress);
      // Grid stays visible through most of drain, fades at the very end
      const gridFadeOut = 1 - smoothstep(0.85, 1.0, drainP);

      rolesGridEl.current.style.opacity = String(gridAppear * gridFadeOut);
      rolesGridEl.current.style.filter = "none";
    }

    // Seed placeholders in grid: appear as flying seeds fade (based on fly phase)
    const flyLocalP = smoothstep(ROLES_FLY_START, ROLES_FLY_END, progress);
    gridSeedRefs.current.forEach((el) => {
      const appear = smoothstep(0.75, 0.95, flyLocalP);
      el.style.opacity = String(appear);
      el.style.visibility = appear > 0.01 ? "visible" : "hidden";
      el.style.filter = "none";

      // Color: cream → cream-muted after full landing
      const muteP = smoothstep(ROLES_FLY_END, ROLES_HOLD_END, progress);
      const mr = Math.round(lerp(0xf0, 0xb0, muteP));
      const mg = Math.round(lerp(0xe6, 0xa8, muteP));
      const mb = Math.round(lerp(0xd0, 0x90, muteP));
      el.style.color = `rgb(${mr},${mg},${mb})`;
    });

    // Fill words: hash-based random stagger (ported from lab prototype)
    const fillSpreadStart = ROLES_FLY_START + flyDur * 0.15;
    const fillSpreadEnd = ROLES_FLY_END + 0.005;
    const fillWordDur = flyDur * 0.25;
    gridFillEls.current.forEach((el, i) => {
      if (!el) return;
      const randOffset = hashToUnit(i * 7.3 + 42);
      const wordStart = lerp(
        fillSpreadStart,
        fillSpreadEnd - fillWordDur,
        randOffset,
      );
      const wordEnd = wordStart + fillWordDur;
      const wordP = smoothstep(wordStart, wordEnd, progress);
      el.style.opacity = String(wordP);
      el.style.transform = `translateY(${lerp(6, 0, wordP)}px)`;
    });

    /* ═══ DRAIN: commits blur out, impacts fade in ═══ */
    const drainP = smoothstep(ROLES_HOLD_END, ROLES_DRAIN_END, progress);

    // Commit lines: blur + fade during first 35% of drain
    commitLineEls.current.forEach((el, i) => {
      if (!el) return;
      const stagger = (i % 4) * 0.05;
      const lineP = smoothstep(stagger, 0.35 + stagger * 0.3, drainP);
      el.style.opacity = String(1 - lineP);
      el.style.filter = lineP > 0.01 ? `blur(${lerp(0, 4, lineP)}px)` : "none";
    });

    // Seed word placeholders: also fade during drain
    if (drainP > 0.01) {
      gridSeedRefs.current.forEach((el) => {
        const seedDrain = smoothstep(0.05, 0.35, drainP);
        const currentOpacity = parseFloat(el.style.opacity || "1");
        el.style.opacity = String(Math.min(currentOpacity, 1 - seedDrain));
        if (seedDrain > 0.01) el.style.filter = `blur(${lerp(0, 4, seedDrain)}px)`;
      });
    }

    // Impact metrics: fade in 20–40%, hold 40–82%, fade out 82–96%
    impactLineEls.current.forEach((el, i) => {
      if (!el) return;
      const stagger = (i % 4) * 0.04;
      const fadeIn = smoothstep(0.20 + stagger, 0.40 + stagger, drainP);
      const fadeOut = 1 - smoothstep(0.82, 0.96, drainP);
      el.style.opacity = String(fadeIn * fadeOut);
      el.style.transform = `translateY(${lerp(4, 0, fadeIn)}px)`;
    });

    /* ═══ THESIS ═══ */
    if (skipThesis) {
      if (thesisEls.current[0]) thesisEls.current[0].style.opacity = "0";
    } else if (thesisEls.current[0]) {
      const thesisFadeInEnd = THESIS_START + PHASES.thesis * THESIS.fadeInFrac;
      const thesisFadeOutStart =
        THESIS_END - PHASES.thesis * THESIS.fadeOutFrac;
      const fadeIn = smoothstep(THESIS_START, thesisFadeInEnd, progress);
      const fadeOut = 1 - smoothstep(thesisFadeOutStart, THESIS_END, progress);
      const wordRevealZone =
        THESIS_START + PHASES.thesis * THESIS.wordZoneFrac;
      const driftFast = smoothstep(THESIS_START, wordRevealZone, progress);
      const driftSlow = smoothstep(wordRevealZone, THESIS_END, progress);
      const driftAmount =
        driftFast * THESIS.driftFastWeight + driftSlow * THESIS.driftSlowWeight;
      const yStart = isDesktop ? THESIS.yStartLg : THESIS.yStartSm;
      const yEnd = isDesktop ? THESIS.yEndLg : THESIS.yEndSm;
      thesisEls.current[0].style.opacity = String(fadeIn * fadeOut);
      thesisEls.current[0].style.transform = `translate(-50%, calc(-50% + ${lerp(yStart, yEnd, driftAmount)}vh))`;
      thesisEls.current[0].style.filter = `blur(${lerp(THESIS.initialBlur, 0, fadeIn)}px)`;
      thesisEls.current[0].style.maxWidth = isDesktop
        ? THESIS.maxWidthLg
        : THESIS.maxWidthSm;

      const WORD_THRESHOLDS = Array.from(
        { length: THESIS.wordCount },
        (_, wIdx) => wordRevealZone + wIdx * THESIS.wordStagger,
      );
      for (let wordIdx = 0; wordIdx < THESIS.wordCount; wordIdx++) {
        const wordEl = thesisWordRefs.current[wordIdx];
        if (!wordEl) continue;
        const wordProgress = smoothstep(
          WORD_THRESHOLDS[wordIdx],
          WORD_THRESHOLDS[wordIdx] + THESIS.wordRevealDur,
          progress,
        );
        wordEl.style.opacity = String(wordProgress);
        wordEl.style.transform = `translateY(${lerp(THESIS.wordDropPx, 0, wordProgress)}px)`;
        wordEl.style.display = "inline-block";
      }
    }
  }

  /**
   * Must be called once after mount so the hook can measure grid target
   * positions relative to the sticky viewport.
   */
  function setStickyViewport(el: HTMLDivElement | null) {
    stickyViewportRef.current = el;
  }

  /* ---- JSX ---- */
  let fillIdx = 0;
  const setFillRef = (el: HTMLElement | null) => {
    const idx = fillIdx++;
    gridFillEls.current[idx] = el;
  };
  let commitLineIdx = 0;
  const setCommitLineRef = (el: HTMLElement | null) => {
    const idx = commitLineIdx++;
    commitLineEls.current[idx] = el;
  };
  let impactLineIdx = 0;
  const setImpactLineRef = (el: HTMLElement | null) => {
    const idx = impactLineIdx++;
    impactLineEls.current[idx] = el;
  };

  const jsx = (
    <>
      {/* Atmosphere — dot grid */}
      <div
        ref={atmosphereGridEl}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow elements — ambient color wash */}
      <div
        ref={glowEl}
        aria-hidden
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(91,158,194,0.04) 0%, transparent 70%)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={innerGlowEl}
        aria-hidden
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />

      {/* Embers */}
      {embers.map((e, i) => (
        <div
          key={`ember-${i}`}
          ref={(element) => {
            emberEls.current[i] = element;
          }}
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: e.size,
            height: e.size,
            background:
              "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 70%, transparent 100%)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Convergence fragments — scale down on mobile for less clutter */}
      {fragments.map((fragment, i) => {
        const setRef = (element: HTMLElement | null) => {
          fragmentEls.current[i] = element;
        };
        const base =
          "absolute left-1/2 top-1/2 select-none pointer-events-none";

        if (fragment.isSeed && fragment.type === "seed") {
          return (
            <span
              key={`seed-${fragment.text}-${i}`}
              ref={setRef as (el: HTMLSpanElement | null) => void}
              aria-hidden
              className={`${base} whitespace-nowrap font-sans`}
              style={{
                fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                fontWeight: fragment.weight,
                opacity: 0,
                letterSpacing: "0.04em",
                willChange: "transform, opacity, filter",
              }}>
              {fragment.text}
            </span>
          );
        }

        switch (fragment.type) {
          case "code":
            return (
              <div
                key={`code-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} whitespace-nowrap`}
                style={{
                  opacity: 0,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "rgba(14,14,20,0.85)",
                  border: `1px solid ${fcExt(fragment.companyIdx, 0.25)}`,
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  color: fcExt(fragment.companyIdx, 0.95),
                  letterSpacing: "0.02em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: "rgba(198,120,221,0.9)" }}>
                  {fragment.code.match(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                  )?.[0] ?? ""}
                </span>
                <span style={{ color: fcExt(fragment.companyIdx, 0.85) }}>
                  {fragment.code.replace(
                    /^(const |let |var |export |async |await |function |interface |import )/,
                    "",
                  )}
                </span>
              </div>
            );
          case "logo":
            return (
              <div
                key={`logo-${fragment.logoKey}-${i}`}
                ref={setRef}
                aria-hidden
                className={base}
                style={{
                  opacity: 0,
                  willChange: "transform, opacity, filter",
                }}>
                <svg
                  viewBox={fragment.label ? "0 0 24 36" : "0 0 24 24"}
                  fill="none"
                  style={{
                    overflow: "visible",
                    width: `calc(${fragment.logoSize}px * var(--frag-scale))`,
                    height: `calc(${fragment.label ? fragment.logoSize * 1.5 : fragment.logoSize}px * var(--frag-scale))`,
                  }}>
                  {LOGOS[fragment.logoKey]}
                  {fragment.label && (
                    <text
                      x="12"
                      y="31"
                      textAnchor="middle"
                      fill="var(--cream-muted)"
                      fontSize="5"
                      fontFamily="var(--font-sans)"
                      letterSpacing="0.06em"
                      style={{ textTransform: "uppercase" }}>
                      {fragment.label}
                    </text>
                  )}
                </svg>
              </div>
            );
          case "command":
            return (
              <div
                key={`cmd-${i}`}
                ref={setRef}
                aria-hidden
                className={`${base} whitespace-nowrap`}
                style={{
                  opacity: 0,
                  padding: "5px 10px",
                  borderRadius: "4px",
                  background: "rgba(7,7,10,0.9)",
                  border: `1px solid ${fcExt(fragment.companyIdx, 0.2)}`,
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.01em",
                  willChange: "transform, opacity, filter",
                }}>
                <span style={{ color: fcExt(fragment.companyIdx, 0.85) }}>
                  ${" "}
                </span>
                <span style={{ color: fcExt(fragment.companyIdx, 0.7) }}>
                  {fragment.cmd}
                </span>
              </div>
            );
          default:
            return (
              <span
                key={`${fragment.type}-${fragment.text}-${i}`}
                ref={setRef as (element: HTMLSpanElement | null) => void}
                aria-hidden
                className={`${base} whitespace-nowrap font-sans`}
                style={{
                  fontSize: `calc(${fragment.size}rem * var(--frag-scale))`,
                  fontWeight: fragment.weight,
                  color: fcExt(fragment.companyIdx, 0.95),
                  opacity: 0,
                  letterSpacing:
                    fragment.type === "tag"
                      ? "0.06em"
                      : fragment.type === "seed"
                        ? "0.04em"
                        : "0.02em",
                  willChange: "transform, opacity, filter",
                  ...(fragment.type === "tag"
                    ? {
                        padding: "2px 8px",
                        borderRadius: "3px",
                        border: `1px solid ${fcExt(fragment.companyIdx, 0.2)}`,
                        background: fcExt(fragment.companyIdx, 0.05),
                      }
                    : {}),
                }}>
                {fragment.text}
              </span>
            );
        }
      })}

      {/* Company roles grid (2x2) */}
      <div
        ref={rolesGridEl}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0 }}>
        <div
          className="grid grid-cols-2 mx-auto w-full max-w-4xl px-3 sm:px-8 gap-x-3 sm:gap-x-6 gap-y-5 sm:gap-y-0">
          {COMPANIES.map((company, ci) => {
            const seedSet = new Set(
              company.distillation.seedWords.map((w) => w.toLowerCase()),
            );
            const claimed = new Set<string>();
            return (
              <div
                key={company.hash}
                className="min-w-0"
                style={{
                  paddingLeft: "0.5rem",
                  paddingRight: "0.25rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.8125rem",
                }}>
                <div
                  ref={setFillRef}
                  className="text-sm font-bold sm:text-base lg:text-lg"
                  style={{ color: COLORS.cream, opacity: 0 }}>
                  {company.company}
                </div>
                <div
                  ref={setFillRef}
                  className="mt-0.5 font-ui text-xs"
                  style={{ color: COLORS.actBlue, opacity: 0 }}>
                  {company.role}
                </div>
                <div
                  ref={setFillRef}
                  className="mt-1 font-ui text-[11px]"
                  style={{ color: COLORS.textDim, opacity: 0 }}>
                  {company.location} &middot;{" "}
                  <span className="sm:hidden">{company.periodShort}</span>
                  <span className="hidden sm:inline">{company.period}</span>
                </div>
                {/* Commits + overlaid impact metrics */}
                <div className="relative" style={{ marginTop: "0.5rem" }}>
                  {/* Commit lines (blur out during drain) */}
                  <ul className="flex flex-col" style={{ gap: "0.125rem" }}>
                    {company.commits.map((commit, commitIdx) => {
                      const typeColor =
                        COLORS.commitTypes[commit.type as keyof typeof COLORS.commitTypes] ?? COLORS.commitTypes.fallback;
                      return (
                        <li
                          key={commitIdx}
                          ref={setCommitLineRef}
                          className="font-ui text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
                          <span
                            ref={setFillRef}
                            style={{ color: typeColor, opacity: 0 }}>
                            {commit.type}
                          </span>
                          <span
                            ref={setFillRef}
                            style={{ color: COLORS.textFaint, opacity: 0 }}>
                            :{" "}
                          </span>
                          {commit.msg.split(/\s+/).map((word, wordIdx) => {
                            const lower = word
                              .toLowerCase()
                              .replace(/[^a-z]/g, "");
                            const claimKey = `${ci}-${lower}`;
                            const isSeed =
                              seedSet.has(lower) && !claimed.has(claimKey);
                            const msgWords = commit.msg.split(/\s+/);
                            const space =
                              wordIdx < msgWords.length - 1 ? "\u00A0" : "";
                            if (isSeed) {
                              claimed.add(claimKey);
                              const refKey = `${ci}-${commitIdx}-${wordIdx}`;
                              return (
                                <span
                                  key={wordIdx}
                                  ref={(el) => {
                                    if (el)
                                      gridSeedRefs.current.set(refKey, el);
                                  }}
                                  className="inline-block"
                                  style={{
                                    color: COLORS.cream,
                                    opacity: 0,
                                    visibility: "hidden",
                                  }}>
                                  {word}
                                  {space}
                                </span>
                              );
                            }
                            return (
                              <span
                                key={wordIdx}
                                ref={setFillRef}
                                className="inline-block"
                                style={{ color: COLORS.creamMuted, opacity: 0 }}>
                                {word}
                                {space}
                              </span>
                            );
                          })}
                        </li>
                      );
                    })}
                  </ul>
                  {/* Impact metrics (fade in at same positions during drain) */}
                  <ul
                    className="absolute inset-0 flex flex-col"
                    style={{ gap: "0.125rem" }}>
                    {company.repo.impact.map((metric, mi) => {
                      const isPromotion = metric.promoted === true;
                      const baseColor = isPromotion ? COLORS.gold : COLORS.creamMuted;
                      const displayText = metric.text ?? metric.label;
                      const hl = metric.highlight;

                      // Split text around highlight substring
                      let content: React.ReactNode = displayText;
                      if (hl && !isPromotion) {
                        const idx = displayText.indexOf(hl);
                        if (idx >= 0) {
                          content = (
                            <>
                              {displayText.slice(0, idx)}
                              <span style={{ color: COLORS.promoted }}>{hl}</span>
                              {displayText.slice(idx + hl.length)}
                            </>
                          );
                        }
                      }

                      return (
                        <li
                          key={mi}
                          ref={setImpactLineRef}
                          className="font-ui text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]"
                          style={{ opacity: 0, color: baseColor }}>
                          {content}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thesis — keywords highlight sequentially on scroll */}
      <div
        ref={(element) => {
          thesisEls.current[0] = element;
        }}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
          color: "var(--cream)",
          fontWeight: 400,
          maxWidth: THESIS.maxWidthLg,
          lineHeight: 1.5,
          willChange: "transform, opacity, filter",
        }}>
        {CONTENT.thesis.prefix}
        <span style={{ whiteSpace: "nowrap" }}>
          {CONTENT.thesis.keywords.map((word, wordIdx) => (
            <span key={word}>
              <span
                ref={(element) => {
                  thesisWordRefs.current[wordIdx] = element;
                }}
                style={{
                  opacity: 0,
                  willChange: "opacity, transform",
                  marginRight:
                    wordIdx < CONTENT.thesis.keywords.length - 1
                      ? "0.3em"
                      : undefined,
                }}>
                {wordIdx === CONTENT.thesis.keywords.length - 1
                  ? `${CONTENT.thesis.conjunction}${word}.`
                  : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>
    </>
  );

  return { update, jsx, setStickyViewport };
}
