"use client";

import Image from "next/image";
import { DetailModal } from "@/components/ui/detail-modal";
import type { IndicatorDetailProps } from "./trading-system.types";

export function IndicatorDetail({ indicator, onClose }: IndicatorDetailProps) {
  return (
    <DetailModal variant="overlay" color={indicator.color} onClose={onClose}>
      <div className="relative aspect-video w-full">
        <Image
          src={indicator.image}
          alt={indicator.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: indicator.color }}
          />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
            {indicator.category}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-[var(--cream)]">
          {indicator.name}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[var(--cream-muted)]">
          {indicator.desc}
        </p>
      </div>
    </DetailModal>
  );
}
