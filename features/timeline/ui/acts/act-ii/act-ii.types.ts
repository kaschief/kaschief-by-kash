/* ==================================================================
   Engineer Candidate — shared types, config objects, and derived
   timing constants.

   Imported by page.tsx (orchestrator) and all sub-components.
   Single source of truth for the scroll animation timeline.
   ================================================================== */

import type { MotionValue } from "framer-motion";

/* ==================================================================
   SHARED PROPS — passed from parent orchestrator to each sub-component
   ================================================================== */

export interface ScrollAnimationProps {
  progress: MotionValue<number>;
  curtainTopRef: React.MutableRefObject<number>;
  isLg: React.MutableRefObject<boolean>;
}

/* ==================================================================
   SCROLL BASE — the "ruler" all phase fractions are authored against.
   CONTAINER_VH is derived at the bottom from the actual content end.
   This means adding/removing phases auto-sizes the container.
   ================================================================== */

const SCROLL_BASE_VH = 2000;

/* ==================================================================
   SCROLL ANIMATION CONSTANTS
   ===========================
   Every timing/styling value lives here. No magic numbers in render logic.
   All scroll values are fractions of total scroll (0–1) unless noted.

   VISUAL SEQUENCE (what the user sees):
   1. TITLE        — "ACT II / THE ENG1NEER" hero text
   2. FRAGMENTS    — keyword words (product, users, code...) + dark pills
                     (code snippets, logos, CLI commands) drift across screen
   3. CONVERGENCE  — keyword words pull toward center, fade out
   4. THESIS       — "Each of my past roles..." sentence fades in with
                     sequential word reveals (product, systems, people, scale)
   5. PARTICLES    — colored dots explode from center, converge to funnel positions
   6. FUNNEL       — SVG Sankey-style ribbons grow tier by tier with dot sources,
                     stream labels, company nodes, and narrator glass panels
   7. TERMINAL     — code typing replay for each company (AMBOSS, Finleap, DKB, Med-El)
                     with narrative reveal (scene → action → shift) per company
   ================================================================== */

/* ==================================================================
   CONFIGURATION OBJECTS — all timing and visual constants grouped
   by the scroll section they control. Values are scroll fractions
   (0–1) unless noted otherwise (px, vh, vw).
   ================================================================== */

/** Top-level phase durations — how much scroll each section occupies */
export const PHASES = {
  title: 0.032,
  convergence: 0.18, // fragments drift + converge
  convergenceTail: 0.04, // extra time after convergence for cleanup
  rolesDissolve: 0.05, // non-seeds dissolve while seeds drift toward grid
  rolesFly: 0.08, // seeds fly to grid positions, fill words appear
  rolesHold: 0.06, // grid visible for reading
  rolesDrain: 0.14, // commits → accomplishments transform + hold + fade
  thesisOverlap: 0.04, // thesis starts this far before convergence ends (crossfade)
  thesis: 0.1, // sentence visible + word reveals
  thesisToParticles: 0.0, // gap (0 = immediate)
  particles: 0.0, // DISABLED — particles removed, funnel starts immediately
  funnel: 0.1, // SVG ribbons grow tier by tier
  merge: 0.1, // streams converge + desaturate into single column
  titleAnchor: 0.005, // title starts this far into scroll
  convergenceToTitle: 0.025, // convergence starts this far after title
} as const;

/** Seed keywords — colored words that drift, converge, and fade */
export const SEED = {
  // Timing offsets (relative to convergence start/end)
  fadeInDuration: 0.05, // appear from blur
  fadeoutDuration: 0.05, // fade during convergence — must finish before thesis
  driftDelay: 0.02, // drift starts after convergence begins
  driftMargin: 0.03, // drift ends before convergence ends
  convergeLead: 0.07, // pull toward center before convergence ends
  heatDelay: 0.07, // scale-up starts after convergence
  heatMargin: 0.02, // heat ends before convergence ends
  shrinkDelay: 0.005, // shrink starts after convergence ends (tail)
  // Visual
  heatMaxScale: 1.3, // 130% at peak heat
  shrinkMinScale: 0.5, // 50% during tail
  initialBlurDur: 0.04, // blur clears over this duration
  maxDissolveBlur: 12, // max blur px for non-seed dissolve
} as const;

