"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FadeUp, RevealLine } from "@components";

const WARM_BG = "#0B0A07";
const SITE_BG = "#0A0A0F";

export function ActIIITitle() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div
      ref={sceneRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: WARM_BG }}>
      {/* Fog — top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px]"
        style={{
          background: `linear-gradient(to bottom, ${SITE_BG}, transparent)`,
        }}
      />

      {/* Fog — bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px]"
        style={{
          background: `linear-gradient(to top, ${SITE_BG}, transparent)`,
        }}
      />

      {/* Breathing glow */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 550,
          height: 550,
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.03), transparent 60%)",
          willChange: "transform, opacity",
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content — centered, scroll-linked fade */}
      <motion.div
        className="relative z-10 px-10 text-center"
        style={{ y: contentY, opacity: contentOpacity, willChange: "transform, opacity" }}>
        {/* ACT III label */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.5em" } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-6 text-xs tracking-wide sm:text-sm md:text-base"
          style={{ color: "#C9A84C" }}>
          ACT III
        </motion.div>

        {/* THE TEAM */}
        <RevealLine delay={0.3}>
          <h3 className="font-sans text-[clamp(72px,15vw,200px)] font-bold leading-[0.78] tracking-[-0.05em] text-(--cream)">
            THE
          </h3>
        </RevealLine>
        <RevealLine delay={0.45}>
          <h3 className="font-sans text-[clamp(72px,15vw,200px)] font-bold leading-[0.78] tracking-[-0.05em] text-(--cream)">
            LEADER
          </h3>
        </RevealLine>

        {/* Quote */}
        <FadeUp delay={0.7}>
          <p
            className="mx-auto mt-8 max-w-[460px] text-[clamp(15px,1.8vw,20px)] leading-relaxed text-(--cream-muted)"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}>
            Leading people turned out to be the hardest kind of
            debugging. And the most rewarding.
          </p>
        </FadeUp>
      </motion.div>

    </div>
  );
}
