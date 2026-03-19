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

export interface ForgeScrollProps {
  progress: MotionValue<number>;
  curtainTopRef: React.MutableRefObject<number>;
  isLg: React.MutableRefObject<boolean>;
}

/* ==================================================================
   CONTAINER
   ================================================================== */

export const CONTAINER_VH = 2000;

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
   7. MID NARRATOR — "Let me show you where I've been" transition text
   8. TERMINAL     — code typing replay for each company (AMBOSS, Finleap, DKB, Med-El)
                     with narrative reveal (scene → action → shift) per company
   9. CRYSTALLIZE  — 4 principle cards fade in with blur, settle into grid
   ================================================================== */

/* ==================================================================
   CONFIGURATION OBJECTS — all timing and visual constants grouped
   by the scroll section they control. Values are scroll fractions
   (0–1) unless noted otherwise (px, vh, vw).
   ================================================================== */

/** Top-level phase durations — how much scroll each section occupies */
export const PHASES = {
  title:            0.032,
  forge:            0.18,   // fragments drift + converge
  forgeTail:        0.04,   // extra time after convergence for cleanup
  thesisOverlap:    0.04,   // thesis starts this far before forge ends (crossfade)
  thesis:           0.10,   // sentence visible + word reveals
  thesisToParticles:0.0,    // gap (0 = immediate)
  particles:        0.14,   // canvas dots explode → converge to SVG
  funnel:           0.1,    // SVG ribbons grow tier by tier
  funnelLinger:     0.02,   // funnel holds complete before fading
  funnelFade:       0.025,  // funnel fade-out
  funnelToTerminal: 0.015,  // gap between funnel and terminal
  terminalCompany:  0.085,  // scroll per company (typing + narrative + wipe)
  terminalToCrystal:0.015,  // gap between terminal and crystallize
  crystallize:      0.08,   // principle cards appear + settle
  titleAnchor:      0.005,  // title starts this far into scroll
  forgeToTitle:     0.025,  // forge starts this far after title
} as const;

/** Seed keywords — colored words that drift, converge, and fade */
export const SEED = {
  // Timing offsets (relative to forge start/end)
  fadeInDuration:    0.05,   // appear from blur
  fadeoutDuration:   0.05,   // fade during convergence — must finish before thesis
  driftDelay:        0.02,   // drift starts after forge begins
  driftMargin:       0.03,   // drift ends before forge ends
  convergeLead:      0.07,   // pull toward center before forge ends
  heatDelay:         0.07,   // scale-up starts after forge
  heatMargin:        0.02,   // heat ends before forge ends
  shrinkDelay:       0.005,  // shrink starts after forge ends (tail)
  // Visual
  heatMaxScale:      1.3,    // 130% at peak heat
  shrinkMinScale:    0.5,    // 50% during tail
  initialBlurDur:    0.04,   // blur clears over this duration
  maxDissolveBlur:   12,     // max blur px for non-seed dissolve
} as const;

/** Non-seed fragments — dark pills with code, logos, commands */
export const FRAGMENTS = {
  earlyStart:        0.01,   // appear slightly before seeds
  fadeInDuration:     0.05,   // fade-in length
  dissolveSpeed:     0.7,    // multiplier on per-pill dissolve range
  driftInset:        0.01,   // drift starts/ends inset from forge bounds
  rotDriftFactor:    0.3,    // rotation increases 30% during drift
  alphaCode:         0.75,   // code snippet opacity
  alphaLogo:         0.85,   // logo opacity
  alphaDefault:      0.75,   // other pill types
} as const;

/** Ember sparks — tiny rising particles during forge phase */
export const EMBER = {
  delay:             0.04,   // start this far after forge
  heatDuration:      0.08,   // each spark heats up
  coolLead:          0.05,   // start cooling before phase end
  riseDelay:         0.01,   // rise starts after phase begins
  baseOpacity:       0.4,    // base brightness
  flickerAmp:        0.3,    // flicker variation (+/- 30%)
  flickerFreq:       80,     // flicker speed
} as const;

/** Grid atmosphere — faint dot grid behind fragments */
export const GRID = {
  delay:             0.02,   // start after forge
  overshoot:         0.01,   // extend past forge gate
  appearDuration:    0.04,   // fade-in duration
  fadeLead:          0.06,   // start fading before glow end
  maxOpacity:        0.05,   // barely visible
} as const;

