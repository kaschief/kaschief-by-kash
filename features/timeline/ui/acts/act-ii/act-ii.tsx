"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { ActLabel, Takeaway } from "@components";
import { ACT_II, COMPANIES, type Company } from "@data";
import { EASE, GLOW_OPACITY, SCROLL_RANGE, SECTION_ID } from "@utilities";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";

import {
  act,
  body,
  BODY_MAX_W,
  COLOR,
  COLOR_RGBA,
  CONTENT_MAX_W,
  SECTION_BG,
  splash,
  SPLASH_MAX_W,
  title,
  TERMINAL_BG,
  TERMINAL_TITLE_BG,
} from "./act-ii.constants";
import { TerminalAtmosphere } from "./terminal-atmosphere";
import { ScrambleText } from "./scramble-text";
import { CommitEntry } from "./commit-entry";
import { RepoPanel } from "./repo-panel";

const { ACT_ENGINEER } = SECTION_ID;
const { glow } = SCROLL_RANGE;

export function ActII() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.05 });
  const titleInView = useInView(titleRef, { once: true, amount: 0.5 });
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  const handleClose = useCallback(() => setSelectedCompany(null), []);

  // Close repo panel when user navigates via nav bar
  useEffect(() => {
    const close = () => setSelectedCompany(null);
    window.addEventListener(NAVIGATION_SCROLL_EVENT, close);
    return () => window.removeEventListener(NAVIGATION_SCROLL_EVENT, close);
  }, []);

  return (
    <div
      id={ACT_ENGINEER}
      ref={sceneRef}
      className="relative min-h-screen py-24 sm:py-32"
      style={{ backgroundColor: SECTION_BG }}>
      <TerminalAtmosphere glowOpacity={glowOpacity} />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto px-(--page-gutter)" style={{ maxWidth: CONTENT_MAX_W }}>
        {/* Act header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE }}>
          <ActLabel label={act} color={COLOR} inView={inView} />
          <h2
            ref={titleRef}
            className="font-sans text-4xl font-bold tracking-[-0.03em] text-(--cream) sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]">
            <ScrambleText
              text={title.toUpperCase().replace(/I/, "1")}
              active={titleInView}
              staggerMs={70}
              cyclesPerChar={6}
              intervalMs={70}
            />
          </h2>
          <p className="mx-auto mt-6 font-serif text-sm leading-relaxed text-(--cream-muted) italic sm:text-base md:text-lg lg:text-xl" style={{ maxWidth: SPLASH_MAX_W }}>
            {splash}
          </p>
          <p className="mx-auto mt-5 text-xs leading-[1.7] text-(--text-dim) sm:text-[13px] sm:mt-6 md:text-sm lg:text-base" style={{ maxWidth: BODY_MAX_W }}>
            {body}
          </p>
        </motion.div>

        {/* Terminal title bar */}
        <motion.div
          className="flex items-center gap-2 rounded-t-lg border border-b-0 border-(--stroke) px-4 py-2.5"
          style={{ backgroundColor: TERMINAL_TITLE_BG }}
          initial={{ opacity: 0, y: -15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}>
          <span className="h-2.5 w-2.5 rounded-full bg-(--act-red)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--act-gold)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--act-green)" />
          <span className="ml-3 font-mono text-[11px] text-(--text-faint)">
            kaschief — ~/career — git log --oneline
          </span>
        </motion.div>

        {/* Terminal body */}
        <motion.div
          className="rounded-b-lg border border-(--stroke) p-4 sm:p-5 md:p-6 lg:p-8"
          style={{ backgroundColor: TERMINAL_BG }}
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}>
          {/* Prompt line */}
          <motion.div
            className="mb-8 font-mono text-[13px]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}>
            <span style={{ color: COLOR }}>~/career</span>
            <span className="text-(--text-faint)"> $ </span>
            <span className="text-(--cream)">git log --graph --all</span>
            <span
              className="ml-1 inline-block h-4 w-2"
              style={{
                backgroundColor: COLOR,
                animation: "cursor-blink 1s step-end infinite",
              }}
            />
          </motion.div>

          {/* Commit entries */}
          {COMPANIES.map((company, i) => (
            <CommitEntry
              key={company.hash}
              company={company}
              index={i}
              onSelect={() => setSelectedCompany(company)}
            />
          ))}
        </motion.div>

        {/* Bottom separator */}
        <motion.div
          className="mx-auto mt-20 h-px max-w-lg"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            background: `linear-gradient(90deg, transparent, ${COLOR_RGBA(0.2)}, transparent)`,
          }}
        />
      </div>

      {ACT_II.takeaway && (
        <Takeaway id="act-ii-takeaway" text={ACT_II.takeaway} />
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedCompany && (
              <RepoPanel company={selectedCompany} onClose={handleClose} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
