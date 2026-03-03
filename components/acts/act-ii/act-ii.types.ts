import type { Job } from "@/data/timeline";

export interface JobTakeoverProps {
  job: Job;
  actLabel: string;
  color: string;
  onClose: () => void;
}

export interface JobRowProps {
  job: Job;
  onSelect: () => void;
  color?: string;
}