/** Non-seed fragments — dark pills with code, logos, commands */
export const FRAGMENTS = {
  earlyStart: 0.01, // appear slightly before seeds
  fadeInDuration: 0.05, // fade-in length
  dissolveSpeed: 0.7, // multiplier on per-pill dissolve range
  driftInset: 0.01, // drift starts/ends inset from convergence bounds
  rotDriftFactor: 0.3, // rotation increases 30% during drift
  alphaCode: 0.75, // code snippet opacity
  alphaLogo: 0.85, // logo opacity
  alphaDefault: 0.75, // other pill types
} as const;

/** Ember sparks — tiny rising particles during convergence phase */
export const EMBER = {
  delay: 0.04, // start this far after convergence
  heatDuration: 0.08, // each spark heats up
  coolLead: 0.05, // start cooling before phase end
  riseDelay: 0.01, // rise starts after phase begins
  baseOpacity: 0.4, // base brightness
  flickerAmp: 0.3, // flicker variation (+/- 30%)
  flickerFreq: 80, // flicker speed
} as const;

/** Grid atmosphere — faint dot grid behind fragments */
export const GRID = {
  delay: 0.02, // start after convergence
  overshoot: 0.01, // extend past convergence gate
  appearDuration: 0.04, // fade-in duration
  fadeLead: 0.06, // start fading before glow end
  maxOpacity: 0.05, // barely visible
} as const;

/** Thesis sentence — fades in, drifts, reveals words sequentially */
export const THESIS = {
  fadeInFrac: 0.3, // first 30% of duration
  fadeOutFrac: 0.3, // last 30% of duration
  wordZoneFrac: 0.35, // word reveals begin at 35%
  driftFastWeight: 0.85, // 85% drift before reveals
  driftSlowWeight: 0.15, // 15% drift during reveals
  yStartLg: 4, // desktop: start 4vh below center
  yStartSm: -4, // mobile: start 4vh above center
  yEndLg: -8, // desktop: drift to 8vh above
  yEndSm: -14, // mobile: drift to 14vh above
  initialBlur: 6, // px blur at start
  maxWidthLg: "min(60vw, 900px)",
  maxWidthSm: "85vw",
  wordStagger: 0.01, // gap between each word reveal
  wordRevealDur: 0.007, // each word's fade-in duration
  wordDropPx: 10, // each word drops from 10px above
  wordCount: 4, // "product", "systems", "people", "scale"
} as const;

/** Curtain — opaque wipe that erases the thesis sentence */
export const CURTAIN_THESIS = {
  pauseAfterWords: 0.03, // pause after last keyword before curtain begins (fraction of progress)
  sweepDuration: 0.19, // how long the curtain sweep takes (fraction of progress)
  accentColor: "var(--gold, #C9A84C)",
} as const;

/** Prefix dissolution — non-keyword text blurs + fades as curtain approaches */
export const PREFIX_DISSOLVE = {
  lookaheadFrac: 0.4, // start dissolving when line is this fraction of viewport height below text
  fullBlurPx: 8, // max blur (matches lab-focus)
  minOpacity: 0.15, // dim but not gone (matches lab-focus)
} as const;

/** Post-curtain keyword reveal — words appear on clean canvas then float to position */
export const POST_CURTAIN = {
  color: "var(--gold, #C9A84C)",
  appearDuration: 0.02, // scroll progress for fade-in
  driftDuration: 0.08, // scroll progress for center → destination drift
  startFontSizeVw: 5, // vw at center appearance
  endFontSizeVw: 3.5, // vw at settled position
  endTopPercent: 12, // % from top when settled
  endLeftPercent: 8, // % from left when settled
} as const;

