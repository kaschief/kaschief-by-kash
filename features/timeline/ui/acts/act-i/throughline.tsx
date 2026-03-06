"use client";

import { FadeIn } from "@components";
import { ACT_I } from "@data";

const { color: COLOR, throughlineHeadline, throughlines } = ACT_I;

export function Throughline() {
  return (
    <div className="relative" data-sticky-zone style={{ height: "200vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center px-(--page-gutter)">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <FadeIn>
              <h3 className="max-w-lg font-serif text-[clamp(24px,3.5vw,40px)] italic leading-[1.2] tracking-[-0.01em] text-(--cream)">
                {throughlineHeadline}
              </h3>
            </FadeIn>
          </div>

          <div className="flex flex-col gap-7 pt-2">
            {throughlines.map((item, index) => (
              <FadeIn key={item.label} delay={0.1 + index * 0.1}>
                <div>
                  <p
                    className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: COLOR }}>
                    {item.label}
                  </p>
                  <p className="font-sans text-sm leading-[1.75] text-(--text-dim) md:text-base">
                    {item.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
