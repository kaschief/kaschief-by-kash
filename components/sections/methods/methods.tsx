"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { METHOD_GROUPS } from "@/data/methods";
import { EASE } from "@/components/motion";
import { SectionGlow } from "@/components/ui/section-glow";
import { TOKENS } from "@/lib/tokens";
import { SECTION_ID } from "@/lib/sections";
import { Panel } from "./panel";
import { SkillRow } from "./skill-row";
import { SkillTakeover } from "./skill-takeover";
import type { ActiveSkill } from "./methods.types";

const N = METHOD_GROUPS.length;

export function Methods() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeSkill, setActiveSkill] = useState<ActiveSkill | null>(null);
  const [mobilePanel, setMobilePanel] = useState(0);

  const inView = useInView(outerRef, { once: true, amount: 0.05 });
  const activeGroup = activeSkill
    ? METHOD_GROUPS[activeSkill.groupIndex]
    : undefined;
  const activeGroupSkills = activeGroup?.skills ?? [];
  const activeSkillIndex = activeSkill?.skillIndex ?? -1;
  const canGoPrevSkill = activeSkillIndex > 0;
  const canGoNextSkill =
    activeSkillIndex !== -1 && activeSkillIndex < activeGroupSkills.length - 1;

  const scrollToPanel = (panelIndex: number) => {
    if (!outerRef.current) return;
    const outerTop =
      window.scrollY + outerRef.current.getBoundingClientRect().top;
    const scrollable = outerRef.current.offsetHeight - window.innerHeight;
    const panelScrollHeight = scrollable / (N - 1);
    window.scrollTo({
      top: outerTop + panelIndex * panelScrollHeight,
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
          const targetPanel = Math.round(p * (N - 1));
          const outerTop =
            window.scrollY + outerRef.current.getBoundingClientRect().top;
          const scrollable2 =
            outerRef.current.offsetHeight - window.innerHeight;
          const panelScrollHeight = scrollable2 / (N - 1);
          window.scrollTo({
            top: outerTop + targetPanel * panelScrollHeight,
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
  }, []);

  const panelProgress = progress * (N - 1);
  const activePanelIndex = Math.round(panelProgress);

  const skillTakeover = activeSkill && (
    <SkillTakeover
      skill={activeSkill.skill}
      groupLabel={activeSkill.groupLabel}
      onClose={() => setActiveSkill(null)}
      onPrev={() => {
        if (!canGoPrevSkill || !activeGroup) return;
        const skillIndex = activeSkill.skillIndex - 1;
        setActiveSkill({
          skill: activeGroup.skills[skillIndex],
          groupLabel: activeGroup.label,
          groupIndex: activeSkill.groupIndex,
          skillIndex,
        });
      }}
      onNext={() => {
        if (!canGoNextSkill || !activeGroup) return;
        const skillIndex = activeSkill.skillIndex + 1;
        setActiveSkill({
          skill: activeGroup.skills[skillIndex],
          groupLabel: activeGroup.label,
          groupIndex: activeSkill.groupIndex,
          skillIndex,
        });
      }}
      canGoPrev={canGoPrevSkill}
      canGoNext={canGoNextSkill}
    />
  );

  return (
    <div id={SECTION_ID.METHODS} style={{ position: "relative" }}>
      <SectionGlow color={TOKENS.gold} size="lg" />

      {/* ── Desktop: sticky scroll experience ──────────────────────────── */}
      <div
        ref={outerRef}
        className="hidden lg:block"
        style={{ height: `${N * 60}vh` }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
          }}>
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
                  setActiveSkill({ skill, groupLabel, groupIndex, skillIndex })
                }
                onScrollToPanel={scrollToPanel}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Mobile: tab-based experience ───────────────────────────────── */}
      <div className="py-16 lg:hidden">
        <div className="mx-auto max-w-5xl px-6">
          {/* Section label */}
          <div className="mb-6 flex items-center gap-3">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: TOKENS.gold }}
            />
            <span
              className="font-mono text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: TOKENS.gold }}>
              Methods
            </span>
          </div>

          {/* Tab strip — horizontally scrollable */}
          <div
            className="mb-8 flex overflow-x-auto border-b border-[var(--stroke)]"
            style={{ scrollbarWidth: "none" }}>
            {METHOD_GROUPS.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setMobilePanel(i)}
                className="mr-6 shrink-0 whitespace-nowrap pb-3 font-mono text-xs uppercase tracking-wider transition-colors"
                style={{
                  color: i === mobilePanel ? TOKENS.cream : TOKENS.textFaint,
                  borderBottom:
                    i === mobilePanel
                      ? `2px solid ${TOKENS.gold}`
                      : "2px solid transparent",
                }}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Active panel content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mobilePanel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <h2
                className="font-serif text-4xl font-normal tracking-[-0.02em]"
                style={{
                  color: TOKENS.cream,
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}>
                {METHOD_GROUPS[mobilePanel].label}
              </h2>
              <p
                className="mb-8 text-sm leading-relaxed"
                style={{ color: TOKENS.textDim }}>
                {METHOD_GROUPS[mobilePanel].description}
              </p>
              {METHOD_GROUPS[mobilePanel].skills.map((skill, i) => (
                <SkillRow
                  key={skill.id}
                  label={skill.label}
                  onSelect={() =>
                    setActiveSkill({
                      skill,
                      groupLabel: METHOD_GROUPS[mobilePanel].label,
                      groupIndex: mobilePanel,
                      skillIndex: i,
                    })
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {skillTakeover}
    </div>
  );
}
