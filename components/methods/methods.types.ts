import type { MethodGroup, MethodSkill } from "@/data/methods";

export interface SkillTakeoverProps {
  skill: MethodSkill;
  groupLabel: string;
  onClose: () => void;
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
  onSkillSelect: (skill: MethodSkill, groupLabel: string) => void;
  onScrollToPanel: (i: number) => void;
}

export interface ActiveSkill {
  skill: MethodSkill;
  groupLabel: string;
}
