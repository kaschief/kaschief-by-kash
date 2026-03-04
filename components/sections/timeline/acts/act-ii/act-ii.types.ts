import type { Job } from "@data";
export interface JobTakeoverProps {
  job: Job;
  actLabel: string;
  color: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export interface JobRowProps {
  job: Job;
  onSelect: () => void;
  color?: string;
}
