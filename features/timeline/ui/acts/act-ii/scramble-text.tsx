"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

/** Idle glitch: min/max pause between glitches (ms) */
const GLITCH_MIN = 3000;
const GLITCH_MAX = 8000;
/** How many chars to glitch at once */
const GLITCH_CHARS = 3;
/** How many frames a glitched char stays scrambled */
const GLITCH_FRAMES = 4;
const GLITCH_FRAME_MS = 50;

export function ScrambleText({
  text,
  active,
  initiallyScrambled = false,
  delayMs = 0,
  idleGlitch = false,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
}: ScrambleTextProps) {
  const scrambledInit = useMemo(
    () => (initiallyScrambled ? scramble(text) : text),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [display, setDisplay] = useState(scrambledInit);
  const decoded = useRef(false);

  // ── Main decode ──
  useEffect(() => {
    if (!active) return;

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
          decoded.current = true;
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
  }, [active, text, delayMs, staggerMs, cyclesPerChar, intervalMs]);

  // ── Idle glitch loop ──
  useEffect(() => {
    if (!idleGlitch) return;

    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const scheduleGlitch = () => {
      const wait = GLITCH_MIN + Math.random() * (GLITCH_MAX - GLITCH_MIN);
      timeout = setTimeout(() => {
        if (cancelled || !decoded.current) {
          if (!cancelled) scheduleGlitch();
          return;
        }

        // Pick random non-space indices to glitch
        const nonSpace: number[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] !== " ") nonSpace.push(i);
        }
        const count = Math.min(GLITCH_CHARS, nonSpace.length);
        const picks = new Set<number>();
        while (picks.size < count) {
          picks.add(nonSpace[Math.floor(Math.random() * nonSpace.length)]);
        }

        let frame = 0;
        interval = setInterval(() => {
          frame++;
          if (frame > GLITCH_FRAMES) {
            clearInterval(interval);
            setDisplay(text);
            if (!cancelled) scheduleGlitch();
            return;
          }
          const chars = text.split("");
          for (const idx of picks) {
            chars[idx] = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          setDisplay(chars.join(""));
        }, GLITCH_FRAME_MS);
      }, wait);
    };

    scheduleGlitch();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [idleGlitch, text]);

  return <>{display}</>;
}
