"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fadeJumpSlide, useLenis, useNavStore, type ActiveZoneInfo } from "@hooks";
import { SCROLL_NAV, SECTION_IDS_ORDERED, DEFAULT_SCROLL_OFFSET, SECTION_SCROLL_OFFSET, type SectionId } from "@utilities";

/* ── Constants ── */

/** User must be at least this deep into the zone (fraction). */
const MIN_PROGRESS = 0.35;
/** Scroll velocity (px/s) threshold — only show when scrolling fast. */
const VELOCITY_THRESHOLD = 800;
/** How many consecutive fast-scroll samples before showing (debounce). */
const FAST_SCROLL_SAMPLES = 4;
/** Overshoot past zone boundary to clear it (px). */
const BOUNDARY_OFFSET_PX = 40;
/** Max distance (px) a section heading can be from the zone edge to snap to it. */
const SNAP_RADIUS_PX = 600;

/**
 * Down: find the first section heading just past the zone bottom (snap to next act).
 * Up: find the section heading this zone belongs to (snap to start of current act).
 */
function findSkipTarget(
  zone: { top: number; bottom: number },
  direction: "down" | "up",
): number | null {
  if (direction === "down") {
    // First section heading after the zone ends
    for (const id of SECTION_IDS_ORDERED) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const offset = SECTION_SCROLL_OFFSET[id as SectionId] ?? DEFAULT_SCROLL_OFFSET;
      if (top > zone.bottom && top - zone.bottom < SNAP_RADIUS_PX) {
        return top - offset;
      }
    }
  } else {
    // Last section heading at or before the zone start (= the act this zone belongs to)
    let best: number | null = null;
    for (const id of SECTION_IDS_ORDERED) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const offset = SECTION_SCROLL_OFFSET[id as SectionId] ?? DEFAULT_SCROLL_OFFSET;
      if (top <= zone.top + SNAP_RADIUS_PX) {
        best = top - offset;
      }
    }
    return best;
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

export function StickyZoneSkip({ activeZone }: StickyZoneSkipProps) {
  const getLenis = useLenis();
  const { direction, isFast } = useScrollIntent();
  const { isNavigating } = useNavStore();
  // Derive visibility purely from props — no setState in effects.
  // Show when deep in zone AND scrolling fast. Hides when either condition drops.
  const visible = !!activeZone && activeZone.progress >= MIN_PROGRESS && isFast;

  const handleSkip = useCallback(() => {
    const lenis = getLenis();
    if (!lenis || !activeZone) return;

    const { zone } = activeZone;
    // Down: snap to next section heading, or zone end.
    // Up: snap to this zone's section heading (start of current act).
    const fallback =
      direction === "down"
        ? zone.bottom + BOUNDARY_OFFSET_PX
        : Math.max(0, zone.top - window.innerHeight);

    const target = findSkipTarget(zone, direction) ?? fallback;

    // Fade out → instant jump past zone → fade back in (no animation scrub)
    const jumpTo =
      direction === "down"
        ? Math.max(0, target - SCROLL_NAV.approachPx)
        : target + SCROLL_NAV.approachPx;

    fadeJumpSlide(lenis, jumpTo, target, SCROLL_NAV.slideInDuration, () => {});
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
          className="fixed bottom-8 right-6 z-40 flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--stroke)] px-4 py-2 font-ui text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--gold-dim)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-dim)]"
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
