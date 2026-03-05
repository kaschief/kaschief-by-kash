import type { ManagementStory } from "@data";
export interface StoryDetailOverlayProps {
  story: ManagementStory;
  actLabel: string;
  color: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export interface CaseStudyCardProps {
  story: ManagementStory;
  color: string;
  onSelect: () => void;
}
