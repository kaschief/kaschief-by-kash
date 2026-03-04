import { TOKENS } from "@utilities";
import type { StatsGridProps } from "./stats-grid.types";
const { gold } = TOKENS;

export function StatsGrid({ stats, color = gold }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-1 lg:gap-y-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="font-serif text-3xl" style={{ color }}>
            {stat.value}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
