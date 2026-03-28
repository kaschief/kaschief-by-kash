import { LabNav } from "../lab-nav";

type StoryCard = {
  company: string;
  label: string;
  note: string;
};

type BridgeSample = {
  slug: string;
  title: string;
  strapline: string;
  placement: string;
  bestFor: string;
  recommended?: boolean;
  storyCards: readonly StoryCard[];
  bridgeTitle: string;
  bridgeBody: string;
  bridgeSignals: readonly string[];
  funnelTiers: readonly string[];
  coda: string;
};

const SAMPLES: readonly BridgeSample[] = [
  {
    slug: "signal-harvest",
    title: "1. Signal Harvest",
    strapline: "The desk sheds detail, but the capability signals survive.",
    placement: "Immediately after the story desk, before any particle motion.",
    bestFor: "Best when you want the funnel to feel earned by residue from the stories.",
    storyCards: [
      {
        company: "AMBOSS",
        label: "Find the problem sooner",
        note: "I care as much about how we find problems as how we fix them.",
      },
      {
        company: "CAPinside",
        label: "Show the reasoning",
        note: "I make my reasoning visible so others can challenge it and make it better.",
      },
      {
        company: "DKB",
        label: "Close the loop",
        note: "I make sure the people who defined the work get to see it before it ships.",
      },
    ],
    bridgeTitle: "What remained after the stories",
    bridgeBody:
      "Instead of carrying twelve anecdotes forward, the bridge harvests what survived each one. The personal scenes fall away. The operating signals stay visible long enough for the funnel to inherit them.",
    bridgeSignals: [
      "notice earlier",
      "make reasoning visible",
      "close the loop",
      "protect user trust",
    ],
    funnelTiers: [
      "Observed behavior",
      "Hidden gaps",
      "Shared alignment",
      "Reliable delivery",
    ],
    coda: "The systems changed. The habit did not.",
  },
  {
    slug: "repeating-question",
    title: "2. Repeating Question",
    strapline: "Each story resolves into the same underlying question.",
    placement: "As a reflective pause after the desk, just before the funnel starts to gather.",
    bestFor: "Best when you want the transition to feel more writerly than diagrammatic.",
    storyCards: [
      {
        company: "AMBOSS",
        label: "User clarity",
        note: "I check how someone gets in and how they get out.",
      },
      {
        company: "Compado",
        label: "Work shape",
        note: "I make sure we understand the weight of the work before we carry it.",
      },
      {
        company: "DKB",
        label: "Release trust",
        note: "I think about what the user sees before I think about whether the code is correct.",
      },
    ],
    bridgeTitle: "The same question kept returning",
    bridgeBody:
      "The bridge does not summarize the stories. It reveals the question underneath them: where does trust break, and what needs to be clarified before it does? The funnel then answers that question at larger and larger scale.",
    bridgeSignals: [
      "what will the user feel?",
      "what are we assuming?",
      "where does trust break?",
      "what needs protecting?",
    ],
    funnelTiers: [
      "User confidence",
      "Flow clarity",
      "Team understanding",
      "Platform trust",
    ],
    coda: "Across every company, the same questions kept returning.",
  },
  {
    slug: "operating-verbs",
    title: "3. Operating Verbs",
    strapline: "The bridge names the verbs behind the stories, then the funnel scales them.",
    placement: "Directly after the desk, with the cleanest handoff into the funnel.",
    bestFor: "Best when you want the clearest synthesis and the strongest structural logic.",
    recommended: true,
    storyCards: [
      {
        company: "AMBOSS",
        label: "See the user clearly",
        note: "I look at the logs even when nothing seems broken.",
      },
      {
        company: "CAPinside",
        label: "Clarify the system",
        note: "I make sure what we design and what we can build are based on the same reality.",
      },
      {
        company: "DKB",
        label: "Protect the release",
        note: "I pay attention to what is still running and whether it should be.",
      },
    ],
    bridgeTitle: "The verbs underneath the job titles",
    bridgeBody:
      "This bridge is the simplest: the stories compress into four verbs. The funnel does not introduce a new idea. It becomes a map of how those verbs expanded from feature work into system work.",
    bridgeSignals: ["notice", "clarify", "align", "safeguard"],
    funnelTiers: [
      "Notice the real signal",
      "Clarify the actual constraint",
      "Align people around reality",
      "Safeguard trust at scale",
    ],
    coda: "That is the engineer those years produced.",
  },
  {
    slug: "scale-shift",
    title: "4. Scale Shift",
    strapline: "The bridge widens the frame from moment, to flow, to team, to platform.",
    placement: "After the desk if you want a clean runway into leadership and systems thinking.",
    bestFor: "Best when you want Act II to end by widening scope rather than by distilling language.",
    storyCards: [
      {
        company: "AMBOSS",
        label: "A single moment",
        note: "A user cannot exit the state cleanly.",
      },
      {
        company: "Compado",
        label: "A repeatable flow",
        note: "A small change keeps turning into three days of hidden work.",
      },
      {
        company: "DKB",
        label: "A platform habit",
        note: "Feature flags meant to be temporary are still shaping production behavior.",
      },
    ],
    bridgeTitle: "The frame kept getting wider",
    bridgeBody:
      "The bridge tracks a scale shift. What starts as one user moment becomes a question about team habits, architecture, and delivery systems. The funnel then visualizes that widening field instead of feeling like a detached graphic.",
    bridgeSignals: [
      "user moment",
      "product flow",
      "team habit",
      "platform condition",
    ],
    funnelTiers: [
      "One person's experience",
      "One flow under pressure",
      "One team's operating habits",
      "One platform people depend on",
    ],
    coda: "The work kept pulling me toward the system around the code.",
  },
  {
    slug: "threshold-coda",
    title: "5. Threshold And Coda",
    strapline: "Use the bridge as a threshold line, then end Act II on a held closing sentence.",
    placement: "A short threshold before the funnel, then a full-screen hold after convergence.",
    bestFor: "Best when you want the strongest ending beat and the least amount of extra explanation.",
    storyCards: [
      {
        company: "AMBOSS",
        label: "Spot the mismatch",
        note: "I care as much about how we find problems as how we fix them.",
      },
      {
        company: "Compado",
        label: "Name the real cost",
        note: "I make sure the words we use mean the same thing to everyone.",
      },
      {
        company: "DKB",
        label: "Keep trust intact",
        note: "I make sure the people who defined the work get to see it before it ships.",
      },
    ],
    bridgeTitle: "What started as solving moments became designing conditions",
    bridgeBody:
      "This version treats the bridge as a threshold sentence rather than a whole scene. The funnel carries that sentence forward, and Act II lands on a coda instead of restarting chronology.",
    bridgeSignals: [
      "moments",
      "patterns",
      "systems",
      "conditions",
    ],
    funnelTiers: [
      "Solve the moment",
      "Recognize the pattern",
      "Reshape the system",
      "Design the conditions",
    ],
    coda: "By then, engineering was less about shipping features and more about building trust.",
  },
] as const;

