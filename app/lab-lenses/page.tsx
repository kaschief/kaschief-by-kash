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
import { MAX_CONTENT_WIDTH, COMPANY_LABEL } from "./lenses.config";
import { REMAINING_ENTRIES } from "./card-config";
import { renderCard } from "../lab-artifacts/render-card";
import type { LensEntry } from "@data";
import { useBreakpoint, useMediaQuery } from "@hooks";
import { BREAKPOINTS } from "@utilities";

/** Mobile: halve the scroll distance so 4 cards don't take 17 screen-heights */
const MOBILE_SCROLL_FACTOR = 0.5;

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

const SWIPE_THRESHOLD = 80;

function StoryOverlay({
  entry,
  onClose,
}: {
  entry: LensEntry;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    // Prevent background scroll — iOS Safari + all browsers
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";
    html.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = "";
      html.style.touchAction = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.touchAction = "";
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);

  // Swipe-down to dismiss (touch devices)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const panel = panelRef.current;
    // Only allow drag when scrolled to top
    if (panel && panel.scrollTop <= 0) {
      dragStartY.current = e.touches[0].clientY;
      isDragging.current = false;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      isDragging.current = true;
      dragCurrentY.current = dy;
      if (panelRef.current) {
        const resistance = Math.min(dy, dy * 0.6);
        panelRef.current.style.transform = `translateY(${resistance}px)`;
        panelRef.current.style.opacity = String(Math.max(0.4, 1 - dy / 400));
      }
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragStartY.current === null) return;
    if (isDragging.current && dragCurrentY.current > SWIPE_THRESHOLD) {
      onClose();
    } else if (panelRef.current) {
      panelRef.current.style.transform = "";
      panelRef.current.style.opacity = "";
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
    isDragging.current = false;
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Story: ${entry.headline}`}
      style={{
        zIndex: 10001,
        background: "rgba(4,4,6,0.94)",
        backdropFilter: "blur(20px)",
        overscrollBehavior: "none",
      }}
      onClick={onClose}>
      {/* Hidden scrollbar styles */}
      <style>{`
        .overlay-scroll::-webkit-scrollbar { display: none; }
        .overlay-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Desktop-only X button — fixed, no nav conflict on desktop */}
      <button
        onClick={onClose}
        aria-label="Close story"
        className="hidden sm:flex"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 10002,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--cream-muted)",
          fontSize: 16,
          lineHeight: 1,
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition:
            "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.15)";
          e.currentTarget.style.borderColor = "var(--gold-dim)";
          e.currentTarget.style.color = "var(--gold)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "var(--cream-muted)";
        }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full overlay-scroll overflow-y-auto outline-none rounded-t-2xl sm:rounded-xl"
        style={{
          maxWidth: 720,
          maxHeight: "92vh",
          padding: "0 16px 40px",
          background: "rgba(10,10,14,0.6)",
          transition: "transform 0.25s ease, opacity 0.25s ease",
          willChange: "transform, opacity",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>
        {/* Mobile grabber pill — swipe down affordance */}
        <div className="sm:hidden flex justify-center pt-3 pb-4">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.25)",
            }}
          />
        </div>
        {/* Desktop top spacing */}
        <div className="hidden sm:block" style={{ height: 32 }} />

        {/* Card */}
        <div className="mx-auto mb-7" style={{ maxWidth: 360 }}>
          {renderCard(entry, { boxShadow: "0 12px 60px rgba(0,0,0,0.5)" })}
        </div>

        {/* Company */}
        <div
          className="font-ui text-center mb-5"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: COMPANY_LABEL.color,
            opacity: COMPANY_LABEL.visible,
          }}>
          {entry.company} &middot; {entry.years}
        </div>

        {/* Headline (question) — ABOVE the i-statement */}
        <p
          className="font-serif text-center mb-4"
          style={{
            fontSize: "clamp(0.88rem, 1.4vw, 1.05rem)",
            color: "var(--cream)",
            fontWeight: 500,
          }}>
          {entry.headline}
        </p>

        {/* I-statement */}
        <p
          className="font-serif text-center mb-6"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
            lineHeight: 1.4,
            color: "var(--gold)",
            maxWidth: 540,
            margin: "0 auto 24px",
          }}>
          {entry.iStatement}
        </p>

        {/* Story */}
        <p
          className="font-narrator text-center"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
            lineHeight: 1.8,
            color: "var(--text-dim)",
            maxWidth: 540,
            margin: "0 auto",
          }}>
          {entry.story}
        </p>
      </div>
    </div>
  );
}

