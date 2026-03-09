import type { Company, ImpactMetric } from "@data";

export interface CommitEntryProps {
  company: Company;
  index: number;
  onSelect: () => void;
}

export interface RepoPanelProps {
  company: Company;
  onClose: () => void;
}

export interface ImpactStatsProps {
  impact: readonly ImpactMetric[];
  hash: string;
}

export interface ReadmeContentProps {
  lines: readonly string[];
}

export interface ScrambleTextProps {
  text: string;
  active: boolean;
  staggerMs?: number;
  cyclesPerChar?: number;
  intervalMs?: number;
}
