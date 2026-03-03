export interface Stat {
  value: string;
  label: string;
}

export interface StatsGridProps {
  stats: Stat[];
  color?: string;
}
