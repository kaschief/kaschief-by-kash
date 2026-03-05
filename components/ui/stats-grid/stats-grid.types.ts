export interface Stat {
  value: string;
  label: string;
}

export interface StatsGridProps {
  stats: Stat[];
  color?: string;
  /** "grid" (default) for timeline sidebar, "row" for inline horizontal layout */
  layout?: "grid" | "row";
  /** Override inView detection — used when parent controls activation (e.g. ScrollTrigger pin) */
  forceActive?: boolean;
}
