export interface Stat {
  readonly value: string;
  readonly label: string;
}

export interface StatsGridProps {
  stats: readonly Stat[];
  color?: string;
  /** "grid" (default) for timeline sidebar, "row" for inline horizontal layout */
  layout?: "grid" | "row";
  /** Override inView detection — used when parent controls activation (e.g. ScrollTrigger pin) */
  forceActive?: boolean;
}
