"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { SectionGlow } from "@components";
import { METHOD_GROUPS } from "@data";
import {
  NAVIGATION_SCROLL_EVENT,
  usePreserveScrollAnchor,
  useSectionScroll,
} from "@hooks";
import {
  DEFAULT_SCROLL_OFFSET,
  EASE,
  LAYOUT,
  SECTION_ID,
  SECTION_SCROLL_OFFSET,
  type SectionId,
  TOKENS,
} from "@utilities";
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
const { methodsPanelVh } = LAYOUT;

export function Methods() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const navScrollInFlightRef = useRef(false);
  const navScrollTargetRef = useRef<SectionId | null>(null);
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
  const methodsOffset = SECTION_SCROLL_OFFSET[METHODS] ?? DEFAULT_SCROLL_OFFSET;

  useEffect(() => {
    const handleNavScroll = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId?: SectionId }>;
      const target = customEvent.detail?.sectionId ?? null;
      navScrollTargetRef.current = target;
      navScrollInFlightRef.current = true;

      // Hide content when scrolling THROUGH Methods (not TO it)
      // so panels don't flash during pass-through.
      if (target !== METHODS && stickyRef.current) {
        stickyRef.current.style.opacity = "0";
      }
    };

    window.addEventListener(
      NAVIGATION_SCROLL_EVENT,
      handleNavScroll as EventListener,
    );
    return () => {
      window.removeEventListener(
        NAVIGATION_SCROLL_EVENT,
        handleNavScroll as EventListener,
      );
    };
  }, []);

  const scrollToPanel = (panelIndex: number) => {
    if (!outerRef.current) return;

    const outerTop =
      window.scrollY + outerRef.current.getBoundingClientRect().top;
    const scrollable = outerRef.current.offsetHeight - window.innerHeight;
    const panelScrollHeight = scrollable / (groupLength - 1);
    const targetY = outerTop - methodsOffset + panelIndex * panelScrollHeight;

    scrollToY(targetY, {
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let snapTimeout: ReturnType<typeof setTimeout>;
    let settleTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (!outerRef.current) return;

      const rect = outerRef.current.getBoundingClientRect();
      const scrollable = outerRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const p = Math.max(
        0,
        Math.min(1, -(rect.top - methodsOffset) / scrollable),
      );

      clearTimeout(snapTimeout);
      clearTimeout(settleTimeout);

      // During nav-initiated scroll, skip snap + check for arrival.
      if (navScrollInFlightRef.current) {
        const targetSectionId = navScrollTargetRef.current;
        if (!targetSectionId) {
          navScrollInFlightRef.current = false;
        } else {
          const target = document.getElementById(targetSectionId);
          if (!target) {
            navScrollInFlightRef.current = false;
          } else {
            const targetTop = target.getBoundingClientRect().top;
            const targetOffset =
              SECTION_SCROLL_OFFSET[targetSectionId] ?? DEFAULT_SCROLL_OFFSET;
            if (Math.abs(targetTop - targetOffset) <= 6) {
              navScrollInFlightRef.current = false;
              navScrollTargetRef.current = null;
            }
          }
        }

        if (navScrollInFlightRef.current) {
          // Fallback: clear flight flag after scroll settles.
          settleTimeout = setTimeout(() => {
            navScrollInFlightRef.current = false;
            navScrollTargetRef.current = null;
            if (stickyRef.current) stickyRef.current.style.opacity = "";
          }, 300);
        } else {
          // Arrived — restore visibility
          if (stickyRef.current) stickyRef.current.style.opacity = "";
        }

        setProgress(p);
        return;
      }

      setProgress(p);

      // Snap to nearest panel when user manually scrolls between panels.
      if (p > 0.05 && p < 0.95) {
        snapTimeout = setTimeout(() => {
          if (!outerRef.current) return;

          const targetPanel = Math.round(p * (groupLength - 1));
          const outerTop =
            window.scrollY + outerRef.current.getBoundingClientRect().top;
          const scrollable2 =
            outerRef.current.offsetHeight - window.innerHeight;
          const panelScrollHeight = scrollable2 / (groupLength - 1);

          scrollToY(
            outerTop - methodsOffset + targetPanel * panelScrollHeight,
            {
              behavior: "smooth",
            },
          );
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(snapTimeout);
      clearTimeout(settleTimeout);
    };
  }, [methodsOffset, scrollToY]);

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
        style={{ height: `${(groupLength - 1) * methodsPanelVh + 100}vh` }}>
        <div
          ref={stickyRef}
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
        <div className="mx-auto max-w-5xl px-[var(--page-gutter)]">
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
