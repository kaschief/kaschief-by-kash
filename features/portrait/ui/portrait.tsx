"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StatsGrid } from "@components";
import { useLayoutReady, useLenis, usePinStore } from "@hooks";
import { EASE, LAYOUT, TOKENS } from "@utilities";

const { cream, textDim, gold } = TOKENS;

const PORTRAIT_STATS = [
  { value: "4", label: "Companies" },
  { value: "8+", label: "Years in tech" },
  { value: "5M+", label: "Users impacted" },
];

/**
 * Single scale unit: 1% of viewport height, capped so fonts don't
 * blow up on tall monitors. Every dimension in this section is a
 * multiple of --ps, so the entire layout scales uniformly.
 */
const S = (n: number) => `calc(${n} * var(--ps))`;

const sectionStyle: CSSProperties = {
  "--ps": "clamp(7.8px, 1svh, 9.5px)",
  height: "100svh",
} as CSSProperties;

export function Portrait() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(imageRef, { once: true, margin: "-60px" });
  const [countersActive, setCountersActive] = useState(false);
  const getLenis = useLenis();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mql = window.matchMedia("(min-width: 768px)");
    if (!mql.matches) {
      // Async via rAF to avoid synchronous setState in effect body
      requestAnimationFrame(() => setCountersActive(true));
      // No pin created — clear barrier immediately
      useLayoutReady.getState().clearBarrier("portrait-pin-ready");
      return;
    }

    // Already completed — no pin at all, just a normal section
    if (usePinStore.getState().completed["portrait"]) {
      requestAnimationFrame(() => setCountersActive(true));
      useLayoutReady.getState().clearBarrier("portrait-pin-ready");
      return;
    }

    const vh = window.innerHeight;
    const downDistance = vh * LAYOUT.pinDownVh;
    const upThreshold = LAYOUT.pinUpVh / LAYOUT.pinDownVh;

    const trigger = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: "top top",
      end: `+=${downDistance}`,
      pinSpacing: true,
      onEnter: () => setCountersActive(true),
      onLeave: (self) => {
        // GSAP-recommended approach for pin-once with Lenis:
        // 1. Capture scroll position & pin distance before killing
        const lenis = getLenis();
        const scroll = lenis?.scroll ?? window.scrollY;
        const pinDistance = self.end - self.start;

        // 2. Kill trigger but preserve element's final position
        self.kill(true, true);

        // 3. Recalculate all ScrollTrigger positions (spacer is now gone)
        ScrollTrigger.refresh();

        // 4. Compensate scroll so user doesn't see a jump
        if (lenis) {
          lenis.scrollTo(scroll - pinDistance, { immediate: true });
        } else {
          window.scrollTo(0, scroll - pinDistance);
        }

        // 5. Mark done in store so pin is never recreated
        usePinStore.getState().markDone("portrait");

        // 6. Re-signal readiness — layout shifted due to spacer removal
        useLayoutReady.getState().clearBarrier("portrait-pin-ready");
      },
      onUpdate: (self) => {
        if (self.direction === -1 && self.progress > 0 && self.progress < upThreshold) {
          self.scroll(self.start);
        }
      },
    });

    // Pin spacer is inserted synchronously by ScrollTrigger.create() —
    // signal that Portrait's layout-shifting work is complete.
    useLayoutReady.getState().clearBarrier("portrait-pin-ready");

    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.35,
          scale: 1,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 35%",
            scrub: true,
          },
        },
      );
    }

    return () => {
      trigger.kill();
    };
  }, [getLenis]);

  return (
    <section id="portrait" ref={sectionRef} style={sectionStyle}>
      <div className="flex h-full flex-col items-center justify-center px-(--page-gutter)">
        {/*
          Single grid — CSS switches layout:
          - Mobile + ultrawide (< md, xl+): single column, stacked centered
          - Tablet/laptop (md–xl): two columns, side-by-side
        */}
        <div
          className="flex flex-col items-center
            md:flex-row md:items-center md:justify-center
            xl:flex-col xl:items-center"
          style={{ gap: S(4) }}>

          {/* Image */}
          <div
            className="relative mx-auto shrink-0 md:mx-0"
            style={{ height: `min(${S(48)}, 75vw)`, aspectRatio: "3/4" }}>
            {/* Glow */}
            <div
              ref={glowRef}
              className="absolute inset-[-30%] z-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center, ${gold}18 0%, transparent 70%)`,
                opacity: 0,
              }}
            />
            <motion.div
              ref={imageRef}
              className="relative z-10 h-full w-full overflow-hidden rounded-sm"
              style={{ backgroundColor: "var(--bg)" }}
              initial={{ clipPath: "inset(16% 0% 16% 0%)" }}
              animate={
                inView
                  ? { clipPath: "inset(0% 0% 2% 0%)" }
                  : { clipPath: "inset(16% 0% 16% 0%)" }
              }
              transition={{ duration: 0.6, ease: EASE }}>
              <div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
                  backgroundSize: "128px 128px",
                  opacity: 0.5,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(to top, var(--bg) 0%, var(--bg) 4%, transparent 50%)",
                }}
              />
              <div className="absolute -inset-px">
                <Image
                  src="/images/kaschief.jpg"
                  alt="Kaschief Johnson"
                  fill
                  sizes="(max-width: 768px) 280px, 400px"
                  className="object-cover"
                  style={{ objectPosition: "center 20%" }}
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Text + stats */}
          <motion.div
            className="relative z-20 text-center md:max-w-sm md:text-left lg:max-w-md xl:max-w-none xl:text-center"
            style={{ marginTop: S(-2) }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}>
            <p
              className="font-ui font-medium uppercase tracking-[0.25em]"
              style={{ color: gold, fontSize: S(1.3), marginBottom: S(1.5) }}>
              Berlin, Germany
            </p>

            <h2
              className="font-serif font-normal tracking-[-0.02em]"
              style={{ color: cream, lineHeight: 1.1, fontSize: S(3.8), marginBottom: S(1.5) }}>
              From the bedside
              <br />
              to the&nbsp;terminal.
            </h2>

            <p
              className="mx-auto max-w-lg leading-relaxed md:mx-0 xl:mx-auto"
              style={{ color: textDim, lineHeight: 1.7, fontSize: S(1.6), marginBottom: S(2.5) }}>
              I started my career as an ICU nurse, where I learned to stay calm
              under pressure and make decisions that matter. That instinct
              followed me into software engineering, then into leadership, and
              now into building products of my own. Every role taught me
              something the last one couldn&rsquo;t.
            </p>

            <StatsGrid
              stats={PORTRAIT_STATS}
              color={cream}
              layout="row"
              forceActive={countersActive}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
