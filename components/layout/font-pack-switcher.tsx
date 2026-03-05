"use client";

import { useEffect, useState } from "react";

const FONT_PACK_STORAGE_KEY = "portfolio-font-pack";
const FONT_PACK_ATTR = "data-font-pack";

const FONT_PACKS = [
  { id: "default", label: "Default" },
  { id: "editorial-noir", label: "Editorial Noir" },
  { id: "atelier-renaissance", label: "Atelier Renaissance" },
  { id: "signal-grid", label: "Signal Grid" },
  { id: "high-contrast-luxe", label: "High Contrast Luxe" },
  { id: "humanist-pro", label: "Humanist Pro" },
  { id: "neo-classic", label: "Neo Classic" },
  { id: "craft-modern", label: "Craft Modern" },
  { id: "kinetic-editorial", label: "Kinetic Editorial" },
  { id: "calm-precision", label: "Calm Precision" },
  { id: "velvet-wire", label: "Velvet Wire" },
  { id: "newsroom-classic", label: "Newsroom Classic" },
  { id: "art-house", label: "Art House" },
  { id: "northern-ledger", label: "Northern Ledger" },
  { id: "technical-romance", label: "Technical Romance" },
  { id: "atelier-raw", label: "Atelier Raw" },
  { id: "print-and-circuit", label: "Print And Circuit" },
  { id: "night-signal", label: "Night Signal" },
] as const;

type FontPackId = (typeof FONT_PACKS)[number]["id"];

function isFontPackId(value: string | null): value is FontPackId {
  return FONT_PACKS.some((pack) => pack.id === value);
}

function applyFontPack(fontPack: FontPackId) {
  document.documentElement.setAttribute(FONT_PACK_ATTR, fontPack);
}

export function FontPackSwitcher() {
  const [selectedPack, setSelectedPack] = useState<FontPackId>("default");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("fontPack");
    const fromStorage = localStorage.getItem(FONT_PACK_STORAGE_KEY);

    const initialPack = isFontPackId(fromQuery)
      ? fromQuery
      : isFontPackId(fromStorage)
        ? fromStorage
        : "default";

    setSelectedPack(initialPack);
    applyFontPack(initialPack);
  }, []);

  const onPackChange = (fontPack: FontPackId) => {
    setSelectedPack(fontPack);
    applyFontPack(fontPack);
    localStorage.setItem(FONT_PACK_STORAGE_KEY, fontPack);
  };

  return (
    <div className="fixed right-4 bottom-4 z-[1200] rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)]/90 px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Font Pack
      </label>
      <select
        value={selectedPack}
        onChange={(event) => onPackChange(event.target.value as FontPackId)}
        className="rounded border border-[var(--stroke)] bg-[var(--bg)] px-2 py-1 font-mono text-xs text-[var(--cream)] outline-none transition-colors focus:border-[var(--gold)]">
        {FONT_PACKS.map((pack) => (
          <option key={pack.id} value={pack.id}>
            {pack.label}
          </option>
        ))}
      </select>
    </div>
  );
}
