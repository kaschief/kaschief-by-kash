"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/* ── Types ── */

export interface StickyZone {
  /** Absolute scroll-Y where the zone starts. */
  top: number;
  /** Absolute scroll-Y where the zone ends. */
  bottom: number;
  /** The DOM element with data-sticky-zone. */
  element: HTMLElement;
}

export interface ActiveZoneInfo {
  /** The zone the user is currently inside. */
  zone: StickyZone;
  /** 0-1 progress through the zone. */
  progress: number;
}

/* ── Constants ── */

const SELECTOR = "[data-sticky-zone]";
/** Minimum height (vh) for a zone to be tracked — filters out tiny sticky wrappers. */
const MIN_ZONE_HEIGHT_VH = 1.5;

/* ── External store ── */

/** Mutable store updated by scroll/resize listeners, exposed via useSyncExternalStore. */
let storeZones: StickyZone[] = [];
let storeActiveZone: ActiveZoneInfo | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getZonesSnapshot() {
  return storeZones;
}

function getActiveZoneSnapshot() {
  return storeActiveZone;
}

function measureZones() {
  const elements = document.querySelectorAll<HTMLElement>(SELECTOR);
  const vh = window.innerHeight;
  const measured: StickyZone[] = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.height < vh * MIN_ZONE_HEIGHT_VH) return;
    const top = rect.top + window.scrollY;
    measured.push({ top, bottom: top + rect.height, element: el });
  });

  measured.sort((a, b) => a.top - b.top);
  storeZones = measured;
  detectActiveZone();
  emit();
}

function detectActiveZone() {
  const scrollY = window.scrollY;
  let found: ActiveZoneInfo | null = null;

  for (const zone of storeZones) {
    if (scrollY >= zone.top && scrollY < zone.bottom) {
      const progress = (scrollY - zone.top) / (zone.bottom - zone.top);
      found = { zone, progress };
      break;
    }
  }

  const prev = storeActiveZone;
  if (!prev && !found) return;
  if (
    prev &&
    found &&
    prev.zone.element === found.zone.element &&
    Math.abs(prev.progress - found.progress) < 0.001
  ) {
    return;
  }

  storeActiveZone = found;
  emit();
}

/* ── Hook ── */

/**
 * Shared zone detection for all sticky-zone features.
 *
 * Returns the list of detected zones and the currently-active zone (if any).
 * Re-measures zone boundaries on resize.
 */
export function useStickyZones() {
  const rafId = useRef(0);
  const zones = useSyncExternalStore(subscribe, getZonesSnapshot, () => []);
  const activeZone = useSyncExternalStore(subscribe, getActiveZoneSnapshot, () => null);

  const remeasure = useCallback(() => measureZones(), []);

  // Measure on mount + resize
  useEffect(() => {
    measureZones();

    const onResize = () => measureZones();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Re-measure after lazy-loaded content settles
  useEffect(() => {
    const timer = setTimeout(() => measureZones(), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Detect active zone on scroll via rAF
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => detectActiveZone());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { zones, activeZone, remeasure };
}
