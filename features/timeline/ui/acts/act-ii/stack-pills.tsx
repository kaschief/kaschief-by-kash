"use client";

import type { Tag } from "@data";

interface StackPillsProps {
  stack: readonly Tag[];
}

export function StackPills({ stack }: StackPillsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-1.5">
      {stack.map((tag) => (
        <span
          key={tag.text}
          className="rounded-full border px-2.5 py-0.5 font-mono text-[10px]"
          style={{
            background: `${tag.color}14`,
            color: tag.color,
            borderColor: `${tag.color}26`,
          }}>
          {tag.text}
        </span>
      ))}
    </div>
  );
}
