"use client";

import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

import type { ScrambleTextProps } from "./act-ii.types";

export function ScrambleText({
  text,
  active,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) return;

    const resolved = new Array(text.length).fill(false);
    const cycles = new Array(text.length).fill(0);

    const interval = setInterval(() => {
      let allDone = true;
      const next = text.split("").map((char, i) => {
        if (char === " ") return " ";

        const startDelay = i * staggerMs;
        const elapsed = cycles[i] * intervalMs;

        if (elapsed < startDelay) {
          cycles[i]++;
          allDone = false;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        }

        if (resolved[i]) return char;

        cycles[i]++;
        const scrambleCycles = cycles[i] - Math.floor(startDelay / intervalMs);

        if (scrambleCycles >= cyclesPerChar) {
          resolved[i] = true;
          return char;
        }

        allDone = false;
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      });

      setDisplay(next.join(""));
      if (allDone) clearInterval(interval);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [active, text, staggerMs, cyclesPerChar, intervalMs]);

  return <>{display}</>;
}
