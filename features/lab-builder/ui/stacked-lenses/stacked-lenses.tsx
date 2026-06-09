"use client";

/**
 * Variant 02 — Stacked Lenses (v4) — "Anchor, then chase."
 *
 * Chart is pinned and sacred. Typography and the filmstrip live strictly
 * above and below the chart's footprint, never across it.
 *
 * Timing grammar (expressed in sticky scroll progress, 0–1):
 *
 *   1. ANCHOR phase (0 → ANCHOR_END)
 *      Pure naked chart. The market settles in before anything else
 *      happens. User scrolls one full screen of naked price.
 *
 *   2. REVEAL phase — per indicator
 *      Right-inset goes 100 → 0 over WIPE_DURATION. Curtain draws in
 *      from the left.
 *
 *   3. HOLD phase — per indicator
 *      Indicator fully visible for HOLD_DURATION.
 *
 *   4. CHASE phase — per indicator transition
 *      The outgoing indicator's CLEAR (left-inset 0 → 100) runs
 *      SIMULTANEOUSLY with the incoming indicator's REVEAL
 *      (right-inset 100 → 0), both moving left-to-right. The incoming
 *      lags the outgoing by CHASE_LAG — producing a small naked gap
 *      between the retreating right-edge border and the advancing
 *      left-edge border. The naked price stays visible in that gap,
 *      reinforcing "same chart, new lens."
 *
 * Geometry of the chase (left-to-right layout):
 *
 *   ──[ incoming ]── naked gap ──[ outgoing ]──
 *
 * As scroll advances, both borders slide right. The gap width is
 * constant ≈ (CHASE_LAG / WIPE_DURATION) × 100% of chart width.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import {
  CHART_ASPECT,
  INDICATOR_OVERLAYS,
  NAKED_BASE,
  type IndicatorOverlay,
} from "../../data/indicator-overlays";
import { MOTION } from "../../constants";
import { HeaderMonumental as StageHeader } from "./headers";

/**
 * Total scroll length of the pinned experience.
 *
 * Budget: ANCHOR + N × (wipe-in + hold + wipe-out) + trailing tail.
 * `900vh` gives ~180vh per indicator which reads as cinematic on
 * standard trackpad velocities.
 */
const SECTION_HEIGHT_VH = 900;

/* --------------------------------------------------------------------- */
/*  Curtain timing — see header comment at top of file                    */
/* --------------------------------------------------------------------- */

/** First slice of sticky scroll that stays on pure naked chart. */
const ANCHOR_END = 0.10;
/** Duration (in sticky-scroll units) of each wipe-in or wipe-out. */
const WIPE_DURATION = 0.08;
/** Duration each indicator holds at full reveal before handing off. */
const HOLD_DURATION = 0.06;
/**
 * Lag between an outgoing indicator starting its wipe-out and the
 * incoming indicator starting its wipe-in. Produces the small naked gap
 * between the two moving borders during a chase transition.
 *
 *    naked-gap-width (%) ≈ (CHASE_LAG / WIPE_DURATION) × 100
 *
 * With the values above → ~10% naked gap.
 */
const CHASE_LAG = 0.008;

/**
 * Scroll progress at which the FINAL indicator's wipe-in completes.
 *
 * The last indicator gets special treatment:
 *   - Its wipe-in is stretched so it finishes near the end of the sticky
 *     range instead of midway through. Without this, the final reveal
 *     would complete early and leave a long dead-hold tail.
 *   - It has NO wipe-out. Its `clear` range is parked outside [0, 1] so
 *     the left-inset never ramps up — the overlay stays fully on screen
 *     until the sticky unpins, instead of scrolling back to naked.
 */
const FINAL_REVEAL_END = 0.92;

interface IndicatorTiming {
  /** Right-inset animates 100 → 0 over this range (curtain draws in from left). */
  readonly reveal: readonly [number, number];
  /** Left-inset animates 0 → 100 over this range (curtain retreats to right). */
  readonly clear: readonly [number, number];
}

