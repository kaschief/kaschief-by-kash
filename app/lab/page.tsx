"use client";

import Link from "next/link";
import { LabNav } from "../lab-nav";
import { getLabSections } from "./registry";

const SECTIONS = getLabSections();

export default function LabHub() {
  return (
    <>
      <LabNav />
      <div className="min-h-screen px-8 pt-20 pb-16 flex flex-col items-center" style={{ background: "var(--bg)" }}>
        <h1
          className="font-sans text-2xl font-bold tracking-tight mb-2"
          style={{ color: "var(--cream)" }}
        >
          Lab
        </h1>
        <p className="font-sans text-sm mb-12" style={{ color: "var(--text-dim)" }}>
          Prototypes and archived sections
        </p>

        <div className="w-full max-w-xl space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2
                className="font-sans text-[10px] uppercase tracking-widest mb-3"
                style={{ color: "var(--gold-dim)" }}
              >
                {section.title}
              </h2>
              <div className="grid gap-2">
                {section.routes.map((v) => (
                  <Link
                    key={v.href}
                    href={v.href}
                    className="block rounded-lg p-4 transition-colors hover:border-[var(--gold-dim)]"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--stroke)",
                    }}
                  >
                    <span className="font-sans text-sm font-semibold block mb-1" style={{ color: "var(--cream)" }}>
                      {v.label}
                    </span>
                    <span className="font-sans text-xs" style={{ color: "var(--text-dim)" }}>
                      {v.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