/** Particle animation — canvas dots explode then converge to SVG positions */
export const PARTICLE = {
  // Sub-phases (fractions of local 0–1 particle progress)
  canvasInStart: 0.0,
  canvasInEnd: 0.05,
  explodeStart: 0.05,
  explodeEnd: 0.2,
  convergeStart: 0.2,
  convergeEnd: 0.45,
  fadeOutStart: 0.4,
  fadeOutEnd: 0.55,
  // Spawn randomization
  angleSpread: 1.4, // radians
  radiusMin: 0.12, // fraction of viewport
  radiusRange: 0.28,
  sizeMin: 2, // px
  sizeRange: 2.5, // px
  // Canvas render
  appearDur: 0.015, // fade-in duration
  alphaCutoff: 0.01, // skip below this (perf)
  convergeShrink: 0.6, // shrink to 60%
  dotOpacity: 0.85,
  glowOpacity: 0.25,
  glowFade: 0.7, // glow fades during convergence
  glowRadius: 3, // Nx dot size
} as const;

/** Canvas → SVG crossfade timing */
export const CANVAS_XFADE = {
  inDuration: 0.01, // canvas wrapper fade-in
  outFrac: 0.35, // canvas out at 35% of particle duration
  outEndFrac: 0.5, // canvas gone at 50%
} as const;

/** SVG funnel — ribbons, dots, labels, nodes */
export const FUNNEL = {
  svgInDuration: 0.02,
  dotsInDuration: 0.03,
  labelsLead: 0.02, // labels start before SVG
  labelsInDuration: 0.02,
  convergePtOvershoot: 0.02, // diamond extends past last tier
  // Dot visuals
  dotStagger: 0.003,
  dotScaleStart: 2,
  dotScaleEnd: 1,
  dotGlowStart: 6, // px
  dotGlowEnd: 3, // px
  // Label visuals
  labelStagger: 0.002,
  labelSlideY: -10, // px
  // Company node badges
  nodeAppearFrac: 0.7, // 70% into ribbon tier
  nodeSlideY: 8, // px
  // Convergence diamond
  convergeMaxBlur: 12, // px
  // Narrator panels
  narratorFadeInFrac: 0.15,
  narratorFadeOutFrac: 0.85,
  narratorMaxOpacity: 0.75,
  narratorSlideY: 12, // px
  narratorTopFracs: [0.28, 0.42, 0.58, 0.74] as readonly number[],
  // Tier timing
  narratorDelayFrac: 0.4, // narrator starts 40% into tier
  narratorOvershoot: 0.3, // narrator lingers 30% past tier
  captionOvershoot: 0.3,
} as const;

/** Mobile skill cards — replace funnel on phone screens */
export const MOBILE_SKILLS = {
  appearDur: 0.03,
  disappearDur: 0.015,
  skillStagger: 0.005,
  skillFadeDur: 0.02,
  skillSlideX: 40, // px
  skillScaleStart: 0.8,
} as const;

/** Chrome — title fade, curtain reveal */
export const EC_UI_CONFIG = {
  labelOpacity: 0.3,
  titleSlowFadeMult: 3,
  titleCurtainThreshold: 0.3, // summary panel erases title at 30% up viewport
  titleCurtainRange: 0.2, // title fully erased over next 20%
  curtainFadePx: 80, // fragment curtain reveal gradient zone
  titleHoldMs: 1800, // Lenis hold duration after title enters view (ms)
  titleScrambleStaggerMs: 70, // scramble word stagger delay
  titleScrambleCycles: 6, // scramble cycles per character
  titleScrambleIntervalMs: 70, // scramble update interval
} as const;

/** Lenses integration — offsets for scroll mapping */
export const LENSES_INTEGRATION = {
  earlyOffset: 0.015, // thesis starts slightly before THESIS_START
  mobileScrollFactor: 0.5, // mobile scroll distance multiplier
} as const;

