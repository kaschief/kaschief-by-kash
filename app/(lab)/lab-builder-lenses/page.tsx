"use client";

import { LabNav } from "../lab-nav";
import { StackedLenses } from "@features/lab-builder";

export default function LabBuilderLenses() {
  return (
    <>
      <LabNav />
      <StackedLenses />
    </>
  );
}
