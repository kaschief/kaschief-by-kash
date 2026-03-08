"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ORBIT_NODES } from "@data";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";
import { C, DRIFT_RATES, DRIFT_DIRS } from "./chaos-to-order.constants";
import { useIsLgRef } from "./chaos-to-order.hooks";
import { OrbitNode } from "./orbit-node";
import { NarrativeText } from "./narrative-text";
import { ScrollIndicator } from "./scroll-indicator";

export function ChaosToOrder() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [burstKey, setBurstKey] = useState(0);
  const hasBurst = useRef(false);
  const [shouldBurst, setShouldBurst] = useState(false);

  const resetBurst = useCallback(() => {
    if (!hasBurst.current) return;
    hasBurst.current = false;
    setShouldBurst(false);
    setBurstKey((k) => k + 1);
  }, []);

  const triggerBurst = useCallback(() => {
    if (hasBurst.current) return;
    hasBurst.current = true;
    setShouldBurst(true);
  }, []);

  // Trigger burst only when scrolling DOWN into the section.
  // Reset when user scrolls back above it.
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = sceneRef.current;
      if (!el) return;
      const scrollingDown = window.scrollY > lastScrollY.current;
      lastScrollY.current = window.scrollY;

      const top = el.getBoundingClientRect().top;

      if (top < window.innerHeight * 0.66 && scrollingDown) {
        triggerBurst();
      } else if (top > 0) {
        resetBurst();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerBurst, resetBurst]);

  // Reset on nav click to home
  useEffect(() => {
    const handleNavScroll = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sectionId === "portrait") resetBurst();
    };
    window.addEventListener(NAVIGATION_SCROLL_EVENT, handleNavScroll);
    return () => window.removeEventListener(NAVIGATION_SCROLL_EVENT, handleNavScroll);
  }, [resetBurst]);

  const lgRef = useIsLgRef();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const baseDrift = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const drifts = DRIFT_RATES.map((rate, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(baseDrift, (v) => v * rate * DRIFT_DIRS[i]),
  );

  return (
    <div
      ref={sceneRef}
      className="relative"
      data-sticky-zone
      style={{ height: "600vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 mx-auto h-screen max-w-350 overflow-hidden">
        {/* Atmospheric glows */}
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 500,
            height: 500,
            top: "15%",
            right: "8%",
            background: `radial-gradient(circle, ${C.glowStrong}, transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 350,
            height: 350,
            bottom: "20%",
            left: "6%",
            background: `radial-gradient(circle, ${C.glowSubtle}, transparent 55%)`,
          }}
        />

        {ORBIT_NODES.map((node, i) => (
          <OrbitNode
            key={`${node.label}-${burstKey}`}
            node={node}
            index={i}
            visible={shouldBurst}
            drift={drifts[i]}
            containerRef={stickyRef}
            scrollProgress={scrollYProgress}
            lgRef={lgRef}
          />
        ))}

        <NarrativeText scrollProgress={scrollYProgress} />
        <ScrollIndicator sectionRef={sceneRef} scrollProgress={scrollYProgress} />
      </div>
    </div>
  );
}
