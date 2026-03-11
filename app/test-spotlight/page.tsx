"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

/* ── Data ── */

const ITEMS = [
  {
    question: "How do you incorporate user research into your engineering decisions?",
    principle: "I build from observed behaviour, not assumption.",
    detail:
      "I watched medical students use flows I thought were straightforward and saw where they hesitated, misread, or took the long way through. That changed how I build. What feels obvious in the code is not always obvious in the experience.",
    seedWords: ["research", "decisions"],
    company: "AMBOSS",
  },
  {
    question: "How do you tell the difference between a product problem and a systems problem?",
    principle: "I step back and check if we're solving the right problem first.",
    detail:
      "The page was still slow in the hand, even after the local fixes looked right on paper. I stepped back and looked at the loading flow itself, what was arriving too early, what could wait, and what was blocking the experience for no good reason. Once I reworked that layer, the improvement was something users could actually feel.",
    seedWords: ["product", "systems"],
    company: "Compado",
  },
  {
    question: "How do you get code quality raised across a platform?",
    principle: "I turn messy flows into something users and engineers can follow.",
    detail:
      "I value structure that makes the right path the easy path. Here, the frontend had drifted into something people edited carefully rather than extended confidently. I reduced one-off patterns, pulled repeated logic into clearer shared structures, added tests around the brittle flows, and cleaned up the places where small changes had too many side effects, so new work could build on the system instead of negotiating with it.",
    seedWords: ["raised", "quality", "code", "platform"],
    company: "CAPinside",
  },
  {
    question: "How do you balance speed and safety on a platform that millions of users depend on?",
    principle: "I put enough testing in place that we can ship without second-guessing ourselves.",
    detail:
      "I helped push testing into the release process because too much was being caught late and too much depended on people remembering things. With Jest and Playwright in place around critical flows, shipping became more regular, less tense, and easier for the team to trust.",
    seedWords: ["speed", "safety", "platform", "millions", "users"],
    company: "DKB Code Factory",
  },
];

type Item = (typeof ITEMS)[number];

/* ── Colors ── */
const BG = "#07070A";
const CREAM = "#F0E6D0";
const CREAM_MUTED = "#B0A890";
const TEXT_DIM = "#8A8478";
const TEXT_FAINT = "#4A4640";
const GOLD_MUTED = "#A89260";
const STROKE = "#16161E";

/* ── Font ── */
const FONT = "var(--font-spectral, Georgia)";
const MONO = "var(--font-mono, monospace)";

/* ── Shared: Question with seed word highlights ── */

