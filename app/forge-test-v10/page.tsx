"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ── Data ───────────────────────────────────────────────────────────── */

const COMPANIES = [
  {
    name: "AMBOSS",
    period: "Berlin, 2018–2019",
    color: "#60A5FA",
    scene:
      "Half a million medical students. An app that was supposed to help them pass exams. I came from the ward — I knew what it felt like when the system you depend on doesn't understand your context.",
    action:
      "Migrated from vanilla JS to React. Introduced A/B testing. Broke production once — learned testing discipline. Brought nursing instinct to every user flow.",
    shift:
      "The gap between 'works technically' and 'works for the person' is where most products fail.",
    metric: "500K",
    metricLabel: "students",
    insight: "The user is never an abstraction.",
  },
  {
    name: "Compado",
    period: "Berlin, 2019–2021",
    color: "#42B883",
    scene:
      "Sites were replicas — same structure, different brands. Every change meant touching six copies. Visitors arrived from search with zero loyalty.",
    action:
      "Rebuilt as swappable components. Attacked load times: Lighthouse, CSS compression, lazy loading. Built first chatbot interface.",
    shift:
      "Every millisecond is a user who stays or leaves. Performance is a product decision.",
    metric: "50%",
    metricLabel: "faster loads",
    insight:
      "Load time is a user's first impression of whether you respect their time.",
  },
  {
    name: "CAPinside",
    period: "Hamburg, 2021",
    color: "#3178C6",
    scene:
      "Ten thousand financial advisors on a fragile platform. Nobody reviewed code. Tests were sparse. TypeScript was new to me.",
    action:
      "Learned to work across systems. Started seeing the codebase as a record of team communication. Every shortcut was a frozen habit.",
    shift:
      "You can't fix code without fixing process. I started diagnosing teams through their codebase.",
    metric: "10K",
    metricLabel: "advisors",
    insight: "A codebase is a record of a team's habits.",
  },
  {
    name: "DKB",
    period: "Berlin, 2021–2024",
    color: "#F472B6",
    scene:
      "Germany's largest direct bank. Five million users. Legacy to React/TypeScript. Monthly releases. Zero automated tests.",
    action:
      "Introduced Playwright. Monthly to weekly releases. Feature flags. Shared design system. Found myself in the product room shaping what got built.",
    shift:
      "Production bugs dropped 30%. I wasn't just building features — I was shaping how the team worked. Then they promoted me.",
    metric: "5M",
    metricLabel: "users",
    insight:
      "The highest-leverage thing an engineer can do is make the right decision obvious.",
  },
];

