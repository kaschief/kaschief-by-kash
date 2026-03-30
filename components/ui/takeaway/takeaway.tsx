"use client";

import { FadeIn } from "@components";
import { useStickyOnce } from "@hooks";
import type { TakeawayProps } from "./takeaway.types";

export function Takeaway({ id, text, height: zonHeight = "150vh" }: TakeawayProps) {
  const { ref, height, stickyClass } = useStickyOnce(id, zonHeight);

  return (
    <div ref={ref} className="relative" data-sticky-zone style={{ height }}>
      <div className={`${stickyClass} flex h-screen h-[100svh] items-center justify-center px-(--page-gutter)`}>
        <FadeIn>
          <h3 className="mx-auto max-w-2xl text-center font-narrator text-[clamp(22px,3vw,36px)] leading-[1.35] tracking-[-0.01em] text-(--cream)">
            {text.includes("\n")
              ? text.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))
              : text}
          </h3>
        </FadeIn>
      </div>
    </div>
  );
}
