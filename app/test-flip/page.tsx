"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SOURCE = "I am a person who loves pizza";
const TARGET = "What kind of pizza do you like?";
const SEED = "pizza";

const sourceWords = SOURCE.split(" ");
const targetWords = TARGET.split(" ");

/* Find seed index in each sentence */
const seedSourceIdx = sourceWords.findIndex((w) => w.toLowerCase() === SEED);
const seedTargetIdx = targetWords.findIndex(
  (w) => w.toLowerCase().replace(/[^a-z]/g, "") === SEED,
);

type Phase = "idle" | "dissolving" | "flying" | "done";

export default function TestFlipPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef<HTMLSpanElement>(null);
  const targetPlaceholderRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  /* Start after 1.5s */
  useEffect(() => {
    const t = setTimeout(() => setPhase("dissolving"), 1500);
    return () => clearTimeout(t);
  }, []);

  /* ── Dissolve non-seed source words ── */
  useEffect(() => {
    if (phase !== "dissolving") return;
    const el = containerRef.current;
    if (!el) return;

    const nonSeeds = el.querySelectorAll("[data-dissolve]");

    const tl = gsap.timeline({
      onComplete: () => setPhase("flying"),
    });

    tl.to(nonSeeds, {
      opacity: 0,
      y: -12,
      filter: "blur(6px)",
      duration: 1.2,
      stagger: { each: 0.08, from: "random" },
      ease: "power2.in",
    });

    return () => { tl.kill(); };
  }, [phase]);

  /* ── Fly: measure target position, animate seed there with GSAP transform ── */
  useEffect(() => {
    if (phase !== "flying") return;
    const seed = seedRef.current;
    const placeholder = targetPlaceholderRef.current;
    if (!seed || !placeholder) return;

    /* Measure where the seed IS and where it NEEDS TO BE */
    const seedRect = seed.getBoundingClientRect();
    const targetRect = placeholder.getBoundingClientRect();

    const dx = targetRect.left - seedRect.left;
    const dy = targetRect.top - seedRect.top;

    /* Hide the placeholder (the real seed will fly there) */
    placeholder.style.visibility = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("done");
        /* Snap the seed to its final position using the placeholder */
        if (placeholder) placeholder.style.visibility = "visible";
      },
    });

    /* Animate font change + position simultaneously */
    tl.to(seed, {
      x: dx,
      y: dy,
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
      fontSize: "30px",
      color: "#F0E6D0",
      duration: 1.2,
      ease: "power3.inOut",
    });

    /* Fade in non-seed target words partway through the fly */
    const fills = containerRef.current?.querySelectorAll("[data-fill]");
    if (fills) {
      tl.fromTo(
        fills,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.7", // overlap with the fly
      );
    }

    return () => { tl.kill(); };
  }, [phase]);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#07070A" }}
    >
      {/* ── Source sentence (always in DOM) ── */}
      <div
        className="absolute flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 px-8"
        style={{
          visibility: phase === "done" ? "hidden" : "visible",
        }}
      >
        {sourceWords.map((word, i) =>
          i === seedSourceIdx ? (
            <span
              key={i}
              ref={seedRef}
              className="inline-block font-mono text-[30px]"
              style={{ color: "#F0E6D0" }}
            >
              {word}
            </span>
          ) : (
            <span
              key={i}
              data-dissolve=""
              className="inline-block font-mono text-[30px]"
              style={{ color: "#8A8478" }}
            >
              {word}
            </span>
          ),
        )}
      </div>

      {/* ── Target sentence (always in DOM, words invisible until filled) ── */}
      <p
        className="absolute text-center text-[30px] italic px-8"
        style={{
          fontFamily: "Georgia, serif",
          color: "#B0A890",
          visibility: phase === "flying" || phase === "done" ? "visible" : "hidden",
        }}
      >
        {targetWords.map((word, i) =>
          i === seedTargetIdx ? (
            <span key={i}>
              <span
                ref={targetPlaceholderRef}
                className="inline-block"
                style={{
                  color: "#F0E6D0",
                  visibility: phase === "done" ? "visible" : "hidden",
                }}
              >
                {word}
              </span>
              {i < targetWords.length - 1 && " "}
            </span>
          ) : (
            <span key={i}>
              <span
                data-fill=""
                className="inline-block"
                style={{ opacity: 0 }}
              >
                {word}
              </span>
              {i < targetWords.length - 1 && " "}
            </span>
          ),
        )}
      </p>
    </div>
  );
}
