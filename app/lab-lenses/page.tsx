"use client";

/**
 * Lab Lenses — Prologue + Crossfade Highlights + Shore Desk
 *
 * 1. Scroll-gated: thesis → keywords → curtain → 4 highlight card crossfade
 * 2. Normal flow: Shore desk with remaining 8 cards (hover/click to explore)
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";
import {
  useLenses,
  CONTAINER_HEIGHT_VH,
  SMOOTH_LERP_FACTOR,
} from "./use-lenses";
import { MAX_CONTENT_WIDTH } from "./lenses.config";
import { REMAINING_ENTRIES } from "./card-config";
import { renderCard } from "../lab-artifacts/render-card";
import type { LensEntry } from "@data";

/* ═══════════════════════════════════════════════════════════
   Shore Desk — resting composition with hover/click exploration
   ═══════════════════════════════════════════════════════════ */

const POSITIONS = [
  { col: 0, row: 0, rot: -1.2, nudgeX: 4, nudgeY: 3 },
  { col: 1, row: 0, rot: 0.8, nudgeX: -2, nudgeY: 6 },
  { col: 2, row: 0, rot: -0.5, nudgeX: 3, nudgeY: -2 },
  { col: 3, row: 0, rot: 1.2, nudgeX: -4, nudgeY: 4 },
  { col: 0, row: 1, rot: 0.6, nudgeX: 6, nudgeY: -4 },
  { col: 1, row: 1, rot: -1.5, nudgeX: -1, nudgeY: 3 },
  { col: 2, row: 1, rot: 0.8, nudgeX: 3, nudgeY: -5 },
  { col: 3, row: 1, rot: -0.3, nudgeX: -3, nudgeY: 1 },
];

function StoryOverlay({
  entry, onClose,
}: {
  entry: LensEntry; onClose: () => void;
}) {
  // Trap focus: close on Escape
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Focus the panel so screen readers announce it
    panelRef.current?.focus();
    // Prevent background scroll while overlay is open
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Story: ${entry.headline}`}
      style={{ zIndex: 10001, background: "rgba(4,4,6,0.94)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      {/* Hidden scrollbar styles */}
      <style>{`
        .overlay-scroll::-webkit-scrollbar { display: none; }
        .overlay-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full overlay-scroll overflow-y-auto outline-none"
        style={{ maxWidth: 720, maxHeight: "88vh", padding: "32px 0 40px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top-right, gold accent on hover */}
        <button
          onClick={onClose}
          aria-label="Close story"
          className="sticky top-2 float-right z-10"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--cream-muted)",
            fontSize: 16, lineHeight: 1,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
            transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(201,168,76,0.12)";
            e.currentTarget.style.borderColor = "var(--gold-dim)";
            e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "var(--cream-muted)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div style={{ clear: "both" }} />

        {/* Card */}
        <div className="mx-auto mb-7" style={{ maxWidth: 360 }}>
          {renderCard(entry, { boxShadow: "0 12px 60px rgba(0,0,0,0.5)" })}
        </div>

        {/* Company */}
        <div
          className="font-ui text-center mb-5"
          style={{
            fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--gold-dim)", opacity: 0.6,
          }}
        >
          {entry.company} &middot; {entry.years}
        </div>

        {/* Headline (question) — ABOVE the i-statement */}
        <p
          className="font-serif text-center mb-4"
          style={{
            fontSize: "clamp(0.88rem, 1.4vw, 1.05rem)",
            color: "var(--cream)", fontWeight: 500,
          }}
        >
          {entry.headline}
        </p>

        {/* I-statement */}
        <p
          className="font-serif text-center mb-6"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
            lineHeight: 1.4, color: "var(--gold)",
            maxWidth: 540, margin: "0 auto 24px",
          }}
        >
          {entry.iStatement}
        </p>

        {/* Story */}
        <p
          className="font-narrator text-center"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
            lineHeight: 1.8, color: "var(--text-dim)",
            maxWidth: 540, margin: "0 auto",
          }}
        >
          {entry.story}
        </p>
      </div>
    </div>
  );
}

