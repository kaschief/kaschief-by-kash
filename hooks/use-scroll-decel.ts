"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./use-lenis";

const DEFAULT_WHEEL = 0.65;
const SLOW_WHEEL = 0.12;

/**
 * Creates scroll deceleration zones around the given section IDs.
 * When a section top enters the viewport threshold, Lenis scroll speed
 * smoothly drops, creating a "glide into view" feel. Desktop only (lg+).
 *
 * @param sectionIds - array of element IDs to create decel zones for
 */
export function useScrollDecel(sectionIds: string[]) {
  const getLenis = useLenis();

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const triggers: ScrollTrigger[] = [];
    let activeCount = 0;

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          // Decel zone: from when section top is at 20% of viewport
          // to when it's 10% above the viewport top
          start: "top 20%",
          end: "top -10%",
          onUpdate: (self) => {
            const lenis = getLenis();
            if (!lenis) return;

            // Ease: fastest at edges (progress 0 or 1), slowest at center (0.5)
            // This creates decelerate → hold → accelerate
            const ease = 1 - Math.sin(self.progress * Math.PI);
            lenis.options.wheelMultiplier =
              DEFAULT_WHEEL - (DEFAULT_WHEEL - SLOW_WHEEL) * ease;
          },
          onEnter: () => { activeCount++; },
          onLeave: () => {
            activeCount--;
            if (activeCount <= 0) restore();
          },
          onEnterBack: () => { activeCount++; },
          onLeaveBack: () => {
            activeCount--;
            if (activeCount <= 0) restore();
          },
        }),
      );
    });

    function restore() {
      activeCount = 0;
      const lenis = getLenis();
      if (lenis) lenis.options.wheelMultiplier = DEFAULT_WHEEL;
    }

    return () => {
      triggers.forEach((t) => t.kill());
      restore();
    };
  }, [getLenis, sectionIds]);
}
