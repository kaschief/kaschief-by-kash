"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionGlow } from "@components";
import { METHOD_GROUPS } from "@data";
import {
  NAVIGATION_SCROLL_EVENT,
  useLenis,
  useNavStore,
  usePreserveScrollAnchor,
} from "@hooks";
import {
  EASE,
  LAYOUT,
  SECTION_ID,
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
const panelStepCount = Math.max(1, groupLength - 1);

export function Methods() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const getLenis = useLenis();

  // Desktop panel state
  const [activePanel, setActivePanel] = useState(0);

  // Skill detail overlay
  const [detailOverlayState, setDetailOverlayState] =
    useState<SkillDetailOverlayState>(SKILL_DETAIL_OVERLAY_INITIAL_STATE);

  // Mobile
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

  const inView = useInView(stickyRef, { once: true, amount: 0.05 });

  // ── Nav scroll coordination ───────────────────────────────────────────
  // When navigating to methods via nav, reset to first panel.
  useEffect(() => {
    const handleNavScroll = (event: Event) => {
      const { sectionId } = (event as CustomEvent<{ sectionId?: SectionId }>).detail ?? {};
      if (sectionId === METHODS) {
        setActivePanel(0);
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

  // ── ScrollTrigger pin + progress-driven panels (desktop) ────────────
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    const mql = window.matchMedia("(min-width: 1440px)");
    if (!mql.matches) return;

    const vh = window.innerHeight;
    const downDistance = panelStepCount * vh * LAYOUT.pinDownVh;
    const upThreshold = LAYOUT.pinUpVh / LAYOUT.pinDownVh;

    const trigger = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: "top top",
      end: `+=${downDistance}`,
      pinSpacing: true,
      onUpdate: (self) => {
        // Don't update panels during any programmatic navigation
        if (useNavStore.getState().isNavigating) return;

        // When scrolling up past the short threshold per panel step, jump out
        const progress = self.progress;
        const panelProgress = progress * panelStepCount;
        const currentPanel = Math.floor(panelProgress);
        const withinPanel = panelProgress - currentPanel;

        if (self.direction === -1 && withinPanel > 0 && withinPanel < upThreshold) {
          // Snap to the previous panel boundary
          const targetProgress = currentPanel / panelStepCount;
          self.scroll(self.start + targetProgress * (self.end - self.start));
        }

        const panel = Math.min(
          groupLength - 1,
          Math.max(0, Math.round(panelProgress)),
        );
        setActivePanel(panel);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // ── Internal panel nav (sidebar buttons) ──────────────────────────────
  const handleScrollToPanel = (panelIndex: number) => {
    const trigger = ScrollTrigger.getAll().find(
      (st) => st.trigger === stickyRef.current,
    );
    if (!trigger) return;

    const { startNavigation, endNavigation } = useNavStore.getState();

    // Set panel immediately and freeze scroll detection
    setActivePanel(panelIndex);
    startNavigation(METHODS);

    // Calculate the scroll position for this panel within the pin range
    const pinStart = trigger.start;
    const pinEnd = trigger.end;
    const pinRange = pinEnd - pinStart;
    const targetScroll = pinStart + (pinRange * panelIndex) / panelStepCount;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetScroll, {
        duration: 0.8,
        lock: true,
        force: true,
        onComplete: () => {
          setTimeout(() => endNavigation(), 50);
        },
      });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
      setTimeout(() => endNavigation(), 1000);
    }

    // Safety fallback
    setTimeout(() => endNavigation(), 3000);
  };

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
      {/* ── Desktop: ScrollTrigger pinned panels ── */}
      <div
        ref={stickyRef}
        className="hidden xl:block"
        style={{ height: "100vh", overflow: "hidden" }}>
        <SectionGlow color={gold} size="lg" />
        <motion.div
          style={{ position: "relative", width: "100%", height: "100%" }}
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}>
          {METHOD_GROUPS.map((group, i) => (
            <Panel
              key={group.id}
              group={group}
              index={i}
              panelProgress={activePanel}
              activePanelIndex={activePanel}
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
              onScrollToPanel={handleScrollToPanel}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Mobile: tab-based panels ── */}
      <div className="py-16 xl:hidden">
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