/** Thesis sentence — fades in, drifts, reveals words sequentially */
export const THESIS = {
  fadeInFrac:        0.3,    // first 30% of duration
  fadeOutFrac:       0.3,    // last 30% of duration
  wordZoneFrac:      0.35,   // word reveals begin at 35%
  driftFastWeight:   0.85,   // 85% drift before reveals
  driftSlowWeight:   0.15,   // 15% drift during reveals
  yStartLg:          4,      // desktop: start 4vh below center
  yStartSm:         -4,      // mobile: start 4vh above center
  yEndLg:           -8,      // desktop: drift to 8vh above
  yEndSm:           -14,     // mobile: drift to 14vh above
  initialBlur:       6,      // px blur at start
  maxWidthLg:        "60vw",
  maxWidthSm:        "85vw",
  wordStagger:       0.01,   // gap between each word reveal
  wordRevealDur:     0.007,  // each word's fade-in duration
  wordDropPx:        10,     // each word drops from 10px above
  wordCount:         4,      // "product", "systems", "people", "scale"
} as const;

/** Particle animation — canvas dots explode then converge to SVG positions */
export const PARTICLE = {
  // Sub-phases (fractions of local 0–1 particle progress)
  canvasInStart:     0.0,
  canvasInEnd:       0.05,
  explodeStart:      0.05,
  explodeEnd:        0.2,
  convergeStart:     0.2,
  convergeEnd:       0.45,
  fadeOutStart:      0.4,
  fadeOutEnd:        0.55,
  // Spawn randomization
  angleSpread:       1.4,    // radians
  radiusMin:         0.12,   // fraction of viewport
  radiusRange:       0.28,
  sizeMin:           2,      // px
  sizeRange:         2.5,    // px
  // Canvas render
  appearDur:         0.015,  // fade-in duration
  alphaCutoff:       0.01,   // skip below this (perf)
  convergeShrink:    0.6,    // shrink to 60%
  dotOpacity:        0.85,
  glowOpacity:       0.25,
  glowFade:          0.7,    // glow fades during convergence
  glowRadius:        3,      // Nx dot size
} as const;

/** Canvas → SVG crossfade timing */
export const CANVAS_XFADE = {
  inDuration:        0.01,   // canvas wrapper fade-in
  outFrac:           0.35,   // canvas out at 35% of particle duration
  outEndFrac:        0.5,    // canvas gone at 50%
} as const;

/** SVG funnel — ribbons, dots, labels, nodes */
export const FUNNEL = {
  // Wrapper timing
  svgInDuration:     0.02,
  dotsInDuration:    0.03,
  labelsLead:        0.02,   // labels start before SVG
  labelsInDuration:  0.02,
  convergePtOvershoot: 0.02, // diamond extends past last tier
  // Dot visuals
  dotStagger:        0.003,
  dotScaleStart:     2,
  dotScaleEnd:       1,
  dotGlowStart:      6,      // px
  dotGlowEnd:        3,      // px
  // Label visuals
  labelStagger:      0.002,
  labelSlideY:       -10,    // px
  // Company node badges
  nodeAppearFrac:    0.7,    // 70% into ribbon tier
  nodeSlideY:        8,      // px
  // Convergence diamond
  convergeMaxBlur:   12,     // px
  // Narrator panels
  narratorFadeInFrac:  0.15,
  narratorFadeOutFrac: 0.85,
  narratorMaxOpacity:  0.75,
  narratorSlideY:      12,   // px
  narratorTopFracs:    [0.28, 0.42, 0.58, 0.74] as readonly number[],
  // Tier timing
  narratorDelayFrac:   0.4,  // narrator starts 40% into tier
  narratorOvershoot:   0.3,  // narrator lingers 30% past tier
  captionOvershoot:    0.3,
} as const;

/** Mobile skill cards — replace funnel on phone screens */
export const MOBILE_SKILLS = {
  appearDur:         0.03,
  disappearDur:      0.015,
  skillStagger:      0.005,
  skillFadeDur:      0.02,
  skillSlideX:       40,     // px
  skillScaleStart:   0.8,
} as const;

/** Mid narrator — "Let me show you where I've been" */
export const MID_NARRATOR = {
  delay:             0.005,  // starts just after funnel fades
  duration:          0.035,
  fadeDur:           0.005,  // very quick fade in/out
  slideY:            10,     // px
} as const;

/** Terminal — code typing replay per company */
export const TERMINAL = {
  fadeDur:           0.01,
  companyCount:      4,
  // Typing sub-phases (fraction of company progress)
  typingP1:          0.2,    // first block done
  typingP2:          0.35,   // second block done
  typingP3:          0.48,   // third block done
  narStart:          0.5,    // narrative begins
  narEnd:            0.88,   // narrative complete
  wipeStart:         0.9,
  wipeEnd:           0.97,
  wipeComplete:      0.99,
  // Promotion highlight
  promotionFg:       "#FBBF24",
  promotionBg:       "rgba(251,191,36,0.08)",
  // Dot indicator
  dotActiveWidth:    "20px",
  dotInactiveWidth:  "6px",
  dotInactiveOpacity: 0.35,
} as const;

