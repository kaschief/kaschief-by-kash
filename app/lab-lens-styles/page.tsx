"use client";

/**
 * Lens Styles Prototype — GAPS: Triangular crossfade (EC-matched)
 *
 * Layout mirrors Act II word-distillation:
 * - Left: card at vertical center (= "question")
 * - Right: i-statement large + story smaller below as one unit, upper-right (= "principle" + "detail")
 * - Card descends from above, i-statement descends shortly after, story rises from below to join it
 * - Gentle drift during hold, everything fades out together
 */

import { useRef, useEffect } from "react";
import { LabNav } from "../lab-nav";
import { LENSES } from "@data";
import { renderCard } from "../lab-artifacts/render-card";

/* ── Math ── */

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
/** power1.out = quadratic ease out (GSAP power1.out) */
function eOut(t: number): number { return 1 - (1 - t) * (1 - t); }
/** power1.in = quadratic ease in (GSAP power1.in) */
function eIn(t: number): number { return t * t; }
function ep(v: number, s: number, e: number, ease: (t: number) => number): number {
  return ease(clamp((v - s) / (e - s), 0, 1));
}

/* ── Scroll progress ── */

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const p = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = () => {
      const r = el.getBoundingClientRect();
      const t = el.scrollHeight - window.innerHeight;
      if (t > 0) p.current = clamp(-r.top / t, 0, 1);
    };
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, [ref]);
  return p;
}

/* ── Data ── */

const GAPS = LENSES.gaps.entries;
const N = GAPS.length;

/* ── Timing (fractions of each item span) ── */

/* Exact EC ratios within each item's span:
 * questionIn=0, questionDone=0.26, principleIn=0.34, principleDone=0.50,
 * detailIn=0.50, detailDone=0.62, holdEnd=0.78, fadeOutEnd=1.0
 * Exit is 0.78→1.0 (22% of span) — generous, never rushed.
 * Items are strictly sequential — no overlap. */
const Z = {
  cardIn: 0, cardDone: 0.26,
  iIn: 0.34, iDone: 0.50,
  storyIn: 0.50, storyDone: 0.62,
  driftEnd: 0.78,
  fadeS: 0.78, fadeE: 1.0,
};

/* ── Y offsets (px) matching EC exactly ── */
/* EC values: question y:65→4→-4→-22, principle y:-60→-3→3→16, detail y:40→2→-2→16 */

const M = {
  // Card (= question): rises from below, drifts up, exits up
  card:  { from: 65,   rest: 4,   drift: -4,  exit: -22 },
  // I-statement (= principle): descends from above, drifts down, exits down
  iStmt: { from: -60,  rest: -3,  drift: 3,   exit: 16  },
  // Story (= detail): rises from below, drifts up, exits down
  story: { from: 40,   rest: 2,   drift: -2,  exit: 16  },
};

