"use client";

import { ActII } from "@features/timeline";
import { LabNav } from "../lab-nav";

export default function OldEngineerPage() {
  return (
    <>
      <LabNav />
      <div className="pt-12">
        <ActII />
      </div>
    </>
  );
}
