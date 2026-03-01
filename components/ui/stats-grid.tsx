export interface Stat {
  value: string
  label: string
}

interface StatsGridProps {
  stats: Stat[]
  color?: string
}

export function StatsGrid({ stats, color = "var(--gold)" }: StatsGridProps) {
  return (
    <div className="space-y-8">
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
  )
}
