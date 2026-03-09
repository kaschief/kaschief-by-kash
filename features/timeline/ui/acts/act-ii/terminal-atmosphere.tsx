"use client";

import { motion, type MotionValue } from "framer-motion";

import {
  COLOR_RGBA,
  GLOW_PRIMARY,
  GLOW_SECONDARY,
  GRID_OPACITY_DESKTOP,
  GRID_OPACITY_MOBILE,
  GRID_SIZE,
  SCAN_LINE_DURATION,
  SCAN_LINE_OPACITY,
  SECTION_BG,
  SITE_BG,
} from "./act-ii.constants";

interface TerminalAtmosphereProps {
  glowOpacity: MotionValue<number>;
}

/** Grid texture, fog overlays, atmospheric glows, and scan line for Act II. */
export function TerminalAtmosphere({ glowOpacity }: TerminalAtmosphereProps) {
  return (
    <>
      {/* Grid texture — mobile/tablet */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          backgroundImage: `
            linear-gradient(${COLOR_RGBA(GRID_OPACITY_MOBILE)} 1px, transparent 1px),
            linear-gradient(90deg, ${COLOR_RGBA(GRID_OPACITY_MOBILE)} 1px, transparent 1px)
          `,
          backgroundSize: GRID_SIZE,
          backgroundAttachment: "fixed",
        }}
      />
      {/* Grid texture — desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `
            linear-gradient(${COLOR_RGBA(GRID_OPACITY_DESKTOP)} 1px, transparent 1px),
            linear-gradient(90deg, ${COLOR_RGBA(GRID_OPACITY_DESKTOP)} 1px, transparent 1px)
          `,
          backgroundSize: GRID_SIZE,
          backgroundAttachment: "fixed",
        }}
      />

      {/* Grid fade mask */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 40%, ${SECTION_BG} 85%)`,
        }}
      />

      {/* Top fog */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(to bottom, ${SITE_BG}, transparent)`,
        }}
      />

      {/* Bottom fog — taller to fade grid before takeaway */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80"
        style={{
          background: `linear-gradient(to top, ${SITE_BG} 30%, transparent)`,
        }}
      />

      {/* Blue atmospheric glows */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: glowOpacity }}>
        <div
          className="atmospheric-glow"
          style={{
            width: GLOW_PRIMARY.size,
            height: GLOW_PRIMARY.size,
            top: GLOW_PRIMARY.top,
            right: GLOW_PRIMARY.right,
            transform: "translate(0, -50%)",
            background: `radial-gradient(circle, ${COLOR_RGBA(GLOW_PRIMARY.opacity)} 0%, transparent 65%)`,
          }}
        />
        <div
          className="atmospheric-glow"
          style={{
            width: GLOW_SECONDARY.size,
            height: GLOW_SECONDARY.size,
            bottom: GLOW_SECONDARY.bottom,
            left: GLOW_SECONDARY.left,
            background: `radial-gradient(circle, ${COLOR_RGBA(GLOW_SECONDARY.opacity)} 0%, transparent 65%)`,
          }}
        />
      </motion.div>

      {/* Scan line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${COLOR_RGBA(SCAN_LINE_OPACITY)}, transparent)`,
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: SCAN_LINE_DURATION, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}
