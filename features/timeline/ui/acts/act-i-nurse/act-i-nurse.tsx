"use client";

import { Takeaway } from "@components";
import { ACT_I } from "@data";
import { SECTION_ID } from "@utilities";
import { Splash } from "./splash";
import { ChaosToOrder } from "./chaos-to-order";

const { ACT_NURSE } = SECTION_ID;

export function ActINurse() {
  return (
    <section id={ACT_NURSE} className="relative" aria-label="Act I — Nursing career">
      <Splash />
      <div className="h-10 lg:h-20" />
      <ChaosToOrder />
      {/* Fade from skill cards into throughline */}
      <div
        className="relative h-24 lg:h-64"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg) 60%)",
        }}
      />
      <Takeaway id="act-i-takeaway" text={ACT_I.throughline} />

      <div className="h-24 md:h-40" />
    </section>
  );
}
