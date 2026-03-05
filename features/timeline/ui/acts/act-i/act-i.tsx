"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { SectionGlow } from "@components";
import { ACT_I } from "@data";
import { EASE, GLOW_OPACITY, SCROLL_RANGE, SECTION_ID } from "@utilities";

const { ACT_NURSE } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const { act, title, color: COLOR, period, takeaway, detail } = ACT_I;

// ECG waveform — single QRS spike unit, tiled. Wider spacing = less squished on small screens.
const spike = (offset: number) =>
  `L${offset},60 L${offset + 20},60 L${offset + 30},20 L${offset + 40},100 L${offset + 50},40 L${offset + 60},60`;

// Fewer spikes for mobile, denser for desktop
const ECG_PATH_SM = `M0,60 ${Array.from({ length: 8 }, (_, i) => spike(i * 200)).join(" ")} L1600,60`;
const ECG_PATH_LG = `M0,60 ${Array.from({ length: 30 }, (_, i) => spike(i * 140)).join(" ")} L4200,60`;

const TICKER_KEYWORDS = [
  "CCRN Certified",
  "Neuro ICU",
  "Cardiac ICU",
  "Ventilators",
  "Differential Diagnosis",
  "Systems Thinking",
  "Crisis Communication",
  "Medication Protocols",
  "Patient Advocacy",
  "IV Drips",
  "Code Response",
  "Hemodynamic Monitoring",
  "Clinical Assessment",
  "Rapid Intervention",
  "Night Shift",
  "Arterial Lines",
  "Central Lines",
  "Sedation Management",
  "Stroke Protocols",
  "Seizure Management",
  "12-Lead EKG",
  "Blood Gas Analysis",
  "Triage",
  "Wound Care",
  "Fall Prevention",
  "Pain Management",
  "End-of-Life Care",
  "Family Communication",
  "Charge Nurse",
  "Telemetry",
];

/** Pixels per second the ticker scrolls — one value for all screens */
const TICKER_PX_PER_SEC = 30;

/** Counts from `from` to `to` with a slow ease-in-out, after an initial delay */
function useBpmCounter(from: number, to: number, active: boolean, delay = 1200, duration = 3000) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;

    timeout = setTimeout(() => {
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // cubic ease-in-out — slower start/end makes each tick visible
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        setValue(from + Math.round(eased * (to - from)));
        if (progress < 1) frame = requestAnimationFrame(step);
      };

      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [active, from, to, delay, duration]);

  return value;
}

