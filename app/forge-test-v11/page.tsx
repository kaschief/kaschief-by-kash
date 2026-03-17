"use client";

import { useRef, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const COMPANIES = [
  {
    name: "AMBOSS",
    period: "Berlin, 2018\u20132019",
    color: "#60A5FA",
    scene:
      "Half a million medical students. An app that was supposed to help them pass exams. I came from the ward \u2014 I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
    action:
      "Migrated from vanilla JS to React. Introduced A/B testing. Broke production once \u2014 learned testing discipline. Brought nursing instinct to every user flow.",
    shift:
      "The gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail.",
    insight: "The user is never an abstraction.",
  },
  {
    name: "Compado",
    period: "Berlin, 2019\u20132021",
    color: "#42B883",
    scene:
      "Sites were replicas \u2014 same structure, different brands. Every change meant touching six copies. Visitors arrived from search with zero loyalty.",
    action:
      "Rebuilt as swappable components. Attacked load times: Lighthouse, CSS compression, lazy loading. Built first chatbot interface.",
    shift:
      "Every millisecond is a user who stays or leaves. Performance is a product decision.",
    insight:
      "Load time is a user\u2019s first impression of whether you respect their time.",
  },
  {
    name: "CAPinside",
    period: "Hamburg, 2021",
    color: "#3178C6",
    scene:
      "Ten thousand financial advisors on a fragile platform. Nobody reviewed code. Tests were sparse. TypeScript was new to me.",
    action:
      "Learned to work across systems. Started seeing the codebase as a record of team communication.",
    shift:
      "You can\u2019t fix code without fixing process. I started diagnosing teams through their codebase.",
    insight: "A codebase is a record of a team\u2019s habits.",
  },
  {
    name: "DKB",
    period: "Berlin, 2021\u20132024",
    color: "#F472B6",
    scene:
      "Germany\u2019s largest direct bank. Five million users. Legacy to React/TypeScript. Monthly releases. Zero automated tests.",
    action:
      "Introduced Playwright. Monthly to weekly releases. Feature flags. Shared design system. Found myself in the product room.",
    shift:
      "Production bugs dropped 30%. Then they promoted me to engineering manager.",
    insight:
      "The highest-leverage thing an engineer can do is make the right decision obvious.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const TOTAL_HEIGHT = 800; // vh
const COMPANY_VH = 150; // vh per company content
const BREATH_VH = 50; // vh per breath between companies
const INTRO_VH = TOTAL_HEIGHT - COMPANIES.length * COMPANY_VH - (COMPANIES.length - 1) * BREATH_VH; // remaining for intro/outro

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function V11SplitScreenEditorial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftNameRef = useRef<HTMLDivElement>(null);
  const leftPeriodRef = useRef<HTMLDivElement>(null);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const leftBarFillRef = useRef<HTMLDivElement>(null);
  const leftInsightRef = useRef<HTMLDivElement>(null);

  // Right-side paragraph refs (scene, action, shift per company)
  const sceneRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const actionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const shiftRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  // Breath refs
  const breathRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const setSceneRef = useCallback(
    (idx: number) => (el: HTMLParagraphElement | null) => {
      sceneRefs.current[idx] = el;
    },
    [],
  );
  const setActionRef = useCallback(
    (idx: number) => (el: HTMLParagraphElement | null) => {
      actionRefs.current[idx] = el;
    },
    [],
  );
  const setShiftRef = useCallback(
    (idx: number) => (el: HTMLParagraphElement | null) => {
      shiftRefs.current[idx] = el;
    },
    [],
  );
  const setBreathRef = useCallback(
    (idx: number) => (el: HTMLDivElement | null) => {
      breathRefs.current[idx] = el;
    },
    [],
  );

  /* Scroll-driven update */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Map scroll progress to virtual position in vh
    const pos = v * TOTAL_HEIGHT;

    // Calculate which company / breath we're in
    const introEnd = INTRO_VH * 0.5;
    const contentStart = introEnd;

    // Determine active company index and local progress
    let activeIdx = -1;
    let localProgress = 0;
    let inBreath = false;
    let breathIdx = -1;
    let breathProgress = 0;

    for (let i = 0; i < COMPANIES.length; i++) {
      const companyStart = contentStart + i * (COMPANY_VH + BREATH_VH);
      const companyEnd = companyStart + COMPANY_VH;
      const breathStart = companyEnd;
      const breathEnd = breathStart + BREATH_VH;

      if (pos >= companyStart && pos < companyEnd) {
        activeIdx = i;
        localProgress = (pos - companyStart) / COMPANY_VH;
        break;
      }
      if (i < COMPANIES.length - 1 && pos >= breathStart && pos < breathEnd) {
        inBreath = true;
        breathIdx = i;
        breathProgress = (pos - breathStart) / BREATH_VH;
        activeIdx = i; // still show current company fading out
        localProgress = 1;
        break;
      }
    }

    // If past all companies
    if (activeIdx === -1 && !inBreath) {
      const lastStart =
        contentStart + (COMPANIES.length - 1) * (COMPANY_VH + BREATH_VH);
      if (pos >= lastStart) {
        activeIdx = COMPANIES.length - 1;
        localProgress = Math.min(1, (pos - lastStart) / COMPANY_VH);
      }
    }

    const company = activeIdx >= 0 ? COMPANIES[activeIdx] : null;

    /* ---- Left panel updates ---- */
    if (leftNameRef.current) {
      if (company && !inBreath) {
        leftNameRef.current.textContent = company.name;
        leftNameRef.current.style.opacity = String(
          smoothstep(0, 0.08, localProgress) *
            (1 - smoothstep(0.92, 1, localProgress)),
        );
        leftNameRef.current.style.color = company.color;
      } else if (inBreath && company) {
        leftNameRef.current.style.opacity = String(1 - smoothstep(0, 0.4, breathProgress));
      } else {
        leftNameRef.current.style.opacity = "0";
      }
    }

    if (leftPeriodRef.current) {
      if (company && !inBreath) {
        leftPeriodRef.current.textContent = company.period;
        leftPeriodRef.current.style.opacity = String(
          smoothstep(0.02, 0.1, localProgress) *
            (1 - smoothstep(0.9, 1, localProgress)),
        );
      } else if (inBreath) {
        leftPeriodRef.current.style.opacity = String(1 - smoothstep(0, 0.3, breathProgress));
      } else {
        leftPeriodRef.current.style.opacity = "0";
      }
    }

    /* Vertical gradient bar */
    if (leftBarRef.current && leftBarFillRef.current) {
      if (company && !inBreath) {
        leftBarRef.current.style.opacity = String(smoothstep(0.05, 0.15, localProgress));
        leftBarFillRef.current.style.height = `${localProgress * 100}%`;
        leftBarFillRef.current.style.background = `linear-gradient(to bottom, ${company.color}, ${company.color}88)`;
      } else if (inBreath) {
        leftBarRef.current.style.opacity = String(1 - smoothstep(0, 0.5, breathProgress));
      } else {
        leftBarRef.current.style.opacity = "0";
        leftBarFillRef.current.style.height = "0%";
      }
    }

    /* Left insight */
    if (leftInsightRef.current) {
      if (company && !inBreath) {
        leftInsightRef.current.textContent = `\u201C${company.insight}\u201D`;
        const insightOpacity = smoothstep(0.6, 0.75, localProgress) *
          (1 - smoothstep(0.92, 1, localProgress));
        leftInsightRef.current.style.opacity = String(insightOpacity);
        leftInsightRef.current.style.color = company.color;
      } else if (inBreath) {
        leftInsightRef.current.style.opacity = String(1 - smoothstep(0, 0.3, breathProgress));
      } else {
        leftInsightRef.current.style.opacity = "0";
      }
    }

    /* ---- Right panel paragraph fade-ins ---- */
    for (let i = 0; i < COMPANIES.length; i++) {
      const isActive = i === activeIdx && !inBreath;
      const sceneEl = sceneRefs.current[i];
      const actionEl = actionRefs.current[i];
      const shiftEl = shiftRefs.current[i];

      if (sceneEl) {
        if (isActive) {
          sceneEl.style.opacity = String(smoothstep(0.0, 0.15, localProgress));
          sceneEl.style.transform = `translateY(${lerp(30, 0, smoothstep(0.0, 0.15, localProgress))}px)`;
        } else {
          sceneEl.style.opacity = "0";
          sceneEl.style.transform = "translateY(30px)";
        }
      }
      if (actionEl) {
        if (isActive) {
          actionEl.style.opacity = String(smoothstep(0.2, 0.4, localProgress));
          actionEl.style.transform = `translateY(${lerp(30, 0, smoothstep(0.2, 0.4, localProgress))}px)`;
        } else {
          actionEl.style.opacity = "0";
          actionEl.style.transform = "translateY(30px)";
        }
      }
      if (shiftEl) {
        if (isActive) {
          shiftEl.style.opacity = String(smoothstep(0.45, 0.65, localProgress));
          shiftEl.style.transform = `translateY(${lerp(30, 0, smoothstep(0.45, 0.65, localProgress))}px)`;
        } else {
          shiftEl.style.opacity = "0";
          shiftEl.style.transform = "translateY(30px)";
        }
      }
    }

    /* ---- Breath moments ---- */
    for (let i = 0; i < COMPANIES.length - 1; i++) {
      const el = breathRefs.current[i];
      if (!el) continue;
      if (inBreath && breathIdx === i) {
        const fadeIn = smoothstep(0.1, 0.4, breathProgress);
        const fadeOut = 1 - smoothstep(0.7, 0.95, breathProgress);
        el.style.opacity = String(fadeIn * fadeOut);
        el.style.transform = `translateY(${lerp(20, 0, fadeIn)}px)`;
      } else {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      }
    }
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        height: `${TOTAL_HEIGHT}vh`,
        background: "var(--bg, #07070A)",
      }}
    >
      <ForgeNav />

      {/* ============================================================= */}
      {/*  Sticky viewport                                               */}
      {/* ============================================================= */}
      <div
        className="sticky top-0 left-0 w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* ---- Left panel (35%) ---- */}
        <div
          className="absolute top-0 left-0 flex flex-col justify-center"
          style={{
            width: "35%",
            height: "100%",
            paddingLeft: "clamp(2rem, 5vw, 6rem)",
            paddingRight: "2rem",
            borderRight: "1px solid var(--stroke, #16161E)",
          }}
        >
          {/* Vertical bar */}
          <div
            ref={leftBarRef}
            className="absolute"
            style={{
              top: "15%",
              bottom: "15%",
              right: "2rem",
              width: "2px",
              background: "var(--stroke, #16161E)",
              opacity: 0,
            }}
          >
            <div
              ref={leftBarFillRef}
              style={{
                width: "100%",
                height: "0%",
                borderRadius: "1px",
                transition: "background 0.6s ease",
              }}
            />
          </div>

          {/* Company name */}
          <div
            ref={leftNameRef}
            className="font-sans"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              opacity: 0,
              transition: "color 0.5s ease",
              marginBottom: "0.75rem",
            }}
          />

          {/* Period */}
          <div
            ref={leftPeriodRef}
            className="font-sans"
            style={{
              fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
              fontWeight: 400,
              color: "var(--text-dim, #8A8478)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              opacity: 0,
            }}
          />

          {/* Insight quote */}
          <div
            ref={leftInsightRef}
            className="font-serif"
            style={{
              fontSize: "clamp(0.9rem, 1.3vw, 1.15rem)",
              fontStyle: "italic",
              lineHeight: 1.6,
              marginTop: "3rem",
              opacity: 0,
              maxWidth: "22ch",
              transition: "color 0.5s ease",
            }}
          />
        </div>

        {/* ---- Right panel (65%) ---- */}
        <div
          className="absolute top-0 right-0 flex flex-col justify-center"
          style={{
            width: "65%",
            height: "100%",
            paddingLeft: "clamp(2rem, 4vw, 5rem)",
            paddingRight: "clamp(2rem, 6vw, 8rem)",
          }}
        >
          {/* Company content blocks — stacked, absolutely positioned so they overlap */}
          {COMPANIES.map((company, idx) => (
            <div
              key={company.name}
              className="absolute"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingLeft: "clamp(2rem, 4vw, 5rem)",
                paddingRight: "clamp(2rem, 6vw, 8rem)",
                pointerEvents: "none",
              }}
            >
              <p
                ref={setSceneRef(idx)}
                className="font-serif"
                style={{
                  fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
                  lineHeight: 1.7,
                  color: "var(--cream, #F0E6D0)",
                  opacity: 0,
                  marginBottom: "2.5rem",
                  maxWidth: "52ch",
                }}
              >
                {company.scene}
              </p>

              <p
                ref={setActionRef(idx)}
                className="font-sans"
                style={{
                  fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
                  lineHeight: 1.75,
                  color: "var(--cream-muted, #B0A890)",
                  opacity: 0,
                  marginBottom: "2.5rem",
                  maxWidth: "52ch",
                }}
              >
                {company.action}
              </p>

              <p
                ref={setShiftRef(idx)}
                className="font-serif"
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  color: company.color,
                  opacity: 0,
                  maxWidth: "44ch",
                }}
              >
                {company.shift}
              </p>
            </div>
          ))}

        </div>

        {/* ---- Breath moments (full-width overlay) ---- */}
        {COMPANIES.slice(0, -1).map((company, idx) => (
          <div
            key={`breath-${idx}`}
            ref={setBreathRef(idx)}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0,
              pointerEvents: "none",
              zIndex: 10,
              background: "var(--bg, #07070A)",
            }}
          >
            <p
              className="font-serif text-center"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "var(--cream, #F0E6D0)",
                maxWidth: "30ch",
              }}
            >
              {company.insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
