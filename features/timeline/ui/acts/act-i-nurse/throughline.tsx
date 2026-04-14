"use client";

import { FadeIn } from "@components";

interface ThroughlineProps {
  id: string;
  text: string;
}

/** Full-viewport closing beat for Act I. No sticky-once — caused hash-refresh scroll jumps. */
export function Throughline({ id, text }: ThroughlineProps) {
  return (
    <div
      id={id}
      className="relative flex h-svh w-full items-center justify-center px-6">
      <FadeIn>
        <h3 className="mx-auto max-w-2xl text-center font-narrator text-[clamp(22px,3vw,36px)] leading-[1.35] tracking-[-0.01em] text-(--cream)">
          {text}
        </h3>
      </FadeIn>
    </div>
  );
}
