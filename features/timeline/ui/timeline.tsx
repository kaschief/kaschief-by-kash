"use client";

import { ActI, ActII, ActIII, ActIV } from "./acts";
import { TradingArsenal } from "./trading-system";
import { SECTION_ID } from "@utilities";

const { ACT_BUILDER } = SECTION_ID;

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActI />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />
      <ActIII />
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[var(--stroke)] to-transparent" />

      <section id={ACT_BUILDER}>
        <ActIV />
        <TradingArsenal />
      </section>
    </section>
  );
}
