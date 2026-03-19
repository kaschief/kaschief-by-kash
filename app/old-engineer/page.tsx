"use client";

import { ActII } from "@features/timeline";
import { DevNav } from "../dev-nav";

export default function OldEngineerPage() {
  return (
    <>
      <DevNav />
      <div className="pt-12">
        <ActII />
      </div>
    </>
  );
}
