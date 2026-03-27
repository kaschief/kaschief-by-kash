"use client";

import { ActIILegacy } from "@features/timeline";
import { LabNav } from "../lab-nav";

export default function LegacyEngineerPage() {
  return (
    <>
      <LabNav />
      <div className="pt-12">
        <ActIILegacy />
      </div>
    </>
  );
}