function GapsCrossfadeSection() {
  const cRef = useRef<HTMLDivElement>(null);
  const pRef = useScrollProgress(cRef);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const compRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iStmtRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillBgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fr = useRef(0);

  useEffect(() => {
    const tick = () => {
      const p = pRef.current;
      const span = 1 / N;

      for (let i = 0; i < N; i++) {
        const L = clamp((p - i * span) / span, -0.05, 1.05);
        const last = i === N - 1;

        // Container: fade in with card, all fade out together
        const fadeIn = ep(L, Z.cardIn, Z.cardDone, eOut);
        const fadeOut = last ? 0 : ep(L, Z.fadeS, Z.fadeE, eIn);
        const it = itemRefs.current[i];
        if (it) {
          const o = fadeIn * (1 - fadeOut);
          it.style.opacity = String(o);
          it.style.visibility = o > 0.005 ? "visible" : "hidden";
        }

        // Exit progress (power1.in — gentle acceleration out)
        const exitP = last ? 0 : ep(L, Z.fadeS, Z.fadeE, eIn);

        // Card (= question): rises from below, drifts up, exits up
        const cd = cardRefs.current[i];
        if (cd) {
          const entry = ep(L, Z.cardIn, Z.cardDone, eOut);
          const drift = ep(L, Z.cardDone, Z.driftEnd, (t) => t);
          const y = lerp(M.card.from, M.card.rest, entry) + drift * M.card.drift + exitP * M.card.exit;
          cd.style.transform = `translateY(${y}px)`;
        }

        // Company label
        const cm = compRefs.current[i];
        if (cm) cm.style.opacity = String(ep(L, Z.cardIn + 0.08, Z.cardDone + 0.05, eOut) * 0.5);

        // I-statement (= principle): descends from above, drifts down, exits down
        const is_ = iStmtRefs.current[i];
        if (is_) {
          const entry = ep(L, Z.iIn, Z.iDone, eOut);
          const drift = ep(L, Z.iDone, Z.driftEnd, (t) => t);
          const y = lerp(M.iStmt.from, M.iStmt.rest, entry) + drift * M.iStmt.drift + exitP * M.iStmt.exit;
          is_.style.transform = `translateY(${y}px)`;
          is_.style.opacity = String(entry);
        }

        // Story (= detail): rises from below, drifts up, exits down
        const st = storyRefs.current[i];
        if (st) {
          const entry = ep(L, Z.storyIn, Z.storyDone, eOut);
          const drift = ep(L, Z.storyDone, Z.driftEnd, (t) => t);
          const y = lerp(M.story.from, M.story.rest, entry) + drift * M.story.drift + exitP * M.story.exit;
          st.style.transform = `translateY(${y}px)`;
          st.style.opacity = String(entry);
        }
      }

      // Progress pills
      const active = clamp(Math.floor(p * N), 0, N - 1);
      for (let i = 0; i < N; i++) {
        const bg = pillBgRefs.current[i];
        const fill = pillFillRefs.current[i];
        if (!bg || !fill) continue;

        if (i < active) {
          bg.style.width = "8px";
          bg.style.borderRadius = "999px";
          fill.style.width = "100%";
          fill.style.opacity = "0.6";
        } else if (i === active) {
          bg.style.width = "28px";
          bg.style.borderRadius = "4px";
          const localP = (p - i * span) / span;
          fill.style.width = `${clamp(localP * 100, 0, 100)}%`;
          fill.style.opacity = "1";
        } else {
          bg.style.width = "8px";
          bg.style.borderRadius = "999px";
          fill.style.width = "0%";
          fill.style.opacity = "0.3";
        }
      }

      fr.current = requestAnimationFrame(tick);
    };
    fr.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(fr.current);
  }, [pRef]);

  return (
    <div ref={cRef} style={{ height: "600vh", background: "var(--bg)" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {GAPS.map((entry, i) => (
          <div
            key={entry.id}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="absolute inset-0 flex items-center px-8"
            style={{ opacity: 0, visibility: "hidden" }}>

            <div className="flex w-full mx-auto items-center gap-14" style={{ maxWidth: 1100 }}>

              {/* Left: card at vertical center */}
              <div style={{ width: "42%" }}>
                <div
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="pointer-events-none"
                  style={{ willChange: "transform" }}>
                  {renderCard(entry, { boxShadow: "0 8px 40px rgba(0,0,0,0.45)" })}
                </div>
                <div
                  ref={(el) => { compRefs.current[i] = el; }}
                  className="font-ui mt-4 text-center pointer-events-none"
                  style={{
                    opacity: 0, fontSize: 10, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "var(--gold-dim)",
                  }}>
                  {entry.company} &middot; {entry.years}
                </div>
              </div>

              {/* Right: i-statement (large, gold) + story (smaller, muted) as one unit */}
              <div style={{ width: "50%" }}>
                {/* I-statement — large, like "principle" */}
                <div
                  ref={(el) => { iStmtRefs.current[i] = el; }}
                  style={{
                    opacity: 0, willChange: "transform, opacity",
                    fontFamily: "var(--font-serif)", fontStyle: "italic",
                    fontSize: "clamp(1.1rem, 2vw, 1.6rem)", lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    color: "var(--gold)", fontWeight: 400,
                  }}>
                  {entry.iStatement}
                </div>

                {/* Story — smaller, like "detail" */}
                <div
                  ref={(el) => { storyRefs.current[i] = el; }}
                  style={{
                    opacity: 0, marginTop: 32, willChange: "transform, opacity",
                    fontFamily: "var(--font-narrator)", fontStyle: "italic",
                    fontSize: "clamp(0.78rem, 1vw, 0.9rem)", lineHeight: 1.75,
                    color: "var(--text-dim)",
                  }}>
                  {entry.story}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Progress pills */}
        <div className="absolute left-1/2 flex items-center gap-2 pointer-events-none"
          style={{ bottom: "4%", transform: "translateX(-50%)" }}>
          {GAPS.map((_, i) => (
            <div
              key={i}
              ref={(el) => { pillBgRefs.current[i] = el; }}
              style={{
                width: 8, height: 8, borderRadius: 999,
                background: "var(--stroke)", overflow: "hidden",
                transition: "width 0.3s ease, border-radius 0.3s ease",
              }}>
              <div
                ref={(el) => { pillFillRefs.current[i] = el; }}
                style={{
                  width: "0%", height: "100%",
                  background: "var(--gold-dim)", borderRadius: "inherit",
                  transition: "opacity 0.3s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LensStylesPage() {
  return (
    <>
      <LabNav />
      <GapsCrossfadeSection />
      <div style={{ height: "25vh", background: "var(--bg)" }} />
    </>
  );
}
