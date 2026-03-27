import type { Company, ImpactMetric } from "@data";

export interface CommitEntryProps {
  company: Company;
  index: number;
  isLast: boolean;
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
  /** Start with scrambled characters instead of the real text */
  initiallyScrambled?: boolean;
  /** Delay before the unscramble begins (ms) */
  delayMs?: number;
  staggerMs?: number;
  cyclesPerChar?: number;
  intervalMs?: number;
}