/* ── Math helpers ────────────────────────────────────────────────────── */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ── Hex → RGB ──────────────────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function V10LayeredReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  /* Per-chapter refs */
  const bgRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const update = useCallback((progress: number) => {
    /* Determine active chapter and local progress within it */
    const rawIdx = progress * COMPANIES.length;
    const idx = Math.min(Math.floor(rawIdx), COMPANIES.length - 1);
    const local = rawIdx - idx; // 0 → 1 within chapter

    const company = COMPANIES[idx];
    if (!company) return;

    /* ── Background color shift ─────────────────────────── */
    const bgEl = bgRef.current;
    if (bgEl) {
      const [r, g, b] = hexToRgb(company.color);
      // Fade accent in during 0.1–0.3 of local, fade out at 0.85–1
      const fadeIn = smoothstep(0.05, 0.2, local);
      const fadeOut = 1 - smoothstep(0.8, 0.95, local);
      const alpha = fadeIn * fadeOut * 0.07;
      bgEl.style.background = `radial-gradient(ellipse 80% 60% at 50% 45%, rgba(${r},${g},${b},${alpha}) 0%, var(--bg, #07070A) 100%)`;
    }

    /* ── Per-chapter elements ───────────────────────────── */
    COMPANIES.forEach((_co, i) => {
      const el = chapterRefs.current[i];
      if (!el) return;

      const isActive = i === idx;
      const watermark = el.querySelector<HTMLElement>("[data-watermark]");
      const period = el.querySelector<HTMLElement>("[data-period]");
      const scene = el.querySelector<HTMLElement>("[data-scene]");
      const metric = el.querySelector<HTMLElement>("[data-metric]");
      const metricLabel = el.querySelector<HTMLElement>("[data-metric-label]");
      const action = el.querySelector<HTMLElement>("[data-action]");
      const shift = el.querySelector<HTMLElement>("[data-shift]");
      const insight = el.querySelector<HTMLElement>("[data-insight]");

      if (!isActive) {
        /* Hide inactive chapters */
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        return;
      }

      el.style.opacity = "1";
      el.style.pointerEvents = "auto";

      /* ── Watermark (always visible when active, subtle drift) ── */
      if (watermark) {
        const drift = lerp(-2, 2, local);
        watermark.style.opacity = String(lerp(0.04, 0.09, smoothstep(0, 0.15, local)) * (1 - smoothstep(0.88, 1, local)));
        watermark.style.transform = `translate(-50%, -50%) translateY(${drift}%)`;
      }

      /* ── Period label ── */
      if (period) {
        const a = smoothstep(0.02, 0.12, local) * (1 - smoothstep(0.85, 0.95, local));
        period.style.opacity = String(a);
        period.style.transform = `translateY(${lerp(10, 0, smoothstep(0.02, 0.12, local))}px)`;
      }

      /* ── Scene (left) — fades up early ── */
      if (scene) {
        const a = smoothstep(0.06, 0.22, local) * (1 - smoothstep(0.78, 0.9, local));
        scene.style.opacity = String(a);
        scene.style.transform = `translateY(${lerp(30, 0, smoothstep(0.06, 0.22, local))}px)`;
      }

      /* ── Metric (center) — scales up ── */
      if (metric) {
        const a = smoothstep(0.12, 0.28, local) * (1 - smoothstep(0.82, 0.92, local));
        const scale = lerp(0.85, 1, smoothstep(0.12, 0.28, local));
        metric.style.opacity = String(a);
        metric.style.transform = `scale(${scale})`;
      }
      if (metricLabel) {
        const a = smoothstep(0.18, 0.32, local) * (1 - smoothstep(0.8, 0.9, local));
        metricLabel.style.opacity = String(a);
        metricLabel.style.transform = `translateY(${lerp(12, 0, smoothstep(0.18, 0.32, local))}px)`;
      }

      /* ── Action (right) — fades up mid ── */
      if (action) {
        const a = smoothstep(0.28, 0.44, local) * (1 - smoothstep(0.78, 0.9, local));
        action.style.opacity = String(a);
        action.style.transform = `translateY(${lerp(24, 0, smoothstep(0.28, 0.44, local))}px)`;
      }

      /* ── Shift (right, below action) — fades up later ── */
      if (shift) {
        const a = smoothstep(0.4, 0.55, local) * (1 - smoothstep(0.78, 0.9, local));
        shift.style.opacity = String(a);
        shift.style.transform = `translateY(${lerp(20, 0, smoothstep(0.4, 0.55, local))}px)`;
      }

      /* ── Insight (centered serif line at chapter end) ── */
      if (insight) {
        const a = smoothstep(0.68, 0.82, local) * (1 - smoothstep(0.92, 1, local));
        insight.style.opacity = String(a);
        insight.style.transform = `translateY(${lerp(16, 0, smoothstep(0.68, 0.82, local))}px) scale(${lerp(0.97, 1, smoothstep(0.68, 0.82, local))})`;
      }
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", update);

  /* Initial paint */
  useEffect(() => {
    update(0);
  }, [update]);

  return (
    <>
      <ForgeNav />

      {/* Scroll container */}
      <div ref={containerRef} style={{ height: "800vh", position: "relative" }}>
        {/* Sticky viewport */}
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ background: "var(--bg, #07070A)" }}
        >
          {/* Animated background layer */}
          <div
            ref={bgRef}
            className="absolute inset-0 transition-none"
            style={{ background: "var(--bg, #07070A)" }}
          />

          {/* Chapters */}
          {COMPANIES.map((co, i) => (
            <div
              key={co.name}
              ref={(el) => { chapterRefs.current[i] = el; }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              {/* Watermark — huge company name */}
              <div
                data-watermark
                className="absolute font-sans select-none pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "clamp(6rem, 14vw, 16rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: co.color,
                  opacity: 0,
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                {co.name}
              </div>

              {/* Content grid — three columns */}
              <div
                className="relative z-10 grid w-full max-w-7xl mx-auto px-8 gap-8"
                style={{
                  gridTemplateColumns: "1fr 1.2fr 1fr",
                  gridTemplateRows: "auto 1fr auto",
                  height: "70vh",
                  alignContent: "center",
                }}
              >
                {/* Period — top center, spanning all cols */}
                <div
                  data-period
                  className="col-span-3 text-center font-sans"
                  style={{
                    opacity: 0,
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--text-dim, #8A8478)",
                  }}
                >
                  {co.period}
                </div>

                {/* Left column — scene */}
                <div className="flex flex-col justify-center pr-4">
                  <p
                    data-scene
                    className="font-sans leading-relaxed"
                    style={{
                      opacity: 0,
                      fontSize: "0.95rem",
                      color: "var(--cream-muted, #B0A890)",
                      lineHeight: 1.75,
                    }}
                  >
                    {co.scene}
                  </p>
                </div>

                {/* Center column — metric */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    data-metric
                    className="font-sans"
                    style={{
                      opacity: 0,
                      fontSize: "clamp(5rem, 10vw, 10rem)",
                      fontWeight: 800,
                      lineHeight: 1,
                      color: co.color,
                      filter: `drop-shadow(0 0 60px ${co.color}33)`,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {co.metric}
                  </div>
                  <div
                    data-metric-label
                    className="font-sans"
                    style={{
                      opacity: 0,
                      fontSize: "1rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--cream-muted, #B0A890)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {co.metricLabel}
                  </div>
                </div>

                {/* Right column — action + shift */}
                <div className="flex flex-col justify-center gap-6 pl-4">
                  <p
                    data-action
                    className="font-sans leading-relaxed"
                    style={{
                      opacity: 0,
                      fontSize: "0.95rem",
                      color: "var(--cream, #F0E6D0)",
                      lineHeight: 1.75,
                    }}
                  >
                    {co.action}
                  </p>
                  <p
                    data-shift
                    className="font-serif italic leading-relaxed"
                    style={{
                      opacity: 0,
                      fontSize: "0.9rem",
                      color: "var(--text-dim, #8A8478)",
                      lineHeight: 1.7,
                      borderLeft: `2px solid ${co.color}44`,
                      paddingLeft: "1rem",
                    }}
                  >
                    {co.shift}
                  </p>
                </div>

                {/* Insight — bottom center, spanning all cols */}
                <div className="col-span-3 flex justify-center">
                  <p
                    data-insight
                    className="font-serif text-center"
                    style={{
                      opacity: 0,
                      fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                      color: "var(--cream, #F0E6D0)",
                      maxWidth: "36rem",
                      lineHeight: 1.6,
                      letterSpacing: "0.01em",
                    }}
                  >
                    &ldquo;{co.insight}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Scroll hint at very top */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-sans"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--text-dim, #8A8478)",
              opacity: 0.5,
            }}
          >
            Scroll to begin
          </div>
        </div>
      </div>
    </>
  );
}