function StoryChip({ label }: { label: string }) {
  return (
    <span
      className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
      style={{
        borderColor: "rgba(201,168,76,0.22)",
        color: "var(--gold-dim)",
        background: "rgba(201,168,76,0.06)",
      }}>
      {label}
    </span>
  );
}

function StoryCardBlock({ card }: { card: StoryCard }) {
  return (
    <div
      className="rounded-[24px] border p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(19,19,25,0.98) 0%, rgba(12,12,18,0.98) 100%)",
        borderColor: "rgba(240,230,208,0.08)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
      }}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "var(--gold-dim)" }}>
          {card.company}
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--text-faint)" }}>
          desk residue
        </span>
      </div>
      <p
        className="mb-3 font-serif text-[1.05rem] leading-[1.45]"
        style={{ color: "var(--cream)" }}>
        {card.label}
      </p>
      <p
        className="text-sm leading-[1.8]"
        style={{ color: "var(--text-dim)" }}>
        {card.note}
      </p>
    </div>
  );
}

function FunnelTier({ text, index }: { text: string; index: number }) {
  const widths = ["88%", "72%", "56%", "42%"];
  const width = widths[index] ?? "42%";

  return (
    <div className="flex justify-center">
      <div
        className="rounded-full border px-4 py-2 text-center text-xs tracking-[0.14em] uppercase"
        style={{
          width,
          borderColor: "rgba(91,158,194,0.22)",
          background: "rgba(91,158,194,0.08)",
          color: "var(--cream-muted)",
        }}>
        {text}
      </div>
    </div>
  );
}

