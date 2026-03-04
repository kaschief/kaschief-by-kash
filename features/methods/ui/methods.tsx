"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { SectionGlow } from "@components";
import { METHOD_GROUPS } from "@data";
import { usePreserveScrollAnchor, useSectionScroll } from "@hooks";
import { EASE, SECTION_ID, TOKENS } from "@utilities";
import {
  closeSkillDetailOverlayState,
  createOpenSkillDetailOverlayState,
  deriveSkillDetailOverlayNavigation,
  moveSkillDetailOverlaySelection,
  SKILL_DETAIL_OVERLAY_INITIAL_STATE,
  type SkillDetailOverlayState,
} from "../model/skill-detail-overlay";
import { Panel } from "./panel";
import { SkillDetailOverlay } from "./skill-detail-overlay";
import { SkillRow } from "./skill-row";

const { cream, gold, textDim, textFaint } = TOKENS;
const { METHODS } = SECTION_ID;
const groupLength = METHOD_GROUPS.length;

export function Methods() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [detailOverlayState, setDetailOverlayState] =
    useState<SkillDetailOverlayState>(SKILL_DETAIL_OVERLAY_INITIAL_STATE);
  const [mobilePanel, setMobilePanel] = useState(0);
  const {
    anchorRef: mobileContentRef,
    captureAnchor: captureMobileContentAnchor,
  } = usePreserveScrollAnchor<HTMLDivElement>(mobilePanel);

  const {
    activeSkill,
    canGoPrev: canGoPrevSkill,
    canGoNext: canGoNextSkill,
  } = deriveSkillDetailOverlayNavigation(detailOverlayState, METHOD_GROUPS);

  const inView = useInView(outerRef, { once: true, amount: 0.05 });
  const { scrollToY } = useSectionScroll();

  const scrollToPanel = (panelIndex: number) => {
    if (!outerRef.current) return;

    const outerTop =
      window.scrollY + outerRef.current.getBoundingClientRect().top;
    const scrollable = outerRef.current.offsetHeight - window.innerHeight;
    const panelScrollHeight = scrollable / (groupLength - 1);

    scrollToY(outerTop + panelIndex * panelScrollHeight, {
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let snapTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (!outerRef.current) return;

      const rect = outerRef.current.getBoundingClientRect();
      const scrollable = outerRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const p = Math.max(0, Math.min(1, -rect.top / scrollable));
      setProgress(p);

      clearTimeout(snapTimeout);
      if (p > 0.05 && p < 0.95) {
        snapTimeout = setTimeout(() => {
          if (!outerRef.current) return;

          const targetPanel = Math.round(p * (groupLength - 1));
          const outerTop =
            window.scrollY + outerRef.current.getBoundingClientRect().top;
          const scrollable2 =
            outerRef.current.offsetHeight - window.innerHeight;
          const panelScrollHeight = scrollable2 / (groupLength - 1);

          scrollToY(outerTop + targetPanel * panelScrollHeight, {
            behavior: "smooth",
          });
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(snapTimeout);
    };
  }, [scrollToY]);

  const panelProgress = progress * (groupLength - 1);
  const activePanelIndex = Math.round(panelProgress);

  const skillDetailOverlay = activeSkill && (
    <SkillDetailOverlay
      skill={activeSkill.skill}
      groupLabel={activeSkill.groupLabel}
      onClose={() => setDetailOverlayState(closeSkillDetailOverlayState())}
      onPrev={() =>
        setDetailOverlayState((previous) =>
          moveSkillDetailOverlaySelection(previous, METHOD_GROUPS, "prev"),
        )
      }
      onNext={() =>
        setDetailOverlayState((previous) =>
          moveSkillDetailOverlaySelection(previous, METHOD_GROUPS, "next"),
        )
      }
      canGoPrev={canGoPrevSkill}
      canGoNext={canGoNextSkill}
    />
  );

  return (
    <div id={METHODS} style={{ position: "relative" }}>
      <div
        ref={outerRef}
        className="hidden lg:block"
        style={{ height: `${groupLength * 60}vh` }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
          }}>
          <SectionGlow color={gold} size="lg" />
          <motion.div
            style={{ position: "relative", width: "100%", height: "100%" }}
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE }}>
            {METHOD_GROUPS.map((group, i) => (
              <Panel
                key={group.id}
                group={group}
                index={i}
                panelProgress={panelProgress}
                activePanelIndex={activePanelIndex}
                onSkillSelect={(skill, groupLabel, groupIndex, skillIndex) =>
                  setDetailOverlayState(
                    createOpenSkillDetailOverlayState({
                      skill,
                      groupLabel,
                      groupIndex,
                      skillIndex,
                    }),
                  )
                }
                onScrollToPanel={scrollToPanel}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-16 lg:hidden">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-6 flex items-center gap-3">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: gold }}
            />
            <span
              className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: gold }}>
              Methods
            </span>
          </div>

          <div
            className="mb-8 flex overflow-x-auto border-b border-[var(--stroke)]"
            style={{ scrollbarWidth: "none" }}>
            {METHOD_GROUPS.map((group, i) => (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  if (i === mobilePanel) return;
                  captureMobileContentAnchor();
                  setMobilePanel(i);
                }}
                className="mr-6 shrink-0 whitespace-nowrap pb-3 font-mono text-xs uppercase tracking-wider transition-colors"
                style={{
                  color: i === mobilePanel ? cream : textFaint,
                  borderBottom:
                    i === mobilePanel
                      ? `2px solid ${gold}`
                      : "2px solid transparent",
                }}>
                {group.label}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false} mode="wait">
            <motion.div
              ref={mobileContentRef}
              key={mobilePanel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}>
              <h2
                className="font-serif text-4xl font-normal tracking-[-0.02em]"
                style={{
                  color: cream,
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}>
                {METHOD_GROUPS[mobilePanel].label}
              </h2>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: textDim }}>
                {METHOD_GROUPS[mobilePanel].description}
              </p>
              {METHOD_GROUPS[mobilePanel].skills.map((skill, i) => (
                <SkillRow
                  key={skill.id}
                  label={skill.label}
                  onSelect={() =>
                    setDetailOverlayState(
                      createOpenSkillDetailOverlayState({
                        skill,
                        groupLabel: METHOD_GROUPS[mobilePanel].label,
                        groupIndex: mobilePanel,
                        skillIndex: i,
                      }),
                    )
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {skillDetailOverlay}
    </div>
  );
}
