"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ActLabel } from "@components";
import { ACT_I } from "@data";
import { EASE } from "@utilities";

const { act, color: COLOR, period, splash, title } = ACT_I;

// ECG waveform — single QRS spike unit, tiled.
const spike = (offset: number) =>
  `L${offset},60 L${offset + 20},60 L${offset + 30},20 L${offset + 40},100 L${offset + 50},40 L${offset + 60},60`;

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
  "Hemodynamic Monitoring",
  "Rapid Intervention",
  "Arterial Lines",
  "Central Lines",
  "12-Lead EKG",
  "Blood Gas Analysis",
  "Triage",
  "Telemetry",
];

const TICKER_PX_PER_SEC = 30;

function useBpmCounter(from: number, to: number, active: boolean, delay = 1200, duration = 3000) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const timeout = setTimeout(() => {
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
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

export function Splash() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickerDuration, setTickerDuration] = useState(80);
  const inView = useInView(sceneRef, { once: true, amount: 0.1 });
  const bpm = useBpmCounter(60, 72, inView, 1200, 2000);

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
      ref={sceneRef}
      className="relative flex min-h-screen min-h-[100svh] flex-col items-center justify-center overflow-hidden py-14 sm:py-20 md:py-28 lg:py-32">
      {/* ── Centered content ── */}
      <div className="relative z-10 w-full px-(--page-gutter)">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}>
          <ActLabel label={act} color={COLOR} inView={inView} />

          {/* Title + ECG wrapper */}
          <div className="relative">
            {/* ECG — mobile */}
            <div
              className="pointer-events-none absolute -z-10 lg:hidden"
              style={{ left: "-50vw", right: "-50vw", top: "-20%", bottom: "-20%", willChange: "transform" }}>
              <svg width="100%" height="100%" viewBox="0 0 1600 120" preserveAspectRatio="none" fill="none">
                <motion.path d={ECG_PATH_SM} stroke={COLOR} strokeWidth={4} fill="none"
                  style={{ opacity: 0.08 }}
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }} />
                <motion.path d={ECG_PATH_SM} stroke={COLOR} strokeWidth={2} fill="none"
                  style={{ opacity: 0.35 }}
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }} />
              </svg>
            </div>
            {/* ECG — desktop */}
            <div
              className="pointer-events-none absolute inset-y-0 -z-10 hidden lg:block"
              style={{ left: "-50vw", right: "-50vw", willChange: "transform" }}>
              <svg width="100%" height="100%" viewBox="0 0 4200 120" preserveAspectRatio="none" fill="none">
                <motion.path d={ECG_PATH_LG} stroke={COLOR} strokeWidth={4} fill="none"
                  style={{ opacity: 0.08 }}
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }} />
                <motion.path d={ECG_PATH_LG} stroke={COLOR} strokeWidth={2} fill="none"
                  style={{ opacity: 0.35 }}
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }} />
              </svg>
            </div>

            {/* 72 BPM — desktop */}
            <motion.div
              className="absolute -top-2 right-0 z-10 hidden text-right sm:-top-4 md:block"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}>
              <p className="font-ui text-4xl font-bold leading-none tracking-tight sm:text-5xl" style={{ color: COLOR }}>
                {bpm}
              </p>
              <p className="mt-1 font-ui text-[11px] tracking-wide" style={{ color: COLOR, opacity: 0.5 }}>
                <motion.span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLOR }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                BPM
              </p>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="relative z-1 font-sans text-6xl font-black uppercase leading-[0.85] tracking-[-0.02em] text-(--cream) sm:text-7xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em] xl:tracking-[-0.05em]"
                initial={{ y: "110%" }} animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE }}>
                {title.toUpperCase().split(" ").map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </motion.h2>
            </div>

            {/* 72 BPM — mobile */}
            <motion.div
              className="mt-4 flex items-center justify-center gap-2 md:hidden"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}>
              <p className="font-ui text-base font-bold leading-none tracking-tight" style={{ color: COLOR }}>
                {bpm}
              </p>
              <p className="font-ui text-[11px] tracking-wide" style={{ color: COLOR, opacity: 0.5 }}>
                <motion.span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLOR }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                BPM
              </p>
            </motion.div>
          </div>

          {/* Location row */}
          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-2 font-ui text-[11px] tracking-wide sm:mt-8 sm:gap-3"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1, ease: EASE }}>
            <span className="text-(--cream-muted)">NYU Langone</span>
            <span className="text-(--text-faint)">/</span>
            <span className="text-(--text-faint)">{ACT_I.location}</span>
            <span className="text-(--text-faint)">/</span>
            <span className="text-(--text-faint)">{period}</span>
          </motion.div>

          <motion.p
            className="mx-auto mt-10 max-w-lg font-[family-name:var(--font-spectral)] text-sm leading-relaxed text-(--cream) sm:mt-20 sm:text-base md:mt-24 md:text-xl"
            style={{ fontStyle: "italic" }}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}>
            {splash}
          </motion.p>
        </motion.div>
      </div>

      {/* Keyword Ticker */}
      <motion.div
        className="absolute inset-x-0 bottom-6 overflow-hidden sm:bottom-10 md:bottom-14"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 1.5 }}>
        <div ref={tickerRef} className="flex w-max" style={tickerStyle}>
          {[...TICKER_KEYWORDS, ...TICKER_KEYWORDS].map((kw, i) => (
            <span key={i} className="shrink-0 px-5 text-[11px] tracking-wide sm:px-8" style={{ color: "#3D362C" }}>
              <span className="mr-5 sm:mr-8" style={{ color: "#2A2420" }}>—</span>
              {kw}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
