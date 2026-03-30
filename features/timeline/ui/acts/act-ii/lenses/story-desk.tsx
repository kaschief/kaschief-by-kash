"use client";

/**
 * Story Desk — resting composition with hover/click exploration.
 * Story Desk for Act II — remaining storycards in a scattered grid layout.
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { COMPANY_LABEL, STORY_STYLE, I_STATEMENT_STYLE } from "./lenses.config";
import { REMAINING_ENTRIES } from "./card-config";
import { renderCard } from "./render-card";
import type { LensEntry } from "@data";
import { useMediaQuery } from "@hooks";
import { CONTENT } from "../act-ii.data";

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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop dismiss: Escape key handled via document keydown listener in useEffect above
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-end sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Story: ${entry.question}`}
      style={{
        zIndex: 10001,
        background: "rgba(4,4,6,0.94)",
        backdropFilter: "blur(20px)",
        overscrollBehavior: "none",
        touchAction: "none",
      }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}>
      {/* Hidden scrollbar styles */}
      <style>{`
        .overlay-scroll::-webkit-scrollbar { display: none; }
        .overlay-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Entry animation */}
      <style>{`
        @keyframes overlay-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- click stops propagation to backdrop; keyboard close handled by Escape listener */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full overlay-scroll overflow-y-auto outline-none flex flex-col items-center rounded-t-2xl sm:rounded-none"
        style={{
          maxWidth: 900,
          maxHeight: "92vh",
          padding: "0 clamp(20px, 5vw, 64px)",
          paddingBottom: "clamp(48px, 8vh, 80px)",
          animation: "overlay-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
          willChange: "transform, opacity",
        }}
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>
        {/* Mobile grabber pill — anchored at top of sheet */}
        <div className="sm:hidden flex justify-center pt-3 pb-6 w-full">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.25)",
            }}
          />
        </div>
        {/* Desktop: subtle close × aligned top-right of content */}
        <div className="hidden sm:flex w-full justify-end" style={{ paddingTop: "clamp(16px, 3vh, 32px)", paddingBottom: 8 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "1px solid var(--text-faint)",
              borderRadius: 999,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-faint)",
              fontSize: 15,
              lineHeight: 1,
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--cream-muted)"; e.currentTarget.style.borderColor = "var(--cream-muted)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.borderColor = "var(--text-faint)"; }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Card — scaled down, artifact not the hero */}
        <div className="mb-8 sm:mb-10" style={{ maxWidth: 340, width: "100%" }}>
          {renderCard(entry, { boxShadow: "0 4px 24px rgba(0,0,0,0.3)" })}
        </div>

        {/* Divider — subtle gold hairline separating artifact from narrative */}
        <div
          className="mb-6 sm:mb-8"
          style={{
            width: 40,
            height: 1,
            background: "var(--gold-dim)",
            opacity: 0.5,
          }}
        />

        {/* Company */}
        <div
          className="font-ui text-center mb-5 sm:mb-6"
          style={{
            fontSize: "clamp(9px, 1vw, 11px)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: COMPANY_LABEL.color,
            opacity: COMPANY_LABEL.visible,
          }}>
          {entry.company} &middot; {entry.years}
        </div>

        {/* Headline (question) */}
        <p
          className="font-serif text-center"
          style={{
            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
            color: "var(--cream)",
            fontWeight: 500,
            maxWidth: 560,
            marginBottom: "clamp(14px, 2.5vh, 24px)",
          }}>
          {entry.question}
        </p>

        {/* I-statement — the hero */}
        <p
          className="font-serif text-center"
          style={{
            ...I_STATEMENT_STYLE,
            fontSize: "clamp(1.15rem, 2.4vw, 1.65rem)",
            maxWidth: 620,
            marginBottom: "clamp(20px, 3.5vh, 36px)",
          }}>
          {entry.iStatement}
        </p>

        {/* Story */}
        <p
          className="font-sans text-center"
          style={{
            ...STORY_STYLE,
            fontSize: "clamp(0.82rem, 1.05vw, 0.95rem)",
            lineHeight: 1.9,
            maxWidth: 560,
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
      className="text-left group story-desk-card"
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
      <div className="story-card-w" style={{ pointerEvents: "none" }}>
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
        className="story-i-stmt text-center"
        style={{
          marginTop: 8,
          fontFamily: "var(--font-narrator)",
          fontStyle: "italic",
          fontSize: touch ? 13 : 13,
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
          opacity: touch
            ? COMPANY_LABEL.visible
            : hovered
              ? COMPANY_LABEL.visible
              : COMPANY_LABEL.resting,
          transition: touch ? undefined : "opacity 0.3s ease",
        }}>
        {entry.company}
      </div>
    </button>
  );
}

export function StoryDesk() {
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
          {CONTENT.storyDeskIntro}
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
          .story-card-w { width: 100%; }

          /* ── Mobile (<640): 2 cols, no scatter, cards zoomed to fit, i-statements visible ── */
          @media (max-width: 639px) {
            .story-grid-item { transform: none !important; width: calc(50% - 8px); }
            .story-desk-card { transform: none !important; width: 100%; }
            .story-i-stmt { opacity: 1 !important; transform: none !important; font-size: 11px !important; line-height: 1.35 !important; margin-top: 5px !important; }
            .story-card-w { width: 100%; zoom: 0.62; }
          }

          /* ── Tablet: 3 columns ── */
          @media (min-width: 640px) {
            .story-grid-item { width: 200px; }
          }
          /* ── Desktop: 4 columns ── */
          @media (min-width: 1024px) {
            .story-grid-item { width: 220px; }
          }
          @media (min-width: 1280px) {
            .story-grid-item { width: 260px; }
          }
        `}</style>
        <div
          className="story-grid flex flex-wrap justify-center gap-y-10 sm:gap-y-12 gap-x-4 sm:gap-x-6"
          style={{ padding: "8px" }}>
          {REMAINING_ENTRIES.map((entry, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            return (
              <div
                key={entry.id}
                className="story-grid-item min-w-0"
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

      {selected &&
        createPortal(
          <StoryOverlay entry={selected} onClose={handleClose} />,
          document.body,
        )}
    </div>
  );
}