function DeskCard({
  entry, pos, onClick,
}: {
  entry: LensEntry;
  pos: typeof POSITIONS[0];
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="text-left group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${entry.company}: ${entry.iStatement}`}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        transform: hovered
          ? "rotate(0deg) translateY(-12px) scale(1.04)"
          : `rotate(${pos.rot}deg)`,
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Card — responsive width */}
      <div className="shore-card-scale sm:w-[200px] lg:w-[220px] xl:w-[260px]" style={{ pointerEvents: "none" }}>
        {renderCard(entry, {
          boxShadow: hovered
            ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px var(--gold-dim)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        })}
      </div>
      {/* I-statement — appears on hover */}
      <div
        style={{
          marginTop: 10,
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: 13, lineHeight: 1.4,
          color: "var(--gold)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          maxWidth: 240,
        }}
      >
        {entry.iStatement}
      </div>
      <div
        className="font-ui mt-2 text-center"
        style={{
          fontSize: 8, letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--gold-dim)",
          opacity: hovered ? 0.5 : 0.25,
          transition: "opacity 0.3s ease",
        }}
      >
        {entry.company} &middot; {entry.years}
      </div>
    </button>
  );
}

function ShoreDesk() {
  const [selected, setSelected] = useState<LensEntry | null>(null);
  const handleClose = useCallback(() => setSelected(null), []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fr = useRef(0);

  // Scroll-triggered fade-in
  useEffect(() => {
    const tick = () => {
      if (!sectionRef.current || !contentRef.current) {
        fr.current = requestAnimationFrame(tick);
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const rawP = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.4)));
      const fadeIn = 1 - (1 - rawP) * (1 - rawP); // easeOut
      contentRef.current.style.opacity = String(fadeIn);
      contentRef.current.style.transform = `translateY(${(1 - fadeIn) * 30}px)`;
      fr.current = requestAnimationFrame(tick);
    };
    fr.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(fr.current);
  }, []);

  return (
    <div ref={sectionRef} style={{ background: "var(--bg)", paddingBottom: 100, position: "relative", zIndex: 5 }}>
      {/* Transition narrator */}
      <div className="flex items-center justify-center px-8 pt-20 pb-8">
        <p
          className="font-narrator text-center"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
            color: "var(--cream-muted)",
            maxWidth: 520,
          }}
        >
          The rest are here if you want them.
        </p>
      </div>

      {/* Desk grid — responsive columns */}
      <div
        ref={contentRef}
        className="mx-auto px-6 sm:px-8 lg:px-12"
        style={{ maxWidth: 1200, opacity: 0, willChange: "transform, opacity" }}
      >
        <style>{`
          .shore-grid { grid-template-columns: repeat(2, 1fr); padding-top: 16px; }
          @media (max-width: 639px) {
            .shore-grid-item { transform: none !important; }
            .shore-card-scale { zoom: 0.5; }
          }
          @media (min-width: 640px) {
            .shore-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (min-width: 1024px) {
            .shore-grid { grid-template-columns: repeat(4, 1fr); }
          }
        `}</style>
        <div className="shore-grid grid gap-y-12 gap-x-4 sm:gap-x-6 justify-items-center" style={{ padding: "16px 8px" }}>
          {REMAINING_ENTRIES.map((entry, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            return (
              <div
                key={entry.id}
                className="shore-grid-item"
                style={{
                  transform: `translate(${pos.nudgeX}px, ${pos.nudgeY}px)`,
                }}
              >
                <DeskCard
                  entry={entry}
                  pos={pos}
                  onClick={() => setSelected(entry)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <StoryOverlay
          entry={selected}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */

export default function LabLensesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);

  const smoothedProgress = useRef(0);
  const rawScrollProgress = useRef(0);
  const animationFrameId = useRef(0);

  const { update, fullScreenJsx, contentJsx } = useLenses();

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // RAF loop
  useEffect(() => {
    const tick = () => {
      smoothedProgress.current +=
        (rawScrollProgress.current - smoothedProgress.current) *
        SMOOTH_LERP_FACTOR;
      update(smoothedProgress.current, stickyViewportRef);
      animationFrameId.current = requestAnimationFrame(tick);
    };
    animationFrameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [update]);

  useMotionValueEvent(scrollYProgress, "change", (latestValue) => {
    rawScrollProgress.current = latestValue;
  });

  return (
    <>
      <LabNav />

      {/* Scroll-gated section: prologue + crossfade highlights */}
      <div
        ref={scrollContainerRef}
        style={{
          height: `${CONTAINER_HEIGHT_VH}vh`,
          background: "var(--bg, #07070A)",
        }}>
        <div
          ref={stickyViewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ containerType: "size" }}>
          {fullScreenJsx}
          <div
            className="relative h-full mx-auto"
            style={{ maxWidth: MAX_CONTENT_WIDTH }}>
            {contentJsx}
          </div>
        </div>
      </div>

      {/* Normal-flow Shore desk */}
      <ShoreDesk />
    </>
  );
}
