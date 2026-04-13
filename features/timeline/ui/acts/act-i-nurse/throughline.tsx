"use client";

import { FadeIn } from "@components";

interface ThroughlineProps {
  /**
   * Stable id retained for upstream callers and for legibility in DevTools.
   * No longer used as a pin-store key — the section is now a plain
   * single-viewport beat.
   */
  id: string;
  text: string;
}

/**
 * Single-viewport closing beat for Act I.
 *
 * Why no sticky-once / pin-store coupling:
 * - The previous `useStickyOnce` wrapper was 150vh tall with a 100vh sticky
 *   child, which produced a ~100vh exit runway between the message and
 *   Act II's title. On hash refreshes past this section, the wrapper would
 *   collapse on the user's first scroll event and force a ~50vh upward
 *   `lenis.scrollTo` compensation, which dropped the user back into Act I.
 * - A plain `h-svh` section with no sticky behavior, no pin-store key, and no
 *   scroll-driven compensation removes both failure modes deterministically.
 *
 * Visual: full-viewport, centered narrator quote. The quote scrolls with the
 * page like any other section.
 */
export function Throughline({ id, text }: ThroughlineProps) {
  return (
    <div
      id={id}
      className="relative flex h-svh w-full items-center justify-center px-6">
      <FadeIn>
        <h3 className="mx-auto max-w-2xl text-center font-narrator text-[clamp(22px,3vw,36px)] leading-[1.35] tracking-[-0.01em] text-(--cream)">
          {text}
        </h3>
      </FadeIn>
    </div>
  );
}
