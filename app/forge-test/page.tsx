import Link from "next/link";

const VARIANTS = [
  { href: "/forge-test-v0", label: "V0: Prototype", desc: "Original forge — title + forge + narrative beats + crystallize (frozen reference)" },
  { href: "/forge-test-ref-horizontal", label: "Ref: Horizontal Sankey", desc: "Left-to-right SVG Sankey, streams flow through company bars" },
  { href: "/forge-test-ref-funnel", label: "Ref: Convergence Funnel", desc: "All streams converge to a single point through 4 company waypoints" },
  { href: "/forge-test-ref-particles", label: "Ref: Particle Flow", desc: "Canvas particles with glow, trails, wobble along stream paths" },
  { href: "/engineer-candidate", label: "Engineer-Candidate", desc: "Active build — title + words + forge glow + thesis + explosion + falling particles + funnel" },
];

export default function ForgeHub() {
  return (
    <div className="min-h-screen px-8 py-16 flex flex-col items-center" style={{ background: "var(--bg)" }}>
      <h1
        className="font-sans text-2xl font-bold tracking-tight mb-2"
        style={{ color: "var(--cream)" }}
      >
        Act II Prototypes
      </h1>
      <p className="font-sans text-sm mb-12" style={{ color: "var(--text-dim)" }}>
        Scroll-driven explorations for the Engineer section
      </p>

      <div className="grid gap-4 w-full max-w-xl">
        {VARIANTS.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="block rounded-lg p-5 transition-colors"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${v.href.includes("workstation") ? "var(--gold-dim)" : "var(--stroke)"}`,
            }}
          >
            <span className="font-sans text-sm font-semibold block mb-1" style={{ color: "var(--cream)" }}>
              {v.label}
            </span>
            <span className="font-sans text-xs" style={{ color: "var(--text-dim)" }}>
              {v.desc}
            </span>
            <span className="font-sans text-xs block mt-2" style={{ color: "var(--gold-dim)" }}>
              {v.href}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
