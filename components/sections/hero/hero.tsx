"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PERSONAL, ROLES } from "@/data/site";
import { EASE } from "@/components/motion";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #0E0E14 0%, #07070A 100%)",
      }}>
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content - just the name and roles */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        style={{ y: contentY, opacity: contentOpacity }}>
        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="font-serif text-[clamp(3.5rem,10vw,8rem)] font-normal leading-[0.9] tracking-[-0.02em] text-[var(--cream)]">
          {PERSONAL.name}
        </motion.h1>

        {/* Roles - static horizontal display with staggered fade-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2">
          {ROLES.map(({ label, color }, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-2">
              {i > 0 && <span className="text-[var(--text-faint)]">/</span>}
              <span
                className="text-sm font-light tracking-wide sm:text-base"
                style={{ color: color }}>
                {label}
              </span>
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
