"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VARIANTS = [
  { href: "/forge-test-v0", label: "V0" },
  { href: "/forge-test-ref-horizontal", label: "Horiz" },
  { href: "/forge-test-ref-funnel", label: "Funnel" },
  { href: "/forge-test-ref-particles", label: "Particles" },
  { href: "/forge-test-workstation", label: "Workstation" },
];

export function ForgeNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center gap-1 px-3 py-2 font-sans"
      style={{
        zIndex: 10000,
        background: "rgba(7,7,10,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--stroke)",
      }}
    >
      <Link
        href="/forge-test"
        className="text-[10px] uppercase tracking-widest mr-3"
        style={{ color: "var(--gold-dim)" }}
      >
        Hub
      </Link>
      {VARIANTS.map((v) => {
        const active = pathname === v.href;
        return (
          <Link
            key={v.href}
            href={v.href}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded"
            style={{
              color: active ? "var(--cream)" : "var(--text-dim)",
              background: active ? "rgba(201,168,76,0.15)" : "transparent",
              border: active ? "1px solid var(--gold-dim)" : "1px solid transparent",
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}
