"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  CategoryTags,
  DetailOverlay,
  ListRow,
  ListRowArrow,
  LIST_ROW_ARROW_STYLE,
  LIST_ROW_TONE,
  SectionGlow,
} from "@components";
import { ACT_III, MGMT_STORIES, type ManagementStory } from "@data";
import {
  CSS_EASE,
  GLOW_OPACITY,
  SCROLL_RANGE,
  SECTION_ID,
  TOKENS,
  TRANSITION,
} from "@utilities";
import { ActSectionContent } from "../act-section-content";
import type { CaseStudyCardProps, StoryDetailOverlayProps } from "./act-iii.types";

const { cream, fontMono, fontSerif, textDim } = TOKENS;
const { ACT_LEADER } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const { act, color } = ACT_III;

function StoryDetailOverlay({
  story,
  actLabel,
  color,
  onClose,
}: StoryDetailOverlayProps) {
  return (
    <DetailOverlay onClose={onClose}>
      {({ item }) => (
        <>
          <p
            style={{
              fontFamily: fontMono,
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
              fontFamily: fontSerif,
              fontWeight: 400,
              fontSize: "clamp(44px, 7vw, 96px)",
              color: cream,
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
              color: textDim,
              maxWidth: 580,
              ...item(0.16),
            }}>
            {story.text}
          </p>
        </>
      )}
    </DetailOverlay>
  );
}

function CaseStudyCard({ story, color, onSelect }: CaseStudyCardProps) {
  return (
    <ListRow
      color={color}
      onClick={onSelect}
      tone={LIST_ROW_TONE.MUTED}
      className="flex items-start justify-between gap-4">
      {({ hovered }) => (
        <>
          <div className="min-w-0 flex-1">
            <div className="mb-2">
              <CategoryTags tags={story.tags} />
            </div>
            <h4
              style={{ color: hovered ? color : undefined }}
              className="text-base font-medium text-[var(--cream)] transition-colors">
              {story.title}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
              {story.teaser}
            </p>
          </div>
          <ListRowArrow hovered={hovered} color={color} variant={LIST_ROW_ARROW_STYLE.LINE} />
        </>
      )}
    </ListRow>
  );
}

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
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  return (
    <div id={ACT_LEADER} ref={ref} className="relative py-24 sm:py-32">
      <SectionGlow opacity={glowOpacity} color={color} size="lg" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <ActSectionContent {...ACT_III}>
          <button
            onClick={() => setShowCaseStudies(!showCaseStudies)}
            onMouseEnter={() => setCaseStudiesHovered(true)}
            onMouseLeave={() => setCaseStudiesHovered(false)}
            style={{ color: caseStudiesHovered ? cream : color }}
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
                    color={color}
                    onSelect={() => setSelectedStory(story)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ActSectionContent>
      </div>

      {selectedStory ? (
        <StoryDetailOverlay
          story={selectedStory}
          actLabel={act}
          color={color}
          onClose={() => setSelectedStory(null)}
        />
      ) : null}
    </div>
  );
}
