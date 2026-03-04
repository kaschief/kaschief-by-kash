import { TOKENS } from "@utilities";
import type { MonoLabelProps } from "./mono-label.types";
const { textFaint } = TOKENS;

export function MonoLabel({
  label,
  color = textFaint,
  className,
}: MonoLabelProps) {
  return (
    <p
      className={`font-mono text-[9px] font-medium uppercase tracking-[0.25em] ${className ?? ""}`}
      style={{ color }}>
      {label}
    </p>
  );
}
