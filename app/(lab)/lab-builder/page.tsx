"use client";

import { LabNav } from "../lab-nav";
import { ActIVBuilder } from "@features/timeline";

export default function LabBuilder() {
  return (
    <>
      <LabNav />
      <div style={{ background: "var(--bg)" }}>
        <ActIVBuilder />
      </div>
    </>
  );
}
