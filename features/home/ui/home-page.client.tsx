"use client";

import { lazy, Suspense, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CursorArrow, StickyZoneControls } from "@components";
import { Contact } from "@features/contact";
import { Hero } from "@features/hero";
import { Navigation } from "@features/navigation";
import { Philosophy } from "@features/philosophy";
import { Portrait } from "@features/portrait";
import { LenisProvider } from "@hooks";
import type { HomePageViewModel } from "../model/get-home-page-view-model";
import { PageLayout } from "./page-layout";

const Timeline = lazy(async () => {
  const { Timeline: TimelineSection } = await import("@features/timeline");
  return { default: TimelineSection };
});

interface HomePageClientProps {
  viewModel: HomePageViewModel;
}

function TimelineFallback({ label }: { label: string }) {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-[var(--page-gutter)] py-20"
      aria-live="polite">
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)]/60 px-6 py-8">
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
          {label}
        </p>
      </div>
    </section>
  );
}

// Hex needed for gradient alpha (CSS vars can't append alpha)
const GOLD_HEX = "#C9A84C";

/** Animated divider that grows from center on scroll */
function ScrollDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.4, 0.15]);

  return (
    <div ref={ref} className="mx-auto max-w-5xl py-2">
      <motion.div
        className="mx-auto h-px"
        style={{
          width,
          opacity,
          background: `linear-gradient(to right, transparent, ${GOLD_HEX}50, transparent)`,
        }}
      />
    </div>
  );
}

/**
 * Scroll-driven section wrapper: applies subtle parallax and fade
 * to create depth between page sections.
 *
 * Progressive enhancement note: CSS `animation-timeline: scroll()` could
 * replace this JS-driven fade/parallax once Safari support stabilizes
 * (currently behind a flag). The Framer Motion approach remains the
 * cross-browser baseline.
 */
function SectionTransition({
  children,
  offset = 60,
}: {
  children: React.ReactNode;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}

/**
 * Client composition shell for the home page.
 */
export function HomePageClient({ viewModel }: HomePageClientProps) {
  const { enableCustomCursor, timelineLoadingLabel } = viewModel;

  return (
    <LenisProvider>
      <StickyZoneControls />
      {enableCustomCursor ? <CursorArrow /> : null}
      <div data-typo="nav">
        <Navigation />
      </div>
      <PageLayout>
        <div data-typo="hero">
          <Hero />
        </div>
        <div data-typo="portrait">
          <Portrait />
        </div>
        <SectionTransition>
          <div data-typo="timeline">
            <Suspense fallback={<TimelineFallback label={timelineLoadingLabel} />}>
              <Timeline />
            </Suspense>
          </div>
        </SectionTransition>
        <SectionTransition offset={40}>
          <ScrollDivider />
          <div data-typo="philosophy">
            <Philosophy />
          </div>
        </SectionTransition>
        <ScrollDivider />
        <div data-typo="contact">
          <Contact />
        </div>
      </PageLayout>
    </LenisProvider>
  );
}
