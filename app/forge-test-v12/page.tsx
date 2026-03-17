"use client";

/**
 * V12: Zooming Timeline
 *
 * Horizontal timeline at top with 4 company dots.
 * As you scroll, the viewport "zooms into" the active company —
 * scene text appears, then action items stagger in, then shift fades italic.
 * Between companies, the zoom pulls back to the full timeline before diving in again.
 */

import { useRef, useState } from "react";
import {
  useScroll,
  useMotionValueEvent,
  motion,
  AnimatePresence,
} from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ================================================================== */
/*  Data                                                                */
/* ================================================================== */

interface Company {
  name: string;
  period: string;
  color: string;
  rgb: [number, number, number];
  scene: string;
  actions: string[];
  shift: string;
}

const COMPANIES: Company[] = [
  {
    name: "AMBOSS",
    period: "Berlin, 2018 — 2019",
    color: "#60A5FA",
    rgb: [96, 165, 250],
    scene:
      "Half a million medical students. An app that was supposed to help them pass their exams. I came from the ward — I knew what it felt like when the system you depend on doesn't understand your context.",
    actions: [
      "Migrated from vanilla JS to React",
      "Introduced A/B testing to stop guessing",
      "Broke production once — learned testing discipline",
      "Brought nursing instinct to UX: spotted when flows lied to users",
    ],
    shift:
      "I learned that the gap between 'works technically' and 'works for the person' is where most products fail.",
  },
  {
    name: "Compado",
    period: "Berlin, 2019 — 2021",
    color: "#42B883",
    rgb: [66, 184, 131],
    scene:
      "The sites were replicas of each other — same structure, different brands, different audiences. Every change meant touching six copies. Visitors arrived from search with zero loyalty and no patience.",
    actions: [
      "Rebuilt architecture: component-driven, shared across brands",
      "Attacked load times — Lighthouse audits, lazy loading, infinite scroll",
      "Built first chatbot — conversational interface for the product",
      "CSS compression and performance as a product strategy",
    ],
    shift:
      "Every millisecond is a user who stays or leaves. Performance isn't a technical achievement — it's a product decision.",
  },
  {
    name: "CAPinside",
    period: "Hamburg, 2021",
    color: "#3178C6",
    rgb: [49, 120, 198],
    scene:
      "Ten thousand financial advisors depending on a platform that had grown fragile. Nobody reviewed code — the process existed on paper but nobody prioritized it. Tests were sparse.",
    actions: [
      "Learned to work across React, Ruby, and PHP systems",
      "Started reading the codebase as a record of team habits",
      "Diagnosed organizational patterns through code shortcuts",
      "Pushed for code review culture and TypeScript adoption",
    ],
    shift:
      "You can't fix code without fixing process. A codebase is a record of a team's habits, frozen in the repository.",
  },
  {
    name: "DKB Code Factory",
    period: "Berlin, 2021 — 2024",
    color: "#F472B6",
    rgb: [244, 114, 182],
    scene:
      "Germany's largest direct bank. Five million users. A banking app moving from legacy to React and TypeScript. Monthly releases. Security, stability, regulations at every turn. Zero automated tests.",
    actions: [
      "Introduced Playwright end-to-end testing — team adopted the patterns",
      "Moved releases from monthly to weekly",
      "Feature flags: product could toggle without deployments",
      "Built shared design system and feature modules with unit tests",
      "Pushed back on flows in the product room — shaped what got built",
    ],
    shift:
      "Production bugs dropped 30%. I wasn't just building features anymore — I was shaping how the team worked, what we shipped, and why.",
  },
];

/* ================================================================== */
/*  Scroll layout — 900vh container, 4 companies                       */
/*  Each company gets ~20% of scroll. Gaps between for pull-back.      */
/* ================================================================== */

// Per-company: 0.18 of scroll for content, 0.05 gap
// Total = 4 * 0.18 + 3 * 0.05 + 0.07 (intro) + 0.08 (outro) = 1.0
const INTRO = 0.07;
const COMPANY_DUR = 0.19;
const GAP = 0.04;

function companyRange(i: number): { start: number; end: number } {
  const start = INTRO + i * (COMPANY_DUR + GAP);
  return { start, end: start + COMPANY_DUR };
}

// Layout total: INTRO + 4*COMPANY_DUR + 3*GAP + OUTRO ≈ 1.0

/* ================================================================== */
/*  Timeline Bar                                                        */
/* ================================================================== */