/* ==================================================================
   DERIVED TIMING CHAIN — computed from config objects above.
   Change a duration → everything downstream shifts automatically.
   ================================================================== */

/*
 * Internal timing chain — computed in SCROLL_BASE fractions (not exported).
 * The `raw` prefix distinguishes these from the rescaled exports below.
 */

/* Title */
const rawTitleStart = PHASES.titleAnchor;
const rawTitleEnd = rawTitleStart + PHASES.title;

/* Convergence */
const rawConvergenceStart = rawTitleStart + PHASES.convergenceToTitle;
const rawConvergenceEnd = rawConvergenceStart + PHASES.convergence;
const rawConvergenceGate = rawConvergenceEnd + PHASES.convergenceTail;

/* Embers + atmosphere */
const rawEmbersStart = rawConvergenceStart + EMBER.delay;
const rawGlowStart = rawConvergenceStart + GRID.delay;
const rawGlowEnd = rawConvergenceGate + GRID.overshoot;

/* Roles grid — seeds fly from cloud to 2x2 company grid */
const rawRolesDissolveStart = rawConvergenceGate;
const rawRolesDissolveEnd = rawRolesDissolveStart + PHASES.rolesDissolve;
const rawRolesFlyStart = rawRolesDissolveEnd;
const rawRolesFlyEnd = rawRolesFlyStart + PHASES.rolesFly;
const rawRolesHoldEnd = rawRolesFlyEnd + PHASES.rolesHold;
const rawRolesDrainEnd = rawRolesHoldEnd + PHASES.rolesDrain;

/* Thesis — starts cleanly after roles drain (tiny gap) */
const rawThesisStart = rawRolesDrainEnd + 0.003;
const rawThesisEnd = rawThesisStart + PHASES.thesis;

/* Seed sub-phases */
const rawSeedFadeInStart = rawConvergenceStart;
const rawSeedFadeInEnd = rawConvergenceStart + SEED.fadeInDuration;
const rawSeedDriftStart = rawConvergenceStart + SEED.driftDelay;
const rawSeedDriftEnd = rawConvergenceEnd - SEED.driftMargin;
const rawSeedConvergeStart = rawConvergenceEnd - SEED.convergeLead;
const rawSeedHeatStart = rawConvergenceStart + SEED.heatDelay;
const rawSeedHeatEnd = rawConvergenceEnd - SEED.heatMargin;
const rawSeedShrinkStart = rawConvergenceEnd + SEED.shrinkDelay;

/* Fragment sub-phases */
const rawFragFadeInStart = rawConvergenceStart - FRAGMENTS.earlyStart;
const rawFragFadeInEnd = rawConvergenceStart + FRAGMENTS.fadeInDuration;

/* Particles */
const rawParticlesStart = rawThesisEnd + PHASES.thesisToParticles;
const rawParticlesEnd = rawParticlesStart + PHASES.particles;

/* Canvas crossfade */
const rawCanvasInStart = rawParticlesStart;
const rawCanvasInEnd = rawParticlesStart + CANVAS_XFADE.inDuration;
const rawCanvasOutStart =
  rawParticlesStart + PHASES.particles * CANVAS_XFADE.outFrac;
const rawCanvasOutEnd =
  rawParticlesStart + PHASES.particles * CANVAS_XFADE.outEndFrac;

/* SVG funnel */
const rawSvgInStart = rawCanvasOutStart;
const rawSvgInEnd = rawCanvasOutStart + FUNNEL.svgInDuration;
const rawDotsInStart = rawSvgInStart;
const rawDotsInEnd = rawSvgInStart + FUNNEL.dotsInDuration;
const rawLabelsInStart = rawSvgInStart - FUNNEL.labelsLead;
const rawLabelsInEnd = rawSvgInStart + FUNNEL.labelsInDuration;