/** Terminal narrative sub-phases (within narStart→narEnd, mapped 0–1) */
export const TERMINAL_NARRATOR = {
  sceneEnd:          0.4,
  actionStart:       0.42,
  actionEnd:         0.6,
  shiftStart:        0.62,
  shiftEnd:          0.8,
  fadeoutStart:      0.9,
  fadeoutEnd:        0.95,
  headerFadeEnd:     0.1,
  slideY:            8,      // px
} as const;

/** Crystallize — 4 principle cards fade in and settle */
export const CRYSTALLIZE = {
  lineAppearStart:   0.15,
  lineAppearEnd:     0.35,
  lineOpacity:       0.3,
  staggerFrac:       0.06,
  fadeInStartFrac:   0.2,
  fadeInEndFrac:     0.55,
  settleStartFrac:   0.35,
  settleEndFrac:     0.85,
  yOffset:           6,      // vh
  initialBlur:       6,      // px
  mobileSpacing:     20,     // vh
  mobileCenter:      1.5,
  maxWidthLg:        "44vw",
  maxWidthSm:        "min(320px, 85vw)",
} as const;

/** Chrome — debug overlay, title fade, curtain reveal */
export const CHROME = {
  labelOpacity:      0.3,
  titleSlowFadeMult: 3,
  titleCurtainThreshold: 0.3,  // summary panel erases title at 30% up viewport
  titleCurtainRange: 0.2,      // title fully erased over next 20%
  curtainFadePx:     80,       // fragment curtain reveal gradient zone
} as const;

/* ==================================================================
   DERIVED TIMING CHAIN — computed from config objects above.
   Change a duration → everything downstream shifts automatically.
   ================================================================== */

/* ---- Anchor: title starts near the top ---- */
export const TITLE_START = PHASES.titleAnchor;
export const TITLE_END   = TITLE_START + PHASES.title;

/* ---- Forge overlaps with title (starts slightly after) ---- */
export const FORGE_START = TITLE_START + PHASES.forgeToTitle;
export const FORGE_END   = FORGE_START + PHASES.forge;
export const FORGE_GATE  = FORGE_END + PHASES.forgeTail;

/* ---- Embers accompany the forge ---- */
export const EMBERS_START = FORGE_START + EMBER.delay;
export const EMBERS_END   = FORGE_GATE;

/* ---- Atmosphere accompanies forge ---- */
export const GLOW_START = FORGE_START + GRID.delay;
export const GLOW_END   = FORGE_GATE + GRID.overshoot;

/* ---- Thesis: crossfades in as seeds converge and fade ---- */
export const THESIS_START = FORGE_END - PHASES.thesisOverlap;
export const THESIS_END   = THESIS_START + PHASES.thesis;

/* ---- Seed sub-phases (within FORGE range) ---- */
export const SEED_FADE_IN_START      = FORGE_START;
export const SEED_FADE_IN_END        = FORGE_START + SEED.fadeInDuration;
export const SEED_DRIFT_START        = FORGE_START + SEED.driftDelay;
export const SEED_DRIFT_END          = FORGE_END - SEED.driftMargin;
export const SEED_CONVERGE_START     = FORGE_END - SEED.convergeLead;
export const SEED_CONVERGE_END       = FORGE_END;
export const SEED_HEAT_START         = FORGE_START + SEED.heatDelay;
export const SEED_HEAT_END           = FORGE_END - SEED.heatMargin;
export const SEED_SCALE_SHRINK_START = FORGE_END + SEED.shrinkDelay;
export const SEED_SCALE_SHRINK_END   = FORGE_GATE;

/* ---- Non-seed fragment sub-phases ---- */
export const FRAG_FADE_IN_START = FORGE_START - FRAGMENTS.earlyStart;
export const FRAG_FADE_IN_END   = FORGE_START + FRAGMENTS.fadeInDuration;

/* ---- Particles: canvas explode + converge + handoff to SVG ---- */
export const PARTICLES_START = THESIS_END + PHASES.thesisToParticles;
export const PARTICLES_END   = PARTICLES_START + PHASES.particles;

/* ---- Canvas sub-phases ---- */
export const CANVAS_IN_START  = PARTICLES_START;
export const CANVAS_IN_END    = PARTICLES_START + CANVAS_XFADE.inDuration;
export const CANVAS_OUT_START = PARTICLES_START + PHASES.particles * CANVAS_XFADE.outFrac;
export const CANVAS_OUT_END   = PARTICLES_START + PHASES.particles * CANVAS_XFADE.outEndFrac;

