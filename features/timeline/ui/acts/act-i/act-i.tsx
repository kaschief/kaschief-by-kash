"use client";

import { SECTION_ID } from "@utilities";
import { Splash } from "./splash";
import { ChaosToOrder } from "./chaos-to-order";
import { Throughline } from "./throughline";

const { ACT_NURSE } = SECTION_ID;

export function ActI() {
  return (
    <div id={ACT_NURSE} className="relative">
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
      <Throughline />

      <div className="h-24 md:h-40" />
    </div>
  );
}
