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

/*
 * Fragments split into two groups:
 *   - "signal" fragments stay gold and sharp — the real story
 *   - "noise" fragments fade and blur away — the filler
 */

interface Fragment {
  text: string;
  signal: boolean;
  cardIdx: number; // originates from this card
}

const FRAGMENTS: Fragment[] = [
  // Signals — these linger
  { text: "untangled", signal: true, cardIdx: 0 },
  { text: "owned the incident", signal: true, cardIdx: 3 },
  { text: "made the team faster", signal: true, cardIdx: 3 },
  { text: "deleted more than I wrote", signal: true, cardIdx: 1 },
  { text: "chose boring technology", signal: true, cardIdx: 2 },
  { text: "built the testing culture", signal: true, cardIdx: 2 },
  { text: "shipped without asking permission", signal: true, cardIdx: 1 },
  // Noise — these dissolve
  { text: "migrated under pressure", signal: false, cardIdx: 0 },
  { text: "killed a feature that was working", signal: false, cardIdx: 1 },
  { text: "rewrote the deploy gate", signal: false, cardIdx: 2 },
  { text: "said no to the VP", signal: false, cardIdx: 3 },
  { text: "automated myself out of a job", signal: false, cardIdx: 0 },
  { text: "mentored through code review", signal: false, cardIdx: 3 },
  { text: "refactored the monolith", signal: false, cardIdx: 1 },
  { text: "debugged production at 2am", signal: false, cardIdx: 2 },
  { text: "convinced stakeholders with data", signal: false, cardIdx: 0 },
];

/* ── Deterministic scatter ── */

function seededRandom(seed: number): number {
  return ((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}

interface FragLayout {
  dx: number; // drift X (vw)
  dy: number; // drift Y (vh)
  rot: number; // drift rotation
}

const FRAG_LAYOUTS: FragLayout[] = FRAGMENTS.map((_, i) => {
  const s1 = seededRandom(i * 7 + 1);
  const s2 = seededRandom(i * 13 + 3);
  const s3 = seededRandom(i * 19 + 7);
  return {
    dx: (s1 - 0.5) * 70,
    dy: (s2 - 0.5) * 60,
    rot: (s3 - 0.5) * 30,
  };
});

/* ── Card grid positions ── */

const CARD_POSITIONS = [
  { x: -22, y: -16 },
  { x: 22, y: -16 },
  { x: -22, y: 16 },
  { x: 22, y: 16 },
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

export default function LabDistill() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fragRefs = useRef<(HTMLDivElement | null)[]>([]);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const onScroll = useCallback((p: number) => {
    /*
     * Timeline:
     *   0.00 - 0.08  cards fade in, sharp and clean
     *   0.08 - 0.28  cards hold — viewer reads them
     *   0.28 - 0.50  cards dissolve: blur + fade + scale down
     *   0.30 - 0.55  fragments emerge from card positions, drift outward
     *   0.55 - 0.80  noise fragments fade/blur away, signals stay gold
     *   0.80 - 1.00  narrative appears below signals
     */

    // --- Cards ---
    const cardIn = smoothstep(0.0, 0.08, p);
    const cardOut = smoothstep(0.28, 0.48, p);

    for (let i = 0; i < 4; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      const pos = CARD_POSITIONS[i]!;
      const opacity = cardIn * (1 - cardOut);
      const blur = lerp(0, 12, cardOut);
      const scale = lerp(1, 0.88, cardOut);

      el.style.transform = `translate(${pos.x}vw, ${pos.y}vh) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.filter = `blur(${blur}px)`;
    }

    // --- Subtitle ("these are the roles...") ---
    if (subtitleRef.current) {
      const subIn = smoothstep(0.06, 0.14, p);
      const subOut = smoothstep(0.26, 0.36, p);
      subtitleRef.current.style.opacity = String(subIn * (1 - subOut));
    }

    // --- Fragments ---
    const fragEmerge = smoothstep(0.30, 0.50, p);
    const noiseFade = smoothstep(0.55, 0.78, p);

    for (let i = 0; i < FRAGMENTS.length; i++) {
      const el = fragRefs.current[i];
      if (!el) continue;

      const frag = FRAGMENTS[i]!;
      const layout = FRAG_LAYOUTS[i]!;
      const cardPos = CARD_POSITIONS[frag.cardIdx]!;

      // Start at card center, drift outward
      const x = lerp(cardPos.x, cardPos.x + layout.dx, fragEmerge);
      const y = lerp(cardPos.y, cardPos.y + layout.dy, fragEmerge);
      const rot = lerp(0, layout.rot, fragEmerge);

      if (frag.signal) {
        // Signal fragments: emerge and stay
        const opacity = smoothstep(0.32, 0.52, p);
        el.style.transform = `translate(${x}vw, ${y}vh) rotate(${rot}deg)`;
        el.style.opacity = String(opacity);
        el.style.filter = "none";
        el.style.color = "var(--gold)";
      } else {
        // Noise fragments: emerge then fade
        const opacity = fragEmerge * (1 - noiseFade);
        const blur = lerp(0, 6, noiseFade);
        el.style.transform = `translate(${x}vw, ${y}vh) rotate(${rot}deg)`;
        el.style.opacity = String(opacity * 0.5);
        el.style.filter = `blur(${blur}px)`;
        el.style.color = "var(--text-dim)";
      }
    }

    // --- Narrative ---
    if (narrativeRef.current) {
      const narFade = smoothstep(0.78, 0.90, p);
      narrativeRef.current.style.opacity = String(narFade);
      narrativeRef.current.style.transform = `translateY(${lerp(24, 0, narFade)}px)`;
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", onScroll);

  return (
    <>
      <LabNav />
      <div ref={containerRef} style={{ height: "600vh", background: "var(--bg)" }}>
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          {/* Card layer */}
          {ROLES.map((role, i) => (
            <div
              key={role.company}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute flex flex-col gap-2 rounded-lg border px-8 py-6"
              style={{
                opacity: 0,
                background: "var(--bg-elevated, #0E0E14)",
                borderColor: `${role.color}33`,
                minWidth: 220,
                willChange: "transform, opacity, filter",
                boxShadow: `0 0 30px 8px ${role.color}11`,
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

          {/* Subtitle */}
          <div
            ref={subtitleRef}
            className="absolute top-[58%] left-1/2 -translate-x-1/2 text-center"
            style={{ opacity: 0 }}>
            <p
              className="font-narrator text-sm italic tracking-wide"
              style={{ color: "var(--text-faint)" }}>
              These are the titles. But titles are containers, not contents.
            </p>
          </div>

          {/* Fragment layer */}
          {FRAGMENTS.map((frag, i) => (
            <div
              key={i}
              ref={(el) => { fragRefs.current[i] = el; }}
              className="pointer-events-none absolute font-ui font-medium tracking-wide"
              style={{
                opacity: 0,
                whiteSpace: "nowrap",
                willChange: "transform, opacity, filter",
                fontSize: frag.signal ? 14 : 12,
              }}>
              {frag.text}
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
              The titles don't matter. The thinking does.
            </p>
          </div>

          {/* Phase label */}
          <div
            className="absolute bottom-6 right-6 font-ui text-[9px] uppercase tracking-[0.4em]"
            style={{ color: "var(--text-faint)" }}>
            Option B — Distillation
          </div>
        </div>
      </div>
    </>
  );
}
