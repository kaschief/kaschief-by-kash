"use client";

import { useState, useRef, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  FadeUp,
  FadeIn,
  RevealLine,
  TRANSITION,
  CSS_EASE,
  SCROLL_RANGE,
  GLOW_OPACITY,
} from "./motion";
import { TOKENS } from "@/lib/tokens";
import { TradingArsenal } from "./trading-system";
import { SectionGlow } from "./ui/section-glow";
import { SectionLabel } from "./ui/section-label";
import { TakeawayBlock } from "./ui/takeaway-block";
import { StatsGrid } from "./ui/stats-grid";
import { CategoryTags } from "./ui/category-tags";
import { DetailModal, ModalCloseButton } from "./ui/detail-modal";
import { SectionProse } from "./ui/section-prose";
import { MonoLabel } from "./ui/mono-label";
import {
  JOBS,
  MGMT_STORIES,
  ACT_I,
  ACT_II,
  ACT_III,
  ACT_IV,
  type ActContent,
  type Job,
  type ManagementStory,
} from "@/data/timeline";
import { SECTION_ID } from "@/lib/sections";

/* ------------------------------------------------------------------ */
/*  Shared two-column section layout (Acts II, III, IV)               */
/* ------------------------------------------------------------------ */

interface ActSectionContentProps extends ActContent {
  children?: ReactNode;
}

