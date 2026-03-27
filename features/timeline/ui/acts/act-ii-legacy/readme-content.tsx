"use client";

import type { ReadmeContentProps } from "./act-ii.types";

export function ReadmeContent({ lines }: ReadmeContentProps) {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {lines.map((line, i) => {
        if (line === "") return <div key={i} className="h-3" />;
        if (line.startsWith("## "))
          return (
            <h2
              key={i}
              className="mb-3 border-b border-(--stroke) pb-2 text-lg font-semibold text-(--cream) md:text-xl"
              style={{ marginTop: i > 0 ? 8 : 0 }}>
              {line.replace("## ", "")}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3
              key={i}
              className="mb-2 mt-4 text-sm font-semibold text-(--cream) md:text-base">
              {line.replace("### ", "")}
            </h3>
          );
        if (line.startsWith("**")) {
          const parts = line.split("**");
          return (
            <p
              key={i}
              className="mb-2 text-[12px] leading-[1.8] text-(--cream-muted) sm:text-[13px]">
              <strong className="text-(--cream)">{parts[1]}</strong>
              {parts[2]}
            </p>
          );
        }
        return (
          <p
            key={i}
            className="mb-2 text-[12px] leading-[1.8] text-(--cream-muted) sm:text-[13px]">
            {line}
          </p>
        );
      })}
    </div>
  );
}
