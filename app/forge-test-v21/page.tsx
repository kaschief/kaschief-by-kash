"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

const ACCENT = "#60A5FA";

const PANELS = [
  {
    id: "p1",
    text: "Half a million med students used this app to pass their boards. I\u2019d been one of them. I knew exactly where the product lost people because I remembered where it lost me.",
    font: "font-serif",
    size: "text-base",
    italic: false,
    from: "left",
    quad: "top-left",
    borderOpacity: 0.6,
  },
  {
    id: "p2",
    text: "The team built from tickets. I built from the feeling of being the user at 3am with an exam in six hours. That difference shaped everything.",
    font: "font-sans",
    size: "text-[0.85rem]",
    italic: false,
    from: "right",
    quad: "top-right",
    borderOpacity: 0.45,
  },
  {
    id: "p3",
    text: "I stopped guessing what users wanted. I pulled session data, set up A/B tests, broke production once at 2am, and started building from evidence.",
    font: "font-sans",
    size: "text-[0.85rem]",
    italic: false,
    from: "left",
    quad: "bottom-left",
    borderOpacity: 0.35,
  },
  {
    id: "p4",
    text: "Your instinct is a hypothesis. Treat it like one.",
    font: "font-narrator",
    size: "text-[0.95rem]",
    italic: true,
    from: "right",
    quad: "bottom-right",
    borderOpacity: 0.55,
  },
] as const;

/* Each panel enters over a 0.15 segment, staggered by 0.18 */
const ENTER_DUR = 0.15;
const STAGGER = 0.18;
const panelStart = (i: number) => 0.08 + i * STAGGER;
const panelEnd = (i: number) => panelStart(i) + ENTER_DUR;
const ALL_VISIBLE = panelEnd(3); // ~0.62

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t) * (1 - t);
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export default function ForgeTestV21() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const crossVRef = useRef<HTMLDivElement>(null);
  const crossHRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    panelRefs.current = panelRefs.current.slice(0, 4);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    /* --- Panels --- */
    for (let i = 0; i < PANELS.length; i++) {
      const el = panelRefs.current[i];
      if (!el) continue;

      const p = PANELS[i];
      const raw = clamp01((v - panelStart(i)) / ENTER_DUR);
      const t = easeOut(raw);

      const offX = p.from === "left" ? -100 : 100;
      const x = lerp(offX, 0, t);
      const opacity = t;

      el.style.transform = `translateX(${x}vw)`;
      el.style.opacity = `${opacity}`;
    }

    /* --- Center title --- */
    if (titleRef.current) {
      const tRaw = clamp01((v - ALL_VISIBLE) / 0.06);
      const tEased = easeOut(tRaw);
      titleRef.current.style.transform = `translate(-50%, -50%) scale(${tEased})`;
      titleRef.current.style.opacity = `${tEased}`;
    }

    /* --- Crosshair --- */
    const crossAlpha = clamp01((v - 0.05) / 0.1) * 0.12;
    if (crossVRef.current) crossVRef.current.style.opacity = `${crossAlpha}`;
    if (crossHRef.current) crossHRef.current.style.opacity = `${crossAlpha}`;

    /* --- Accent border pulse after all visible --- */
    if (v >= ALL_VISIBLE && v < ALL_VISIBLE + 0.12) {
      const cycle = ((v - ALL_VISIBLE) / 0.12) * Math.PI * 2;
      pulseRef.current = 0.15 + Math.sin(cycle) * 0.15;
    } else {
      pulseRef.current = 0;
    }

    for (let i = 0; i < PANELS.length; i++) {
      const el = panelRefs.current[i];
      if (!el) continue;
      const border = el.querySelector<HTMLDivElement>("[data-border]");
      if (!border) continue;
      const base = PANELS[i].borderOpacity;
      const extra = pulseRef.current;
      border.style.opacity = `${clamp01(base + extra)}`;
    }
  });

  return (
    <div ref={containerRef} className="relative" style={{ height: "800vh" }}>
      <ForgeNav />
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Crosshair lines */}
        <div
          ref={crossVRef}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{ background: ACCENT, opacity: 0 }}
        />
        <div
          ref={crossHRef}
          className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
          style={{ background: ACCENT, opacity: 0 }}
        />

        {/* 2x2 grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {PANELS.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => { panelRefs.current[i] = el; }}
              className="flex items-center justify-center px-8 sm:px-12 lg:px-16"
              style={{ opacity: 0, transform: `translateX(${p.from === "left" ? -100 : 100}vw)`, willChange: "transform, opacity" }}
            >
              <div className="relative max-w-md pl-5">
                {/* Accent left border */}
                <div
                  data-border
                  className="absolute left-0 top-0 h-full w-[2px]"
                  style={{ background: ACCENT, opacity: p.borderOpacity }}
                />
                <p
                  className={`${p.font} ${p.size} leading-relaxed ${p.italic ? "italic" : ""}`}
                  style={{ color: "var(--cream-muted)" }}
                >
                  {p.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Center company title */}
        <div
          ref={titleRef}
          className="absolute left-1/2 top-1/2 pointer-events-none select-none"
          style={{
            transform: "translate(-50%, -50%) scale(0)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-ui text-xs tracking-[0.25em] uppercase"
              style={{ color: ACCENT }}
            >
              AMBOSS
            </span>
            <span
              className="font-sans text-[0.7rem] tracking-widest"
              style={{ color: "var(--text-faint)" }}
            >
              Berlin, 2018&ndash;2019
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
