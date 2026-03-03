"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  FadeIn,
  TRANSITION,
  SCROLL_RANGE,
  GLOW_OPACITY,
  useTakeover,
} from "@/components/motion";
import { TOKENS } from "@/lib/tokens";
import { Z_INDEX } from "@/lib/constants";
import { SectionGlow } from "@/components/ui/section-glow";
import { MonoLabel } from "@/components/ui/mono-label";
import { ActSectionContent } from "@/components/acts/act-section-content";
import { ACT_II, JOBS, type Job } from "@/data/timeline";
import { SECTION_ID } from "@/lib/sections";
import type { JobRowProps, JobTakeoverProps } from "./act-ii.types";

/* ------------------------------------------------------------------ */
/*  Job takeover                                                        */
/* ------------------------------------------------------------------ */

function JobTakeover({
  job,
  actLabel,
  color,
  onClose,
}: JobTakeoverProps) {
  const { item } = useTakeover(onClose);

  return (
    <div
      onClick={() => history.back()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: Z_INDEX.takeover,
        background: TOKENS.bg,
        overflowY: "auto",
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          padding: "18vh 24px 10vh",
          width: "100%",
        }}>
        <p
          style={{
            fontFamily: TOKENS.fontMono,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color,
            marginBottom: 32,
            ...item(0.08),
          }}>
          {actLabel}
        </p>

        <h2
          style={{
            fontFamily: TOKENS.fontSerif,
            fontWeight: 400,
            fontSize: "clamp(44px, 7vw, 96px)",
            color: TOKENS.cream,
            lineHeight: 1,
            marginBottom: 16,
            ...item(0.04),
          }}>
          {job.company}
        </h2>

        <p
          style={{
            fontSize: 17,
            color: TOKENS.creamMuted,
            marginBottom: 8,
            ...item(0.1),
          }}>
          {job.role}
        </p>

        <p
          style={{
            fontFamily: TOKENS.fontMono,
            fontSize: 10,
            color: TOKENS.textFaint,
            marginBottom: 40,
            ...item(0.12),
          }}>
          {job.period} · {job.location}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 52,
            ...item(0.16),
          }}>
          {job.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: TOKENS.fontMono,
                fontSize: 10,
                color,
                border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                borderRadius: 999,
                padding: "4px 12px",
              }}>
              {t}
            </span>
          ))}
        </div>

        <div style={{ maxWidth: 580, ...item(0.2) }}>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: TOKENS.textDim,
              marginBottom: 24,
            }}>
            {job.deepDive.context}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: TOKENS.textDim,
              marginBottom: 24,
            }}>
            {job.deepDive.contribution}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: TOKENS.cream,
            }}>
            {job.deepDive.outcome}
          </p>
        </div>

        <div style={{ marginTop: 48, ...item(0.24) }}>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: TOKENS.fontMono,
              fontSize: 11,
              color,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}>
            {job.url.replace("https://", "")}
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5">
              <path d="M3 9l6-6M4 3h5v5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Job row                                                             */
/* ------------------------------------------------------------------ */

function JobRow({
  job,
  onSelect,
  color = TOKENS.gold,
}: JobRowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={TRANSITION.base}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered
          ? `color-mix(in srgb, ${color} 31%, transparent)`
          : undefined,
      }}
      className="group flex w-full cursor-pointer flex-col gap-3 border-b border-[var(--stroke)] py-8 text-left transition-colors sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <div className="flex items-baseline gap-4">
          <h4
            style={{ color: hovered ? color : undefined }}
            className="font-serif text-2xl text-[var(--cream)] transition-colors sm:text-3xl">
            {job.company}
          </h4>
          <span className="hidden font-mono text-xs text-[var(--text-faint)] sm:inline">
            {job.period}
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--cream-muted)]">{job.role}</p>
        <p className="mt-1 text-sm text-[var(--text-dim)]">{job.summary}</p>
      </div>
      <span
        style={{ color: hovered ? color : undefined }}
        className="shrink-0 text-[var(--text-faint)] transition-all group-hover:translate-x-1 sm:mt-2">
        →
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Act II — The Engineer                                               */
/* ------------------------------------------------------------------ */

export function ActII() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(
    scrollYProgress,
    SCROLL_RANGE.glow,
    GLOW_OPACITY,
  );

  return (
    <div
      id={SECTION_ID.ACT_ENGINEER}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={ACT_II.color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_II}>
          <FadeIn>
            <MonoLabel label="Companies" className="mb-6" />
          </FadeIn>
          {JOBS.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              color={ACT_II.color}
              onSelect={() => setSelectedJob(job)}
            />
          ))}
        </ActSectionContent>
      </div>

      {selectedJob && (
        <JobTakeover
          job={selectedJob}
          actLabel={ACT_II.act}
          color={ACT_II.color}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