function TimelineBar({ progress }: { progress: number }) {
  const dotSpacing = 100 / (COMPANIES.length + 1);

  return (
    <div
      className="fixed left-0 right-0 flex items-center font-sans"
      style={{
        top: 40,
        height: 48,
        zIndex: 9000,
        background: "rgba(7,7,10,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--stroke, #16161E)",
      }}
    >
      {/* Rail */}
      <div
        className="absolute"
        style={{
          left: `${dotSpacing}%`,
          right: `${dotSpacing}%`,
          top: "50%",
          height: 2,
          background: "var(--stroke, #16161E)",
          transform: "translateY(-50%)",
        }}
      />

      {/* Progress fill */}
      <div
        className="absolute"
        style={{
          left: `${dotSpacing}%`,
          top: "50%",
          height: 2,
          transform: "translateY(-50%)",
          background: (() => {
            // Find which company we're in or between
            const activeIdx = COMPANIES.findIndex((_, i) => {
              const r = companyRange(i);
              return progress >= r.start && progress <= r.end;
            });
            const ci = activeIdx >= 0 ? activeIdx : Math.min(3, Math.floor((progress - INTRO) / (COMPANY_DUR + GAP)));
            const clampedIdx = clamp(ci, 0, 3);
            return COMPANIES[clampedIdx].color;
          })(),
          width: (() => {
            const totalRailPct = 100 - 2 * dotSpacing;
            // Map progress to 0–1 across company ranges
            const firstStart = companyRange(0).start;
            const lastEnd = companyRange(3).end;
            const norm = clamp(
              (progress - firstStart) / (lastEnd - firstStart),
              0,
              1
            );
            return `${norm * totalRailPct}%`;
          })(),
          transition: "width 0.15s ease-out",
        }}
      />

      {/* Dots */}
      {COMPANIES.map((c, i) => {
        const r = companyRange(i);
        const isActive = progress >= r.start && progress <= r.end;
        const isPast = progress > r.end;
        const internalProgress = clamp(
          (progress - r.start) / (r.end - r.start),
          0,
          1
        );

        const dotFill = isActive
          ? internalProgress
          : isPast
            ? 1
            : 0;

        const scale = isActive ? 1.35 : isPast ? 1.1 : 1;
        const dotSize = 14;

        return (
          <div
            key={c.name}
            className="absolute flex flex-col items-center"
            style={{
              left: `${dotSpacing * (i + 1)}%`,
              top: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Glow */}
            {isActive && (
              <div
                className="absolute rounded-full"
                style={{
                  width: dotSize + 16,
                  height: dotSize + 16,
                  background: `rgba(${c.rgb.join(",")}, 0.15)`,
                  filter: "blur(6px)",
                }}
              />
            )}

            {/* Dot background */}
            <div
              className="relative rounded-full overflow-hidden"
              style={{
                width: dotSize,
                height: dotSize,
                border: `2px solid ${isPast || isActive ? c.color : "var(--stroke, #16161E)"}`,
                background: "var(--bg, #07070A)",
                transition: "border-color 0.3s ease",
              }}
            >
              {/* Fill */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${dotFill * 100}%`,
                  background: c.color,
                  transition: "height 0.15s ease-out",
                }}
              />
            </div>

            {/* Label */}
            <span
              className="absolute whitespace-nowrap text-[9px] tracking-wider uppercase"
              style={{
                top: dotSize / 2 + 12,
                color: isActive
                  ? c.color
                  : isPast
                    ? "var(--cream-muted, #B0A890)"
                    : "var(--text-dim, #8A8478)",
                fontWeight: isActive ? 600 : 400,
                transition: "color 0.3s ease",
              }}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Company Content                                                     */
/* ================================================================== */

function CompanyContent({
  company,
  internalProgress,
}: {
  company: Company;
  internalProgress: number;
}) {
  // Phase timing within the company's scroll range
  const sceneIn = smoothstep(0.0, 0.15, internalProgress);
  const actionsIn = smoothstep(0.15, 0.55, internalProgress);
  const shiftIn = smoothstep(0.55, 0.75, internalProgress);
  const fadeOut = 1 - smoothstep(0.85, 1.0, internalProgress);

  const masterOpacity = Math.min(
    smoothstep(0.0, 0.08, internalProgress),
    fadeOut
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-8 font-sans"
      style={{
        opacity: masterOpacity,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Company name — "zoomed in" */}
      <motion.h2
        className="font-serif font-semibold tracking-tight text-center"
        style={{
          fontSize: lerp(18, 48, smoothstep(0.0, 0.12, internalProgress)),
          color: company.color,
          opacity: sceneIn,
          marginBottom: 4,
        }}
      >
        {company.name}
      </motion.h2>

      <motion.p
        className="text-center tracking-wide uppercase"
        style={{
          fontSize: 12,
          color: "var(--text-dim, #8A8478)",
          opacity: sceneIn,
          letterSpacing: "0.15em",
          marginBottom: 32,
        }}
      >
        {company.period}
      </motion.p>

      {/* Scene */}
      <motion.p
        className="text-center leading-relaxed"
        style={{
          fontSize: 16,
          color: "var(--cream-muted, #B0A890)",
          opacity: sceneIn,
          transform: `translateY(${lerp(20, 0, sceneIn)}px)`,
          marginBottom: 36,
          maxWidth: 580,
        }}
      >
        {company.scene}
      </motion.p>

      {/* Actions list */}
      <div style={{ opacity: actionsIn, marginBottom: 36, width: "100%" }}>
        <ul className="space-y-3" style={{ maxWidth: 540, margin: "0 auto" }}>
          {company.actions.map((action, ai) => {
            const stagger = clamp(
              (actionsIn - ai * 0.15) / 0.6,
              0,
              1
            );
            return (
              <li
                key={ai}
                className="flex items-start gap-3"
                style={{
                  opacity: stagger,
                  transform: `translateX(${lerp(-16, 0, stagger)}px)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                <span
                  className="mt-[7px] shrink-0 rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: company.color,
                    opacity: 0.7,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--cream, #F0E6D0)",
                    lineHeight: 1.6,
                  }}
                >
                  {action}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Shift */}
      <motion.p
        className="text-center italic leading-relaxed font-serif"
        style={{
          fontSize: 15,
          color: `rgba(${company.rgb.join(",")}, ${lerp(0.4, 0.85, shiftIn)})`,
          opacity: shiftIn,
          transform: `translateY(${lerp(12, 0, shiftIn)}px)`,
          maxWidth: 520,
        }}
      >
        {company.shift}
      </motion.p>
    </motion.div>
  );
}

/* ================================================================== */
/*  Pullback overlay — visible between companies                       */
/* ================================================================== */

function PullbackOverlay({ progress }: { progress: number }) {
  // Show overlay during gaps between companies
  let gapOpacity = 0;

  for (let i = 0; i < COMPANIES.length - 1; i++) {
    const prevEnd = companyRange(i).end;
    const nextStart = companyRange(i + 1).start;
    const mid = (prevEnd + nextStart) / 2;
    const halfGap = (nextStart - prevEnd) / 2;
    const dist = Math.abs(progress - mid);
    if (dist < halfGap) {
      gapOpacity = Math.max(
        gapOpacity,
        1 - smoothstep(0, halfGap, dist)
      );
    }
  }

  // Also show during intro
  const introOpacity = 1 - smoothstep(INTRO * 0.5, INTRO, progress);
  gapOpacity = Math.max(gapOpacity, introOpacity);

  if (gapOpacity < 0.01) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center font-sans pointer-events-none"
      style={{ opacity: gapOpacity }}
    >
      <p
        className="text-center uppercase tracking-[0.3em]"
        style={{
          fontSize: 11,
          color: "var(--text-dim, #8A8478)",
        }}
      >
        {progress < INTRO ? "Scroll to begin" : ""}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Main page                                                           */
/* ================================================================== */

export default function V12ZoomingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
  });

  // Find active company
  let activeIdx = -1;
  let internalProgress = 0;

  for (let i = 0; i < COMPANIES.length; i++) {
    const r = companyRange(i);
    if (progress >= r.start && progress <= r.end) {
      activeIdx = i;
      internalProgress = clamp(
        (progress - r.start) / (r.end - r.start),
        0,
        1
      );
      break;
    }
  }

  // Zoom scale: 1.0 in gap (pulled back), ~1.05 when zoomed in
  const zoomScale =
    activeIdx >= 0
      ? lerp(1.0, 1.04, smoothstep(0.0, 0.15, internalProgress) * (1 - smoothstep(0.85, 1.0, internalProgress)))
      : 1.0;

  // Background tint from active company
  const bgTint =
    activeIdx >= 0
      ? `rgba(${COMPANIES[activeIdx].rgb.join(",")}, ${lerp(0, 0.04, smoothstep(0.05, 0.2, internalProgress) * (1 - smoothstep(0.8, 1.0, internalProgress)))})`
      : "transparent";

  return (
    <>
      <ForgeNav />

      {/* 900vh scroll container */}
      <div
        ref={containerRef}
        style={{
          height: "900vh",
          position: "relative",
          background: "var(--bg, #07070A)",
        }}
      >
        {/* Timeline bar — fixed */}
        <TimelineBar progress={progress} />

        {/* Sticky viewport for content */}
        <div
          className="sticky top-0 flex items-center justify-center overflow-hidden"
          style={{
            height: "100vh",
            paddingTop: 88,
          }}
        >
          {/* Background tint layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: bgTint,
              transition: "background 0.5s ease",
            }}
          />

          {/* Zoom container */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomScale})`,
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <PullbackOverlay progress={progress} />

            <AnimatePresence mode="wait">
              {activeIdx >= 0 && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex items-center justify-center"
                >
                  <CompanyContent
                    company={COMPANIES[activeIdx]}
                    internalProgress={internalProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
