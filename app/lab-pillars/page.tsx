"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { LabNav } from "../lab-nav";

/* ── Pillar data ── */

interface Story {
  company: string;
  companyColor: string;
  text: string;
}

interface Pillar {
  word: string;
  accent: string;
  subtitle: string;
  stories: Story[];
}

const PILLARS: Pillar[] = [
  {
    word: "Users",
    accent: "#E05252",
    subtitle: "I build from observed behaviour, not assumption.",
    stories: [
      {
        company: "AMBOSS",
        companyColor: "#0AA6B8",
        text: "Half a million med students used the app. I\u2019d been one of them. I knew exactly where the product lost people \u2014 because I remembered where it lost me.",
      },
      {
        company: "Compado",
        companyColor: "#6366F1",
        text: "We had 40 duplicate landing pages. I pulled session recordings, found the three flows that actually converted, and killed the rest.",
      },
      {
        company: "DKB",
        companyColor: "#148DEA",
        text: "Five million users, zero qualitative research. I introduced session replay and turned support tickets into product signals.",
      },
    ],
  },
  {
    word: "Gaps",
    accent: "#5B9EC2",
    subtitle: "I find the missing piece before it becomes a problem.",
    stories: [
      {
        company: "CAPinside",
        companyColor: "#06B6D4",
        text: "No code review, no shared patterns. I introduced PR templates, linting, and a component library. Within two months the team shipped faster with fewer regressions.",
      },
      {
        company: "DKB",
        companyColor: "#148DEA",
        text: "Everyone blamed the frontend for slow pages. I traced it to an unindexed query three services deep. The fix was one line \u2014 finding it took reading four codebases.",
      },
      {
        company: "Compado",
        companyColor: "#6366F1",
        text: "40 duplicated sites with diverging logic. I built a shared component system that reduced the codebase by 60% and made new verticals a config change.",
      },
    ],
  },
  {
    word: "Patterns",
    accent: "#C9A84C",
    subtitle: "I shape the code so the right decisions are easier to make.",
    stories: [
      {
        company: "DKB",
        companyColor: "#148DEA",
        text: "Monthly releases, manual QA, no feature flags. I brought in Playwright, built the release pipeline, and we moved to weekly deploys.",
      },
      {
        company: "AMBOSS",
        companyColor: "#0AA6B8",
        text: "The team built from tickets. I built from the feeling of being the user at 3am with an exam in six hours. That difference shaped every technical decision.",
      },
      {
        company: "Compado",
        companyColor: "#6366F1",
        text: "Lighthouse scores in the 30s. I introduced lazy loading, code splitting, and image optimization. Scores hit 90+, organic traffic doubled.",
      },
    ],
  },
];

/* ── Scroll constants ── */

const TOTAL_HEIGHT_VH = 5000;
const INTRO_FRAC = 0.06; // cards settle into stack
const PILLAR_FRAC = 0.15; // each pillar's scroll zone
// remaining scroll after all pillars: 1 - INTRO_FRAC - PILLAR_FRAC * 4

/* ── Helpers ── */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ── Component ── */

