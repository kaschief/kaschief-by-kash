"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { DevNav } from "../dev-nav";

const ACCENT = "#60A5FA";

const COPY = {
  company: "AMBOSS",
  date: "Berlin, 2018\u20132019",
  p1: "Half a million med students used this app to pass their boards. I\u2019d been one of them. I knew exactly where the product lost people because I remembered where it lost me.",
  p2: "The team built from tickets. I built from the feeling of being the user at 3am with an exam in six hours. That difference shaped everything.",
  p3: "I stopped guessing what users wanted. I pulled session data, set up A/B tests, broke production once at 2am, and started building from evidence.",
  p4: "Your instinct is a hypothesis. Treat it like one.",
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export default function ForgeV26() {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const parasRef = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const curtain = curtainRef.current;
    const content = contentRef.current;
    if (!curtain || !content) return;

    // Curtain rises from 0 to 0.75 of scroll
    const curtainProgress = clamp(v / 0.75, 0, 1);
    const curtainHeight = (1 - curtainProgress) * 100;
    curtain.style.height = `${curtainHeight}%`;

    // Paragraph settle animations
    const thresholds = [0.08, 0.25, 0.42, 0.58];
    for (let i = 0; i < parasRef.current.length; i++) {
      const el = parasRef.current[i];
      if (!el) continue;
      const t = clamp((v - thresholds[i]) / 0.12, 0, 1);
      const y = (1 - t) * 10;
      const opacity = t;
      el.style.transform = `translateY(${y}px)`;
      el.style.opacity = `${opacity}`;
    }

    // After curtain fully up (0.75-0.85 hold), fade content (0.85-0.95)
    if (v > 0.85) {
      const fadeT = clamp((v - 0.85) / 0.1, 0, 1);
      const op = 1 - fadeT * 0.7;
      content.style.opacity = `${op}`;
    } else {
      content.style.opacity = "1";
    }
  });

  useEffect(() => {
    parasRef.current.forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(10px)";
      }
    });
  }, []);

  return (
    <>
      <DevNav />
      <div ref={containerRef} style={{ height: "800vh", position: "relative" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {/* Static text content underneath */}
          <div
            ref={contentRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <div style={{ maxWidth: 520, width: "100%", padding: "0 24px" }}>
              {/* Company name */}
              <div
                className="font-ui"
                style={{
                  color: ACCENT,
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {COPY.company}
              </div>
              <div
                className="font-ui"
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginBottom: 48,
                }}
              >
                {COPY.date}
              </div>

              {/* P1 */}
              <div
                ref={(el) => { parasRef.current[0] = el; }}
                className="font-serif"
                style={{
                  color: "var(--cream)",
                  fontSize: "1.1rem",
                  lineHeight: 1.65,
                  textAlign: "center",
                  marginBottom: 36,
                }}
              >
                {COPY.p1}
              </div>

              {/* P2 */}
              <div
                ref={(el) => { parasRef.current[1] = el; }}
                className="font-sans"
                style={{
                  color: "var(--cream-muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  textAlign: "center",
                  marginBottom: 32,
                }}
              >
                {COPY.p2}
              </div>

              {/* P3 */}
              <div
                ref={(el) => { parasRef.current[2] = el; }}
                className="font-sans"
                style={{
                  color: "var(--cream-muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  textAlign: "center",
                  marginBottom: 36,
                }}
              >
                {COPY.p3}
              </div>

              {/* P4 — takeaway */}
              <div
                ref={(el) => { parasRef.current[3] = el; }}
                className="font-narrator"
                style={{
                  color: "var(--cream)",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  borderLeft: "2px solid var(--gold)",
                  paddingLeft: 20,
                  marginLeft: 16,
                }}
              >
                {COPY.p4}
              </div>
            </div>
          </div>

          {/* Curtain overlay — sits on top, shrinks from bottom */}
          <div
            ref={curtainRef}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
              zIndex: 2,
              background: "var(--bg)",
              pointerEvents: "none",
            }}
          >
            {/* Top edge: accent line (the "hem") */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: ACCENT,
                opacity: 0.7,
              }}
            />
            {/* Gradient at top edge for soft reveal */}
            <div
              style={{
                position: "absolute",
                top: -20,
                left: 0,
                right: 0,
                height: 20,
                background: `linear-gradient(to bottom, transparent, var(--bg))`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