function DeskCard({
  entry,
  pos,
  onClick,
  touch,
}: {
  entry: LensEntry;
  pos: (typeof POSITIONS)[0];
  onClick: () => void;
  touch: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="text-left group shore-desk-card"
      onClick={onClick}
      onMouseEnter={touch ? undefined : () => setHovered(true)}
      onMouseLeave={touch ? undefined : () => setHovered(false)}
      onFocus={touch ? undefined : () => setHovered(true)}
      onBlur={touch ? undefined : () => setHovered(false)}
      aria-label={`${entry.company}: ${entry.iStatement}`}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        transform: touch
          ? `rotate(${pos.rot}deg)`
          : hovered
            ? "rotate(0deg) translateY(-12px) scale(1.04)"
            : `rotate(${pos.rot}deg)`,
        transition: touch
          ? undefined
          : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
      {/* Card — responsive width via CSS classes */}
      <div className="shore-card-w" style={{ pointerEvents: "none" }}>
        {renderCard(entry, {
          boxShadow: touch
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : hovered
              ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px var(--gold-dim)"
              : "0 4px 20px rgba(0,0,0,0.3)",
        })}
      </div>
      {/* I-statement — always visible on touch, hover on desktop */}
      <div
        className="shore-i-stmt text-center"
        style={{
          marginTop: 8,
          fontFamily: "var(--font-narrator)",
          fontStyle: "italic",
          fontSize: touch ? 11 : 13,
          lineHeight: 1.4,
          color: "var(--gold)",
          ...(touch
            ? {}
            : {
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }),
        }}>
        {entry.iStatement}
      </div>
      <div
        className="font-ui mt-1 text-center"
        style={{
          fontSize: 8,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: COMPANY_LABEL.color,
          opacity: touch ? COMPANY_LABEL.visible : hovered ? COMPANY_LABEL.visible : COMPANY_LABEL.resting,
          transition: touch ? undefined : "opacity 0.3s ease",
        }}>
        {entry.company}
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
  const canHover = useMediaQuery("(hover: hover)");
  const touch = !canHover;

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
    <div
      ref={sectionRef}
      style={{
        background: "var(--bg)",
        paddingBottom: 100,
        position: "relative",
        zIndex: 5,
      }}>
      {/* Transition narrator */}
      <div className="flex items-center justify-center px-8 pt-20 pb-8">
        <p
          className="font-narrator text-center"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
            color: "var(--cream-muted)",
            maxWidth: 520,
          }}>
          The rest are here if you want them.
        </p>
      </div>

      {/* Desk grid — responsive columns */}
      <div
        ref={contentRef}
        className="mx-auto px-6 sm:px-8 lg:px-12"
        style={{
          maxWidth: 1200,
          opacity: 0,
          willChange: "transform, opacity",
        }}>
        <style>{`
          .shore-card-w { width: 100%; }

          /* ── Mobile (<640): 2 cols, no scatter, cards zoomed to fit, i-statements visible ── */
          @media (max-width: 639px) {
            .shore-grid-item { transform: none !important; width: calc(50% - 8px); }
            .shore-desk-card { transform: none !important; width: 100%; }
            .shore-i-stmt { opacity: 1 !important; transform: none !important; font-size: 11px !important; line-height: 1.35 !important; margin-top: 5px !important; }
            .shore-card-w { width: 100%; zoom: 0.62; }
          }

          /* ── Tablet: 3 columns ── */
          @media (min-width: 640px) {
            .shore-grid-item { width: 200px; }
          }
          /* ── Desktop: 4 columns ── */
          @media (min-width: 1024px) {
            .shore-grid-item { width: 220px; }
          }
          @media (min-width: 1280px) {
            .shore-grid-item { width: 260px; }
          }
        `}</style>
        <div
          className="shore-grid flex flex-wrap justify-center gap-y-10 sm:gap-y-12 gap-x-4 sm:gap-x-6"
          style={{ padding: "8px" }}>
          {REMAINING_ENTRIES.map((entry, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            return (
              <div
                key={entry.id}
                className="shore-grid-item min-w-0"
                style={{
                  transform: `translate(${pos.nudgeX}px, ${pos.nudgeY}px)`,
                }}>
                <DeskCard
                  entry={entry}
                  pos={pos}
                  touch={touch}
                  onClick={() => setSelected(entry)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {selected && <StoryOverlay entry={selected} onClose={handleClose} />}
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

  const isSmUp = useBreakpoint(BREAKPOINTS.sm);
  const scrollHeight = isSmUp ? CONTAINER_HEIGHT_VH : Math.ceil(CONTAINER_HEIGHT_VH * MOBILE_SCROLL_FACTOR);

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
          height: `${scrollHeight}vh`,
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
