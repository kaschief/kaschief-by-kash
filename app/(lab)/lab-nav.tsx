"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAB_ROUTES } from "./lab/registry";

export function LabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center gap-1 px-3 py-2 font-sans overflow-x-auto"
      style={{
        zIndex: 10000,
        background: "rgba(7,7,10,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--stroke)",
      }}
    >
      <Link
        href="/"
        className="text-[10px] uppercase tracking-widest shrink-0 mr-2"
        style={{ color: "var(--text-dim)" }}
      >
        Home
      </Link>
      <Link
        href="/lab"
        className="text-[10px] uppercase tracking-widest shrink-0 mr-1"
        style={{ color: pathname === "/lab" ? "var(--cream)" : "var(--gold-dim)" }}
      >
        Lab
      </Link>

      <span className="h-3 w-px shrink-0 bg-white/[0.08]" />

      {LAB_ROUTES.map((route) => {
        const active = pathname === route.href;
        return (
          <Link
            key={route.href}
            href={route.href}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded shrink-0"
            style={{
              color: active ? "var(--cream)" : "var(--text-dim)",
              background: active ? "rgba(201,168,76,0.15)" : "transparent",
              border: active ? "1px solid var(--gold-dim)" : "1px solid transparent",
            }}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
