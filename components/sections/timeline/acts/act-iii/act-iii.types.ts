import type { ManagementStory } from "@/data/timeline";

export interface StoryTakeoverProps {
  story: ManagementStory;
  actLabel: string;
  color: string;
  onClose: () => void;
}

export interface CaseStudyCardProps {
  story: ManagementStory;
  color: string;
  onSelect: () => void;
}
