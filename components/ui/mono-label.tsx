export interface MonoLabelProps {
  label: string
  color?: string
  className?: string
}

export function MonoLabel({ label, color = "var(--text-faint)", className }: MonoLabelProps) {
  return (
    <p
      className={`font-mono text-[9px] font-medium uppercase tracking-[0.25em] ${className ?? ""}`}
      style={{ color }}
    >
      {label}
    </p>
  )
}
