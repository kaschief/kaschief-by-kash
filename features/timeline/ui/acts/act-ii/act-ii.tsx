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
import { ActLabel } from "@components";
import { ACT_II, COMPANIES, type Company } from "@data";
import { EASE, GLOW_OPACITY, SCROLL_RANGE, SECTION_ID } from "@utilities";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";

import {
  ACT_BLUE,
  BODY_MAX_W,
  CONTENT_MAX_W,
  SECTION_BG,
  SPLASH_MAX_W,
  TERMINAL_BG,
  TERMINAL_BORDER,
  TERMINAL_TITLE_BG,
} from "./act-ii.constants";
import { TerminalAtmosphere } from "./terminal-atmosphere";
import { ScrambleText } from "./scramble-text";
import { CommitEntry } from "./commit-entry";
import { Distillation } from "./distillation";
import { RepoPanel } from "./repo-panel";

const { ACT_ENGINEER } = SECTION_ID;
const { glow } = SCROLL_RANGE;

export function ActII() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.05 });
  const titleInView = useInView(titleRef, { once: true, amount: 0.5 });
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  // Fade the terminal out fast — tight 20% viewport window
  const { scrollYProgress: termExit } = useScroll({
    target: terminalRef,
    offset: ["end 0.6", "end 0.4"],
  });
  const terminalOpacity = useTransform(termExit, [0, 1], [1, 0]);

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
      className="relative min-h-screen min-h-[100svh] py-24 sm:py-32"
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
          <ActLabel label={ACT_II.act} color={ACT_BLUE} inView={inView} />
          <h2
            ref={titleRef}
            className="font-sans text-4xl font-bold tracking-[-0.03em] text-(--cream) sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]">
            {ACT_II.title.toUpperCase().replace(/I/, "1").split(" ").map((word, i) => (
              <span key={i} className="block">
                <ScrambleText
                  text={word}
                  active={titleInView}
                  staggerMs={70}
                  cyclesPerChar={6}
                  intervalMs={70}
                />
              </span>
            ))}
          </h2>
          <p className="mx-auto mt-6 font-serif text-sm leading-relaxed text-(--cream-muted) italic sm:text-base md:text-lg lg:text-xl" style={{ maxWidth: SPLASH_MAX_W }}>
            {ACT_II.splash}
          </p>
          <p className="mx-auto mt-5 text-xs leading-[1.7] text-(--text-dim) sm:text-[13px] sm:mt-6 md:text-sm lg:text-base" style={{ maxWidth: BODY_MAX_W }}>
            {ACT_II.body}
          </p>
        </motion.div>

        {/* Terminal — fades out quickly as it exits viewport */}
        <motion.div ref={terminalRef} style={{ opacity: terminalOpacity }}>
          {/* Terminal title bar */}
          <motion.div
            className="flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5"
            style={{ backgroundColor: TERMINAL_TITLE_BG, borderColor: TERMINAL_BORDER }}
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
            className="rounded-b-lg border p-4 sm:p-5 md:p-6 lg:p-8"
            style={{ backgroundColor: TERMINAL_BG, borderColor: TERMINAL_BORDER }}
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}>
            {/* Prompt line */}
            <motion.div
              className="mb-8 font-mono text-[13px]"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}>
              <span style={{ color: ACT_BLUE }}>~/career</span>
              <span className="text-(--text-faint)"> $ </span>
              <span className="text-(--cream)">git log --graph --all</span>
              <span
                className="ml-1 inline-block h-4 w-2"
                style={{
                  backgroundColor: ACT_BLUE,
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
                isLast={i === COMPANIES.length - 1}
                onSelect={() => setSelectedCompany(company)}
              />
            ))}
          </motion.div>
        </motion.div>

      </div>

      <Distillation />

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
