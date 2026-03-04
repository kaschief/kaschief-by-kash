"use client";

import { useCallback, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { FadeIn, MonoLabel, SectionGlow } from "@components";
import { ACT_II, JOBS } from "@data";
import { GLOW_OPACITY, SCROLL_RANGE, SECTION_ID } from "@utilities";
import { ActSectionContent } from "../act-section-content";
import { JobDetailOverlay } from "./job-detail-overlay";
import { JobRow } from "./job-row";

const { ACT_ENGINEER } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const { act, color } = ACT_II;

export function ActII() {
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  const selectedJob =
    selectedJobIndex !== null ? JOBS[selectedJobIndex] ?? null : null;
  const canGoPrevJob = selectedJobIndex !== null && selectedJobIndex > 0;
  const canGoNextJob =
    selectedJobIndex !== null && selectedJobIndex < JOBS.length - 1;

  const handleCloseDetailOverlay = useCallback(() => {
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
    <div id={ACT_ENGINEER} ref={ref} className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_II}>
          <FadeIn>
            <MonoLabel label="Companies" className="mb-6" />
          </FadeIn>
          {JOBS.map((job, index) => (
            <JobRow
              key={job.id}
              job={job}
              color={color}
              onSelect={() => setSelectedJobIndex(index)}
            />
          ))}
        </ActSectionContent>
      </div>

      {selectedJob ? (
        <JobDetailOverlay
          job={selectedJob}
          actLabel={act}
          color={color}
          onClose={handleCloseDetailOverlay}
          onPrev={handlePrevJob}
          onNext={handleNextJob}
          canGoPrev={canGoPrevJob}
          canGoNext={canGoNextJob}
        />
      ) : null}
    </div>
  );
}
