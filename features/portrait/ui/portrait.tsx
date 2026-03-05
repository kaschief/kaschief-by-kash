"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, LAYOUT, TOKENS } from "@utilities";

const { cream, textDim, gold, creamMuted } = TOKENS;

const STATS = [
  { value: 4, suffix: "", label: "Companies" },
  { value: 8, suffix: "+", label: "Years in tech" },
  { value: 5, suffix: "M", label: "Users impacted" },
] as const;

function Counter({
  target,
  suffix,
  active,
}: {
  target: number;
  suffix: string;
  active: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame: number;
    const duration = 1800;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

function StatsRow({ stats }: { stats: typeof STATS }) {
  const ref = useRef<HTMLDivElement>(null);
  const statsInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="inline-flex items-start gap-8 sm:gap-12">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={i > 0 ? "border-l border-(--stroke) pl-8 sm:pl-12" : ""}>
          <span
            className="block font-serif text-2xl tracking-tight sm:text-3xl"
            style={{ color: cream }}>
            <Counter
              target={stat.value}
              suffix={stat.suffix}
              active={statsInView}
            />
          </span>
          <span
            className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: creamMuted }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Portrait() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(imageRef, { once: true, margin: "-60px" });

  // ScrollTrigger pin — replaces manual 150vh wrapper + CSS sticky
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const vh = window.innerHeight;
    const downDistance = vh * LAYOUT.pinDownVh;
    const upThreshold = LAYOUT.pinUpVh / LAYOUT.pinDownVh; // progress at which up-scroll releases

    const trigger = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: "top top",
      end: `+=${downDistance}`,
      pinSpacing: true,
      onUpdate: (self) => {
        // When scrolling up and past the short threshold, jump out of the pin
        if (self.direction === -1 && self.progress > 0 && self.progress < upThreshold) {
          self.scroll(self.start);
        }
      },
    });

    // Animate glow with scroll progress
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
  }, []);

  return (
    <section id="portrait" ref={sectionRef}>
      <div className="relative py-44 sm:py-52" style={{ minHeight: "100vh" }}>
        <div className="relative mx-auto max-w-5xl px-[var(--page-gutter)]">
          {/* Centered image block with one-shot reveal + glow */}
          <div className="relative mx-auto -mb-12 max-w-md sm:-mb-16 sm:max-w-lg">
            {/* Ambient glow behind image */}
            <div
              ref={glowRef}
              className="absolute inset-[-30%] z-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center, ${gold}18 0%, transparent 70%)`,
                opacity: 0,
              }}
            />

            {/* Image with one-time clip reveal on enter */}
            <motion.div
              ref={imageRef}
              className="relative z-10 overflow-hidden rounded-sm"
              style={{ aspectRatio: "3 / 4", backgroundColor: "var(--bg)" }}
              initial={{ clipPath: "inset(16% 0% 16% 0%)" }}
              animate={
                inView
                  ? { clipPath: "inset(0% 0% 2% 0%)" }
                  : { clipPath: "inset(16% 0% 16% 0%)" }
              }
              transition={{ duration: 0.6, ease: EASE }}>
              {/* Film grain overlay */}
              <div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
                  backgroundSize: "128px 128px",
                  opacity: 0.5,
                }}
              />
              {/* Bottom fade */}
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(to top, var(--bg) 0%, var(--bg) 4%, transparent 50%)",
                }}
              />

              <div className="absolute inset-[-1px]">
                <Image
                  src="/images/kaschief.jpg"
                  alt="Kaschief Johnson"
                  fill
                  sizes="(max-width: 640px) 384px, 512px"
                  className="object-cover"
                  style={{ objectPosition: "center 20%" }}
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Overlapping text block — sits on top of image bottom fade */}
          <motion.div
            className="relative z-20 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}>
            <p
              className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: gold }}>
              Berlin, Germany
            </p>

            <h2
              className="mb-5 font-serif text-3xl font-normal tracking-[-0.02em] sm:text-4xl lg:text-5xl"
              style={{ color: cream, lineHeight: 1.1 }}>
              From the bedside
              <br />
              to the&nbsp;terminal.
            </h2>

            <p
              className="mx-auto mb-10 max-w-lg text-sm leading-relaxed sm:text-[15px]"
              style={{ color: textDim, lineHeight: 1.8 }}>
              I started my career as an ICU nurse, where I learned to stay calm
              under pressure and make decisions that matter. That instinct
              followed me into software engineering, then into leadership, and
              now into building products of my own. Every role taught me
              something the last one couldn&rsquo;t.
            </p>

            {/* Stats row */}
            <StatsRow stats={STATS} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