/* ---- SVG funnel ---- */
export const SVG_IN_START    = CANVAS_OUT_START;
export const SVG_IN_END      = CANVAS_OUT_START + FUNNEL.svgInDuration;
export const DOTS_IN_START   = SVG_IN_START;
export const DOTS_IN_END     = SVG_IN_START + FUNNEL.dotsInDuration;
export const LABELS_IN_START = SVG_IN_START - FUNNEL.labelsLead;
export const LABELS_IN_END   = SVG_IN_START + FUNNEL.labelsInDuration;

/* ---- Funnel ribbon tiers ---- */
export const RIBBON_START  = SVG_IN_END;
export const TIER_DURATION = PHASES.funnel / 4;
export const RIBBON_TIERS  = [0, 1, 2, 3].map((i) => ({
  start: RIBBON_START + i * TIER_DURATION,
  end:   RIBBON_START + (i + 1) * TIER_DURATION,
}));
export const FUNNEL_COMPLETE = RIBBON_TIERS[3].end;

/* ---- Convergence point + funnel fade ---- */
export const CONVERGE_PT_START = RIBBON_TIERS[3].start;
export const CONVERGE_PT_END   = FUNNEL_COMPLETE + FUNNEL.convergePtOvershoot;
export const FUNNEL_OUT_START  = FUNNEL_COMPLETE + PHASES.funnelLinger;
export const FUNNEL_OUT_END    = FUNNEL_OUT_START + PHASES.funnelFade;

/* ---- Narrator panels (tied to funnel tiers) ---- */
export const NARRATOR_TIERS = RIBBON_TIERS.map((tier) => ({
  start: tier.start + TIER_DURATION * FUNNEL.narratorDelayFrac,
  end:   tier.end + TIER_DURATION * FUNNEL.narratorOvershoot,
}));

/* ---- Caption tiers ---- */
export const CAPTION_TIERS = RIBBON_TIERS.map((tier) => ({
  start: tier.start,
  end:   tier.end + TIER_DURATION * FUNNEL.captionOvershoot,
}));

/* ---- Mid narrator ("Let me show you...") ---- */
export const MID_NARRATOR_START = FUNNEL_OUT_END + MID_NARRATOR.delay;
export const MID_NARRATOR_END   = MID_NARRATOR_START + MID_NARRATOR.duration;

/* ---- Terminal / Beats ---- */
export const BEATS_START = MID_NARRATOR_END + PHASES.funnelToTerminal;
export const BEATS = [0, 1, 2, 3].map((i) => ({
  start: BEATS_START + i * PHASES.terminalCompany,
  end: BEATS_START + (i + 1) * PHASES.terminalCompany,
}));
export const BEATS_END = BEATS[3].end;

/* ---- Crystallize ---- */
export const CRYSTALLIZE_START = BEATS_END + PHASES.terminalToCrystal;
export const CRYSTALLIZE_END = CRYSTALLIZE_START + PHASES.crystallize;

/* ---- Chrome ---- */
export const CHROME_END = CRYSTALLIZE_START;

/* ---- Assembled PH object (consumed by scroll callbacks) ---- */
export const PH = {
  TITLE: { start: TITLE_START, end: TITLE_END },
  FORGE: { start: FORGE_START, end: FORGE_END },
  FORGE_GATE,
  EMBERS: { start: EMBERS_START, end: EMBERS_END },
  GLOW: { start: GLOW_START, end: GLOW_END },
  THESIS: { start: THESIS_START, end: THESIS_END },
  PARTICLES: { start: PARTICLES_START, end: PARTICLES_END },
  CANVAS_OUT: { start: CANVAS_OUT_START, end: CANVAS_OUT_END },
  SVG_IN: { start: SVG_IN_START, end: SVG_IN_END },
  DOTS_IN: { start: DOTS_IN_START, end: DOTS_IN_END },
  LABELS_IN: { start: LABELS_IN_START, end: LABELS_IN_END },
  RIBBON_TIERS,
  CONVERGE_PT: { start: CONVERGE_PT_START, end: CONVERGE_PT_END },
  FUNNEL_OUT: { start: FUNNEL_OUT_START, end: FUNNEL_OUT_END },
  CAPTION_TIERS,
  NARRATOR_TIERS,
  MID_NARRATOR: { start: MID_NARRATOR_START, end: MID_NARRATOR_END },
  BEATS,
  CRYSTALLIZE: { start: CRYSTALLIZE_START, end: CRYSTALLIZE_END },
  CHROME_END,
};

/** Canvas particle local phases (0–1 within PARTICLES range) */
export const PP = {
  CANVAS_IN: [PARTICLE.canvasInStart, PARTICLE.canvasInEnd] as const,
  EXPLODE: [PARTICLE.explodeStart, PARTICLE.explodeEnd] as const,
  CONVERGE: [PARTICLE.convergeStart, PARTICLE.convergeEnd] as const,
  FADE_OUT: [PARTICLE.fadeOutStart, PARTICLE.fadeOutEnd] as const,
};
