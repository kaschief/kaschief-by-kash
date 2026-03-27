"use client";

/**
 * Dev route — renders Act II in isolation with lab navigation.
 * Production rendering happens via the Timeline component.
 */

import { LabNav } from "../lab-nav";
import { ActIIEngineer } from "../../../features/timeline/ui/acts/act-ii";

export default function ActIIPage() {
  return (
    <>
      <LabNav />
      <ActIIEngineer />
    </>
  );
}
