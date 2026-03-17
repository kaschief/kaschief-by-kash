"use client";

import { useRef, useState, useMemo } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function srand(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

/* ================================================================== */
/*  Data                                                               */
/* ================================================================== */

interface CompanyData {
  name: string;
  period: string;
  color: string;
  colorRgb: [number, number, number];
  scene: string;
  actions: string[];
  shift: string;
  principle: string;
}

const COMPANIES: CompanyData[] = [
  {
    name: "AMBOSS",
    period: "Berlin, 2018 \u2014 2019",
    color: "#60A5FA",
    colorRgb: [96, 165, 250],
    scene:
      "Half a million medical students. An app that was supposed to help them pass their exams. I came from the ward \u2014 I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
    actions: [
      "Migrated vanilla JS to React",
      "Introduced A/B testing to stop guessing",
      "Broke production once \u2014 learned testing discipline",
      "Brought clinical instinct to product flows",
    ],
    shift:
      "I learned that the gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail. And I was one of the only engineers who could see that gap.",
    principle:
      "The user is never an abstraction. The moment you treat them like one, the product starts lying to people.",
  },
  {
    name: "Compado",
    period: "Berlin, 2019 \u2014 2021",
    color: "#42B883",
    colorRgb: [66, 184, 131],
    scene:
      "The sites were replicas of each other \u2014 same structure, different brands, different audiences. Every change meant touching six copies. Visitors arrived from search with zero loyalty and no patience.",
    actions: [
      "Rebuilt architecture for shared components across brands",
      "Lighthouse audits, CSS compression, lazy loading",
      "Built a conversational chatbot interface",
      "Attacked load times to improve conversion",
    ],
    shift:
      "I discovered that every millisecond is a user who stays or leaves. Performance isn\u2019t a technical achievement \u2014 it\u2019s a product decision.",
    principle:
      "Load time is not a metric. It is a user\u2019s first impression of whether you respect their time.",
  },
  {
    name: "CAPinside",
    period: "Hamburg, 2021",
    color: "#3178C6",
    colorRgb: [49, 120, 198],
    scene:
      "Ten thousand financial advisors depending on a platform that had grown fragile. Nobody reviewed code \u2014 the process existed on paper but nobody prioritised it. Tests were sparse.",
    actions: [
      "Worked across React, Ruby, and PHP systems",
      "Diagnosed team habits through the codebase",
      "Championed code review as a cultural practice",
      "Introduced TypeScript incrementally",
    ],
    shift:
      "I realised you can\u2019t fix code without fixing process. This was my first time diagnosing a team through its codebase \u2014 reading the organisation through the code.",
    principle:
      "A codebase is a record of a team\u2019s habits. If you want to change the code, you have to change how the team works.",
  },
  {
    name: "DKB Code Factory",
    period: "Berlin, 2021 \u2014 2024",
    color: "#F472B6",
    colorRgb: [244, 114, 182],
    scene:
      "Germany\u2019s largest direct bank. Five million users. A banking app moving from legacy to React and TypeScript. Monthly releases. Security, stability, regulations at every turn. Zero automated tests.",
    actions: [
      "Introduced Playwright end-to-end testing",
      "Moved releases from monthly to weekly",
      "Feature flags for deployment-free toggles",
      "Shaped product decisions from the engineering side",
    ],
    shift:
      "Production bugs dropped 30%. But the real shift was personal: I wasn\u2019t just building features anymore. I was shaping how the team worked, what we shipped, and why.",
    principle:
      "At a certain scale, the highest-leverage thing an engineer can do is make the right decision obvious.",
  },
];

const NUM_COMPANIES = COMPANIES.length;
const VH_PER_COMPANY = 300;
const TOTAL_VH = VH_PER_COMPANY * NUM_COMPANIES;

/* ================================================================== */
/*  Constellation dots                                                 */
/* ================================================================== */

interface DotData {
  x: number;
  y: number;
  size: number;
  parallaxRate: number;
  opacity: number;
}

function generateDots(companyIdx: number): DotData[] {
  return Array.from({ length: 15 }, (_, i) => {
    const seed = companyIdx * 100 + i;
    return {
      x: srand(seed * 7.3) * 100,
      y: srand(seed * 11.1) * 100,
      size: srand(seed * 3.7) * 3 + 1,
      parallaxRate: srand(seed * 5.9) * 0.6 + 0.2,
      opacity: srand(seed * 9.1) * 0.25 + 0.08,
    };
  });
}

/* ================================================================== */
/*  Company Section                                                    */
/* ================================================================== */

function CompanySection({
  company,
  companyIdx,
  globalProgress,
}: {
  company: CompanyData;
  companyIdx: number;
  globalProgress: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dots = useMemo(() => generateDots(companyIdx), [companyIdx]);

  // Local progress within this company section: 0..1
  const sectionStart = companyIdx / NUM_COMPANIES;
  const sectionEnd = (companyIdx + 1) / NUM_COMPANIES;
  const local = clamp(
    (globalProgress - sectionStart) / (sectionEnd - sectionStart),
    0,
    1
  );

  // Phase breakpoints within local 0..1
  const sceneIn = smoothstep(0.0, 0.08, local);
  const sceneOut = 1 - smoothstep(0.28, 0.36, local);
  const sceneOpacity = Math.min(sceneIn, sceneOut);

  const actionIn = smoothstep(0.22, 0.30, local);
  const actionOut = 1 - smoothstep(0.52, 0.60, local);
  const actionOpacity = Math.min(actionIn, actionOut);

  const shiftIn = smoothstep(0.48, 0.56, local);
  const shiftOut = 1 - smoothstep(0.72, 0.80, local);
  const shiftOpacity = Math.min(shiftIn, shiftOut);

  const principleProgress = smoothstep(0.78, 0.92, local);
  const principleBlur = lerp(8, 0, principleProgress);
  const principleOpacity = principleProgress;

  // Header always visible while in section
  const headerOpacity = smoothstep(0.0, 0.04, local) * (1 - smoothstep(0.96, 1.0, local));

  const rgbStr = company.colorRgb.join(",");

  return (
    <div
      ref={sectionRef}
      style={{ height: `${VH_PER_COMPANY}vh`, position: "relative" }}
    >
      {/* Sticky viewport */}
      <div
        className="sticky top-0 flex items-center justify-center overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Constellation dots */}
        {dots.map((dot, i) => {
          const yShift = local * dot.parallaxRate * -200;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                background: `rgba(${rgbStr},${dot.opacity})`,
                transform: `translateY(${yShift}px)`,
                transition: "transform 0.05s linear",
              }}
            />
          );
        })}

        {/* Company header pinned at top */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-16 pb-4"
          style={{ opacity: headerOpacity }}
        >
          <h2
            className="font-serif text-2xl tracking-wide"
            style={{ color: company.color }}
          >
            {company.name}
          </h2>
          <span
            className="font-sans text-sm tracking-widest uppercase"
            style={{ color: `rgba(${rgbStr},0.5)` }}
          >
            {company.period}
          </span>
        </div>

        {/* Content area */}
        <div className="relative z-10 max-w-2xl px-8">
          {/* Scene */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{
              opacity: sceneOpacity,
              transform: `translateY(${lerp(40, -40, smoothstep(0.0, 0.36, local))}px)`,
            }}
          >
            <p
              className="font-serif text-xl leading-relaxed text-center"
              style={{ color: "var(--cream, #F0E6D0)" }}
            >
              {company.scene}
            </p>
          </div>

          {/* Actions */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{
              opacity: actionOpacity,
              transform: `translateY(${lerp(60, -30, smoothstep(0.22, 0.60, local))}px)`,
            }}
          >
            <ul className="space-y-3">
              {company.actions.map((action, i) => (
                <li
                  key={i}
                  className="font-sans text-base"
                  style={{
                    color: "var(--cream-muted, #B0A890)",
                    opacity: smoothstep(
                      0.22 + i * 0.04,
                      0.28 + i * 0.04,
                      local
                    ),
                    transform: `translateY(${lerp(20, 0, smoothstep(0.22 + i * 0.04, 0.30 + i * 0.04, local))}px)`,
                  }}
                >
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Shift */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{
              opacity: shiftOpacity,
              transform: `translateY(${lerp(80, -20, smoothstep(0.48, 0.80, local))}px)`,
            }}
          >
            <p
              className="font-serif italic text-2xl leading-relaxed text-center"
              style={{ color: "var(--cream, #F0E6D0)" }}
            >
              {company.shift}
            </p>
          </div>

          {/* Principle crystallize */}
          <div
            className="absolute inset-0 flex items-center justify-center px-12"
            style={{
              opacity: principleOpacity,
              filter: `blur(${principleBlur}px)`,
            }}
          >
            <blockquote
              className="font-serif text-2xl leading-relaxed text-center"
              style={{
                color: company.color,
                borderLeft: `3px solid rgba(${rgbStr},0.3)`,
                paddingLeft: "1.5rem",
              }}
            >
              {company.principle}
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Mini-timeline                                                      */
/* ================================================================== */

function MiniTimeline({ progress }: { progress: number }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex font-sans"
      style={{
        zIndex: 9999,
        height: 3,
        background: "rgba(7,7,10,0.6)",
      }}
    >
      {COMPANIES.map((company, i) => {
        const segStart = i / NUM_COMPANIES;
        const segEnd = (i + 1) / NUM_COMPANIES;
        const fill = clamp((progress - segStart) / (segEnd - segStart), 0, 1);
        const isActive = progress >= segStart && progress < segEnd;

        return (
          <div
            key={i}
            className="relative flex-1"
            style={{
              borderRight:
                i < NUM_COMPANIES - 1
                  ? "1px solid rgba(255,255,255,0.06)"
                  : undefined,
            }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${fill * 100}%`,
                background: isActive
                  ? company.color
                  : `rgba(${company.colorRgb.join(",")},0.4)`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Mini-timeline labels (above the bar)                               */
/* ================================================================== */

function MiniTimelineLabels({ progress }: { progress: number }) {
  return (
    <div
      className="fixed bottom-1 left-0 right-0 flex font-sans pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {COMPANIES.map((company, i) => {
        const segStart = i / NUM_COMPANIES;
        const segEnd = (i + 1) / NUM_COMPANIES;
        const isActive = progress >= segStart && progress < segEnd;

        return (
          <div
            key={i}
            className="flex-1 text-center"
            style={{
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: isActive
                ? company.color
                : "var(--text-faint, #4A4640)",
              opacity: isActive ? 1 : 0.6,
              transition: "color 0.3s, opacity 0.3s",
              paddingBottom: 6,
            }}
          >
            {company.name}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function ForgeV14Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
  });

  return (
    <div
      style={{
        background: "var(--bg, #07070A)",
        color: "var(--cream, #F0E6D0)",
        minHeight: "100vh",
      }}
    >
      <ForgeNav />

      {/* Hero */}
      <section className="flex items-center justify-center" style={{ height: "100vh" }}>
        <div className="text-center px-8">
          <h1
            className="font-serif text-5xl mb-4 tracking-tight"
            style={{ color: "var(--cream, #F0E6D0)" }}
          >
            V14: Parallax Pinned Scenes
          </h1>
          <p
            className="font-sans text-sm tracking-widest uppercase"
            style={{ color: "var(--text-dim, #8A8478)" }}
          >
            Scroll to begin
          </p>
        </div>
      </section>

      {/* Scroll container */}
      <div ref={containerRef} style={{ height: `${TOTAL_VH}vh`, position: "relative" }}>
        {COMPANIES.map((company, i) => (
          <CompanySection
            key={i}
            company={company}
            companyIdx={i}
            globalProgress={progress}
          />
        ))}
      </div>

      {/* Mini-timeline */}
      <MiniTimeline progress={progress} />
      <MiniTimelineLabels progress={progress} />

      {/* Footer */}
      <section
        className="flex items-center justify-center"
        style={{ height: "50vh" }}
      >
        <p
          className="font-serif text-lg"
          style={{ color: "var(--text-dim, #8A8478)" }}
        >
          End of forge.
        </p>
      </section>
    </div>
  );
}
