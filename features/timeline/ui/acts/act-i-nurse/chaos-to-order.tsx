"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ACT_I } from "@data";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";
import {
  COLORS,
  SCENE_HEIGHT_VH,
  BURST_TRIGGER_VIEWPORT,
  BURST_RESET_VIEWPORT,
  BASE_DRIFT_RANGE,
} from "./chaos-to-order.constants";
import { useIsLg } from "./chaos-to-order.hooks";
import { SkillCard } from "./skill-card";
import { NarrativeText } from "./narrative-text";
import { ScrollIndicator } from "./scroll-indicator";
import { FocusBall } from "./focus-ball";
import { FocusAccordion } from "./focus-accordion";

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

  // Trigger burst when scrolling DOWN into the section.
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = sceneRef.current;
      if (!el) return;
      const scrollingDown = window.scrollY > lastScrollY.current;
      lastScrollY.current = window.scrollY;

      const top = el.getBoundingClientRect().top;

      if (top < window.innerHeight * BURST_TRIGGER_VIEWPORT && scrollingDown) {
        triggerBurst();
      } else if (top > window.innerHeight * BURST_RESET_VIEWPORT) {
        // Only reset when section is mostly off-screen (avoids flash of empty black)
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
    return () =>
      window.removeEventListener(NAVIGATION_SCROLL_EVENT, handleNavScroll);
  }, [resetBurst]);

  const { isLg, lgRef } = useIsLg();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const baseDrift = useTransform(scrollYProgress, [0, 1], [0, BASE_DRIFT_RANGE]);

  return (
    <div
      ref={sceneRef}
      className="relative"
      data-sticky-zone
      style={{ height: `${SCENE_HEIGHT_VH}vh` }}>
      <div
        ref={stickyRef}
        className="sticky top-0 mx-auto h-screen h-[100svh] max-w-350"
        style={{
          containerType: "size",
          overflowX: "visible",
          overflowY: "clip",
          willChange: "transform",
        }}>
        {/* Atmospheric glows */}
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 500,
            height: 500,
            top: "15%",
            right: "8%",
            background: `radial-gradient(circle, ${COLORS.glowStrong}, transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 350,
            height: 350,
            bottom: "20%",
            left: "6%",
            background: `radial-gradient(circle, ${COLORS.glowSubtle}, transparent 55%)`,
          }}
        />

        {ACT_I.skillScenarios.map((node, i) => (
          <SkillCard
            key={`${node.id}-${burstKey}`}
            node={node}
            index={i}
            visible={shouldBurst}
            baseDrift={baseDrift}
            containerRef={stickyRef}
            scrollProgress={scrollYProgress}
            lgRef={lgRef}
            isLg={isLg}
          />
        ))}

        <NarrativeText scrollProgress={scrollYProgress} />
        <FocusBall scrollProgress={scrollYProgress} lgRef={lgRef} />
        <FocusAccordion scrollProgress={scrollYProgress} />
        <ScrollIndicator
          sectionRef={sceneRef}
          scrollProgress={scrollYProgress}
        />
      </div>
    </div>
  );
}
