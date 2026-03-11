"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

import type { ScrambleTextProps } from "./act-ii.types";

/** Generate a scrambled version of a string (preserving spaces) */
function scramble(text: string): string {
  return text
    .split("")
    .map((ch) =>
      ch === " "
        ? " "
        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    )
    .join("");
}

export function ScrambleText({
  text,
  active,
  initiallyScrambled = false,
  delayMs = 0,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
}: ScrambleTextProps) {
  const prefersReducedMotion = useReducedMotion();

  const scrambledInit = useMemo(
    () => (initiallyScrambled && !prefersReducedMotion ? scramble(text) : text),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [display, setDisplay] = useState(scrambledInit);

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion) {
      setDisplay(text);
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      const resolved = new Array(text.length).fill(false);
      const cycles = new Array(text.length).fill(0);

      interval = setInterval(() => {
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
        if (allDone) {
          clearInterval(interval);
        }
      }, intervalMs);
    };

    if (delayMs > 0) {
      timeout = setTimeout(start, delayMs);
    } else {
      start();
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, delayMs, staggerMs, cyclesPerChar, intervalMs, prefersReducedMotion]);

  return <>{display}</>;
}
