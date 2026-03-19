"use client";

import { useRef, useEffect, useMemo } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { DevNav } from "../dev-nav";

/* ── Copy ─────────────────────────────────────────────────── */
const COMPANY = "AMBOSS";
const LOCATION = "Berlin, 2018–2019";
const ACCENT = "#60A5FA";
const GOLD = "var(--gold)";
const CREAM = "var(--cream)";

interface ParaConfig {
  text: string;
  font: string;
  size: string;
  italic: boolean;
}

const PARAGRAPHS: ParaConfig[] = [
  {
    text: "Half a million med students used this app to pass their boards. I'd been one of them. I knew exactly where the product lost people because I remembered where it lost me.",
    font: "font-serif",
    size: "text-[1.05rem]",
    italic: false,
  },
  {
    text: "The team built from tickets. I built from the feeling of being the user at 3am with an exam in six hours. That difference shaped everything.",
    font: "font-sans",
    size: "text-[0.9rem]",
    italic: false,
  },
  {
    text: "I stopped guessing what users wanted. I pulled session data, set up A/B tests, broke production once at 2am, and started building from evidence.",
    font: "font-sans",
    size: "text-[0.9rem]",
    italic: false,
  },
  {
    text: "Your instinct is a hypothesis. Treat it like one.",
    font: "font-narrator",
    size: "text-[1rem]",
    italic: true,
  },
];

/* ── Build word list with separators ──────────────────────── */
interface WordToken {
  type: "word" | "break";
  text: string;
  paraIndex: number;
  font: string;
  size: string;
  italic: boolean;
}

function buildTokens(paragraphs: ParaConfig[]): WordToken[] {
  const tokens: WordToken[] = [];
  paragraphs.forEach((p, pi) => {
    if (pi > 0) {
      tokens.push({
        type: "break",
        text: "·",
        paraIndex: pi,
        font: "",
        size: "",
        italic: false,
      });
    }
    const words = p.text.split(/\s+/);
    words.forEach((w) => {
      tokens.push({
        type: "word",
        text: w,
        paraIndex: pi,
        font: p.font,
        size: p.size,
        italic: p.italic,
      });
    });
  });
  return tokens;
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ForgeV23() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const tokens = useMemo(() => buildTokens(PARAGRAPHS), []);
  const totalTokens = tokens.length;

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const els = tokenRefs.current;
    /* map scroll 0.05–0.92 to token reveal (leave breathing room) */
    const scrollStart = 0.05;
    const scrollEnd = 0.92;
    const range = scrollEnd - scrollStart;
    const progress = Math.max(0, Math.min(1, (v - scrollStart) / range));
    const currentFloat = progress * totalTokens;

    for (let i = 0; i < totalTokens; i++) {
      const el = els[i];
      if (!el) continue;

      const threshold = i;
      const diff = currentFloat - threshold;

      if (diff < 0) {
        /* not yet revealed */
        el.style.opacity = "0";
        el.style.transform = "scale(1)";
        el.style.color = CREAM;
      } else if (diff < 1) {
        /* currently appearing */
        const t = diff;
        el.style.opacity = `${t}`;
        const sc = 1 + 0.02 * (1 - t);
        el.style.transform = `scale(${sc})`;
        /* gold flash that fades to cream */
        if (t < 0.5) {
          el.style.color = GOLD;
        } else {
          el.style.color = CREAM;
        }
      } else {
        /* fully revealed */
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
        el.style.color = CREAM;
      }
    }
  });

  /* initial state — all hidden */
  useEffect(() => {
    tokenRefs.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "scale(1)";
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-[var(--bg)]"
      style={{ height: "800vh" }}
    >
      <DevNav />

      {/* sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="max-w-[500px] px-6 text-center">
          {/* company header */}
          <p
            className="font-ui text-xs tracking-[0.25em] uppercase mb-1"
            style={{ color: ACCENT }}
          >
            {COMPANY}
          </p>
          <p className="font-sans text-[0.7rem] text-[var(--text-dim)] mb-12">
            {LOCATION}
          </p>

          {/* word-by-word text block */}
          <div className="text-left leading-[1.85]">
            {tokens.map((token, i) => {
              if (token.type === "break") {
                return (
                  <span key={i} className="block my-6 flex justify-center">
                    <span
                      ref={(el) => { tokenRefs.current[i] = el; }}
                      className="inline-block w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: "var(--gold)",
                        willChange: "opacity, transform",
                      }}
                    />
                  </span>
                );
              }

              return (
                <span
                  key={i}
                  ref={(el) => { tokenRefs.current[i] = el; }}
                  className={`inline-block mr-[0.3em] ${token.font} ${token.size} ${token.italic ? "italic" : ""}`}
                  style={{
                    willChange: "opacity, transform, color",
                    transition: "color 0.15s ease",
                  }}
                >
                  {token.text}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