export function ActI() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickerDuration, setTickerDuration] = useState(80);
  const inView = useInView(sceneRef, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);
  const bpm = useBpmCounter(60, 72, inView, 1200, 2000);

  // Measure ticker width and derive duration from constant scroll speed
  const measureTicker = useCallback(() => {
    const el = tickerRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    setTickerDuration(halfWidth / TICKER_PX_PER_SEC);
  }, []);

  useEffect(() => {
    measureTicker();
    window.addEventListener("resize", measureTicker);
    return () => window.removeEventListener("resize", measureTicker);
  }, [measureTicker]);

  const tickerStyle: React.CSSProperties = {
    animation: `scroll-ticker ${tickerDuration}s linear infinite`,
  };

  return (
    <div
      id={ACT_NURSE}
      ref={sceneRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-14 sm:py-20 md:py-28 lg:py-32">
      <SectionGlow opacity={glowOpacity} color={COLOR} size="lg" />

      {/* ── Centered content ── */}
      <div className="relative z-10 w-full px-[var(--page-gutter)]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.8, ease: EASE }}>
          {/* Act I — always centered above title */}
          <p
            className="mb-3 text-xs tracking-wide sm:mb-6 sm:text-sx md:text-base"
            style={{ color: COLOR }}>
            {act}
          </p>

          {/* Title + ECG wrapper — ECG is anchored to the title */}
          <div className="relative">
            {/* ECG — mobile version (fewer spikes) */}
            <div
              className="pointer-events-none absolute z-0 lg:hidden"
              style={{
                left: "-50vw",
                right: "-50vw",
                top: "-20%",
                bottom: "-20%",
              }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1600 120"
                preserveAspectRatio="none"
                fill="none">
                <motion.path
                  d={ECG_PATH_SM}
                  stroke={COLOR}
                  strokeWidth={4}
                  fill="none"
                  style={{ filter: "blur(8px)", opacity: 0.1 }}
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <motion.path
                  d={ECG_PATH_SM}
                  stroke={COLOR}
                  strokeWidth={2}
                  fill="none"
                  style={{ opacity: 0.35 }}
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
            </div>
            {/* ECG — desktop version (denser spikes) */}
            <div
              className="pointer-events-none absolute inset-y-0 z-0 hidden lg:block"
              style={{ left: "-50vw", right: "-50vw" }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 4200 120"
                preserveAspectRatio="none"
                fill="none">
                <motion.path
                  d={ECG_PATH_LG}
                  stroke={COLOR}
                  strokeWidth={4}
                  fill="none"
                  style={{ filter: "blur(8px)", opacity: 0.1 }}
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <motion.path
                  d={ECG_PATH_LG}
                  stroke={COLOR}
                  strokeWidth={2}
                  fill="none"
                  style={{ opacity: 0.35 }}
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
            </div>

            {/* 72 BPM accent — hidden on small, absolute on md+ */}
            <motion.div
              className="hidden md:block absolute -top-2 right-0 z-10 text-right sm:-top-4"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}>
              <p
                className="font-sans text-4xl font-black leading-none tracking-[-0.03em] sm:text-5xl"
                style={{ color: COLOR }}>
                {bpm}
              </p>
              <p className="mt-1 text-[11px] tracking-wide text-[var(--text-faint)]">
                <motion.span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLOR }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                BPM
              </p>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="relative z-1 font-sans text-4xl font-black uppercase leading-[0.85] tracking-[-0.02em] text-[var(--cream)] sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em] xl:tracking-[-0.05em]"
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE }}>
                {title
                  .toUpperCase()
                  .split(" ")
                  .map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
              </motion.h2>
            </div>

            {/* 72 BPM — inline on mobile only */}
            <motion.div
              className="mt-4 flex items-center justify-center gap-2 md:hidden"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}>
              <p
                className="font-sans text-base font-black leading-none tracking-[-0.03em]"
                style={{ color: COLOR }}>
                {bpm}
              </p>
              <p className="text-[11px] tracking-wide text-[var(--text-faint)]">
                <motion.span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLOR }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                BPM
              </p>
            </motion.div>
          </div>

          {/* Location row */}
          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] tracking-wide sm:mt-8 sm:gap-3"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1, ease: EASE }}>
            <span className="text-[var(--cream-muted)]">NYU Langone</span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-[var(--text-faint)]">{ACT_I.location}</span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-[var(--text-faint)]">{period}</span>
          </motion.div>

          <motion.p
            className="mx-auto mt-5 max-w-lg font-serif text-xs leading-relaxed text-[var(--cream-muted)] sm:mt-10 sm:text-base md:text-xl"
            style={{ fontStyle: "italic" }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}>
            &ldquo;{takeaway}&rdquo;
          </motion.p>
        </motion.div>

        {/* ── Detail paragraph ── */}
        <motion.div
          className="mx-auto mt-6 max-w-lg text-center sm:mt-14"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 1.3, ease: EASE }}>
          <p className="text-[11px] font-light leading-loose text-[var(--cream-muted)] sm:text-[13px]">
            {detail}
          </p>
        </motion.div>
      </div>

      {/* ── Keyword Ticker (bottom) — full width ── */}
      <motion.div
        className="absolute inset-x-0 bottom-6 overflow-hidden sm:bottom-10 md:bottom-14"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 1.5 }}>
        <div ref={tickerRef} className="flex w-max" style={tickerStyle}>
          {[...TICKER_KEYWORDS, ...TICKER_KEYWORDS].map((kw, i) => (
            <span
              key={i}
              className="shrink-0 px-5 text-[11px] tracking-wide sm:px-8"
              style={{ color: "#3D362C" }}>
              <span className="mr-5 sm:mr-8" style={{ color: "#2A2420" }}>
                —
              </span>
              {kw}
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
