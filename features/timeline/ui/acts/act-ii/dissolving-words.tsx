"use client";

import { useMemo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Commit } from "@data";
import {
  FILLER_WORDS,
  STOP_WORDS,
  TIER_RANGES,
  WORD_DISSOLVE_SPAN,
  wordJitter,
} from "./distillation.constants";

interface DissolvingWordsProps {
  readonly commits: readonly Commit[];
  /** 0-1 progress within this company's phase */
  readonly progress: MotionValue<number>;
}

interface WordMeta {
  text: string;
  tier: 1 | 2 | 3;
  threshold: number;
}

function getWordTier(word: string): 1 | 2 | 3 {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  if (STOP_WORDS.has(lower)) return 1;
  if (FILLER_WORDS.has(lower)) return 2;
  return 3;
}

export function DissolvingWords({ commits, progress }: DissolvingWordsProps) {
  const words = useMemo<readonly WordMeta[]>(() => {
    const all: WordMeta[] = [];
    for (const commit of commits) {
      const parts = commit.msg.split(/\s+/);
      for (const word of parts) {
        if (!word) continue;
        const tier = getWordTier(word);
        const range = TIER_RANGES[tier];
        const jitter = wordJitter(all.length, word.charCodeAt(0));
        const threshold = range[0] + jitter * (range[1] - range[0]);
        all.push({ text: word, tier, threshold });
      }
    }
    return all;
  }, [commits]);

  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-1">
      {words.map((w, i) => (
        <DissolvingWord key={i} word={w} progress={progress} />
      ))}
    </div>
  );
}

function DissolvingWord({
  word,
  progress,
}: {
  word: WordMeta;
  progress: MotionValue<number>;
}) {
  const end = word.threshold + WORD_DISSOLVE_SPAN;
  const opacity = useTransform(progress, [word.threshold, end], [1, 0]);
  const y = useTransform(progress, [word.threshold, end], [0, -4]);
  const blur = useTransform(progress, [word.threshold, end], [0, 3]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.span
      className="font-mono text-[clamp(8px,1.1cqh,11px)] text-(--text-dim)"
      style={{ opacity, y, filter }}
    >
      {word.text}
    </motion.span>
  );
}
