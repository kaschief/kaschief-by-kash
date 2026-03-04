"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  TRANSITION,
  CSS_EASE,
  SCROLL_RANGE,
  GLOW_OPACITY,
  useTakeover,
} from "@/components/motion";
import { TOKENS } from "@/lib/tokens";
import { Z_INDEX } from "@/lib/constants";
import { TakeoverContent } from "@/components/ui/takeover-content";
import { SectionGlow } from "@/components/ui/section-glow";
import { CategoryTags } from "@/components/ui/category-tags";
import { ActSectionContent } from "@/components/sections/timeline/acts/act-section-content";
import { ACT_III, MGMT_STORIES, type ManagementStory } from "@/data/timeline";
import { SECTION_ID } from "@/lib/sections";
import type { CaseStudyCardProps, StoryTakeoverProps } from "./act-iii.types";

/* ------------------------------------------------------------------ */
/*  Story takeover                                                      */
/* ------------------------------------------------------------------ */

function StoryTakeover({
  story,
  actLabel,
  color,
  onClose,
}: StoryTakeoverProps) {
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
      <TakeoverContent onClick={(e) => e.stopPropagation()}>
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
            marginBottom: 32,
            ...item(0.04),
          }}>
          {story.title}
        </h2>

        <div style={{ marginBottom: 48, ...item(0.12) }}>
          <CategoryTags tags={story.tags} />
        </div>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            lineHeight: 1.85,
            color: TOKENS.textDim,
            maxWidth: 580,
            ...item(0.16),
          }}>
          {story.text}
        </p>
      </TakeoverContent>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Case study card                                                     */
/* ------------------------------------------------------------------ */

function CaseStudyCard({
  story,
  color,
  onSelect,
}: CaseStudyCardProps) {
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
          className="mt-1 hidden shrink-0 text-[var(--text-faint)] transition-all group-hover:translate-x-1 sm:block">
          →
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
        {story.teaser}
      </p>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Act III — The Leader                                                */
/* ------------------------------------------------------------------ */

export function ActIII() {
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
                className="border-l border-[var(--stroke)] pl-6 pr-2 pt-10 sm:pl-8">
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

      {selectedStory && (
        <StoryTakeover
          story={selectedStory}
          actLabel={ACT_III.act}
          color={ACT_III.color}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