/**
 * Build per-indicator timings so consecutive indicators chase each other
 * with a small naked gap. Anchor first, then indicator 0 reveals, holds,
 * begins wiping out as indicator 1 begins wiping in — and so on.
 *
 * The last indicator is special-cased: its wipe-in stretches to end at
 * FINAL_REVEAL_END, and its clear range is parked outside [0, 1] so it
 * never wipes out. Effect: scrolling past the last indicator doesn't
 * return to naked — the final lens stays on until the sticky unpins.
 */
function buildIndicatorTimings(count: number): readonly IndicatorTiming[] {
  const timings: IndicatorTiming[] = [];
  let cursor = ANCHOR_END;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const revealStart = cursor;
    const revealEnd = isLast
      ? FINAL_REVEAL_END
      : revealStart + WIPE_DURATION;
    const clearStart = revealEnd + HOLD_DURATION;
    const clearEnd = clearStart + WIPE_DURATION;
    timings.push({
      reveal: [revealStart, revealEnd],
      // Last indicator: clear range sits outside the scroll's [0, 1] so
      // the left-inset never leaves its clamped starting value (0). The
      // overlay stays fully visible for the remainder of the sticky range.
      clear: isLast ? [2, 2] : [clearStart, clearEnd],
    });
    cursor = clearStart + CHASE_LAG;
  }
  return timings;
}