function QuestionText({
  item, style, className,
}: {
  item: Item;
  style?: React.CSSProperties;
  className?: string;
}) {
  const seedSet = useMemo(() => new Set(item.seedWords.map((w) => w.toLowerCase())), [item.seedWords]);
  const words = item.question.split(" ");

  return (
    <p className={className} style={style}>
      {words.map((w, wi) => {
        const stripped = w.toLowerCase().replace(/[^a-z]/g, "");
        const isSeed = seedSet.has(stripped);
        return (
          <span key={wi} style={{ color: isSeed ? CREAM : undefined }}>
            {w}{wi < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}


/* ══════════════════════════════════════════════════════════════
 * OPTION A — CONVERGE
 *
 * Phase 1 (0–0.20): All 4 questions form simultaneously.
 *   Seed words start scattered/blurred, fly into position.
 *   Fill words fade in. All 4 questions hang together.
 *
 * Phase 2 (0.20–0.30): Questions 2/3/4 fade out.
 *   Question 1 slides into left-column focal position.
 *   Principle + detail fade in on the right.
 *
 * Phase 3 (0.30–1.0): Pinned crossfade cycling through 1→2→3→4.
 *
 * ══════════════════════════════════════════════════════════════ */

/* Seed word animation — blurred/scattered → clear/positioned */
function SeedFormWord({
  word, isSeed, scrollYProgress, formEnd,
}: {
  word: string; isSeed: boolean;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  formEnd: number;
}) {
  const opacity = useTransform(scrollYProgress,
    [0, formEnd * 0.3, formEnd * 0.7],
    isSeed ? [0, 0.5, 1] : [0, 0, 1]);
  const blur = useTransform(scrollYProgress,
    [0, formEnd * 0.5, formEnd * 0.8],
    isSeed ? [8, 3, 0] : [4, 2, 0]);
  const y = useTransform(scrollYProgress,
    [0, formEnd * 0.6, formEnd],
    isSeed ? [20, 5, 0] : [8, 2, 0]);
  const filterVal = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span
      className="inline-block"
      style={{
        opacity,
        y,
        filter: filterVal,
        color: isSeed ? CREAM : CREAM_MUTED,
      }}
    >
      {word}&nbsp;
    </motion.span>
  );
}

function FormingQuestion({
  item, scrollYProgress, formEnd, groupOpacity,
}: {
  item: Item;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  formEnd: number;
  groupOpacity: ReturnType<typeof useTransform>;
}) {
  const seedSet = useMemo(() => new Set(item.seedWords.map((w) => w.toLowerCase())), [item.seedWords]);
  const words = item.question.split(" ");

  return (
    <motion.div className="text-center" style={{ opacity: groupOpacity }}>
      <p className="italic" style={{ fontFamily: FONT, fontSize: "clamp(14px, 2vw, 20px)", lineHeight: 1.55 }}>
        {words.map((w, wi) => (
          <SeedFormWord
            key={wi}
            word={w}
            isSeed={seedSet.has(w.toLowerCase().replace(/[^a-z]/g, ""))}
            scrollYProgress={scrollYProgress}
            formEnd={formEnd}
          />
        ))}
      </p>
    </motion.div>
  );
}

function ConvergeCrossfadeItem({
  item, index, scrollYProgress, cycleStart,
}: {
  item: Item; index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  cycleStart: number;
}) {
  const cycleLen = (1 - cycleStart) / ITEMS.length;
  const zStart = cycleStart + index * cycleLen;
  const zEnd = zStart + cycleLen;
  const zMid = (zStart + zEnd) / 2;

  const questionY = useTransform(scrollYProgress, [zStart, zMid, zEnd], [60, 0, -60]);
  const detailY = useTransform(scrollYProgress, [zStart, zMid, zEnd], [-40, 0, 40]);
  const opacity = useTransform(scrollYProgress,
    [zStart, zStart + 0.03, zMid - 0.01, zMid + 0.01, zEnd - 0.03, zEnd],
    [0, 1, 1, 1, 1, 0]);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center px-8" style={{ opacity }}>
      <div className="grid w-full max-w-5xl gap-10" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
        <motion.div className="flex flex-col justify-center text-right" style={{ y: questionY }}>
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT }}>{item.company}</span>
          <QuestionText item={item} className="italic"
            style={{ fontFamily: FONT, fontSize: "clamp(14px, 1.8vw, 19px)", lineHeight: 1.55, color: CREAM_MUTED }} />
        </motion.div>
        <div className="flex items-center"><div className="h-3/4 w-px" style={{ backgroundColor: STROKE }} /></div>
        <div className="flex flex-col justify-center">
          <p style={{ fontFamily: FONT, fontSize: "clamp(18px, 2.5vw, 28px)", lineHeight: 1.35, letterSpacing: "-0.01em", color: GOLD_MUTED }}>
            {item.principle}
          </p>
          <motion.p className="mt-4 max-w-md"
            style={{ fontFamily: FONT, fontSize: "clamp(12px, 1.2vw, 14px)", lineHeight: 1.75, color: TEXT_DIM, y: detailY }}>
            {item.detail}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function OptionA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const FORM_END = 0.18;
  const TRANSITION = 0.28;
  const CYCLE_START = 0.30;

  /* All-questions-visible phase opacity */
  const allQuestionsOpacity = useTransform(scrollYProgress, [FORM_END, TRANSITION], [1, 0]);
  /* Per-question opacity during formation (all same for now) */
  const formGroupOpacity = useTransform(scrollYProgress, [0, FORM_END * 0.5, FORM_END, TRANSITION], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative" style={{ height: "700vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: BG }}>

        {/* Phase 1: All 4 questions forming simultaneously */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8"
          style={{ opacity: allQuestionsOpacity }}
        >
          {ITEMS.map((item, i) => (
            <FormingQuestion
              key={i}
              item={item}
              scrollYProgress={scrollYProgress}
              formEnd={FORM_END}
              groupOpacity={formGroupOpacity}
            />
          ))}
        </motion.div>

        {/* Phase 3: Crossfade cycling */}
        {ITEMS.map((item, i) => (
          <ConvergeCrossfadeItem
            key={i}
            item={item}
            index={i}
            scrollYProgress={scrollYProgress}
            cycleStart={CYCLE_START}
          />
        ))}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
 * OPTION B — SEQUENTIAL FORMATION
 *
 * Each question forms from seeds AND gets answered in one
 * continuous scroll. No "all visible at once" moment.
 *
 * Per item: seeds scatter in → words form question → principle
 * fades in on right → detail appears → crossfade to next.
 *
 * ══════════════════════════════════════════════════════════════ */

function SequentialItem({
  item, index, scrollYProgress,
}: {
  item: Item; index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const count = ITEMS.length;
  const zStart = index / count;
  const zEnd = (index + 1) / count;
  const span = zEnd - zStart; // 0.25

  /* Sub-phases within this item's zone:
   * 0.00–0.25: seeds form question
   * 0.25–0.45: question fully visible, principle fades in
   * 0.45–0.70: principle + detail visible (reading time)
   * 0.70–1.00: everything fades out, next item starts */
  const formEnd = zStart + span * 0.25;
  const principleIn = zStart + span * 0.30;
  const detailIn = zStart + span * 0.45;
  const holdEnd = zStart + span * 0.75;
  const fadeOut = zEnd;

  const seedSet = useMemo(() => new Set(item.seedWords.map((w) => w.toLowerCase())), [item.seedWords]);
  const words = item.question.split(" ");

  /* Question word formation */
  const questionY = useTransform(scrollYProgress, [zStart, formEnd, holdEnd, fadeOut], [0, 0, 0, -50]);

  /* Overall item opacity */
  const itemOpacity = useTransform(scrollYProgress,
    [zStart, zStart + span * 0.05, holdEnd, fadeOut],
    [0, 1, 1, 0]);

  /* Principle */
  const principleOpacity = useTransform(scrollYProgress, [principleIn, principleIn + span * 0.1], [0, 1]);
  const principleY = useTransform(scrollYProgress, [principleIn, principleIn + span * 0.1], [20, 0]);

  /* Detail */
  const detailOpacity = useTransform(scrollYProgress, [detailIn, detailIn + span * 0.1], [0, 1]);
  const detailYOffset = useTransform(scrollYProgress, [detailIn, detailIn + span * 0.1, holdEnd, fadeOut], [30, 0, 0, 30]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-8"
      style={{ opacity: itemOpacity }}
    >
      <div className="grid w-full max-w-5xl gap-10" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
        {/* Left: forming question */}
        <motion.div className="flex flex-col justify-center text-right" style={{ y: questionY }}>
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT }}>{item.company}</span>
          <p className="italic" style={{ fontFamily: FONT, fontSize: "clamp(14px, 1.8vw, 19px)", lineHeight: 1.55 }}>
            {words.map((w, wi) => {
              const isSeed = seedSet.has(w.toLowerCase().replace(/[^a-z]/g, ""));
              return (
                <SequentialWord
                  key={wi}
                  word={w}
                  isSeed={isSeed}
                  scrollYProgress={scrollYProgress}
                  formStart={zStart}
                  formEnd={formEnd}
                />
              );
            })}
          </p>
        </motion.div>

        <div className="flex items-center"><div className="h-3/4 w-px" style={{ backgroundColor: STROKE }} /></div>

        {/* Right: principle + detail */}
        <div className="flex flex-col justify-center">
          <motion.p
            style={{
              fontFamily: FONT, fontSize: "clamp(18px, 2.5vw, 28px)", lineHeight: 1.35,
              letterSpacing: "-0.01em", color: GOLD_MUTED,
              opacity: principleOpacity, y: principleY,
            }}>
            {item.principle}
          </motion.p>
          <motion.p className="mt-4 max-w-md"
            style={{ fontFamily: FONT, fontSize: "clamp(12px, 1.2vw, 14px)", lineHeight: 1.75, color: TEXT_DIM, opacity: detailOpacity, y: detailYOffset }}>
            {item.detail}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function SequentialWord({
  word, isSeed, scrollYProgress, formStart, formEnd,
}: {
  word: string; isSeed: boolean;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  formStart: number; formEnd: number;
}) {
  const span = formEnd - formStart;
  const opacity = useTransform(scrollYProgress,
    [formStart, formStart + span * (isSeed ? 0.3 : 0.6), formEnd],
    [0, isSeed ? 0.7 : 0, 1]);
  const blur = useTransform(scrollYProgress,
    [formStart, formStart + span * 0.5, formEnd],
    isSeed ? [6, 2, 0] : [4, 2, 0]);
  const y = useTransform(scrollYProgress,
    [formStart, formEnd],
    isSeed ? [15, 0] : [6, 0]);
  const filterVal = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span
      className="inline-block"
      style={{ opacity, y, filter: filterVal, color: isSeed ? CREAM : CREAM_MUTED }}
    >
      {word}&nbsp;
    </motion.span>
  );
}

function OptionB() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative" style={{ height: "700vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: BG }}>
        {ITEMS.map((item, i) => (
          <SequentialItem key={i} item={item} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
 * OPTION C — PROLOGUE + ACT TWO
 *
 * Phase 1 (0–0.25): All 4 questions form together as a
 *   dramatic "title card" — the full scope hangs visible.
 *   A beat of stillness.
 *
 * Phase 2 (0.25–0.30): Subtle text appears: "Here's how I
 *   answered each one." or just a thin line draws.
 *
 * Phase 3 (0.30–1.0): Questions separate — first one takes
 *   focal position with principle + detail. Crossfade cycling.
 *   But now each question is ALREADY formed — no re-formation.
 *   They just slide into position from where they were.
 *
 * ══════════════════════════════════════════════════════════════ */

function OptionC() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const FORM_END = 0.15;
  const BEAT_END = 0.22;
  const CYCLE_START = 0.28;

  /* Formation phase */
  const formGroupOpacity = useTransform(scrollYProgress, [0, FORM_END * 0.4, FORM_END], [0, 0.5, 1]);
  const allQuestionsOpacity = useTransform(scrollYProgress, [FORM_END, BEAT_END, CYCLE_START], [1, 1, 0]);

  /* Transition beat — thin line draws */
  const lineWidth = useTransform(scrollYProgress, [FORM_END + 0.01, BEAT_END], [0, 100]);
  const lineOpacity = useTransform(scrollYProgress, [FORM_END, FORM_END + 0.02, BEAT_END, CYCLE_START], [0, 0.5, 0.5, 0]);

  return (
    <div ref={ref} className="relative" style={{ height: "700vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: BG }}>

        {/* Phase 1: All questions form as title card */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8"
          style={{ opacity: allQuestionsOpacity }}
        >
          {ITEMS.map((item, i) => (
            <FormingQuestion
              key={i}
              item={item}
              scrollYProgress={scrollYProgress}
              formEnd={FORM_END}
              groupOpacity={formGroupOpacity}
            />
          ))}

          {/* Transition beat — thin gold line */}
          <motion.div
            className="mt-4 h-px"
            style={{
              width: useTransform(lineWidth, (v) => `${v}%`),
              maxWidth: 200,
              backgroundColor: GOLD_MUTED,
              opacity: lineOpacity,
            }}
          />
        </motion.div>

        {/* Phase 3: Crossfade cycling — questions already formed, just position */}
        {ITEMS.map((item, i) => {
          const cycleLen = (1 - CYCLE_START) / ITEMS.length;
          const zStart = CYCLE_START + i * cycleLen;
          const zEnd = zStart + cycleLen;
          const zMid = (zStart + zEnd) / 2;

          return (
            <PrologueCrossfadeItem
              key={i}
              item={item}
              scrollYProgress={scrollYProgress}
              zStart={zStart}
              zEnd={zEnd}
              zMid={zMid}
            />
          );
        })}
      </div>
    </div>
  );
}

function PrologueCrossfadeItem({
  item, scrollYProgress, zStart, zEnd, zMid,
}: {
  item: Item;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  zStart: number; zEnd: number; zMid: number;
}) {
  const questionY = useTransform(scrollYProgress, [zStart, zMid, zEnd], [50, 0, -50]);
  const detailY = useTransform(scrollYProgress, [zStart, zMid, zEnd], [-30, 0, 30]);
  const opacity = useTransform(scrollYProgress,
    [zStart, zStart + 0.03, zMid - 0.01, zMid + 0.01, zEnd - 0.03, zEnd],
    [0, 1, 1, 1, 1, 0]);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center px-8" style={{ opacity }}>
      <div className="grid w-full max-w-5xl gap-10" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
        <motion.div className="flex flex-col justify-center text-right" style={{ y: questionY }}>
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT }}>{item.company}</span>
          <QuestionText item={item} className="italic"
            style={{ fontFamily: FONT, fontSize: "clamp(14px, 1.8vw, 19px)", lineHeight: 1.55, color: CREAM_MUTED }} />
        </motion.div>
        <div className="flex items-center"><div className="h-3/4 w-px" style={{ backgroundColor: STROKE }} /></div>
        <div className="flex flex-col justify-center">
          <p style={{ fontFamily: FONT, fontSize: "clamp(18px, 2.5vw, 28px)", lineHeight: 1.35, letterSpacing: "-0.01em", color: GOLD_MUTED }}>
            {item.principle}
          </p>
          <motion.p className="mt-4 max-w-md"
            style={{ fontFamily: FONT, fontSize: "clamp(12px, 1.2vw, 14px)", lineHeight: 1.75, color: TEXT_DIM, y: detailY }}>
            {item.detail}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}


/* ══════════════════════════════════════════════════════════════
 * PAGE — All 3 options stacked
 * ══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  {
    id: "converge",
    label: "A — Converge",
    sub: "All 4 questions form together, then converge into one-at-a-time crossfade.",
    Component: OptionA,
  },
  {
    id: "sequential",
    label: "B — Sequential",
    sub: "Each question forms from seeds AND gets answered in one continuous scroll.",
    Component: OptionB,
  },
  {
    id: "prologue",
    label: "C — Prologue + Act Two",
    sub: "All questions form as a title card moment, then separate into crossfade.",
    Component: OptionC,
  },
];

export default function TestSpotlightPage() {
  return (
    <div style={{ backgroundColor: BG }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex gap-4 px-6 py-3 backdrop-blur-md"
        style={{ backgroundColor: `${BG}CC`, borderBottom: `1px solid ${TEXT_FAINT}30` }}>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}
            className="font-mono text-[10px] uppercase tracking-[0.08em] transition-colors hover:text-[var(--cream)]"
            style={{ color: TEXT_DIM }}>
            {s.label}
          </a>
        ))}
      </nav>

      {SECTIONS.map(({ id, label, sub, Component }) => (
        <section key={id} id={id}>
          <div className="flex h-[50vh] flex-col items-center justify-center px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>{label}</p>
            <p className="mt-2 max-w-md text-center font-mono text-[10px] tracking-[0.05em]" style={{ color: TEXT_FAINT }}>{sub}</p>
          </div>
          <Component />
        </section>
      ))}

      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT }}>End</p>
      </div>
    </div>
  );
}
