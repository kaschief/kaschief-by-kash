"use client";

import { useRef, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";

/* ── Data ── */

const ROLES = [
  { company: "AMBOSS", role: "Frontend Engineer", period: "2018 - 2019", color: "#60A5FA" },
  { company: "Compado", role: "Senior Frontend Engineer", period: "2019 - 2021", color: "#42B883" },
  { company: "CAPinside", role: "Senior Frontend Engineer", period: "2021", color: "#06B6D4" },
  { company: "DKB", role: "Engineering Manager", period: "2021 - 2022", color: "#F472B6" },
] as const;

const FRAGMENTS = [
  "untangled",
  "migrated under pressure",
  "killed a feature that was working",
  "owned the incident",
  "rewrote the deploy gate",
  "shipped without asking permission",
  "made the team faster",
  "deleted more than I wrote",
  "chose boring technology",
  "said no to the VP",
  "automated myself out of a job",
  "built the testing culture",
  "mentored through code review",
  "refactored the monolith",
  "debugged production at 2am",
  "convinced stakeholders with data",
] as const;

/* ── Deterministic scatter positions ── */

function seededRandom(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

interface FragLayout {
  x0: number; // initial X offset from center (vw)
  y0: number; // initial Y offset from center (vh)
  rot0: number; // initial rotation (deg)
  cardIdx: number; // which card this fragment belongs to (0-3)
}

const FRAG_LAYOUTS: FragLayout[] = FRAGMENTS.map((_, i) => {
  const s1 = seededRandom(i * 7 + 1);
  const s2 = seededRandom(i * 13 + 3);
  const s3 = seededRandom(i * 19 + 7);
  return {
    x0: (s1 - 0.5) * 80, // -40vw to +40vw
    y0: (s2 - 0.5) * 70, // -35vh to +35vh
    rot0: (s3 - 0.5) * 40, // -20deg to +20deg
    cardIdx: i % 4,
  };
});

/* ── Card grid target positions (relative to viewport center) ── */

const CARD_TARGETS = [
  { x: -22, y: -18 }, // top-left
  { x: 22, y: -18 },  // top-right
  { x: -22, y: 18 },  // bottom-left
  { x: 22, y: 18 },   // bottom-right
];

/* ── Helpers ── */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ── Component ── */

export default function LabConverge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fragRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const narrativeRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const onScroll = useCallback((p: number) => {
    /*
     * Timeline:
     *   0.00 - 0.10  fragments fade in, scattered
     *   0.10 - 0.50  fragments drift toward their card positions
     *   0.50 - 0.65  fragments snap into card grid, cards solidify
     *   0.65 - 0.80  cards fully visible, glow intensifies
     *   0.80 - 1.00  hold / narrative appears
     */

    // --- Fragments ---
    const fadeIn = smoothstep(0.02, 0.12, p);
    const drift = smoothstep(0.10, 0.55, p);
    const dissolve = smoothstep(0.55, 0.68, p);

    for (let i = 0; i < FRAGMENTS.length; i++) {
      const el = fragRefs.current[i];
      if (!el) continue;

      const layout = FRAG_LAYOUTS[i]!;
      const target = CARD_TARGETS[layout.cardIdx]!;

      // Position: scatter → card center
      const x = lerp(layout.x0, target.x, drift);
      const y = lerp(layout.y0, target.y, drift);
      const rot = lerp(layout.rot0, 0, drift);

      // Opacity: fade in then fade out as cards solidify
      const opacity = fadeIn * (1 - dissolve);

      // Scale: slight shrink as they converge
      const scale = lerp(1, 0.85, drift);

      el.style.transform = `translate(${x}vw, ${y}vh) rotate(${rot}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
    }

    // --- Cards ---
    const cardFade = smoothstep(0.55, 0.70, p);
    const cardGlow = smoothstep(0.65, 0.85, p);

    for (let i = 0; i < 4; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      const role = ROLES[i]!;
      const target = CARD_TARGETS[i]!;

      el.style.transform = `translate(${target.x}vw, ${target.y}vh)`;
      el.style.opacity = String(cardFade);

      // Scale: slight pop-in
      const scale = lerp(0.92, 1, smoothstep(0.55, 0.72, p));
      el.style.transform = `translate(${target.x}vw, ${target.y}vh) scale(${scale})`;

      // Glow
      el.style.boxShadow = `0 0 ${lerp(0, 40, cardGlow)}px ${lerp(0, 12, cardGlow)}px ${role.color}22, inset 0 1px 0 ${role.color}${Math.round(lerp(0, 30, cardGlow)).toString(16).padStart(2, "0")}`;
      el.style.borderColor = `${role.color}${Math.round(lerp(0, 80, cardGlow)).toString(16).padStart(2, "0")}`;
    }

    // --- Narrative ---
    if (narrativeRef.current) {
      const narFade = smoothstep(0.82, 0.92, p);
      narrativeRef.current.style.opacity = String(narFade);
      narrativeRef.current.style.transform = `translateY(${lerp(20, 0, narFade)}px)`;
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", onScroll);

  return (
    <>
      <LabNav />
      <div ref={containerRef} style={{ height: "600vh", background: "var(--bg)" }}>
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          {/* Fragments layer */}
          {FRAGMENTS.map((text, i) => {
            const layout = FRAG_LAYOUTS[i]!;
            const role = ROLES[layout.cardIdx]!;
            return (
              <div
                key={i}
                ref={(el) => { fragRefs.current[i] = el; }}
                className="pointer-events-none absolute font-ui text-sm font-medium tracking-wide"
                style={{
                  color: role.color,
                  opacity: 0,
                  whiteSpace: "nowrap",
                  willChange: "transform, opacity",
                }}>
                {text}
              </div>
            );
          })}

          {/* Card layer */}
          {ROLES.map((role, i) => (
            <div
              key={role.company}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute flex flex-col gap-2 rounded-lg border px-8 py-6"
              style={{
                opacity: 0,
                background: "var(--bg-elevated, #0E0E14)",
                borderColor: "transparent",
                minWidth: 220,
                willChange: "transform, opacity, box-shadow",
              }}>
              <span
                className="font-ui text-[10px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: role.color }}>
                {role.company}
              </span>
              <span
                className="font-serif text-lg"
                style={{ color: "var(--cream)" }}>
                {role.role}
              </span>
              <span
                className="font-ui text-[11px] tracking-wider"
                style={{ color: "var(--text-dim)" }}>
                {role.period}
              </span>
            </div>
          ))}

          {/* Narrative */}
          <div
            ref={narrativeRef}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center"
            style={{ opacity: 0, willChange: "transform, opacity" }}>
            <p
              className="font-narrator text-lg italic leading-relaxed tracking-wide"
              style={{ color: "var(--cream-muted)", maxWidth: 480 }}>
              All of this chaos was actually a career.
            </p>
          </div>

          {/* Phase label */}
          <div
            className="absolute bottom-6 right-6 font-ui text-[9px] uppercase tracking-[0.4em]"
            style={{ color: "var(--text-faint)" }}>
            Option A — Convergence
          </div>
        </div>
      </div>
    </>
  );
}
