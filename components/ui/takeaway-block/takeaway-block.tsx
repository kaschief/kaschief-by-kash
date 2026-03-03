"use client";

import { FadeUp } from "@/components/motion";
import { TOKENS } from "@/lib/tokens";
import type { TakeawayBlockProps } from "./takeaway-block.types";

export function TakeawayBlock({
  text,
  color = TOKENS.gold,
  delay = 0.4,
  serif = false,
  className,
}: TakeawayBlockProps) {
  return (
    <FadeUp delay={delay}>
      <div
        className={`border-l-2 py-2 pl-6 ${className ?? ""}`}
        style={{
          borderColor: `color-mix(in srgb, ${color} 19%, transparent)`,
        }}>
        <p
          className={`${serif ? "font-serif text-base" : "text-sm"} italic leading-relaxed text-[var(--cream-muted)]`}>
          {text}
        </p>
      </div>
    </FadeUp>
  );
}