export default function LabPillarsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const tabEls = useRef<(HTMLDivElement | null)[]>([]);
  const storyContainerEls = useRef<(HTMLDivElement | null)[]>([]);
  const storyEls = useRef<(HTMLDivElement | null)[][]>([[], [], [], []]);
  const introTextEl = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll progress to eliminate mouse wheel choppiness.
  // Raw scroll jumps in big steps on mouse; this lerps toward it each frame.
  const smoothProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef(0);

  const updateCards = useCallback((progress: number) => {
    /* ── Intro: cards settle ── */
    const introEnd = INTRO_FRAC;
    const introT = smoothstep(0, introEnd, progress);

    if (introTextEl.current) {
      const fadeOut = 1 - smoothstep(introEnd * 0.5, introEnd * 0.85, progress);
      introTextEl.current.style.opacity = String(fadeOut);
      introTextEl.current.style.transform = `translateY(${lerp(0, -30, smoothstep(introEnd * 0.3, introEnd, progress))}px)`;
    }

    /* ── Per-pillar animation ── */
    const OVERLAP = 0.7; // next card starts peeling at 25% through current card
    PILLARS.forEach((_pillar, i) => {
      // Each card's peel occupies a full PILLAR_FRAC of scroll,
      // but overlaps with the next card by OVERLAP fraction.
      const peelStart = INTRO_FRAC + i * PILLAR_FRAC * (1 - OVERLAP);
      const peelEnd = peelStart + PILLAR_FRAC;
      const pillarStart = peelStart;
      const pillarEnd = peelEnd;
      const storyZoneStart = peelStart + PILLAR_FRAC * 0.15;
      const storyZoneEnd = peelEnd - PILLAR_FRAC * 0.15;
      const exitStart = storyZoneEnd;
      const exitEnd = peelEnd;

      const card = cardEls.current[i];
      const tab = tabEls.current[i];
      const storyContainer = storyContainerEls.current[i];
      const stories = storyEls.current[i];

      if (!card) return;

      /* Card states:
         - waiting: stacked in deck (before this pillar's turn)
         - peeling: rotating/scaling off to reveal content
         - active: expanded, stories visible
         - done: compressed tab at top
      */

      const isBeforeTurn = progress < peelStart;
      const isPeeling = progress >= peelStart && progress < peelEnd;
      const isActive = progress >= peelEnd && progress < exitEnd;
      const isDone = progress >= exitEnd;

      // Stack position (cards stack with slight offset)
      const stackIndex = i;
      const cardsAbove = PILLARS.slice(0, i).filter((_, j) => {
        const jEnd = INTRO_FRAC + (j + 1) * PILLAR_FRAC;
        return progress >= jEnd;
      }).length;

      // Base rotation per card (alternating slight tilt like the reference)
      const baseRotations = [3, -2, 4, -3];
      const baseRot = baseRotations[i] || 0;

      if (isBeforeTurn) {
        // Stacked in deck with base rotation
        const settleT = introT;
        card.style.opacity = "1";
        card.style.transform = `
          translateY(${lerp(80 + i * 30, 0, settleT)}px)
          rotate(${lerp(0, baseRot, settleT)}deg)
        `;
        card.style.zIndex = String(40 - i);
      } else if (isPeeling) {
        // Rolling ball easing — gentle start, smooth acceleration, soft landing
        const rawT = Math.max(
          0,
          Math.min(1, (progress - peelStart) / (peelEnd - peelStart)),
        );
        const peelT =
          rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
        const peelDir = baseRot >= 0 ? 1 : -1;
        const rotation = baseRot + peelT * 22 * peelDir;
        const translateY = peelT * -120;

        card.style.opacity =
          peelT > 0.8 ? String(lerp(1, 0, (peelT - 0.8) / 0.2)) : "1";
        card.style.transform = `translateY(${translateY}vh) rotate(${rotation}deg)`;
        card.style.zIndex = String(40 - i);
      } else if (isActive || isDone) {
        const doneDir = baseRot >= 0 ? 1 : -1;
        card.style.opacity = "0";
        card.style.transform = `translateY(-120vh) rotate(${baseRot + 22 * doneDir}deg)`;
        card.style.zIndex = "0";
      }

      // Tab (compressed strip at top)
      if (tab) {
        if (isDone || isActive) {
          const tabAppear = isDone
            ? 1
            : smoothstep(peelStart, peelEnd, progress);
          tab.style.opacity = String(tabAppear);
          tab.style.transform = `translateY(0)`;
        } else {
          tab.style.opacity = "0";
          tab.style.transform = `translateY(-20px)`;
        }
      }

      // Story container visibility
      if (storyContainer) {
        if (isActive) {
          const containerIn = smoothstep(
            peelEnd,
            peelEnd + PILLAR_FRAC * 0.05,
            progress,
          );
          const containerOut = 1 - smoothstep(exitStart, exitEnd, progress);
          storyContainer.style.opacity = String(
            Math.min(containerIn, containerOut),
          );
          storyContainer.style.pointerEvents =
            containerIn > 0.5 ? "auto" : "none";
        } else {
          storyContainer.style.opacity = "0";
          storyContainer.style.pointerEvents = "none";
        }
      }

      // Individual stories stagger within the story zone
      if (stories && isActive) {
        const storyCount = stories.length;
        const storyZoneDuration = storyZoneEnd - storyZoneStart;

        stories.forEach((storyEl, si) => {
          if (!storyEl) return;
          const storyFrac = storyZoneDuration / storyCount;
          const storyStart = storyZoneStart + si * storyFrac;
          const storyPeak = storyStart + storyFrac * 0.15;
          const storyFadeOut = storyStart + storyFrac * 0.75;
          const storyEnd = storyStart + storyFrac;

          const fadeIn = smoothstep(storyStart, storyPeak, progress);
          const fadeOut =
            si < storyCount - 1
              ? 1 - smoothstep(storyFadeOut, storyEnd, progress)
              : 1 - smoothstep(exitStart, exitEnd, progress);
          const opacity = Math.min(fadeIn, fadeOut);
          const slideY = lerp(40, 0, fadeIn);

          storyEl.style.opacity = String(opacity);
          storyEl.style.transform = `translateY(${slideY}px)`;
        });
      } else if (stories) {
        stories.forEach((storyEl) => {
          if (storyEl) storyEl.style.opacity = "0";
        });
      }
    });
  }, []);

  // RAF loop: lerp smoothProgress toward targetProgress each frame
  useEffect(() => {
    const tick = () => {
      smoothProgress.current += (targetProgress.current - smoothProgress.current) * 0.08;
      updateCards(smoothProgress.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [updateCards]);

  // Feed raw scroll into the target
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetProgress.current = v;
  });

  return (
    <>
      <LabNav />
      <div
        ref={containerRef}
        style={{ height: `${TOTAL_HEIGHT_VH}vh`, background: "var(--bg)" }}>
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Intro text */}
          <div
            ref={introTextEl}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 50 }}>
            <p
              className="font-serif text-center max-w-lg px-8"
              style={{
                fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
                lineHeight: 1.7,
                color: "var(--cream)",
              }}>
              Each of my past roles sharpened a different part of how I think,
              about{" "}
              {PILLARS.map((p, i) => (
                <span key={p.word}>
                  {i > 0 && (i === PILLARS.length - 1 ? " and " : ", ")}
                  <span style={{ color: p.accent, fontWeight: 600 }}>
                    {p.word.toLowerCase()}
                  </span>
                </span>
              ))}
              .
            </p>
          </div>

          {/* Pillar tabs (compressed strips at top) */}
          <div
            className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-2"
            style={{ zIndex: 60 }}>
            {PILLARS.map((pillar, i) => (
              <div
                key={`tab-${pillar.word}`}
                ref={(el) => {
                  tabEls.current[i] = el;
                }}
                className="px-4 py-1.5 rounded-full font-sans uppercase tracking-widest transition-none"
                style={{
                  fontSize: "0.6rem",
                  background: `${pillar.accent}15`,
                  border: `1px solid ${pillar.accent}40`,
                  color: pillar.accent,
                  opacity: 0,
                  willChange: "transform, opacity",
                }}>
                {pillar.word}
              </div>
            ))}
          </div>

          {/* Card stack */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 30 }}>
            {PILLARS.map((pillar, i) => (
              <div
                key={`card-${pillar.word}`}
                ref={(el) => {
                  cardEls.current[i] = el;
                }}
                className="absolute rounded-3xl flex flex-col items-center justify-center text-center p-10 sm:p-14"
                style={{
                  width: "min(500px, 82vw)",
                  height: "min(620px, 75vh)",
                  background: pillar.accent,
                  opacity: 0,
                  willChange: "transform, opacity",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}>
                <h2
                  className="font-serif tracking-tight mb-6"
                  style={{
                    fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
                    color: "var(--cream)",
                    lineHeight: 1.1,
                  }}>
                  {pillar.word}
                </h2>
                <p
                  className="font-serif leading-relaxed max-w-xs"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                    color: "var(--cream)",
                    opacity: 0.85,
                  }}>
                  {pillar.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Story containers (one per pillar, positioned behind cards) */}
          {PILLARS.map((pillar, i) => (
            <div
              key={`stories-${pillar.word}`}
              ref={(el) => {
                storyContainerEls.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                zIndex: 20,
                opacity: 0,
                willChange: "opacity",
              }}>
              {/* Active pillar label */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center">
                <span
                  className="font-sans uppercase tracking-[0.25em] text-[0.6rem]"
                  style={{ color: `${pillar.accent}80` }}>
                  {pillar.word}
                </span>
              </div>

              {/* Stories stack in the center */}
              <div className="relative w-full max-w-2xl px-8">
                {pillar.stories.map((story, si) => (
                  <div
                    key={`story-${i}-${si}`}
                    ref={(el) => {
                      if (!storyEls.current[i]) storyEls.current[i] = [];
                      storyEls.current[i][si] = el;
                    }}
                    className="absolute left-0 right-0 px-8 text-center"
                    style={{
                      opacity: 0,
                      willChange: "transform, opacity",
                    }}>
                    {/* Company badge */}
                    <span
                      className="inline-block font-sans uppercase tracking-[0.2em] mb-5 px-3 py-1 rounded-full"
                      style={{
                        fontSize: "0.55rem",
                        color: story.companyColor,
                        background: `${story.companyColor}12`,
                        border: `1px solid ${story.companyColor}25`,
                      }}>
                      {story.company}
                    </span>

                    {/* Story text */}
                    <p
                      className="font-serif mx-auto"
                      style={{
                        fontSize: "clamp(1rem, 2vw, 1.25rem)",
                        lineHeight: 1.75,
                        color: "var(--cream)",
                        maxWidth: "42ch",
                      }}>
                      {story.text}
                    </p>

                    {/* Subtle divider */}
                    <div
                      className="mx-auto mt-6 w-6 h-px rounded-full"
                      style={{ background: `${pillar.accent}30` }}
                    />
                  </div>
                ))}
              </div>

              {/* Pillar accent glow (very subtle) */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${pillar.accent}20, transparent)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
