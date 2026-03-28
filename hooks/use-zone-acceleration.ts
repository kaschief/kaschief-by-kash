"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "./use-lenis";
import { useNavStore } from "./use-nav-store";
import type { ActiveZoneInfo } from "./use-sticky-zones";

/* ── Constants ── */

/** Default wheelMultiplier set in LenisProvider. */
const BASE_MULTIPLIER = 0.9;
/** Accelerated multiplier inside sticky zones (~2.5x effective speed). */
const ZONE_MULTIPLIER = 2.2;

/* ── Hook ── */

/**
 * Dynamically increases Lenis `wheelMultiplier` when the user is inside
 * a sticky zone, making scroll-driven animations pass more quickly.
 *
 * Does not affect touchMultiplier (mobile swipe speed is already tuned).
 * Pauses during programmatic nav scrolls to avoid interference.
 */
export function useZoneAcceleration(activeZone: ActiveZoneInfo | null) {
  const getLenis = useLenis();
  const appliedRef = useRef(false);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    const { isNavigating } = useNavStore.getState();

    if (activeZone && !isNavigating) {
      lenis.options.wheelMultiplier = ZONE_MULTIPLIER;
      appliedRef.current = true;
    } else if (appliedRef.current) {
      lenis.options.wheelMultiplier = BASE_MULTIPLIER;
      appliedRef.current = false;
    }

    // Subscribe to nav store changes so we restore immediately when nav starts
    const unsub = useNavStore.subscribe((state) => {
      const l = getLenis();
      if (!l) return;
      if (state.isNavigating && appliedRef.current) {
        l.options.wheelMultiplier = BASE_MULTIPLIER;
        appliedRef.current = false;
      }
    });

    return () => {
      unsub();
      // Always restore on cleanup
      const l = getLenis();
      if (l && appliedRef.current) {
        l.options.wheelMultiplier = BASE_MULTIPLIER;
        appliedRef.current = false;
      }
    };
  }, [activeZone, getLenis]);
}
