"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { LabNav } from "../lab-nav";
import { ActIVBuilder } from "@features/timeline";

/* ================================================================== */
/*  Construction Hoarding — bold graphic design on construction boards */
/* ================================================================== */

/** Mouse-reactive parallax wrapper */
function ParallaxLayer({
  children,
  depth,
  mouseX,
  mouseY,
  className = "",
}: {
  children: React.ReactNode;
  depth: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        x: mouseX,
        y: mouseY,
        scale: 1 + depth * 0.02,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Geometric accent shape */
function GeoShape({
  top,
  left,
  size,
  rotate,
  color,
  delay,
  shape,
}: {
  top: string;
  left: string;
  size: string;
  rotate: number;
  color: string;
  delay: number;
  shape: "square" | "circle" | "triangle";
}) {
  const borderRadius = shape === "circle" ? "50%" : "0";
  const clip =
    shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined;

  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: size,
        height: size,
        rotate,
        borderRadius,
        clipPath: clip,
        border: `2px solid ${color}`,
        opacity: 0.15,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.15 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
    />
  );
}

export default function ConstructionHoarding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  // Smoothed parallax values — different depths
  const mx1 = useSpring(rawMouseX, { stiffness: 50, damping: 20 });
  const my1 = useSpring(rawMouseY, { stiffness: 50, damping: 20 });
  const mx2 = useSpring(rawMouseX, { stiffness: 30, damping: 25 });
  const my2 = useSpring(rawMouseY, { stiffness: 30, damping: 25 });
  const mx3 = useSpring(rawMouseX, { stiffness: 20, damping: 30 });
  const my3 = useSpring(rawMouseY, { stiffness: 20, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      rawMouseX.set(cx * -20);
      rawMouseY.set(cy * -15);
    },
    [rawMouseX, rawMouseY]
  );

  const handleMouseLeave = useCallback(() => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  }, [rawMouseX, rawMouseY]);

  return (
    <>
      <LabNav />
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-screen overflow-hidden cursor-crosshair"
        style={{ background: "#08080c" }}
      >
        {/* Real Act IV content behind the hoarding — visible through board gaps */}
        <div className="pointer-events-none" style={{ opacity: 0.15 }}>
          <ActIVBuilder />
        </div>

        {/* Cover layer — hoarding boards on top */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Board gaps — strategic transparent strips where Act IV bleeds through */}
          {/* Vertical gap left side */}
          <div
            className="absolute pointer-events-none z-[2]"
            style={{
              left: "18%",
              top: "15%",
              width: "3px",
              height: "35%",
              background: "transparent",
              boxShadow: "0 0 12px 4px rgba(94,187,115,0.04)",
            }}
          />
          {/* Vertical gap right side */}
          <div
            className="absolute pointer-events-none z-[2]"
            style={{
              right: "22%",
              top: "45%",
              width: "4px",
              height: "30%",
              background: "transparent",
              boxShadow: "0 0 12px 4px rgba(201,168,76,0.03)",
            }}
          />

          {/* Semi-opaque board surface — covers most of Act IV but gaps let content through */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: "#08080c",
              opacity: 0.82,
              maskImage: `
                linear-gradient(90deg,
                  black 0%, black 17%,
                  rgba(0,0,0,0.2) 18%, rgba(0,0,0,0.2) 19%,
                  black 20%, black 76%,
                  rgba(0,0,0,0.15) 77%, rgba(0,0,0,0.15) 78%,
                  black 79%, black 100%
                )
              `,
              WebkitMaskImage: `
                linear-gradient(90deg,
                  black 0%, black 17%,
                  rgba(0,0,0,0.2) 18%, rgba(0,0,0,0.2) 19%,
                  black 20%, black 76%,
                  rgba(0,0,0,0.15) 77%, rgba(0,0,0,0.15) 78%,
                  black 79%, black 100%
                )
              `,
            }}
          />

          {/* Peeled corner — top right, reveals more content underneath */}
          <div
            className="absolute top-0 right-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none z-[3]"
            style={{
              background: "linear-gradient(225deg, transparent 35%, #08080c 60%)",
            }}
          />

          {/* Board panel texture */}
          <div
            className="absolute inset-0 pointer-events-none z-[4]"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  transparent 120px,
                  rgba(255,255,255,0.015) 120px,
                  rgba(255,255,255,0.015) 121px
                )
              `,
            }}
          />

          {/* Layer 3 — deepest: geometric accents */}
          <ParallaxLayer depth={3} mouseX={mx3} mouseY={my3}>
            <GeoShape top="10%" left="8%" size="80px" rotate={15} color="var(--gold)" delay={0.5} shape="square" />
            <GeoShape top="70%" left="75%" size="60px" rotate={-20} color="var(--cream)" delay={0.8} shape="circle" />
            <GeoShape top="25%" left="80%" size="50px" rotate={45} color="var(--gold)" delay={1.1} shape="triangle" />
            <GeoShape top="80%" left="15%" size="70px" rotate={-10} color="var(--cream)" delay={1.4} shape="square" />
            <GeoShape top="45%" left="5%" size="40px" rotate={30} color="var(--gold-dim)" delay={0.9} shape="triangle" />
            <GeoShape top="15%" left="55%" size="45px" rotate={-35} color="var(--cream)" delay={1.6} shape="circle" />

            {/* Diagonal lines */}
            <div
              className="absolute top-0 bottom-0 left-[20%] w-px"
              style={{
                background: "rgba(201,168,76,0.06)",
                transform: "rotate(15deg)",
                transformOrigin: "top left",
              }}
            />
            <div
              className="absolute top-0 bottom-0 right-[25%] w-px"
              style={{
                background: "rgba(240,230,208,0.04)",
                transform: "rotate(-12deg)",
                transformOrigin: "top right",
              }}
            />
          </ParallaxLayer>

          {/* Layer 2 — mid: bold type background */}
          <ParallaxLayer depth={2} mouseX={mx2} mouseY={my2}>
            {/* Giant background "IV" */}
            <motion.div
              className="absolute right-[-5%] top-[10%]"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1.5 }}
            >
              <span
                className="font-serif text-[30vw] font-bold leading-none select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(240,230,208,0.04)",
                }}
              >
                IV
              </span>
            </motion.div>

            {/* Angled "UNDER CONSTRUCTION" band */}
            <motion.div
              className="absolute left-[-5%] right-[-5%] flex items-center justify-center py-3 sm:py-4"
              style={{
                top: "55%",
                background: "rgba(201,168,76,0.08)",
                transform: "rotate(-5deg)",
                borderTop: "1px solid rgba(201,168,76,0.12)",
                borderBottom: "1px solid rgba(201,168,76,0.12)",
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            >
              <span
                className="font-ui text-[10px] sm:text-xs uppercase tracking-[0.6em] sm:tracking-[0.8em]"
                style={{ color: "var(--gold-dim)" }}
              >
                Under Construction
              </span>
            </motion.div>
          </ParallaxLayer>

          {/* Layer 1 — front: main typography */}
          <ParallaxLayer depth={1} mouseX={mx1} mouseY={my1} className="flex items-center justify-center">
            <div className="relative flex flex-col items-center gap-4 sm:gap-6 px-8">
              {/* "THE" — small, wide-tracked */}
              <motion.span
                className="font-ui text-sm sm:text-base uppercase tracking-[0.8em] sm:tracking-[1em]"
                style={{ color: "rgba(240,230,208,0.3)" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                The
              </motion.span>

              {/* "BUILDER" — massive */}
              <motion.h1
                className="font-sans text-[14vw] sm:text-[12vw] md:text-[10vw] font-black uppercase leading-[0.85] tracking-tight text-center"
                style={{
                  color: "var(--cream)",
                  textShadow: "0 4px 40px rgba(240,230,208,0.05)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              >
                Builder
              </motion.h1>

              {/* Underline accent */}
              <motion.div
                className="h-[2px] w-24 sm:w-32"
                style={{ background: "var(--gold)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />

              {/* Status line */}
              <motion.div
                className="flex items-center gap-3 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <div className="h-px w-6" style={{ background: "rgba(240,230,208,0.1)" }} />
                <span
                  className="font-ui text-[8px] sm:text-[9px] uppercase tracking-[0.4em]"
                  style={{ color: "var(--text-dim)" }}
                >
                  Currently in progress
                </span>
                <div className="h-px w-6" style={{ background: "rgba(240,230,208,0.1)" }} />
              </motion.div>

              {/* Section identifier */}
              <motion.span
                className="font-ui text-[7px] uppercase tracking-[0.5em]"
                style={{ color: "rgba(240,230,208,0.08)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                Section IV
              </motion.span>
            </div>
          </ParallaxLayer>

          {/* Corner brackets — construction board edges */}
          {/* Top-left */}
          <motion.div
            className="absolute w-8 h-8 sm:w-12 sm:h-12 z-30"
            style={{
              top: "24px", left: "24px",
              borderTop: "2px solid rgba(240,230,208,0.1)",
              borderLeft: "2px solid rgba(240,230,208,0.1)",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          />
          {/* Top-right */}
          <motion.div
            className="absolute w-8 h-8 sm:w-12 sm:h-12 z-30"
            style={{
              top: "24px", right: "24px",
              borderTop: "2px solid rgba(240,230,208,0.1)",
              borderRight: "2px solid rgba(240,230,208,0.1)",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          />
          {/* Bottom-left */}
          <motion.div
            className="absolute w-8 h-8 sm:w-12 sm:h-12 z-30"
            style={{
              bottom: "24px", left: "24px",
              borderBottom: "2px solid rgba(240,230,208,0.1)",
              borderLeft: "2px solid rgba(240,230,208,0.1)",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          />
          {/* Bottom-right */}
          <motion.div
            className="absolute w-8 h-8 sm:w-12 sm:h-12 z-30"
            style={{
              bottom: "24px", right: "24px",
              borderBottom: "2px solid rgba(240,230,208,0.1)",
              borderRight: "2px solid rgba(240,230,208,0.1)",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          />

          {/* Peeling edge effect — subtle drop shadow at top right */}
          <div
            className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-20"
            style={{
              background:
                "linear-gradient(225deg, rgba(8,8,12,0.9) 0%, transparent 60%)",
              boxShadow: "inset -4px 4px 12px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Back to lab */}
        <Link
          href="/lab"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 font-ui text-[10px] uppercase tracking-[0.3em] px-4 py-2 rounded z-50 transition-colors"
          style={{
            color: "var(--text-dim)",
            border: "1px solid var(--stroke)",
            background: "rgba(8,8,12,0.9)",
          }}
        >
          Back to Lab
        </Link>
      </div>
    </>
  );
}
