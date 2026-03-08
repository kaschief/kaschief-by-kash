"use client";

import { FadeIn } from "@components";
import { ACT_I } from "@data";
import { useStickyOnce } from "@hooks";

const { throughlineHeadline } = ACT_I;

export function Throughline() {
  const { ref, height, stickyClass } = useStickyOnce("throughline", "150vh");

  return (
    <div ref={ref} className="relative" data-sticky-zone style={{ height }}>
      <div className={`${stickyClass} flex h-screen items-center justify-center px-(--page-gutter)`}>
        <FadeIn>
          <h3 className="mx-auto max-w-2xl text-center font-[family-name:var(--font-spectral)] text-[clamp(22px,3vw,36px)] italic leading-[1.35] tracking-[-0.01em] text-(--cream)">
            {throughlineHeadline}
          </h3>
        </FadeIn>
      </div>
    </div>
  );
}
