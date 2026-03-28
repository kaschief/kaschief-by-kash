"use client";

import { useStickyZones, useZoneAcceleration } from "@hooks";
import { StickyZoneSkip } from "./sticky-zone-skip";

/**
 * Orchestrates all sticky-zone UX enhancements:
 * - Scroll acceleration inside zones
 * - Skip button for bypassing zones
 *
 * Render once in the page layout — detects all [data-sticky-zone] elements
 * automatically.
 */
export function StickyZoneControls() {
  const { activeZone } = useStickyZones();

  useZoneAcceleration(activeZone);

  return <StickyZoneSkip activeZone={activeZone} />;
}
