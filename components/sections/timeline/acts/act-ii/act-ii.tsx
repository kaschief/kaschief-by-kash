"use client";

import { useState, useRef, useCallback } from "react";
import { useScroll, useTransform } from "framer-motion";
import { FadeIn, SCROLL_RANGE, GLOW_OPACITY } from "@/components/motion";
import { SectionGlow } from "@/components/ui/section-glow";
import { MonoLabel } from "@/components/ui/mono-label";
import { ActSectionContent } from "@/components/sections/timeline/acts/act-section-content";
import { ACT_II, JOBS } from "@/data/timeline";
import { SECTION_ID } from "@/lib/sections";
import { JobRow } from "./job-row";
import { JobTakeover } from "./job-takeover";

/* ------------------------------------------------------------------ */
/*  Act II — The Engineer                                               */
/* ------------------------------------------------------------------ */

export function ActII() {
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
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
  const selectedJob =
    selectedJobIndex !== null ? JOBS[selectedJobIndex] ?? null : null;
  const canGoPrevJob = selectedJobIndex !== null && selectedJobIndex > 0;
  const canGoNextJob =
    selectedJobIndex !== null && selectedJobIndex < JOBS.length - 1;

  const handleCloseTakeover = useCallback(() => {
    setSelectedJobIndex(null);
  }, []);

  const handlePrevJob = useCallback(() => {
    setSelectedJobIndex((current) => {
      if (current === null || current <= 0) return current;
      return current - 1;
    });
  }, []);

  const handleNextJob = useCallback(() => {
    setSelectedJobIndex((current) => {
      if (current === null || current >= JOBS.length - 1) return current;
      return current + 1;
    });
  }, []);

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
          {JOBS.map((job, index) => (
            <JobRow
              key={job.id}
              job={job}
              color={ACT_II.color}
              onSelect={() => setSelectedJobIndex(index)}
            />
          ))}
        </ActSectionContent>
      </div>

      {selectedJob && (
        <JobTakeover
          job={selectedJob}
          actLabel={ACT_II.act}
          color={ACT_II.color}
          onClose={handleCloseTakeover}
          onPrev={handlePrevJob}
          onNext={handleNextJob}
          canGoPrev={canGoPrevJob}
          canGoNext={canGoNextJob}
        />
      )}
    </div>
  );
}
