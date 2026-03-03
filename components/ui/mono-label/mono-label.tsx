import { TOKENS } from "@/lib/tokens";
import type { MonoLabelProps } from "./mono-label.types";

export function MonoLabel({
  label,
  color = TOKENS.textFaint,
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
