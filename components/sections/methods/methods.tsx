"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { METHOD_GROUPS } from "@/data/methods";
import { EASE } from "@/components/motion";
import { SectionGlow } from "@/components/ui/section-glow";
import { TOKENS } from "@/lib/tokens";
import { SECTION_ID } from "@/lib/sections";
import { Panel } from "./panel";
import { SkillTakeover } from "./skill-takeover";
import type { ActiveSkill } from "./methods.types";

const N = METHOD_GROUPS.length;

export function Methods() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeSkill, setActiveSkill] = useState<ActiveSkill | null>(null);

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

  return (
    <div
      id={SECTION_ID.METHODS}
      ref={outerRef}
      style={{ height: `${N * 60}vh`, position: "relative" }}>
      <SectionGlow color={TOKENS.gold} size="lg" />
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
                setActiveSkill({
                  skill,
                  groupLabel,
                  groupIndex,
                  skillIndex,
                })
              }
              onScrollToPanel={scrollToPanel}
            />
          ))}
        </motion.div>
      </div>

      {activeSkill && (
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
      )}
    </div>
  );
}