export function StackedLenses() {
  return (
    <div className="relative bg-[#050507] text-(--cream)">
      <Intro />
      <MobileStack />
      <DesktopStage />
      <Outro />
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  Desktop stage                                                          */
/* --------------------------------------------------------------------- */

/** Spring config for the cursor-driven divider. Matches Horizon Split. */
const HOVER_SPRING = { stiffness: 260, damping: 30, mass: 0.45 } as const;
/** Fade duration between scroll-driven curtain and cursor-driven split. */
const HOVER_FADE_SECONDS = 0.22;

function DesktopStage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const timings = useMemo(
    () => buildIndicatorTimings(INDICATOR_OVERLAYS.length),
    [],
  );

  /**
   * `activeIndex` is the "headline" indicator — the one the typography
   * speaks for. Returns -1 while in the anchor phase (before indicator 0
   * begins wiping in). Once an indicator's REVEAL has started, it takes
   * the headline even if the previous indicator is still partly on chart
   * mid-chase. This biases copy toward the incoming lens.
   */
  const activeIndex = useActiveIndexFromScroll(scrollYProgress, timings);
  const active = activeIndex >= 0 ? INDICATOR_OVERLAYS[activeIndex]! : null;
  const activeTiming = activeIndex >= 0 ? timings[activeIndex]! : null;

  /**
   * Cursor-driven reveal.
   *
   * `rawHoverX` is 0–1 across the chart width, updated on every pointermove.
   * `hoverX` is a spring-smoothed copy used for rendering — it trails the
   * cursor slightly, which kills jitter and gives the divider weight.
   *
   * `isHovering` is a React state flag; when true, scroll-driven overlays
   * fade out and a single cursor-driven overlay (for the active indicator
   * only) fades in. When false, the curtain resumes.
   */
  const rawHoverX = useMotionValue(0);
  const hoverX = useSpring(rawHoverX, HOVER_SPRING);
  const [isHovering, setIsHovering] = useState(false);

  /**
   * Jump the page so the given indicator's HOLD phase lands in the sticky
   * window. Uses `behavior: "auto"` (instant) rather than smooth — a
   * smooth scroll would animate through every intermediate indicator's
   * chase transition, which is exactly the visual noise the user wanted
   * to avoid when clicking a specific tile.
   *
   * Since the chart is pinned inside a sticky container, an instant
   * scroll change does NOT visually move the layout at all: only the
   * overlay state updates. Effect from the user's perspective: click the
   * tile, chart snaps to that indicator fully revealed.
   */
  const scrollToIndicator = useCallback(
    (targetIdx: number) => {
      const section = ref.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTopInDoc = rect.top + window.scrollY;
      const travel = rect.height - window.innerHeight;
      const target = timings[targetIdx];
      if (!target) return;
      const targetProgress = (target.reveal[1] + target.clear[0]) / 2;
      const targetScroll = sectionTopInDoc + targetProgress * travel;
      window.scrollTo({ top: targetScroll, behavior: "auto" });
    },
    [timings],
  );

  return (
    <section
      ref={ref}
      aria-label="Indicators — pinned chart with lens gallery below"
      className="relative hidden md:block"
      style={{ height: `${SECTION_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-[90vw] max-w-[1400px] flex-col gap-8">
          <StageHeader active={active} />
          <ChartFrame
            active={active}
            activeTiming={activeTiming}
            scrollProgress={scrollYProgress}
            timings={timings}
            rawHoverX={rawHoverX}
            hoverX={hoverX}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
          />
          <StageBody active={active} />
          <Filmstrip
            activeIndex={activeIndex}
            scrollProgress={scrollYProgress}
            timings={timings}
            onSelect={scrollToIndicator}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The active "headline" indicator — -1 during the anchor phase, then
 * switches to indicator `i` once indicator `i`'s reveal has started.
 * Biases toward the INCOMING lens during a chase transition.
 */
function useActiveIndexFromScroll(
  scrollProgress: MotionValue<number>,
  timings: readonly IndicatorTiming[],
): number {
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    const compute = (v: number) => {
      let next = -1;
      for (let i = 0; i < timings.length; i++) {
        if (v >= timings[i]!.reveal[0]) next = i;
      }
      setIdx((prev) => (prev === next ? prev : next));
    };
    compute(scrollProgress.get());
    return scrollProgress.on("change", compute);
  }, [scrollProgress, timings]);

  return idx;
}

/* --------------------------------------------------------------------- */
/*  Stage header (counter + hero name)                                     */
/* --------------------------------------------------------------------- */


/* --------------------------------------------------------------------- */
/*  Chart frame — pinned, one overlay at a time via crossfade              */
/* --------------------------------------------------------------------- */

interface ChartFrameProps {
  readonly active: IndicatorOverlay | null;
  readonly activeTiming: IndicatorTiming | null;
  readonly scrollProgress: MotionValue<number>;
  readonly timings: readonly IndicatorTiming[];
  readonly rawHoverX: MotionValue<number>;
  readonly hoverX: MotionValue<number>;
  readonly isHovering: boolean;
  readonly setIsHovering: (v: boolean) => void;
}

function ChartFrame({
  active,
  activeTiming,
  scrollProgress,
  timings,
  rawHoverX,
  hoverX,
  isHovering,
  setIsHovering,
}: ChartFrameProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const accent = active?.accent ?? "#ffffff";

  // Hover is a no-op during the anchor phase — no active indicator to
  // horizon-split. Also a no-op when reduced motion is requested.
  const hoverEnabled = active !== null && !prefersReducedMotion;

  /**
   * Where is the scroll-driven curtain's boundary *right now*?
   *
   * Returns a 0–1 position corresponding to the divider position that
   * matches the current scroll state for the active indicator:
   *   - before reveal       → 0 (overlay hidden; divider at left edge)
   *   - during reveal       → reveal progress
   *   - during hold         → 1 (overlay fully revealed; divider at right edge)
   *   - during clear        → clear progress (divider follows left-inset)
   *
   * Used on pointer enter/leave to sync the hover divider with the scroll
   * curtain — kills the visual pop that would otherwise happen when the
   * hover mode snaps the divider to the cursor X (or vice versa).
   */
  const scrollBoundary = useCallback((): number => {
    if (!activeTiming) return 0;
    const t = scrollProgress.get();
    const { reveal, clear } = activeTiming;
    if (t < reveal[0]) return 0;
    if (t <= reveal[1]) {
      const span = reveal[1] - reveal[0];
      return span > 0 ? (t - reveal[0]) / span : 1;
    }
    if (t < clear[0]) return 1;
    if (t <= clear[1]) {
      const span = clear[1] - clear[0];
      return span > 0 ? (t - clear[0]) / span : 1;
    }
    return 1;
  }, [activeTiming, scrollProgress]);

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!hoverEnabled) return;
      const rect = chartRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cursorNorm = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );

      // Step 1: jump the displayed divider to where the scroll curtain
      //   currently has its boundary. No visual pop at this instant —
      //   the hover overlay fades in at *exactly* the same clip state
      //   the scroll overlay was showing.
      const edge = scrollBoundary();
      rawHoverX.jump(edge);
      hoverX.jump(edge);

      // Step 2: set the spring target to the actual cursor position.
      //   The divider now smoothly springs from scroll-boundary to
      //   cursor-X. User sees continuity, then a natural movement
      //   toward where their hand actually is.
      rawHoverX.set(cursorNorm);

      setIsHovering(true);
    },
    [hoverEnabled, scrollBoundary, rawHoverX, hoverX, setIsHovering],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!hoverEnabled) return;
      const rect = chartRef.current?.getBoundingClientRect();
      if (!rect) return;
      const norm = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      rawHoverX.set(norm);
    },
    [hoverEnabled, rawHoverX],
  );

  const handlePointerLeave = useCallback(() => {
    if (!hoverEnabled) return;
    // Leave the divider exactly where the user left it — don't animate
    // it back to the scroll boundary. The hover overlay fades out in
    // place, the scroll curtain fades back in. User's last action is
    // honored; the divider doesn't move unless the user moves it.
    setIsHovering(false);
  }, [hoverEnabled, setIsHovering]);

  return (
    <div
      ref={chartRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto w-full overflow-hidden rounded-2xl bg-white ring-1 ring-white/5"
      style={{
        aspectRatio: CHART_ASPECT,
        boxShadow: active
          ? `0 40px 120px -60px ${accent}55, 0 0 0 1px ${accent}18 inset`
          : "0 40px 120px -60px rgba(255,255,255,0.05)",
        transition: "box-shadow 480ms ease",
        cursor: hoverEnabled ? "col-resize" : "default",
      }}
    >
      <Image
        src={NAKED_BASE}
        alt="Price action, unmarked"
        fill
        sizes="(min-width: 768px) 90vw, 100vw"
        priority
        className="object-cover"
      />

      {/* Scroll-driven curtain overlays — fade out on hover */}
      {INDICATOR_OVERLAYS.map((overlay, i) => (
        <ChartOverlay
          key={overlay.id}
          overlay={overlay}
          scrollProgress={scrollProgress}
          timing={timings[i]!}
          isHovering={isHovering}
        />
      ))}

      {/* Cursor-driven horizon split — fades in on hover, targets active only */}
      <AnimatePresence>
        {active && (
          <HoverOverlay
            key={active.id}
            active={active}
            hoverX={hoverX}
            isHovering={isHovering}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ChartOverlayProps {
  readonly overlay: IndicatorOverlay;
  readonly scrollProgress: MotionValue<number>;
  readonly timing: IndicatorTiming;
  readonly isHovering: boolean;
}

/**
 * Scroll-driven reveal-curtain layer per overlay.
 *
 * Two independent clip-path insets, each driven by its own scroll range:
 *
 *   rightInset — ramps 100 → 0 during `timing.reveal`.
 *   leftInset  — ramps 0 → 100 during `timing.clear`.
 *
 * Opacity transitions are asymmetric to avoid ever showing a stray
 * in-between frame of a non-active overlay:
 *
 *   On hover enter  → fade OUT over HOVER_FADE_SECONDS. Synced with the
 *                     hover overlay's fade IN (which starts at the same
 *                     clip thanks to the scroll-boundary sync), so the
 *                     crossfade is visually invisible.
 *
 *   On hover exit   → appear INSTANTLY at the scroll-driven clip. No
 *                     gradual fade-in. A fade-in would briefly show the
 *                     scroll overlays at partial opacity against the
 *                     naked base, which reads as "a new indicator
 *                     appearing" — exactly the ambiguity the user
 *                     flagged. Instant snap-back means the chart is
 *                     back to its exact scroll state with zero in-between
 *                     frames.
 */
function ChartOverlay({
  overlay,
  scrollProgress,
  timing,
  isHovering,
}: ChartOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  const rightInset = useTransform(
    scrollProgress,
    [timing.reveal[0], timing.reveal[1]],
    prefersReducedMotion ? [0, 0] : [100, 0],
    { clamp: true },
  );
  const leftInset = useTransform(
    scrollProgress,
    [timing.clear[0], timing.clear[1]],
    prefersReducedMotion ? [0, 0] : [0, 100],
    { clamp: true },
  );
  const clipPath = useMotionTemplate`inset(0 ${rightInset}% 0 ${leftInset}%)`;

  return (
    <motion.div
      style={{ clipPath }}
      animate={{ opacity: isHovering ? 0 : 1 }}
      transition={{
        duration: isHovering ? HOVER_FADE_SECONDS : 0,
        ease: MOTION.ease.silk,
      }}
      aria-hidden
      className="absolute inset-0"
    >
      <Image
        src={overlay.overlayImage}
        alt=""
        fill
        sizes="(min-width: 768px) 90vw, 100vw"
        className="object-cover"
      />
    </motion.div>
  );
}

/* --------------------------------------------------------------------- */
/*  Hover overlay — cursor-driven horizon split                            */
/* --------------------------------------------------------------------- */

interface HoverOverlayProps {
  readonly active: IndicatorOverlay;
  readonly hoverX: MotionValue<number>;
  readonly isHovering: boolean;
}

/**
 * Cursor-driven horizon split for the active indicator.
 *
 * Same mechanic as the Horizon Split variant: overlay clipped to the left
 * of the cursor, naked base visible to the right. Overlay grows from the
 * left as the cursor moves right.
 *
 *   cursor at far left  → all naked, overlay effectively hidden
 *   cursor at far right → full overlay revealed
 *
 * A 1px accent-colored divider line sits at the cursor position with a
 * small handle on the vertical centerline — clearly signals this is a
 * drag-compare tool when the user is hovering.
 */
function HoverOverlay({ active, hoverX, isHovering }: HoverOverlayProps) {
  const inversePct = useTransform(hoverX, (v) => (1 - v) * 100);
  const splitPct = useTransform(hoverX, (v) => v * 100);
  const clipPath = useMotionTemplate`inset(0 ${inversePct}% 0 0)`;
  const dividerLeft = useMotionTemplate`${splitPct}%`;

  /**
   * Asymmetric fade. On entry (isHovering → true) we crossfade over
   * HOVER_FADE_SECONDS — that's fine because the hover divider is synced
   * to the scroll curtain's boundary at the entry instant, so both clips
   * match and the crossfade is visually invisible.
   *
   * On exit (isHovering → false) we kill the hover layer INSTANTLY. The
   * hover divider is wherever the user's cursor last was — which almost
   * certainly does NOT match the scroll curtain's current position. A
   * gradual fade here would show two distinct clips stacked for 220ms,
   * which is the "two at the same time" mess the user flagged. Instant
   * exit means: hover is gone, scroll curtain fades back in at its own
   * clip, never two overlays visible simultaneously.
   */
  const fadeDuration = isHovering ? HOVER_FADE_SECONDS : 0;

  return (
    <>
      {/* The overlay image, clipped to left of divider */}
      <motion.div
        style={{ clipPath }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeDuration, ease: MOTION.ease.silk }}
        aria-hidden
        className="absolute inset-0"
      >
        <Image
          src={active.overlayImage}
          alt=""
          fill
          sizes="(min-width: 768px) 90vw, 100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Divider: 1px accent line + handle at vertical center */}
      <motion.div
        aria-hidden
        style={{ left: dividerLeft, background: active.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 0.85 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeDuration, ease: MOTION.ease.silk }}
        className="pointer-events-none absolute inset-y-0 w-px"
      >
        <div
          className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm"
          style={{
            background: active.accent,
            boxShadow: `0 6px 22px -8px ${active.accent}`,
          }}
        >
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
            <path
              d="M2 6 L5 3 M2 6 L5 9 M10 6 L7 3 M10 6 L7 9"
              stroke="#0a0a0d"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.div>
    </>
  );
}

/* --------------------------------------------------------------------- */
/*  Stage body — tagline + short description                               */
/* --------------------------------------------------------------------- */

function StageBody({ active }: { readonly active: IndicatorOverlay | null }) {
  return (
    <div className="relative min-h-[8rem]">
      {/*
       * Default AnimatePresence mode (not "wait"). With mode="wait" the
       * exit of one version must fully finish before the enter of the next
       * begins — on fast scroll the queue builds up and the body visibly
       * lags behind the chart. Default mode lets new content start
       * animating in *while* the old is still animating out; at typical
       * scroll speeds this reads as a clean crossfade with no lag.
       */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active?.id ?? "anchor"}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.silk }}
          className="absolute inset-0 grid grid-cols-12 items-start gap-8"
        >
          {active ? (
            <>
              <p className="col-span-7 font-(--font-bricolage-grotesque) text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-(--cream)">
                {active.tagline}
              </p>
              <p className="col-span-5 font-(--font-manrope) text-sm leading-relaxed text-(--cream-muted)">
                {active.body}
              </p>
            </>
          ) : (
            <>
              <p className="col-span-7 font-(--font-bricolage-grotesque) text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-(--cream)">
                Five lenses. Same chart. Keep scrolling.
              </p>
              <p className="col-span-5 font-(--font-manrope) text-sm leading-relaxed text-(--cream-muted)">
                Each lens wipes in from the left and hands off to the next.
                The naked price stays underneath the whole time.
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  Filmstrip — progress ribbon under the chart                            */
/* --------------------------------------------------------------------- */

interface FilmstripProps {
  readonly activeIndex: number;
  readonly scrollProgress: MotionValue<number>;
  readonly timings: readonly IndicatorTiming[];
  readonly onSelect: (index: number) => void;
}

function Filmstrip({
  activeIndex,
  scrollProgress,
  timings,
  onSelect,
}: FilmstripProps) {
  const accent =
    activeIndex >= 0 ? INDICATOR_OVERLAYS[activeIndex]!.accent : "#ffffff";
  return (
    <div className="relative">
      <ScrollRail
        scrollProgress={scrollProgress}
        timings={timings}
        accent={accent}
      />
      <ol className="mt-4 flex items-stretch gap-3" role="tablist">
        {INDICATOR_OVERLAYS.map((overlay, i) => (
          <FilmstripPlate
            key={overlay.id}
            overlay={overlay}
            isActive={i === activeIndex}
            onClick={() => onSelect(i)}
          />
        ))}
      </ol>
    </div>
  );
}

/**
 * One filmstrip tile. Clickable — jumps the page to this indicator's
 * hold phase inside the sticky section. Keyboard-accessible (native
 * button semantics). Minimal visual: just the indicator name and an
 * active-state color fill. No counters, no category labels.
 */
function FilmstripPlate({
  overlay,
  isActive,
  onClick,
}: {
  readonly overlay: IndicatorOverlay;
  readonly isActive: boolean;
  readonly onClick: () => void;
}) {
  return (
    <li className="flex-1" role="presentation">
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={onClick}
        className="group w-full cursor-pointer rounded-lg border px-4 py-3 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050507]"
        style={{
          borderColor: isActive ? overlay.accent : "rgba(255,255,255,0.08)",
          background: isActive ? `${overlay.accent}14` : "transparent",
          opacity: isActive ? 1 : 0.5,
          transform: isActive ? "translateY(-2px)" : "translateY(0)",
          transitionDuration: "400ms",
        }}
      >
        <p
          className="font-(--font-bricolage-grotesque) text-base leading-tight transition-colors"
          style={{ color: isActive ? overlay.accent : "var(--cream-muted)" }}
        >
          {overlay.name.toLowerCase()}
        </p>
      </button>
    </li>
  );
}

/**
 * Continuous scroll rail — single bar across the filmstrip showing raw
 * scroll progress. Spans from the FIRST reveal start (just after anchor)
 * to the LAST reveal end (when the final indicator is fully on). Gives
 * the eye a precise indicator of where they are within the sticky range,
 * independent of the snapped index.
 */
function ScrollRail({
  scrollProgress,
  timings,
  accent,
}: {
  readonly scrollProgress: MotionValue<number>;
  readonly timings: readonly IndicatorTiming[];
  readonly accent: string;
}) {
  const first = timings[0]!.reveal[0];
  const last = timings[timings.length - 1]!.reveal[1];
  const fill = useTransform(scrollProgress, [first, last], [0, 1]);
  const fillWidth = useTransform(fill, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);
  return (
    <div className="relative h-px w-full bg-white/10" aria-hidden>
      <motion.div
        style={{ width: fillWidth, background: accent }}
        className="h-full"
      />
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  Mobile fallback — vertical card stack                                  */
/* --------------------------------------------------------------------- */

function MobileStack() {
  return (
    <section
      aria-label="Indicators — stacked"
      className="block space-y-16 px-6 py-24 md:hidden"
    >
      {INDICATOR_OVERLAYS.map((overlay, i) => (
        <MobileLens key={overlay.id} overlay={overlay} priority={i === 0} />
      ))}
    </section>
  );
}

function MobileLens({
  overlay,
  priority,
}: {
  readonly overlay: IndicatorOverlay;
  readonly priority: boolean;
}) {
  return (
    <article>
      <span
        className="font-(--font-manrope) text-[10px] uppercase tracking-[0.35em]"
        style={{ color: overlay.accent }}
      >
        {overlay.index} · {overlay.category}
      </span>
      <h3 className="mt-3 font-(--font-bricolage-grotesque) text-4xl leading-[0.9] text-(--cream)">
        {overlay.name}
      </h3>
      <p className="mt-3 font-(--font-manrope) text-base text-(--cream-muted)">
        {overlay.tagline}
      </p>
      <div
        className="relative mt-5 overflow-hidden rounded-xl bg-white ring-1 ring-white/5"
        style={{ aspectRatio: CHART_ASPECT }}
      >
        <Image
          src={overlay.overlayImage}
          alt={`Chart with ${overlay.name} applied`}
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover"
        />
      </div>
      <p className="mt-4 font-(--font-manrope) text-sm leading-relaxed text-(--text-dim)">
        {overlay.body}
      </p>
    </article>
  );
}

/* --------------------------------------------------------------------- */

function Intro() {
  return (
    <header className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION.duration.base }}
        className="font-(--font-manrope) text-[11px] uppercase tracking-[0.5em] text-(--gold-dim)"
      >
        Lens Gallery
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.silk, delay: 0.08 }}
        className="mt-6 max-w-[20ch] font-(--font-bricolage-grotesque) text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.95] tracking-tight"
      >
        Same chart. Five lenses. Watch it change.
      </motion.h1>
      <p className="mt-6 max-w-[50ch] font-(--font-manrope) text-base leading-relaxed text-(--cream-muted)">
        The chart stays still. Only the lens on top of it moves. Keep scrolling.
      </p>
    </header>
  );
}

function Outro() {
  return (
    <footer className="flex min-h-[60vh] items-center justify-center px-6 text-center">
      <p className="max-w-[38ch] font-(--font-bricolage-grotesque) text-3xl leading-tight text-(--cream)">
        Nine more plates not pictured.
      </p>
    </footer>
  );
}
