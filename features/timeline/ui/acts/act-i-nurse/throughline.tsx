"use client";

import { FadeIn } from "@components";
import { useStickyOnce } from "@hooks";

interface ThroughlineProps {
  id: string;
  text: string;
  height?: string;
}

export function Throughline({ id, text, height: zoneHeight = "150vh" }: ThroughlineProps) {
  const { ref, height, stickyClass } = useStickyOnce(id, zoneHeight);

  return (
    <div ref={ref} className="relative" data-sticky-zone style={{ height }}>
      <div className={`${stickyClass} flex h-screen h-svh items-center justify-center px-6`}>
        <FadeIn>
          <h3 className="mx-auto max-w-2xl text-center font-narrator text-[clamp(22px,3vw,36px)] leading-[1.35] tracking-[-0.01em] text-(--cream)">
            {text}
          </h3>
        </FadeIn>
      </div>
    </div>
  );
}
