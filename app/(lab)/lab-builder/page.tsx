"use client";

import { LabNav } from "../lab-nav";
import { ActIVBuilder, TradingArsenal } from "@features/timeline";

export default function LabBuilder() {
  return (
    <>
      <LabNav />
      <div style={{ background: "var(--bg)" }}>
        <ActIVBuilder />
        <TradingArsenal />
      </div>
    </>
  );
}