/* Ribbon tiers */
const rawRibbonStart = rawSvgInEnd;
const rawTierDuration = PHASES.funnel / 4;
const rawRibbonTiers = [0, 1, 2, 3].map((i) => ({
  start: rawRibbonStart + i * rawTierDuration,
  end: rawRibbonStart + (i + 1) * rawTierDuration,
}));
const rawFunnelComplete = rawRibbonTiers[3].end;

/* Merge — streams converge into single column */
const rawMergeStart = rawFunnelComplete;
const rawMergeEnd = rawMergeStart + PHASES.merge;

/* Convergence point */
const rawConvergePtStart = rawRibbonTiers[3].start;
const rawConvergePtEnd = rawFunnelComplete + FUNNEL.convergePtOvershoot;

/* Narrator + caption tiers */
const rawNarratorTiers = rawRibbonTiers.map((t) => ({
  start: t.start + rawTierDuration * FUNNEL.narratorDelayFrac,
  end: t.end + rawTierDuration * FUNNEL.narratorOvershoot,
}));
const rawCaptionTiers = rawRibbonTiers.map((t) => ({
  start: t.start,
  end: t.end + rawTierDuration * FUNNEL.captionOvershoot,
}));

/* ==================================================================
   AUTO-SIZED CONTAINER
   =====================
   CONTAINER_VH is derived from the last phase in the chain.
   Adding/removing a phase automatically adjusts the container height.
   All exported constants are rescaled so progress 0–1 maps exactly
   to the content, with no dead space.
   ================================================================== */

const rawContentEnd = rawMergeEnd + 0.01;

/** Container height in vh — auto-sized to content. */
export const CONTAINER_VH = Math.ceil(rawContentEnd * SCROLL_BASE_VH);

/** Rescale a SCROLL_BASE fraction to a container fraction (0–1). */
const rescale = (v: number) => v / rawContentEnd;

/* ---- Rescaled exports (consumed by animation hooks) ---- */

