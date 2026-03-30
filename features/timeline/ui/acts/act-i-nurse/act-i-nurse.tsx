"use client";

import { ACT_I } from "@data";
import { SECTION_ID } from "@utilities";
import { Splash } from "./splash";
import { ChaosToOrder } from "./chaos-to-order";
import { Throughline } from "./throughline";

const { ACT_NURSE } = SECTION_ID;

export function ActINurse() {
  return (
    <section id={ACT_NURSE} className="relative" aria-label="Act I — Nursing career">
      <Splash />
      <div className="h-10 lg:h-20" />
      <ChaosToOrder />
      <div
        className="relative h-2 lg:h-4"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg) 60%)",
        }}
      />
      <Throughline id="act-i-throughline" text={ACT_I.throughline} />
    </section>
  );
}
