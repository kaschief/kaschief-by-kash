# Eliminate Magic Numbers — Batched Plan

All inline numeric literals in the scroll animation logic need named constants.
Batches are grouped semantically so each can be tested independently.

---

## Batch 1: Phase-chain constants (lines 605–688)
Extract all inline offsets in the constant declarations section into named durations/offsets.

**New constants to add (top of durations block):**
```
TITLE_ANCHOR                  = 0.005   // where title starts in scroll
FORGE_OVERLAP_WITH_TITLE      = 0.025   // forge starts this far after title
EMBERS_DELAY                  = 0.04    // embers start this far after forge
GLOW_DELAY                    = 0.02    // glow starts this far after forge
GLOW_OVERSHOOT                = 0.01    // glow extends past forge gate
SEED_FADE_IN_DURATION         = 0.05    // how long seeds take to appear
SEED_DRIFT_DELAY              = 0.02    // drift starts this far after forge
SEED_DRIFT_MARGIN             = 0.03    // drift ends this far before forge end
SEED_CONVERGE_LEAD            = 0.07    // convergence begins this far before forge end
SEED_HEAT_DELAY               = 0.07    // heat starts this far after forge
SEED_HEAT_MARGIN              = 0.02    // heat ends this far before forge end
SEED_SCALE_SHRINK_DELAY       = 0.005   // scale shrink starts this far after forge end
FRAG_EARLY_START              = 0.01    // non-seed fragments start this far before forge
FRAG_FADE_IN_DURATION         = 0.05    // non-seed fragment fade-in length
CANVAS_IN_DURATION            = 0.01    // canvas fade-in length
CANVAS_OUT_POINT              = 0.35    // canvas out starts at this fraction of particles
CANVAS_OUT_END_POINT           = 0.5    // canvas out ends at this fraction of particles
SVG_IN_DURATION               = 0.02    // SVG funnel fade-in length
DOTS_IN_DURATION              = 0.03    // dots fade-in length
LABELS_LEAD                   = 0.02    // labels start this far before SVG
LABELS_IN_DURATION            = 0.02    // labels fade-in length
CONVERGE_PT_OVERSHOOT         = 0.02    // convergence point extends past funnel complete
NARRATOR_DELAY_FRAC           = 0.4     // narrator starts at this fraction into tier
NARRATOR_OVERSHOOT_FRAC       = 0.3     // narrator extends past tier end by this fraction
CAPTION_OVERSHOOT_FRAC        = 0.3     // caption extends past tier end
MID_NARRATOR_DELAY            = 0.005   // mid narrator starts this far after funnel fade
MID_NARRATOR_DURATION         = 0.035   // mid narrator hold time
```

Then replace all inline numbers in lines 605–688 with these names.

---

## Batch 2: Render — Forge fragments (lines 845–966)
Extract inline numbers from the seed + non-seed fragment render logic.

**New constants:**
```
SEED_BLUR_CLEAR_DURATION      = 0.04    // how fast initial seed blur clears
SEED_HEAT_SCALE               = 1.3     // max scale during heat
SEED_SHRINK_SCALE              = 0.5    // min scale during shrink
FRAG_DRIFT_MARGIN             = 0.01    // non-seed drift inset from forge start/end
FRAG_ROTATION_DRIFT           = 0.3     // rotation multiplier during drift
FRAG_DISSOLVE_SPEED           = 0.7     // timing scalar for non-seed dissolves
FRAG_MAX_BLUR                 = 12      // max blur px for dissolving fragments
FRAG_ALPHA_COMPANY            = 1.0     // base opacity for company fragments
FRAG_ALPHA_CODE               = 0.75    // base opacity for code/command fragments
FRAG_ALPHA_LOGO               = 0.85    // base opacity for logo fragments
FRAG_ALPHA_DEFAULT            = 0.75    // base opacity fallback
CURTAIN_FADE_PX               = 80      // curtain reveal pixel threshold
TITLE_SLOW_FADE_MULT          = 3       // title fades over 3x its duration
CURTAIN_OFFSET_FRAC           = 0.3     // curtain starts at 30% from bottom
CURTAIN_RANGE_FRAC            = 0.2     // curtain normalizes over 20% of vh
```

---

## Batch 3: Render — Embers + Grid + Thesis + Particles (lines 968–1020)
Extract inline numbers from ember, grid, thesis, and word reveal logic.

**New constants:**
```
EMBER_HEAT_DURATION           = 0.08    // ember heat-up window
EMBER_COOL_LEAD               = 0.05    // ember cool starts this far before embers end
EMBER_RISE_DELAY              = 0.01    // ember rise starts this far after embers start
EMBER_BASE_OPACITY            = 0.4     // ember min opacity
EMBER_FLICKER_AMP             = 0.3     // ember twinkle amplitude
EMBER_FLICKER_FREQ            = 80      // ember oscillation frequency
GRID_APPEAR_DURATION          = 0.04    // grid fades in over this range
GRID_FADE_LEAD                = 0.06    // grid fade starts this far before glow end
GRID_MAX_OPACITY              = 0.05    // grid peak opacity (5%)
THESIS_FADE_FRAC              = 0.3     // thesis fade-in/out each use 30% of duration
THESIS_WORD_ZONE_FRAC         = 0.35    // word reveal zone starts at 35% of thesis
THESIS_DRIFT_FAST_WEIGHT      = 0.85    // fast drift contribution
THESIS_DRIFT_SLOW_WEIGHT      = 0.15    // slow drift contribution
THESIS_Y_START_LG             = 4       // thesis start Y (desktop) vh
THESIS_Y_START_SM             = -4      // thesis start Y (mobile) vh
THESIS_Y_END_LG               = -8      // thesis end Y (desktop) vh
THESIS_Y_END_SM               = -14     // thesis end Y (mobile) vh
THESIS_INITIAL_BLUR           = 6       // thesis starts blurred by 6px
THESIS_MAX_WIDTH_LG           = "60vw"
THESIS_MAX_WIDTH_SM           = "85vw"
WORD_REVEAL_GAP               = 0.01    // gap between each word threshold
WORD_REVEAL_DURATION          = 0.007   // each word's fade-in duration
WORD_REVEAL_DROP              = 10      // word translateY drop in px
```

---

## Batch 4: Particle config (PP object + initParticles, lines 730–753)

**New constants:**
```
PP_CANVAS_IN_END              = 0.05
PP_EXPLODE_END                = 0.2
PP_CONVERGE_END               = 0.45
PP_FADE_OUT_START             = 0.4
PP_FADE_OUT_END               = 0.55
PARTICLE_ANGLE_VARIANCE       = 1.4
PARTICLE_ANGLE_OFFSET         = 0.5
PARTICLE_RADIUS_BASE          = 0.12
PARTICLE_RADIUS_RANGE         = 0.28
PARTICLE_SIZE_BASE            = 2
PARTICLE_SIZE_RANGE           = 2.5
```

---

Each batch: I make the changes, you scroll through to verify nothing shifted, then we move to the next.
