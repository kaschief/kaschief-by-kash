"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FadeUp, FadeIn } from "./motion";
import { DetailModal, ModalCloseButton } from "./ui/detail-modal";
import { MonoLabel } from "./ui/mono-label";
import {
  INDICATORS,
  PROGRESSION,
  CATEGORIES,
  type Indicator,
} from "@/data/trading";
import { TOKENS } from "@/lib/tokens";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Indicator Detail Modal                                             */
/* ------------------------------------------------------------------ */

function IndicatorDetail({
  indicator,
  onClose,
}: {
  indicator: Indicator;
  onClose: () => void;
}) {
  return (
    <DetailModal variant="overlay" color={indicator.color} onClose={onClose}>
      <div className="relative aspect-video w-full">
        <Image
          src={indicator.image}
          alt={indicator.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: indicator.color }}
          />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
            {indicator.category}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-[var(--cream)]">
          {indicator.name}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-[var(--cream-muted)]">
          {indicator.desc}
        </p>
        <p
          className="mt-2 font-mono text-xs"
          style={{ color: indicator.color }}>
          {indicator.lines} lines
        </p>
      </div>
    </DetailModal>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TradingArsenal() {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState("Liquidity");
  const [activeProgression, setActiveProgression] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const progressionRef = useRef<HTMLDivElement>(null);
  const progressionInView = useInView(progressionRef, {
    once: true,
    margin: "-50px",
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const indicatorsRef = useRef<HTMLDivElement>(null);
  const indicatorsInView = useInView(indicatorsRef, {
    once: true,
    margin: "-50px",
  });

  const filteredIndicators = INDICATORS.filter(
    (ind) => ind.category === activeCategory,
  );

  return (
    <div className="relative pb-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Visual nesting under Act IV */}
        <div className="border-l-2 border-[var(--act-green)]/20 pl-8 sm:pl-12">
          {/* Sub-section header */}
          <FadeUp>
            <MonoLabel
              label="The Arsenal"
              color={TOKENS.actGreen}
              className="mb-2 opacity-60"
            />
            <h4 className="mb-3 font-serif text-2xl text-[var(--cream)] sm:text-3xl">
              The Tools I Built
            </h4>
            <p className="mb-16 max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
              14 custom indicators. Each one solves a specific problem in
              reading price action.
            </p>
          </FadeUp>

          {/* Progression - clickable to enlarge */}
          <div ref={progressionRef} className="mb-20">
            <FadeIn>
              <MonoLabel
                label="The Progression"
                color={TOKENS.actGreen}
                className="mb-6"
              />
            </FadeIn>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Steps */}
              <div className="space-y-2">
                {PROGRESSION.map((step, i) => (
                  <motion.button
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={progressionInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    onClick={() => setActiveProgression(i)}
                    style={{
                      borderColor:
                        activeProgression === i
                          ? `color-mix(in srgb, ${TOKENS.actGreen} 30%, transparent)`
                          : "transparent",
                    }}
                    className={`group w-full cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 ${
                      activeProgression === i
                        ? "bg-[var(--bg-elevated)]"
                        : "hover:bg-[var(--bg-elevated)]"
                    }`}>
                    <div className="flex items-start gap-4">
                      <span
                        className="shrink-0 font-mono text-xs transition-colors"
                        style={{
                          color:
                            activeProgression === i
                              ? TOKENS.actGreen
                              : TOKENS.textFaint,
                        }}>
                        {step.step}
                      </span>
                      <div>
                        <h5
                          className={`text-sm font-medium transition-colors ${
                            activeProgression === i
                              ? "text-[var(--cream)]"
                              : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"
                          }`}>
                          {step.title}
                        </h5>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Image - clickable to enlarge */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={progressionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={() =>
                  setLightboxImage(PROGRESSION[activeProgression].image)
                }
                className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-[var(--stroke)] transition-all hover:border-[var(--act-green)]/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProgression}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full">
                    <Image
                      src={PROGRESSION[activeProgression].image}
                      alt={PROGRESSION[activeProgression].title}
                      fill
                      className="object-cover object-top transition-transform group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 600px"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Expand hint */}
                <div className="absolute bottom-3 right-3 rounded-full bg-[var(--bg)]/70 px-2 py-1 text-[10px] text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                  Click to expand
                </div>
              </motion.button>
            </div>
          </div>

          {/* ============================================================ */}
          {/*  INDICATORS - Category tabs + horizontal scroll strip        */}
          {/* ============================================================ */}
          <div ref={indicatorsRef}>
            <FadeUp delay={0.2}>
              <h4 className="mb-6 font-serif text-xl text-[var(--cream)]">
                The Indicators
              </h4>
            </FadeUp>

            {/* Category Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={indicatorsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-6 flex gap-6 border-b border-[var(--stroke)]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={
                    activeCategory === cat
                      ? { borderColor: TOKENS.actGreen }
                      : undefined
                  }
                  className={`cursor-pointer pb-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                    activeCategory === cat
                      ? "border-b-2 text-[var(--cream)]"
                      : "text-[var(--text-faint)] hover:text-[var(--cream-muted)]"
                  }`}>
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Horizontal Scroll Strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={indicatorsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}>
              <div
                ref={scrollContainerRef}
                className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <AnimatePresence mode="wait">
                  {filteredIndicators.map((indicator, i) => (
                    <motion.button
                      key={indicator.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      onClick={() => setSelectedIndicator(indicator)}
                      className="group w-64 shrink-0 cursor-pointer text-left">
                      {/* Image card - no border */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--bg-elevated)] transition-all">
                        <Image
                          src={indicator.image}
                          alt={indicator.name}
                          fill
                          className="object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                          sizes="256px"
                        />
                      </div>

                      {/* Info below */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-[var(--cream)] transition-colors group-hover:text-[var(--act-green)]">
                          {indicator.name}
                        </h5>
                        <p className="mt-1 text-xs text-[var(--text-dim)]">
                          {indicator.desc}
                        </p>
                        <p
                          className="mt-1 font-mono text-[10px]"
                          style={{ color: indicator.color }}>
                          {indicator.lines} lines
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Indicator Detail Modal */}
      <AnimatePresence>
        {selectedIndicator && (
          <IndicatorDetail
            indicator={selectedIndicator}
            onClose={() => setSelectedIndicator(null)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox for progression images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-[var(--bg)]/90 p-6 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]">
              <Image
                src={lightboxImage}
                alt="Progression step"
                width={1920}
                height={1080}
                className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
              />
            </motion.div>
            <ModalCloseButton
              onClose={() => setLightboxImage(null)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { TradingArsenal as TradingSystem };