function ActSectionContent({
  act,
  title,
  period,
  location,
  color,
  lead,
  body,
  takeaway,
  takeawaySerif,
  stats,
  statsColor,
  children,
}: ActSectionContentProps) {
  return (
    <>
      <SectionLabel label={act} color={color} />
      <RevealLine>
        <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
          {title}
        </h3>
      </RevealLine>
      <FadeUp delay={0.2}>
        <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
          {period} · {location}
        </p>
      </FadeUp>

      <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          <SectionProse lead={lead} body={body} delay={0.3} />
          <TakeawayBlock
            text={takeaway}
            color={color}
            delay={0.35}
            serif={takeawaySerif}
            className="mt-12"
          />
        </div>
        <FadeUp delay={0.25}>
          <StatsGrid stats={stats} color={statsColor ?? color} />
        </FadeUp>
      </div>

      {children && (
        <FadeUp delay={0.4}>
          <div className="mt-16 max-w-2xl mx-auto">{children}</div>
        </FadeUp>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT I — The Nurse                                                  */
/* ------------------------------------------------------------------ */

function ActI() {
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

  const {
    act,
    title,
    period,
    location,
    color,
    takeaway,
    intro,
    detail,
    features,
  } = ACT_I;

  return (
    <div
      id={SECTION_ID.ACT_NURSE}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <SectionLabel label={act} color={color} />
        <RevealLine>
          <h3 className="font-serif text-4xl font-normal tracking-[-0.02em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
            {title}
          </h3>
        </RevealLine>
        <FadeUp delay={0.2}>
          <p className="mt-4 font-mono text-xs text-[var(--text-faint)]">
            {period} · {location}
          </p>
        </FadeUp>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <SectionProse lead={intro} body={detail} delay={0.2} />
          <FadeUp delay={0.3}>
            <div className="space-y-4">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-5">
                  <p
                    className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.25em]"
                    style={{ color }}>
                    {f.label}
                  </p>
                  <p className="text-sm text-[var(--cream-muted)]">{f.text}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <TakeawayBlock
          text={takeaway}
          color={color}
          delay={0.4}
          className="mt-20"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT II — The Engineer                                              */
/* ------------------------------------------------------------------ */

function JobRow({
  job,
  onSelect,
  color = TOKENS.gold,
}: {
  job: Job;
  onSelect: () => void;
  color?: string;
}) {
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

function ActII() {
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

      <AnimatePresence>
        {selectedJob && (
          <DetailModal
            variant="overlay"
            color={ACT_II.color}
            onClose={() => setSelectedJob(null)}>
            <div className="overflow-y-auto p-8 sm:p-12">
              <div className="mb-8 border-b border-[var(--stroke)] pb-8">
                <p className="mb-2 font-mono text-xs text-[var(--text-faint)]">
                  {selectedJob.period} · {selectedJob.location}
                </p>
                <h2 className="font-serif text-3xl text-[var(--cream)] sm:text-4xl">
                  {selectedJob.company}
                </h2>
                <p className="mt-2 text-lg text-[var(--cream-muted)]">
                  {selectedJob.role}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {selectedJob.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        color: ACT_II.color,
                        borderColor: `color-mix(in srgb, ${ACT_II.color} 30%, transparent)`,
                      }}
                      className="rounded-full border px-3 py-1 font-mono text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-6 text-base leading-[1.9] text-[var(--cream-muted)]">
                <p>{selectedJob.deepDive.context}</p>
                <p>{selectedJob.deepDive.contribution}</p>
                <p className="text-[var(--cream)]">
                  {selectedJob.deepDive.outcome}
                </p>
              </div>
              <div className="mt-8 border-t border-[var(--stroke)] pt-6">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: ACT_II.color }}
                  className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors hover:text-[var(--cream)]">
                  {selectedJob.url.replace("https://", "")}
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
          </DetailModal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT III — The Leader                                               */
/* ------------------------------------------------------------------ */

function CaseStudyCard({
  story,
  color,
  onSelect,
}: {
  story: ManagementStory;
  color: string;
  onSelect: () => void;
}) {
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
          ? `color-mix(in srgb, ${color} 40%, transparent)`
          : undefined,
      }}
      className="group w-full cursor-pointer border-b border-[var(--stroke)] py-6 text-left transition-colors">
      <div className="mb-2">
        <CategoryTags tags={story.tags} />
      </div>
      <div className="flex items-start justify-between gap-4">
        <h4
          style={{ color: hovered ? color : undefined }}
          className="text-base font-medium text-[var(--cream)] transition-colors">
          {story.title}
        </h4>
        <span
          style={{ color: hovered ? color : undefined }}
          className="mt-1 shrink-0 text-[var(--text-faint)] transition-all group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
        {story.teaser}
      </p>
    </motion.button>
  );
}

function ActIII() {
  const [selectedStory, setSelectedStory] = useState<ManagementStory | null>(
    null,
  );
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [caseStudiesHovered, setCaseStudiesHovered] = useState(false);
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
      id={SECTION_ID.ACT_LEADER}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={ACT_III.color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_III}>
          <button
            onClick={() => setShowCaseStudies(!showCaseStudies)}
            onMouseEnter={() => setCaseStudiesHovered(true)}
            onMouseLeave={() => setCaseStudiesHovered(false)}
            style={{ color: caseStudiesHovered ? TOKENS.cream : ACT_III.color }}
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-wider transition-colors">
            <ChevronDown
              size={12}
              className={`transition-transform duration-300 ${showCaseStudies ? "-rotate-180" : ""}`}
            />
            Case studies
          </button>
          {/* CSS grid accordion — no height measurement, no interaction with parent transforms */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: showCaseStudies ? "1fr" : "0fr",
              transition: `grid-template-rows ${TRANSITION.page.duration}s ${CSS_EASE}`,
              overflowAnchor: "none",
            }}>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  opacity: showCaseStudies ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
                className="pt-10 border-l border-[var(--stroke)] pl-6 pr-2 sm:pl-8">
                {MGMT_STORIES.map((story) => (
                  <CaseStudyCard
                    key={story.id}
                    story={story}
                    color={ACT_III.color}
                    onSelect={() => setSelectedStory(story)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ActSectionContent>
      </div>

      <AnimatePresence>
        {selectedStory && (
          <DetailModal
            variant="overlay"
            color={ACT_III.color}
            onClose={() => setSelectedStory(null)}>
            <div className="overflow-y-auto p-8 sm:p-12">
              <CategoryTags tags={selectedStory.tags} />
              <h2 className="mt-4 font-serif text-3xl text-[var(--cream)] sm:text-4xl">
                {selectedStory.title}
              </h2>
              <p className="mt-6 text-base leading-[1.9] text-[var(--cream-muted)]">
                {selectedStory.text}
              </p>
            </div>
          </DetailModal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT IV — The Builder                                               */
/* ------------------------------------------------------------------ */

function ActIV() {
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
      id={SECTION_ID.ACT_BUILDER}
      ref={ref}
      className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={ACT_IV.color} size="lg" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_IV} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActI />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIV />
      <TradingArsenal />
    </section>
  );
}
