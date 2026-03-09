"use client";

import { FadeUp } from "@components";
import { TOKENS } from "@utilities";
import type { TakeawayBlockProps } from "./takeaway-block.types";
const { gold } = TOKENS;

export function TakeawayBlock({
  text,
  color = gold,
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
          className={`${serif ? "font-[family-name:var(--font-spectral)] text-base" : "font-[family-name:var(--font-spectral)] text-sm"} italic leading-relaxed text-[var(--cream)]`}>
          {text}
        </p>
      </div>
    </FadeUp>
  );
}
