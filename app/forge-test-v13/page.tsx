"use client";

/**
 * V13: Card Stack
 *
 * Four oversized cards in a fan arrangement. Scroll lifts each card to center,
 * reveals its scene/action/shift, then slides it off left. Between cards a
 * distilled principle appears centered on a dark void.
 */

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ================================================================== */
/*  Inline math helpers                                                */
/* ================================================================== */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ================================================================== */
/*  Data (hardcoded, same set as V10-V12)                              */
/* ================================================================== */

interface CardData {
  company: string;
  period: string;
  accent: string;
  scene: string;
  action: string;
  shift: string;
  principle: string;
}

const CARDS: CardData[] = [
  {
    company: "AMBOSS",
    period: "2018 — 2019",
    accent: "#60A5FA",
    scene:
      "A medical-knowledge platform scaling fast, where every UI choice carried clinical weight.",
    action:
      "Built patient-facing features in React, iterated with doctors, shipped empathy into code.",
    shift:
      "Learned that the user is never an abstraction — treat them like one and the product lies to people.",
    principle:
      "Empathy is not a soft skill. It is the hardest engineering constraint.",
  },
  {
    company: "Compado",
    period: "2019 — 2021",
    accent: "#42B883",
    scene:
      "A comparison-engine startup where page speed was revenue and every millisecond was a conversion lever.",
    action:
      "Re-architected the Vue front-end for performance, introduced SSR, trimmed bundle by 60%.",
    shift:
      "Discovered that load time is not a metric — it is a user's first impression of whether you respect their time.",
    principle:
      "Speed is a feature. Lag is an opinion about your users.",
  },
  {
    company: "CAPinside",
    period: "2021",
    accent: "#3178C6",
    scene:
      "A fintech platform where a legacy codebase reflected years of shifting priorities and team turnover.",
    action:
      "Introduced TypeScript, migrated critical paths, wrote shared contracts between FE and BE.",
    shift:
      "Realized a codebase is a record of a team's habits — change the code by changing how the team works.",
    principle:
      "Architecture is team culture, crystallized.",
  },
  {
    company: "DKB",
    period: "2021 — 2024",
    accent: "#F472B6",
    scene:
      "Germany's largest digital bank, rebuilding its customer-facing platform from scratch at regulatory scale.",
    action:
      "Led front-end architecture for the new platform, mentored engineers, aligned product and engineering.",
    shift:
      "At scale, the highest-leverage thing an engineer can do is make the right decision obvious for everyone else.",
    principle:
      "Leadership is clarity at scale.",
  },
];

const NUM_CARDS = CARDS.length;

/* ================================================================== */
/*  Fan / Stack geometry                                               */
/* ================================================================== */

/** Within each card's 250vh range (total 1000vh):
 *  0.00-0.10  lift from fan (approach)
 *  0.10-0.55  hold at center (read)
 *  0.55-0.70  slide off left
 *  0.70-1.00  void / principle text
 */

/* Initial fan offsets */
const FAN_OFFSET_X = 15; // px per card
const FAN_ROTATE = 2; // deg per card

/* ================================================================== */
/*  Card component                                                     */
/* ================================================================== */

