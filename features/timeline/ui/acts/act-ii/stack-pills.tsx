"use client";

import type { Tag } from "@data";
import { TAG_ALPHA_BG, TAG_ALPHA_BORDER } from "./act-ii.constants";

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
            background: `${tag.color}${TAG_ALPHA_BG}`,
            color: tag.color,
            borderColor: `${tag.color}${TAG_ALPHA_BORDER}`,
          }}>
          {tag.text}
        </span>
      ))}
    </div>
  );
}
