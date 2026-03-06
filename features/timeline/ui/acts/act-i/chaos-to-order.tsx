"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ACT_I } from "@data";

const COLOR = ACT_I.color;

// ─── Layout Constants ────────────────────────────────────────────────────────

/** Scroll progress range where chaos snaps to order */
const SNAP_START = 0.55;
const SNAP_END = 0.62;

/** Custom event fired by nav scroll — used to reset burst on home nav */
const NAV_SCROLL_EVENT = "portfolio:section-nav-scroll";

// ─── Orbit Data ─────────────────────────────────────────────────────────────

const ORBIT_NODES = [
  {
    label: "Assessment",
    title: "Read the room before the monitor does",
    did: "Neuro checks every hour. ICP, hemodynamics, blood gas — all at once. Incomplete data, competing signals, every single shift.",
    built: "Absorb fast, filter noise, orient before the full picture exists.",
    transfer:
      "The instinct that reads a patient before the alarm fires is the same one that catches a system failing before the ticket lands.",
  },
  {
    label: "Pattern Recognition",
    title: "Never treat the symptom",
    did: "A cough at 1 am — nothing, or effusion, vent malfunction, a dosage reaction from hours ago. Diagnosis under time pressure, every night.",
    built: "Find what's actually broken. Not what's loudest.",
    transfer:
      "The eye that catches a drug interaction catches a regression buried three PRs deep.",
  },
  {
    label: "Communication",
    title: "Translate fear into trust in ninety seconds",
    did: "Briefed surgeons in three sentences. Talked families through ventilator settings at 3 am. Every audience needed a different language.",
    built: "Make complexity clear for people who need to act on it. Now.",
    transfer:
      "The voice that steadies a family in the ICU steadies a team when the roadmap shifts.",
  },
  {
    label: "Execution",
    title: "Chaos, controlled",
    did: "Rapid response. Ventilators, IV titrations, arterial lines. Document in real time. Then walk back to three other patients like nothing happened.",
    built:
      "Move fast under pressure without getting sloppy. Context-switch clean.",
    transfer:
      "Production incidents, regulatory deadlines, competing releases. Same muscle, different room.",
  },
  {
    label: "Triage",
    title: "One crashing. Three still need you steady.",
    did: "Four critical patients. Competing needs, all urgent. Escalated past the chain when the chain was too slow.",
    built: "Know which fire to fight first. Know which ones can wait.",
    transfer:
      "Three projects on fire, a teammate blocked, a deadline moved up. Triage was four ICU beds.",
  },
  {
    label: "Composure",
    title: "Calm is a procedure, not a personality",
    did: "~1,100 night shifts. Codes, family breakdowns, moments where the call was mine alone. The room reads the nurse first.",
    built:
      "Regulate yourself first. A reactive leader makes a reactive system.",
    transfer: "A team reads its manager the way a room reads its nurse.",
  },
] as const;

// Per-node animation tuning
const NODE_DELAYS = [0.0, 0.08, 0.15, 0.22, 0.3, 0.38];
const NODE_START_ROTATIONS = [-12, 8, -6, 14, -10, 7];
const NODE_END_ROTATIONS = [-2, 1.5, -1, 3, -2.5, 1];
const NODE_WEIGHTS = [0.9, 1.2, 0.75, 1.0, 1.3, 0.85];
const DRIFT_RATES = [0.9, 1.2, 0.65, 1.05, 0.8, 0.95];
const DRIFT_DIRS = [-1, 1, -1, 1, -1, 1];

// ─── Position Sets ──────────────────────────────────────────────────────────
// Narrator occupies ~42%–60% vertically on both breakpoints.
// All positions must clear that band and stay within viewport.

// Desktop (lg) — 3×2 elliptical orbit → 3×2 grid
const CHAOS_LG = [
  { left: 24, top: 38 },
  { left: 34, top: 16 },
  { left: 54, top: 12 },
  { left: 64, top: 34 },
  { left: 56, top: 58 },
  { left: 32, top: 62 },
];
const ORDER_LG = [
  { left: 24, top: 14 },
  { left: 44, top: 14 },
  { left: 64, top: 14 },
  { left: 24, top: 62 },
  { left: 44, top: 62 },
  { left: 64, top: 62 },
];
const MAX_W_LG = [
  "min(180px, 15vw)",
  "min(170px, 14vw)",
  "min(175px, 15vw)",
  "min(175px, 15vw)",
  "min(165px, 13vw)",
  "min(170px, 14vw)",
];

