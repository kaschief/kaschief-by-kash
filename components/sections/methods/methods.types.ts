import type { MethodGroup, MethodSkill } from "@/data/methods";

export interface SkillTakeoverProps {
  skill: MethodSkill;
  groupLabel: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export interface SkillRowProps {
  label: string;
  onSelect: () => void;
}

export interface NavButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface PanelProps {
  group: MethodGroup;
  index: number;
  panelProgress: number;
  activePanelIndex: number;
  onSkillSelect: (
    skill: MethodSkill,
    groupLabel: string,
    groupIndex: number,
    skillIndex: number,
  ) => void;
  onScrollToPanel: (i: number) => void;
}

export interface ActiveSkill {
  skill: MethodSkill;
  groupLabel: string;
  groupIndex: number;
  skillIndex: number;
}