function SampleSection({ sample }: { sample: BridgeSample }) {
  return (
    <article
      id={sample.slug}
      className="rounded-[32px] border p-6 sm:p-8 lg:p-10"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,14,20,0.88) 0%, rgba(9,9,13,0.94) 100%)",
        borderColor: "rgba(240,230,208,0.08)",
        boxShadow: "0 36px 120px rgba(0,0,0,0.32)",
      }}>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.32em]"
          style={{ color: "var(--gold-dim)" }}>
          Act II Bridge Sample
        </span>
        {sample.recommended ? <StoryChip label="recommended" /> : null}
      </div>

      <div className="mb-8 max-w-3xl">
        <h2
          className="font-serif text-3xl leading-none sm:text-4xl"
          style={{ color: "var(--cream)" }}>
          {sample.title}
        </h2>
        <p
          className="mt-4 text-base leading-[1.8] sm:text-lg"
          style={{ color: "var(--cream-muted)" }}>
          {sample.strapline}
        </p>
        <p
          className="mt-3 text-sm leading-[1.8]"
          style={{ color: "var(--text-dim)" }}>
          {sample.bestFor}
        </p>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.25fr_1fr_0.95fr]">
        <section>
          <p
            className="mb-4 text-[10px] uppercase tracking-[0.28em]"
            style={{ color: "var(--text-faint)" }}>
            After Story Desk
          </p>
          <div className="grid gap-4">
            {sample.storyCards.map((card) => (
              <StoryCardBlock
                key={`${sample.slug}-${card.company}-${card.label}`}
                card={card}
              />
            ))}
          </div>
        </section>

        <section>
          <p
            className="mb-4 text-[10px] uppercase tracking-[0.28em]"
            style={{ color: "var(--text-faint)" }}>
            Bridge Move
          </p>
          <div
            className="relative h-full rounded-[28px] border p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(91,158,194,0.08) 0%, rgba(201,168,76,0.04) 100%)",
              borderColor: "rgba(91,158,194,0.18)",
            }}>
            <div
              aria-hidden
              className="absolute left-6 top-6 bottom-6 w-px"
              style={{
                background:
                  "linear-gradient(180deg, rgba(91,158,194,0.5) 0%, rgba(201,168,76,0.12) 100%)",
              }}
            />
            <div className="pl-6">
              <p
                className="text-[10px] uppercase tracking-[0.26em]"
                style={{ color: "var(--gold-dim)" }}>
                {sample.placement}
              </p>
              <h3
                className="mt-4 font-serif text-2xl leading-tight"
                style={{ color: "var(--cream)" }}>
                {sample.bridgeTitle}
              </h3>
              <p
                className="mt-4 text-sm leading-[1.9]"
                style={{ color: "var(--cream-muted)" }}>
                {sample.bridgeBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {sample.bridgeSignals.map((signal) => (
                  <StoryChip
                    key={`${sample.slug}-${signal}`}
                    label={signal}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p
            className="mb-4 text-[10px] uppercase tracking-[0.28em]"
            style={{ color: "var(--text-faint)" }}>
            Funnel And Coda
          </p>
          <div
            className="rounded-[28px] border p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,20,28,0.82) 0%, rgba(8,10,14,0.92) 100%)",
              borderColor: "rgba(91,158,194,0.22)",
            }}>
            <div className="space-y-3">
              {sample.funnelTiers.map((tier, index) => (
                <FunnelTier
                  key={`${sample.slug}-${tier}`}
                  text={tier}
                  index={index}
                />
              ))}
            </div>
            <div className="my-5 flex justify-center">
              <div
                className="h-10 w-10 rotate-45 rounded-[10px] border"
                style={{
                  borderColor: "rgba(201,168,76,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(201,168,76,0.24) 0%, rgba(201,168,76,0.08) 100%)",
                  boxShadow: "0 0 30px rgba(201,168,76,0.16)",
                }}
              />
            </div>
            <p
              className="mx-auto max-w-xs text-center font-serif text-xl leading-[1.55] italic"
              style={{ color: "var(--cream)" }}>
              {sample.coda}
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}

export default function LabBridgesPage() {
  return (
    <>
      <LabNav />
      <main
        className="min-h-screen px-5 pb-20 pt-24 sm:px-8 lg:px-12"
        style={{
          background:
            "radial-gradient(circle at top, rgba(91,158,194,0.14) 0%, rgba(7,7,10,0) 30%), linear-gradient(180deg, #07070a 0%, #0b0c11 100%)",
        }}>
        <section className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p
              className="text-[10px] uppercase tracking-[0.34em]"
              style={{ color: "var(--gold-dim)" }}>
              Lab Exploration
            </p>
            <h1
              className="mt-4 font-serif text-4xl leading-none sm:text-6xl"
              style={{ color: "var(--cream)" }}>
              Five bridges from story desk to funnel
            </h1>
            <p
              className="mt-6 max-w-3xl text-base leading-[1.9] sm:text-lg"
              style={{ color: "var(--cream-muted)" }}>
              These are not five new Act II concepts. They are five ways to
              handle the exact gap you called out: what happens after the story
              desk, before the funnel, and what line earns the ending after the
              funnel.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <a
                key={sample.slug}
                href={`#${sample.slug}`}
                className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors"
                style={{
                  borderColor: "rgba(240,230,208,0.08)",
                  color: "var(--text-dim)",
                  background: "rgba(14,14,20,0.72)",
                }}>
                {sample.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </div>

          <div className="mt-12 space-y-8">
            {SAMPLES.map((sample) => (
              <SampleSection key={sample.slug} sample={sample} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
