"use client";

import { ActI, ActII, ActIII, ActIV } from "@/components/acts";
import { TradingArsenal } from "@/components/trading-system";

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActI />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIV />
      <TradingArsenal />
    </section>
  );
}