function StackCard({
  card,
  index,
  scrollProgress,
}: {
  card: CardData;
  index: number;
  scrollProgress: number;
}) {
  // Normalize progress for this card's segment (0-1 within its 250vh)
  const segStart = index / NUM_CARDS;
  const segEnd = (index + 1) / NUM_CARDS;
  const local = Math.max(0, Math.min(1, (scrollProgress - segStart) / (segEnd - segStart)));

  // Phase thresholds (within local 0-1)
  const liftEnd = 0.10;
  const holdEnd = 0.55;
  const exitEnd = 0.70;

  // Lift phase: fan position -> center
  const liftT = smoothstep(0, liftEnd, local);
  // Exit phase: center -> off left
  const exitT = smoothstep(holdEnd, exitEnd, local);

  // Fan base offsets (centered around 0)
  const fanCenter = (NUM_CARDS - 1) / 2;
  const fanX = (index - fanCenter) * FAN_OFFSET_X;
  const fanY = Math.abs(index - fanCenter) * 8;
  const fanRot = (index - fanCenter) * FAN_ROTATE;

  // Compute transforms
  const x = lerp(fanX, 0, liftT) + lerp(0, -120, exitT);
  const y = lerp(fanY, 0, liftT);
  const rotate = lerp(fanRot, 0, liftT) + lerp(0, -8, exitT);
  const scale = lerp(0.92, 1, liftT) * lerp(1, 0.85, exitT);

  // Opacity: visible during approach and hold, fade during exit
  const opacity =
    local < liftEnd * 0.3
      ? smoothstep(0, liftEnd * 0.3, local) // fade in
      : local > holdEnd
        ? 1 - smoothstep(holdEnd, exitEnd, local) // fade out
        : 1;

  // Content opacity (only during hold phase)
  const contentOpacity = smoothstep(liftEnd * 0.5, liftEnd, local) * (1 - smoothstep(holdEnd, holdEnd + 0.05, local));

  // z-index: active card on top
  const isActive = local > 0 && local < exitEnd;
  const zIndex = isActive ? 50 + index : 10 - index;

  // If card hasn't started or is fully exited, hide
  if (local <= 0 && index > 0) {
    // Show in fan only for first view
  }
  if (local >= 1) {
    return null;
  }

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        width: "100%",
        height: "100%",
        zIndex,
        pointerEvents: "none",
      }}
    >
      <div
        className="relative font-sans"
        style={{
          maxWidth: 600,
          width: "90vw",
          padding: "48px 40px",
          borderRadius: 12,
          background: "var(--bg-elevated, #0E0E14)",
          border: `1px solid ${card.accent}26`,
          boxShadow: `0 0 60px ${card.accent}10, 0 4px 24px rgba(0,0,0,0.5)`,
          transform: `translate(${x}vw, ${y}px) rotate(${rotate}deg) scale(${scale})`,
          opacity,
          transition: "none",
        }}
      >
        {/* Company + Period header */}
        <div
          className="font-sans"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: card.accent,
            marginBottom: 32,
            opacity: contentOpacity,
          }}
        >
          {card.company}
          <span style={{ color: "var(--text-dim, #8A8478)", marginLeft: 12 }}>
            {card.period}
          </span>
        </div>

        {/* Scene */}
        <p
          className="font-serif"
          style={{
            fontSize: 20,
            lineHeight: 1.5,
            color: "var(--cream, #F0E6D0)",
            marginBottom: 24,
            opacity: contentOpacity,
          }}
        >
          {card.scene}
        </p>

        {/* Action */}
        <p
          className="font-sans"
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: "var(--cream-muted, #B0A890)",
            marginBottom: 24,
            opacity: contentOpacity,
          }}
        >
          {card.action}
        </p>

        {/* Shift */}
        <p
          className="font-serif italic"
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--text-dim, #8A8478)",
            opacity: contentOpacity,
          }}
        >
          {card.shift}
        </p>

        {/* Accent gradient edge (left) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 3,
            borderRadius: "12px 0 0 12px",
            background: `linear-gradient(180deg, ${card.accent}40, ${card.accent}00)`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Principle void (between cards)                                     */
/* ================================================================== */

function PrincipleVoid({
  card,
  index,
  scrollProgress,
}: {
  card: CardData;
  index: number;
  scrollProgress: number;
}) {
  const segStart = index / NUM_CARDS;
  const segEnd = (index + 1) / NUM_CARDS;
  const local = Math.max(0, Math.min(1, (scrollProgress - segStart) / (segEnd - segStart)));

  // Principle appears during void phase (0.70-0.95 local)
  const fadeIn = smoothstep(0.70, 0.80, local);
  const fadeOut = smoothstep(0.90, 1.0, local);
  const opacity = fadeIn * (1 - fadeOut);

  if (opacity < 0.01) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 40, pointerEvents: "none" }}
    >
      <p
        className="font-serif text-center"
        style={{
          maxWidth: 520,
          padding: "0 24px",
          fontSize: 26,
          lineHeight: 1.5,
          color: "var(--cream, #F0E6D0)",
          opacity,
          transform: `translateY(${lerp(12, 0, fadeIn)}px)`,
        }}
      >
        {card.principle}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function ForgeV13() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
  });

  return (
    <>
      <ForgeNav />

      {/* Scroll runway */}
      <div
        ref={containerRef}
        style={{
          height: "1000vh",
          position: "relative",
          background: "var(--bg, #07070A)",
        }}
      >
        {/* Sticky viewport */}
        <div
          className="sticky top-0 left-0 w-full overflow-hidden"
          style={{ height: "100vh" }}
        >
          {/* Cards */}
          {CARDS.map((card, i) => (
            <StackCard
              key={card.company}
              card={card}
              index={i}
              scrollProgress={progress}
            />
          ))}

          {/* Principle voids */}
          {CARDS.map((card, i) => (
            <PrincipleVoid
              key={`void-${card.company}`}
              card={card}
              index={i}
              scrollProgress={progress}
            />
          ))}

          {/* Progress indicator */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
            style={{ zIndex: 100 }}
          >
            {CARDS.map((card, i) => {
              const segStart = i / NUM_CARDS;
              const segEnd = (i + 1) / NUM_CARDS;
              const local = Math.max(
                0,
                Math.min(1, (progress - segStart) / (segEnd - segStart))
              );
              return (
                <div
                  key={card.company}
                  style={{
                    width: 32,
                    height: 3,
                    borderRadius: 2,
                    background:
                      local > 0.05
                        ? card.accent
                        : "var(--text-faint, #4A4640)",
                    opacity: local > 0.05 ? 0.8 : 0.3,
                    transition: "background 0.3s, opacity 0.3s",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
