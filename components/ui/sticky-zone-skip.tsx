"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fadeJumpSlide, useLenis, useNavStore, type ActiveZoneInfo } from "@hooks";
import { SECTION_IDS_ORDERED, DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET, type SectionId } from "@utilities";

/* ── Constants ── */

/** User must be at least this deep into the zone (fraction). */
const MIN_PROGRESS = 0.35;
/** Scroll velocity (px/s) threshold — only show when scrolling fast. */
const VELOCITY_THRESHOLD = 800;
/** How many consecutive fast-scroll samples before showing (debounce). */
const FAST_SCROLL_SAMPLES = 4;
/** Minimum time (ms) the button stays visible after appearing — gives user time to click. */
const LINGER_MS = 3000;
/** Overshoot past zone boundary to clear it (px). */
interface SkipTarget {
  scrollTo: number;
  sectionId: SectionId;
}

/**
 * Find the next section heading to skip to, based on current scroll position.
 * Down: first section heading that's at least one viewport below current scroll.
 * Up: last section heading that's above current scroll.
 */
function findSkipTarget(
  zone: { top: number; bottom: number },
  direction: "down" | "up",
): SkipTarget | null {
  const scrollY = window.scrollY;

  // Measure all sections and sort by actual DOM position
  const sections: { id: SectionId; absTop: number; scrollTo: number }[] = [];
  for (const id of SECTION_IDS_ORDERED) {
    const el = document.getElementById(id);
    if (!el) continue;
    const absTop = el.getBoundingClientRect().top + scrollY;
    const offset = SECTION_SCROLL_OFFSET[id as SectionId] ?? DEFAULT_SCROLL_OFFSET;
    sections.push({ id: id as SectionId, absTop, scrollTo: absTop - offset });
  }
  sections.sort((a, b) => a.absTop - b.absTop);

  if (direction === "down") {
    // Skip past the sticky zone — land on the first content after it.
    // Find the nearest section heading at or before the zone end to set correct nav state.
    let nearestSection: typeof sections[0] | undefined;
    for (const s of sections) {
      if (s.absTop <= zone.bottom) nearestSection = s;
    }
    return {
      scrollTo: zone.bottom,
      sectionId: nearestSection?.id ?? sections[0].id,
    };
  } else {
    // Skip back to the start of the zone — land on the section heading that owns it.
    let best: typeof sections[0] | null = null;
    for (const s of sections) {
      if (s.absTop <= zone.top) best = s;
    }
    return best ? { scrollTo: best.scrollTo, sectionId: best.id } : null;
  }
  return null;
}

/* ── Hook: scroll direction + velocity ── */

interface ScrollState {
  direction: "down" | "up";
  isFast: boolean;
}

function useScrollIntent(): ScrollState {
  const [state, setState] = useState<ScrollState>({
    direction: "down",
    isFast: false,
  });
  const lastY = useRef(0);
  const lastT = useRef(0);
  const fastCount = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const dt = now - lastT.current;
      const dy = Math.abs(y - lastY.current);

      if (dt > 0 && dy > 2) {
        const velocity = (dy / dt) * 1000; // px/s
        const dir = y > lastY.current ? "down" : "up";

        if (velocity > VELOCITY_THRESHOLD) {
          fastCount.current = Math.min(fastCount.current + 1, FAST_SCROLL_SAMPLES + 1);
        } else {
          fastCount.current = Math.max(0, fastCount.current - 1);
        }

        setState({
          direction: dir,
          isFast: fastCount.current >= FAST_SCROLL_SAMPLES,
        });
      }

      lastY.current = y;
      lastT.current = now;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}

/* ── Component ── */

interface StickyZoneSkipProps {
  activeZone: ActiveZoneInfo | null;
}

/* ── Visibility state machine ── */

type VisPhase = "hidden" | "active" | "lingering" | "dismissed";

type VisAction =
  | { type: "TRIGGER_ON" }
  | { type: "TRIGGER_OFF" }
  | { type: "LINGER_EXPIRED" }
  | { type: "DISMISS" }
  | { type: "ZONE_CHANGED" };

function visReducer(state: VisPhase, action: VisAction): VisPhase {
  switch (action.type) {
    case "TRIGGER_ON":
      // From hidden or lingering, go active. Dismissed stays dismissed.
      if (state === "dismissed") return state;
      return "active";
    case "TRIGGER_OFF":
      // Only transition active → lingering (hidden/dismissed stay put)
      return state === "active" ? "lingering" : state;
    case "LINGER_EXPIRED":
      return state === "lingering" ? "hidden" : state;
    case "DISMISS":
      return "dismissed";
    case "ZONE_CHANGED":
      return "hidden";
  }
}

export function StickyZoneSkip({ activeZone }: StickyZoneSkipProps) {
  const getLenis = useLenis();
  const { direction, isFast } = useScrollIntent();
  const { isNavigating } = useNavStore();

  const [phase, dispatch] = useReducer(visReducer, "hidden");
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevZoneElRef = useRef<HTMLElement | null>(null);

  // Core trigger: deep in zone AND scrolling fast (pure derivation from props)
  const triggered = !!activeZone && activeZone.progress >= MIN_PROGRESS && isFast;

  // Reset when zone element changes — ref is only read/written inside this effect, never during render
  const zoneEl = activeZone?.zone.element ?? null;
  useEffect(() => {
    if (zoneEl === prevZoneElRef.current) return;
    prevZoneElRef.current = zoneEl;
    clearTimeout(lingerTimerRef.current);
    dispatch({ type: "ZONE_CHANGED" });
  }, [zoneEl]);

  // Dispatch TRIGGER_ON / TRIGGER_OFF from effects
  useEffect(() => {
    if (triggered) {
      dispatch({ type: "TRIGGER_ON" });
    } else {
      dispatch({ type: "TRIGGER_OFF" });
    }
  }, [triggered]);

  // Start/extend linger timer when entering lingering phase
  useEffect(() => {
    if (phase !== "lingering") return;
    clearTimeout(lingerTimerRef.current);
    lingerTimerRef.current = setTimeout(() => {
      dispatch({ type: "LINGER_EXPIRED" });
    }, LINGER_MS);
    return () => clearTimeout(lingerTimerRef.current);
  }, [phase]);

  const visible = phase === "active" || phase === "lingering";

  const handleSkip = useCallback(() => {
    const lenis = getLenis();
    if (!lenis || !activeZone) return;

    const result = findSkipTarget(activeZone.zone, direction);
    if (!result) return;

    // Dismiss button immediately
    clearTimeout(lingerTimerRef.current);
    dispatch({ type: "DISMISS" });

    // Signal navigating with the actual target section so nav highlights correctly
    const { startNavigation, endNavigation } = useNavStore.getState();
    startNavigation(result.sectionId);

    // Hard cut — jump directly to target, no slide
    fadeJumpSlide(lenis, result.scrollTo, result.scrollTo, 0, () => {
      endNavigation();
    });
  }, [getLenis, activeZone, direction]);

  // Escape key binding
  useEffect(() => {
    if (!visible || isNavigating) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, isNavigating, handleSkip]);

  const shouldShow = visible && !!activeZone && !isNavigating;
  const label = "Skip";
  const Chevron = direction === "down" ? ChevronDown : ChevronUp;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          key="sticky-zone-skip"
          type="button"
          onClick={handleSkip}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-16 left-1/2 z-40 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--stroke)] px-4 py-2 font-ui text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--gold-dim)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-dim)]"
          style={{
            background: "rgba(7, 7, 10, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          aria-label={label}>
          <Chevron size={12} strokeWidth={2} />
          <span>{label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
