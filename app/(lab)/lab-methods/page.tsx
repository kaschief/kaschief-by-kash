"use client";

import { LabNav } from "../lab-nav";
import { Methods } from "@features/methods";

export default function LabMethods() {
  return (
    <>
      <LabNav />
      <div style={{ background: "var(--bg)" }}>
        <Methods />
      </div>
    </>
  );
}