// Mobile (< lg) — scattered orbit → 2×3 grid
// Cards are 40vw wide. Narrator at ~54%.
const CHAOS_SM = [
  { left: 18, top: 11 },
  { left: 48, top: 22 },
  { left: 2, top: 32 },
  { left: 54, top: 35 },
  { left: 10, top: 68 },
  { left: 46, top: 72 },
];
const ORDER_SM = [
  { left: 6, top: 12 },
  { left: 52, top: 12 },
  { left: 6, top: 32 },
  { left: 52, top: 32 },
  { left: 6, top: 72 },
  { left: 52, top: 72 },
];
const MAX_W_SM = "40vw";

// ─── Mouse Displacement ─────────────────────────────────────────────────────
// Water-like repulsion via useSpring — desktop only (no re-renders)

const MOUSE_RADIUS = 500;
const MOUSE_STRENGTH = 100;
const MAX_DISPLACEMENT = 80;
const SPRING_CONFIG = { stiffness: 35, damping: 10, mass: 2 };

// ─── Hooks ──────────────────────────────────────────────────────────────────

function useIsLg() {
  const [lg, setLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return lg;
}

function useMouseDisplacement(
  containerRef: React.RefObject<HTMLDivElement | null>,
  nodeLeft: number,
  nodeTop: number,
  weight: number,
  enabled: boolean,
) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const nx = (nodeLeft / 100) * rect.width;
        const ny = (nodeTop / 100) * rect.height;
        const dx = nx - mx;
        const dy = ny - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const t = 1 - dist / MOUSE_RADIUS;
          const force = Math.min(t * t * MOUSE_STRENGTH * weight, MAX_DISPLACEMENT);
          rawX.set((dx / dist) * force);
          rawY.set((dy / dist) * force);
        } else {
          rawX.set(0);
          rawY.set(0);
        }
      });
    };

    const handleLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef, nodeLeft, nodeTop, weight, enabled, rawX, rawY]);

  return { x, y };
}

// ─── OrbitNode ──────────────────────────────────────────────────────────────

interface OrbitNodeProps {
  node: (typeof ORBIT_NODES)[number];
  index: number;
  visible: boolean;
  drift: import("framer-motion").MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: import("framer-motion").MotionValue<number>;
  chaos: { left: number; top: number };
  order: { left: number; top: number };
  maxWidth: string;
  interactive: boolean;
}

