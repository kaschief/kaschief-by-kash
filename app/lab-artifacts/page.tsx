"use client";

/**
 * Artifact gallery — pure layout.
 * All content from data/lenses.ts. All components from artifact-cards.tsx.
 * Wiring via render-card.tsx.
 */

import { LabNav } from "../lab-nav";
import { LENS_NAMES, LENS_DISPLAY, LENSES } from "@data";
import { renderCard } from "./render-card";

/* ── Palette (layout-only) ── */

const INK = "#1A1917";
const INK_3 = "#6E6B65";
const INK_4 = "#9C9890";

/* ── Layout components ── */

function CompanyLabel({ company, years }: { company: string; years: string }) {
  return (
    <div
      className="font-ui"
      style={{
        fontSize: 9,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: INK_4,
        marginBottom: 16,
        fontWeight: 600,
      }}>
      {company} &middot; {years}
    </div>
  );
}

function LensHeading({ name, desc }: { name: string; desc: string }) {
  return (
    <div style={{ marginBottom: 40, marginTop: 16 }}>
      <h2
        className="font-sans"
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: INK,
          margin: "0 0 6px",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}>
        {name}
      </h2>
      <p style={{ fontSize: 14, color: INK_3, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}

/* ── Page ── */

export default function LabArtifactsPage() {
  return (
    <>
      <LabNav />
      <div
        style={{
          minHeight: "100vh",
          background: "#F7F6F3",
          color: INK,
          padding: "80px 24px 120px",
        }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {LENS_NAMES.map((name, i) => {
            const lens = LENSES[name];
            return (
            <div key={name} style={i > 0 ? { marginTop: 96 } : undefined}>
              <LensHeading name={LENS_DISPLAY[name]} desc={lens.desc} />
              <div style={{ display: "flex", flexDirection: "column", gap: 54 }}>
                {lens.entries.map((entry) => (
                  <div key={entry.id}>
                    <CompanyLabel company={entry.company} years={entry.years} />
                    {renderCard(entry)}
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
