"use client";

import { FadeUp } from "@/components/motion";
import type { SectionProseProps } from "./section-prose.types";

export function SectionProse({
  lead,
  body,
  delay = 0.3,
  className,
}: SectionProseProps) {
  return (
    <FadeUp delay={delay} className={className}>
      <p className="text-lg leading-[1.8] text-[var(--cream-muted)]">{lead}</p>
      {body && (
        <p className="mt-6 text-sm leading-[1.9] text-[var(--text-dim)]">
          {body}
        </p>
      )}
    </FadeUp>
  );
}