export const TITLE_START = rescale(rawTitleStart);
export const TITLE_END = rescale(rawTitleEnd);
export const CONVERGENCE_START = rescale(rawConvergenceStart);
export const CONVERGENCE_END = rescale(rawConvergenceEnd);
export const CONVERGENCE_GATE = rescale(rawConvergenceGate);
export const EMBERS_START = rescale(rawEmbersStart);
export const EMBERS_END = rescale(rawConvergenceGate);
export const GLOW_START = rescale(rawGlowStart);
export const GLOW_END = rescale(rawGlowEnd);
export const THESIS_START = rescale(rawThesisStart);
export const THESIS_END = rescale(rawThesisEnd);
export const SEED_FADE_IN_START = rescale(rawSeedFadeInStart);
export const SEED_FADE_IN_END = rescale(rawSeedFadeInEnd);
export const SEED_DRIFT_START = rescale(rawSeedDriftStart);
export const SEED_DRIFT_END = rescale(rawSeedDriftEnd);
export const SEED_CONVERGE_START = rescale(rawSeedConvergeStart);
export const SEED_CONVERGE_END = rescale(rawConvergenceEnd);
export const SEED_HEAT_START = rescale(rawSeedHeatStart);
export const SEED_HEAT_END = rescale(rawSeedHeatEnd);
export const SEED_SCALE_SHRINK_START = rescale(rawSeedShrinkStart);
export const SEED_SCALE_SHRINK_END = rescale(rawConvergenceGate);
export const FRAG_FADE_IN_START = rescale(rawFragFadeInStart);
export const FRAG_FADE_IN_END = rescale(rawFragFadeInEnd);
export const ROLES_DISSOLVE_START = rescale(rawRolesDissolveStart);
export const ROLES_DISSOLVE_END = rescale(rawRolesDissolveEnd);
export const ROLES_FLY_START = rescale(rawRolesFlyStart);
export const ROLES_FLY_END = rescale(rawRolesFlyEnd);
export const ROLES_HOLD_END = rescale(rawRolesHoldEnd);
export const ROLES_DRAIN_END = rescale(rawRolesDrainEnd);
export const PARTICLES_START = rescale(rawParticlesStart);
export const PARTICLES_END = rescale(rawParticlesEnd);
export const CANVAS_IN_START = rescale(rawCanvasInStart);
export const CANVAS_IN_END = rescale(rawCanvasInEnd);
export const CANVAS_OUT_START = rescale(rawCanvasOutStart);
export const CANVAS_OUT_END = rescale(rawCanvasOutEnd);
export const SVG_IN_START = rescale(rawSvgInStart);
export const SVG_IN_END = rescale(rawSvgInEnd);
export const DOTS_IN_START = rescale(rawDotsInStart);
export const DOTS_IN_END = rescale(rawDotsInEnd);
export const LABELS_IN_START = rescale(rawLabelsInStart);
export const LABELS_IN_END = rescale(rawLabelsInEnd);
export const RIBBON_START = rescale(rawRibbonStart);
export const TIER_DURATION = rescale(rawTierDuration);
export const RIBBON_TIERS = rawRibbonTiers.map((t) => ({
  start: rescale(t.start),
  end: rescale(t.end),
}));
export const FUNNEL_COMPLETE = rescale(rawFunnelComplete);
export const MERGE_START = rescale(rawMergeStart);
export const MERGE_END = rescale(rawMergeEnd);
export const CONVERGE_PT_START = rescale(rawConvergePtStart);
export const CONVERGE_PT_END = rescale(rawConvergePtEnd);
export const NARRATOR_TIERS = rawNarratorTiers.map((t) => ({
  start: rescale(t.start),
  end: rescale(t.end),
}));
export const CAPTION_TIERS = rawCaptionTiers.map((t) => ({
  start: rescale(t.start),
  end: rescale(t.end),
}));
/* ---- Assembled SCROLL_PHASES object (consumed by scroll callbacks) ---- */
export const SCROLL_PHASES = {
  TITLE: { start: TITLE_START, end: TITLE_END },
  CONVERGENCE: { start: CONVERGENCE_START, end: CONVERGENCE_END },
  CONVERGENCE_GATE,
  EMBERS: { start: EMBERS_START, end: EMBERS_END },
  GLOW: { start: GLOW_START, end: GLOW_END },
  ROLES_DISSOLVE: { start: ROLES_DISSOLVE_START, end: ROLES_DISSOLVE_END },
  ROLES_FLY: { start: ROLES_FLY_START, end: ROLES_FLY_END },
  ROLES_HOLD_END,
  ROLES_DRAIN_END,
  THESIS: { start: THESIS_START, end: THESIS_END },
  PARTICLES: { start: PARTICLES_START, end: PARTICLES_END },
  CANVAS_OUT: { start: CANVAS_OUT_START, end: CANVAS_OUT_END },
  SVG_IN: { start: SVG_IN_START, end: SVG_IN_END },
  DOTS_IN: { start: DOTS_IN_START, end: DOTS_IN_END },
  LABELS_IN: { start: LABELS_IN_START, end: LABELS_IN_END },
  RIBBON_TIERS,
  CONVERGE_PT: { start: CONVERGE_PT_START, end: CONVERGE_PT_END },
  CAPTION_TIERS,
  NARRATOR_TIERS,
};

/** Canvas particle local phases (0–1 within PARTICLES range) */
export const PARTICLE_PHASES = {
  CANVAS_IN: [PARTICLE.canvasInStart, PARTICLE.canvasInEnd] as const,
  EXPLODE: [PARTICLE.explodeStart, PARTICLE.explodeEnd] as const,
  CONVERGE: [PARTICLE.convergeStart, PARTICLE.convergeEnd] as const,
  FADE_OUT: [PARTICLE.fadeOutStart, PARTICLE.fadeOutEnd] as const,
};