function OrbitNode({
  node,
  index,
  visible,
  drift,
  containerRef,
  scrollProgress,
  chaos,
  order,
  maxWidth,
  interactive,
}: OrbitNodeProps) {
  const [hovered, setHovered] = useState(false);
  const [burstDone, setBurstDone] = useState(false);

  const { x: displaceX, y: displaceY } = useMouseDisplacement(
    containerRef,
    chaos.left,
    chaos.top,
    NODE_WEIGHTS[index],
    interactive,
  );

  // Scroll-driven chaos → order
  const scrollLeft = useTransform(scrollProgress, [SNAP_START, SNAP_END], [chaos.left, order.left]);
  const scrollTop = useTransform(scrollProgress, [SNAP_START, SNAP_END], [chaos.top, order.top]);
  const leftStr = useTransform(scrollLeft, (v) => `${v}%`);
  const topStr = useTransform(scrollTop, (v) => `${v}%`);

  const scrollRotate = useTransform(
    scrollProgress,
    [0, SNAP_START, SNAP_END],
    [NODE_END_ROTATIONS[index], NODE_END_ROTATIONS[index], 0],
  );

  // Fade out chaos-only effects (drift + mouse displacement) during snap
  const chaosFade = useTransform(scrollProgress, [SNAP_START, SNAP_END], [1, 0]);
  const fadedDrift = useTransform([drift, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceX = useTransform([displaceX, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const fadedDisplaceY = useTransform([displaceY, chaosFade], ([d, cf]) => (d as number) * (cf as number));
  const combinedY = useTransform([fadedDisplaceY, fadedDrift], ([dy, d]) => (dy as number) + (d as number));

  // Dim during chaos (0.25), full brightness when ordered (1)
  const finalOpacity = useTransform(scrollProgress, [SNAP_START, SNAP_END], [0.25, 1]);

  const isHovered = interactive && hovered;

  return (
    <motion.div
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
      initial={{
        left: "50%",
        top: "50%",
        opacity: 0,
        scale: 0.3,
        rotate: NODE_START_ROTATIONS[index],
      }}
      animate={
        visible
          ? {
              left: `${chaos.left}%`,
              top: `${chaos.top}%`,
              opacity: [0, 0.45, 0.25],
              scale: 1,
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 12,
        mass: 1.2,
        delay: NODE_DELAYS[index],
        opacity: { duration: 0.8, delay: NODE_DELAYS[index], ease: [0.22, 1, 0.36, 1] },
      }}
      onAnimationComplete={() => setBurstDone(true)}
      className="absolute z-5 cursor-default"
      style={{
        ...(burstDone ? { left: leftStr, top: topStr } : {}),
        maxWidth,
        rotate: scrollRotate,
        opacity: isHovered ? 1 : finalOpacity,
        willChange: "auto",
      }}>
      <motion.div style={{ x: fadedDisplaceX, y: combinedY }}>
        {/* Red hairline */}
        <div
          style={{
            width: isHovered ? 28 : 12,
            height: 1,
            background: isHovered ? "#F06060" : COLOR,
            opacity: isHovered ? 0.6 : 0.2,
            marginBottom: 6,
            transition: "all 0.4s ease",
          }}
        />

        {/* Label */}
        <div
          className="mb-1 font-mono text-[7px] uppercase tracking-[0.25em] md:text-[9px]"
          style={{
            color: isHovered ? "#F06060" : COLOR,
            opacity: isHovered ? 0.9 : 0.5,
            transition: "all 0.4s",
          }}>
          {node.label}
        </div>

        {/* Title */}
        <div
          className="mb-1.5 font-serif text-[clamp(13px,1.6vw,20px)] leading-tight"
          style={{
            color: isHovered ? "#FFFFFF" : "var(--cream)",
            transition: "color 0.4s",
          }}>
          {node.title}
        </div>

        {/* What I did — desktop only */}
        <p
          className="hidden font-mono text-[clamp(8px,0.85vw,11px)] font-light leading-[1.7] sm:block"
          style={{
            color: isHovered ? "#D0C8B8" : "#A89E90",
            transition: "color 0.4s",
          }}>
          {node.did}
        </p>

        {/* What it built — desktop only */}
        <p
          className="mt-2 hidden pt-1.5 font-mono text-[clamp(7px,0.8vw,10px)] leading-[1.6] sm:block"
          style={{
            color: isHovered ? "#C0B8A0" : "#908878",
            borderTop: `1px solid ${isHovered ? "rgba(240,96,96,0.15)" : "rgba(224,82,82,0.06)"}`,
            transition: "all 0.4s",
          }}>
          <em
            className="not-italic"
            style={{
              color: isHovered ? "#F06060" : COLOR,
              transition: "color 0.4s",
            }}>
            {"\u2192"}
          </em>{" "}
          {node.built}
        </p>

        {/* Transfer — desktop hover only */}
        <p
          className="mt-2 hidden font-serif text-[clamp(9px,0.8vw,11px)] italic leading-normal sm:block"
          style={{
            color: "#B0A890",
            opacity: isHovered ? 0.85 : 0,
            maxHeight: isHovered ? 80 : 0,
            overflow: "hidden",
            transition: "opacity 0.4s ease, max-height 0.5s ease",
          }}>
          {node.transfer}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Scroll Indicator ────────────────────────────────────────────────────────

function ScrollIndicator({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  // Visible early in the section, fades out as user scrolls
  const opacity = useTransform(scrollProgress, [0, 0.04, 0.1], [0, 1, 0]);

  return (
    <motion.div
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      style={{ opacity }}>
      <motion.div
        className="font-mono text-[9px] uppercase tracking-[0.3em]"
        style={{ color: COLOR, opacity: 0.6 }}>
        Scroll
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 5L7 10L12 5"
            stroke={COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Narrative Text ─────────────────────────────────────────────────────────

function NarrativeText({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const chaosOpacity = useTransform(scrollProgress, [0.08, 0.15, 0.45, 0.53], [0, 1, 1, 0]);
  const orderOpacity = useTransform(scrollProgress, [SNAP_START, SNAP_END], [0, 1]);

  // Desktop narrator shifts from center (50%) to sit between grid rows (48%)
  const narratorTop = useTransform(scrollProgress, [SNAP_START, SNAP_END], [50, 48]);
  const narratorTopStr = useTransform(narratorTop, (v) => `${v}%`);

  const chaosBlock = (
    <motion.div
      className="rounded-lg px-6 py-4"
      style={{
        opacity: chaosOpacity,
        background: "radial-gradient(ellipse, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.85) 50%, transparent 100%)",
      }}>
      <p
        className="font-serif text-[clamp(16px,1.6vw,22px)] italic leading-relaxed"
        style={{ color: "var(--cream)" }}>
        Every shift began in the middle of something — competing signals,
        incomplete information, all at once.
      </p>
    </motion.div>
  );

  const orderBlock = (
    <motion.div
      className="rounded-lg px-6 py-4"
      style={{
        opacity: orderOpacity,
        background: "radial-gradient(ellipse, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.85) 50%, transparent 100%)",
      }}>
      <p
        className="font-serif text-[clamp(16px,1.6vw,22px)] italic leading-relaxed"
        style={{ color: "var(--cream)" }}>
        The job was never to eliminate the chaos. It was to make order from it.
      </p>
    </motion.div>
  );

  return (
    <>
      {/* Desktop — scroll-driven vertical position */}
      <motion.div
        className="pointer-events-none absolute left-1/2 z-20 hidden w-72 -translate-x-1/2 -translate-y-1/2 text-center lg:block"
        style={{ top: narratorTopStr }}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          {chaosBlock}
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          {orderBlock}
        </div>
      </motion.div>

      {/* Mobile — fixed between rows 2 & 3 */}
      <div className="pointer-events-none absolute left-1/2 top-[54%] z-20 w-[80vw] -translate-x-1/2 -translate-y-1/2 text-center lg:hidden">
        <div className="relative">
          {chaosBlock}
          <div className="absolute inset-0">{orderBlock}</div>
        </div>
      </div>
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function ChaosToOrder() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [burstKey, setBurstKey] = useState(0);
  const hasBurst = useRef(false);
  const [shouldBurst, setShouldBurst] = useState(false);

  const resetBurst = useCallback(() => {
    if (!hasBurst.current) return;
    hasBurst.current = false;
    setShouldBurst(false);
    setBurstKey((k) => k + 1);
  }, []);

  const triggerBurst = useCallback(() => {
    if (hasBurst.current) return;
    hasBurst.current = true;
    setShouldBurst(true);
  }, []);

  // Trigger burst only when scrolling DOWN into the section (top edge enters viewport).
  // Reset when user scrolls back above it.
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = sceneRef.current;
      if (!el) return;
      const scrollingDown = window.scrollY > lastScrollY.current;
      lastScrollY.current = window.scrollY;

      const top = el.getBoundingClientRect().top;

      // Trigger when more than 1/3 of the viewport is covered by the section
      if (top < window.innerHeight * 0.66 && scrollingDown) {
        triggerBurst();
      } else if (top > 0) {
        resetBurst();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerBurst, resetBurst]);

  // Also reset on nav click to home
  useEffect(() => {
    const handleNavScroll = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sectionId === "portrait") resetBurst();
    };
    window.addEventListener(NAV_SCROLL_EVENT, handleNavScroll);
    return () => window.removeEventListener(NAV_SCROLL_EVENT, handleNavScroll);
  }, [resetBurst]);

  const lg = useIsLg();
  const chaosPos = lg ? CHAOS_LG : CHAOS_SM;
  const orderPos = lg ? ORDER_LG : ORDER_SM;

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const baseDrift = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const drifts = DRIFT_RATES.map((rate, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(baseDrift, (v) => v * rate * DRIFT_DIRS[i]),
  );

  return (
    <div
      ref={sceneRef}
      className="relative"
      data-sticky-zone
      style={{ height: "600vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 mx-auto h-screen max-w-350 overflow-hidden">
        {/* Atmospheric glows — desktop only */}
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 500,
            height: 500,
            top: "15%",
            right: "8%",
            background: "radial-gradient(circle, rgba(224,82,82,0.012), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 350,
            height: 350,
            bottom: "20%",
            left: "6%",
            background: "radial-gradient(circle, rgba(224,82,82,0.007), transparent 55%)",
          }}
        />

        {ORBIT_NODES.map((node, i) => (
          <OrbitNode
            key={`${node.label}-${burstKey}`}
            node={node}
            index={i}
            visible={shouldBurst}
            drift={drifts[i]}
            containerRef={stickyRef}
            scrollProgress={scrollYProgress}
            chaos={chaosPos[i]}
            order={orderPos[i]}
            maxWidth={lg ? MAX_W_LG[i] : MAX_W_SM}
            interactive={lg}
          />
        ))}

        <NarrativeText scrollProgress={scrollYProgress} />
        <ScrollIndicator scrollProgress={scrollYProgress} />
      </div>
    </div>
  );
}
