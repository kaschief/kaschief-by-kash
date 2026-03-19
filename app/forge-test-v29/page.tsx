"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { DevNav } from "../dev-nav";

/* ── Paragraph data ── */
const PARAGRAPHS: {
  text: string;
  font: string;
  size: string;
}[] = [
  {
    text: "Half a million med students used this app to pass their boards. I\u2019d been one of them. I knew exactly where the product lost people because I remembered where it lost me.",
    font: "font-serif",
    size: "text-[1.05rem]",
  },
  {
    text: "The team built from tickets. I built from the feeling of being the user at 3am with an exam in six hours. That difference shaped everything.",
    font: "font-sans",
    size: "text-[0.9rem]",
  },
  {
    text: "I stopped guessing what users wanted. I pulled session data, set up A/B tests, broke production once at 2am, and started building from evidence.",
    font: "font-sans",
    size: "text-[0.9rem]",
  },
  {
    text: "Your instinct is a hypothesis. Treat it like one.",
    font: "font-narrator italic",
    size: "text-[1rem]",
  },
];

/* ── Scroll zones per paragraph ── */
const ZONES = [
  { start: 0, end: 0.25 },
  { start: 0.25, end: 0.5 },
  { start: 0.5, end: 0.75 },
  { start: 0.75, end: 1.0 },
];

const TRANSITION = 0.05;
const ALL_SHARP_START = 0.95;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ForgeV29() {
  const containerRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const borderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    /* End state: all sharp */
    const allSharpT = clamp((v - ALL_SHARP_START) / (1.0 - ALL_SHARP_START), 0, 1);

    /* Track which paragraph center is closest for the dot */
    let activeDotY = 0;
    let minDist = Infinity;

    PARAGRAPHS.forEach((_, i) => {
      const el = paraRefs.current[i];
      const border = borderRefs.current[i];
      if (!el || !border) return;

      const zone = ZONES[i];
      const mid = (zone.start + zone.end) / 2;

      /* Compute focus: 1 = fully focused, 0 = not */
      let focus: number;
      if (v < zone.start) {
        focus = clamp(1 - (zone.start - v) / TRANSITION, 0, 1);
      } else if (v > zone.end) {
        focus = clamp(1 - (v - zone.end) / TRANSITION, 0, 1);
      } else {
        /* Inside the zone */
        const distToEdge = Math.min(v - zone.start, zone.end - v);
        focus = clamp(distToEdge / TRANSITION, 0, 1);
      }

      /* During all-sharp phase, override toward uniform */
      const finalOpacity = lerp(lerp(0.15, 1, focus), 0.7, allSharpT);
      const finalBlur = lerp(lerp(8, 0, focus), 0, allSharpT);
      const finalScale = lerp(lerp(1, 1.02, focus), 1, allSharpT);
      const finalBorder = lerp(lerp(0, 0.3, focus), 0, allSharpT);

      el.style.opacity = String(finalOpacity);
      el.style.filter = `blur(${finalBlur}px)`;
      el.style.transform = `scale(${finalScale})`;
      border.style.opacity = String(finalBorder);

      /* Dot tracking */
      const dist = Math.abs(v - mid);
      if (dist < minDist) {
        minDist = dist;
        const rect = el.getBoundingClientRect();
        const parent = el.parentElement?.parentElement?.getBoundingClientRect();
        if (parent) {
          activeDotY = rect.top - parent.top + rect.height / 2;
        }
      }
    });

    /* Position the gold dot */
    if (dotRef.current) {
      dotRef.current.style.transform = `translateY(${activeDotY}px)`;
      dotRef.current.style.opacity = allSharpT > 0.5 ? "0" : "1";
    }
  });

  /* Initial state: P1 focused, rest blurred */
  useEffect(() => {
    PARAGRAPHS.forEach((_, i) => {
      const el = paraRefs.current[i];
      const border = borderRefs.current[i];
      if (!el || !border) return;
      if (i === 0) {
        el.style.opacity = "1";
        el.style.filter = "blur(0px)";
        el.style.transform = "scale(1.02)";
        border.style.opacity = "0.3";
      } else {
        el.style.opacity = "0.15";
        el.style.filter = "blur(8px)";
        el.style.transform = "scale(1)";
        border.style.opacity = "0";
      }
    });
  }, []);

  return (
    <>
      <DevNav />
      <div ref={containerRef} style={{ height: "800vh", background: "var(--bg)" }}>
        <div
          className="sticky top-0 flex flex-col items-center justify-center"
          style={{ height: "100vh", overflow: "hidden" }}
        >
          {/* Company header */}
          <div className="absolute top-16 left-0 right-0 flex flex-col items-center gap-1">
            <span
              className="font-ui text-[0.65rem] uppercase tracking-[0.25em]"
              style={{ color: "var(--text-faint)" }}
            >
              Berlin, 2018\u20132019
            </span>
            <h1
              className="font-serif text-[1.5rem] tracking-wide"
              style={{ color: "var(--cream)" }}
            >
              AMBOSS
            </h1>
            <div
              className="mt-1"
              style={{
                width: 24,
                height: 1,
                background: "#60A5FA",
                opacity: 0.4,
              }}
            />
          </div>

          {/* Paragraphs with dot indicator */}
          <div className="relative" style={{ maxWidth: 520, width: "100%", padding: "0 1.5rem" }}>
            {/* Gold tracking dot */}
            <div
              ref={dotRef}
              className="absolute"
              style={{
                left: -12,
                top: 0,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--gold)",
                transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s",
                willChange: "transform",
              }}
            />

            {/* Paragraph stack */}
            <div className="flex flex-col gap-7">
              {PARAGRAPHS.map((para, i) => (
                <div key={i} className="relative flex">
                  {/* Accent left border */}
                  <div
                    ref={(el) => {
                      borderRefs.current[i] = el;
                    }}
                    className="absolute left-0 top-0 bottom-0"
                    style={{
                      width: 2,
                      background: "#60A5FA",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      borderRadius: 1,
                    }}
                  />
                  <div
                    ref={(el) => {
                      paraRefs.current[i] = el;
                    }}
                    className={`${para.font} ${para.size} pl-4`}
                    style={{
                      color: "var(--cream)",
                      lineHeight: 1.75,
                      willChange: "filter, opacity, transform",
                      transformOrigin: "left center",
                    }}
                  >
                    {para.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 font-ui text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            scroll to focus
          </div>
        </div>
      </div>
    </>
  );
}
