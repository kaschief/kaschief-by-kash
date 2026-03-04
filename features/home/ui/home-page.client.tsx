"use client";

import { lazy, Suspense } from "react";
import { CursorArrow } from "@components";
import { Contact } from "@features/contact";
import { Hero } from "@features/hero";
import { Methods } from "@features/methods";
import { Navigation } from "@features/navigation";
import { Philosophy } from "@features/philosophy";
import type { HomePageViewModel } from "../model/get-home-page-view-model";

const Timeline = lazy(async () => {
  const { Timeline: TimelineSection } = await import("@features/timeline");
  return { default: TimelineSection };
});

interface HomePageClientProps {
  viewModel: HomePageViewModel;
}

function TimelineFallback({ label }: { label: string }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20" aria-live="polite">
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)]/60 px-6 py-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
          {label}
        </p>
      </div>
    </section>
  );
}

/**
 * Client composition shell for the home page.
 *
 * Trade-off:
 * - Timeline is lazily loaded so initial hydration path is lighter.
 * - The fallback keeps layout stable and communicates loading state.
 */
export function HomePageClient({ viewModel }: HomePageClientProps) {
  const { enableCustomCursor, timelineLoadingLabel } = viewModel;

  return (
    <>
      {enableCustomCursor ? <CursorArrow /> : null}
      <Navigation />
      <main>
        <Hero />
        <Philosophy />
        <Suspense fallback={<TimelineFallback label={timelineLoadingLabel} />}>
          <Timeline />
        </Suspense>
        <Methods />
        <Contact />
      </main>
    </>
  );
}
