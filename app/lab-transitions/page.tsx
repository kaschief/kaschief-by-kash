"use client";

import { useRef, useEffect } from "react";
import { LabNav } from "../lab-nav";

/* ── Content ── */

const STORY = {
  text: "I ask what phone, what browser. Older iOS, Safari. Format issue, quick to fix. But it came through a colleague, not our monitoring. I flag it in standup and a few of us pull up the analytics. Nearly a fifth of our users are on configurations we are not testing against. We expand the matrix together.",
  iStatement: "I care as much about how we find problems as how we fix them.",
};

/* ── Shared math ── */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/* ── Scroll progress hook ── */

function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>) {
  const progressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const totalScroll = container.scrollHeight - viewportH;
      if (totalScroll <= 0) return;
      progressRef.current = clamp(-rect.top / totalScroll, 0, 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return progressRef;
}

/* ── Mock cards — 3 scattered artifacts ── */

const CARD_DATA = [
  { label: "AMBOSS", sub: "Medical Content", title: "Images not displaying on mobile", id: "MED-2847", color: "#1868DB", barColor: "#1868DB" },
  { label: "Compado", sub: "meal-kit-reco", title: "TypeError: Cannot read 'href'", id: "312 events", color: "#E1567C", barColor: "linear-gradient(90deg, #6C5FC7, #E1567C, #F5B234)" },
  { label: "DKB", sub: "#frontend-dkb", title: "Transfer page missing recipient", id: "Thomas M.", color: "#3F0E40", barColor: "#3F0E40" },
];

const SCATTERED = [
  { x: 5, y: 22, rot: -4 },
  { x: 55, y: 18, rot: 3 },
  { x: 25, y: 60, rot: -2 },
];

const STACKED_LEFT = [
  { x: 4, y: 18, rot: 0 },
  { x: 4, y: 42, rot: 0 },
  { x: 4, y: 66, rot: 0 },
];

function MiniCard({
  card,
  dark = false,
  style,
}: {
  card: typeof CARD_DATA[0];
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 8,
        background: dark ? "#140C1F" : "#FFFFFF",
        border: `1px solid ${dark ? "#2A1D3A" : "#E2DED6"}`,
        boxShadow: dark
          ? "0 4px 20px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(26,25,23,0.08), 0 8px 24px rgba(26,25,23,0.06)",
        overflow: "hidden",
        ...style,
      }}>
      <div
        style={{
          height: 2,
          background: card.barColor,
        }}
      />
      <div style={{ padding: "10px 14px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: card.color,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: dark ? "#E8E0F0" : card.color,
            }}>
            {card.label}
          </span>
          <span style={{ fontSize: 10, color: dark ? "#6B5A80" : "#9C9890" }}>/</span>
          <span style={{ fontSize: 10, color: dark ? "#8B7BA0" : "#6E6B65" }}>{card.sub}</span>
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: dark ? "#F9FAFB" : "#1A1917",
            lineHeight: 1.4,
            marginBottom: 4,
          }}>
          {card.title}
        </div>
        <div style={{ fontSize: 10, color: dark ? "#8B7BA0" : card.color, fontWeight: 500 }}>
          {card.id}
        </div>
      </div>
    </div>
  );
}

/* ── Section label ── */

function SectionLabel({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "3vh",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        zIndex: 20,
        pointerEvents: "none",
        width: "90%",
      }}>
      <div
        className="font-ui"
        style={{
          fontSize: "clamp(0.55rem, 0.75vw, 0.7rem)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: 8,
          fontWeight: 600,
        }}>
        {num}
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
          color: "var(--cream)",
          fontWeight: 400,
          marginBottom: 6,
        }}>
        {name}
      </div>
      <div
        className="font-ui"
        style={{
          fontSize: "clamp(0.6rem, 0.85vw, 0.75rem)",
          color: "var(--cream-muted)",
          maxWidth: 500,
          lineHeight: 1.5,
          margin: "0 auto",
        }}>
        {desc}
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        height: 1,
        background: "linear-gradient(90deg, transparent 10%, var(--gold-dim) 50%, transparent 90%)",
        opacity: 0.3,
        margin: "0 10%",
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════
   A. STACK & SPOTLIGHT
   Cards slide left into a vertical stack. Each highlights in
   turn with its story on the right, then I-statement replaces.
   ════════════════════════════════════════════════════════════ */

function StackSpotlightSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(containerRef);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;

      // Phase 1 (0–0.2): cards slide from scattered to stacked-left
      const stackProgress = smoothstep(0.05, 0.25, p);

      for (let i = 0; i < 3; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const from = SCATTERED[i];
        const to = STACKED_LEFT[i];
        const x = lerp(from.x, to.x, stackProgress);
        const y = lerp(from.y, to.y, stackProgress);
        const rot = lerp(from.rot, to.rot, stackProgress);

        // Highlight active card
        const isActive = p > 0.3 && Math.floor((p - 0.3) / 0.2) === i;
        const scale = isActive ? 1.03 : 1;
        const border = isActive ? "var(--gold)" : "transparent";

        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `rotate(${rot}deg) scale(${scale})`;
        el.style.outline = `2px solid ${border}`;
        el.style.outlineOffset = "3px";
        el.style.opacity = stackProgress < 0.1 ? "0" : "1";
      }

      // Highlight indicator
      if (highlightRef.current) {
        const activeIdx = Math.min(2, Math.max(0, Math.floor((p - 0.3) / 0.2)));
        const showHighlight = p > 0.28 && p < 0.9;
        highlightRef.current.style.opacity = showHighlight ? "1" : "0";
        highlightRef.current.style.top = `${STACKED_LEFT[activeIdx].y}%`;
      }

      // Story text
      if (storyRef.current) {
        const storyIn = smoothstep(0.28, 0.38, p);
        const storyOut = smoothstep(0.6, 0.7, p);
        storyRef.current.style.opacity = String(storyIn * (1 - storyOut));
      }

      // I-statement
      if (statementRef.current) {
        const stmtIn = smoothstep(0.7, 0.85, p);
        statementRef.current.style.opacity = String(stmtIn);
        statementRef.current.style.transform = `translateY(${lerp(12, 0, stmtIn)}px)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [progressRef]);

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <SectionLabel
          num="A"
          name="Stack & Spotlight"
          desc="Cards slide into a left stack. Each highlights with its story, then the I-statement takes over."
        />

        {/* Stacking cards */}
        {CARD_DATA.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: `${SCATTERED[i].x}%`,
              top: `${SCATTERED[i].y}%`,
              transform: `rotate(${SCATTERED[i].rot}deg)`,
              width: "max(280px, 22vw)",
              opacity: 0,
              transition: "outline 0.3s, outline-offset 0.3s",
              borderRadius: 8,
              willChange: "left, top, transform, opacity",
              zIndex: 5 + i,
            }}>
            <MiniCard card={card} dark={i === 1} />
          </div>
        ))}

        {/* Active indicator line */}
        <div
          ref={highlightRef}
          style={{
            position: "absolute",
            left: "2.5%",
            width: 3,
            height: "max(100px, 12vh)",
            background: "var(--gold)",
            borderRadius: 2,
            opacity: 0,
            transition: "top 0.4s ease",
            willChange: "top, opacity",
            zIndex: 10,
          }}
        />

        {/* Story text — right side */}
        <div
          ref={storyRef}
          className="font-sans"
          style={{
            position: "absolute",
            left: "42%",
            top: "50%",
            transform: "translateY(-50%)",
            maxWidth: "max(340px, 32vw)",
            fontSize: "clamp(0.9rem, 1.15vw, 1.05rem)",
            lineHeight: 1.75,
            color: "var(--cream-muted)",
            opacity: 0,
            willChange: "opacity",
          }}>
          {STORY.text}
        </div>

        {/* I-statement */}
        <div
          ref={statementRef}
          className="font-serif"
          style={{
            position: "absolute",
            left: "42%",
            top: "50%",
            transform: "translateY(-50%)",
            maxWidth: "max(420px, 35vw)",
            fontSize: "clamp(1.3rem, 2.4vw, 2rem)",
            lineHeight: 1.45,
            color: "var(--gold)",
            fontStyle: "italic",
            opacity: 0,
            willChange: "opacity, transform",
          }}>
          {STORY.iStatement}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   B. ONE-AT-A-TIME FOCUS
   Cards stay scattered. One scales up and moves center-left,
   others dim. Story + I-statement cycle per card.
   ════════════════════════════════════════════════════════════ */

function FocusSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(containerRef);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;

      // Each card gets a ~0.25 window
      const cardWindow = 0.28;
      const cardStart = 0.1;

      for (let i = 0; i < 3; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const myStart = cardStart + i * cardWindow;
        const focusIn = smoothstep(myStart, myStart + 0.06, p);
        const focusOut = smoothstep(myStart + cardWindow - 0.06, myStart + cardWindow, p);
        const isFocused = focusIn > 0 && focusOut < 1;
        const focusAmount = focusIn * (1 - focusOut);

        const baseX = SCATTERED[i].x;
        const baseY = SCATTERED[i].y;
        const baseRot = SCATTERED[i].rot;

        // When focused: move toward center-left, scale up
        const targetX = 18;
        const targetY = 45;
        const x = lerp(baseX, targetX, focusAmount);
        const y = lerp(baseY, targetY, focusAmount);
        const rot = lerp(baseRot, 0, focusAmount);
        const scale = lerp(1, 1.15, focusAmount);
        const dim = isFocused ? 1 : lerp(1, 0.3, smoothstep(cardStart, cardStart + 0.1, p));

        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `rotate(${rot}deg) scale(${scale})`;
        el.style.opacity = String(dim);
        el.style.zIndex = isFocused ? "15" : "5";
      }

      // Story and I-statement cycle
      const activeWindow = Math.floor((p - cardStart) / cardWindow);
      const localProgress = ((p - cardStart) % cardWindow) / cardWindow;

      if (storyRef.current) {
        const showStory = localProgress > 0.15 && localProgress < 0.55 && activeWindow >= 0 && activeWindow < 3;
        storyRef.current.style.opacity = showStory ? String(smoothstep(0.15, 0.25, localProgress) * (1 - smoothstep(0.45, 0.55, localProgress))) : "0";
      }

      if (statementRef.current) {
        const showStatement = localProgress > 0.5 && localProgress < 0.95 && activeWindow >= 0 && activeWindow < 3;
        const stmtProgress = showStatement ? smoothstep(0.5, 0.65, localProgress) : 0;
        statementRef.current.style.opacity = String(stmtProgress);
        statementRef.current.style.transform = `translateY(${lerp(8, 0, stmtProgress)}px)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [progressRef]);

  return (
    <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <SectionLabel
          num="B"
          name="One-at-a-Time Focus"
          desc="All cards stay scattered. One scales up and centers, others dim. Story → I-statement per card."
        />

        {CARD_DATA.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: `${SCATTERED[i].x}%`,
              top: `${SCATTERED[i].y}%`,
              transform: `rotate(${SCATTERED[i].rot}deg)`,
              width: "max(280px, 22vw)",
              willChange: "left, top, transform, opacity",
              zIndex: 5 + i,
            }}>
            <MiniCard card={card} dark={i === 1} />
          </div>
        ))}

        <div
          ref={storyRef}
          className="font-sans"
          style={{
            position: "absolute",
            right: "8%",
            top: "38%",
            maxWidth: "max(320px, 30vw)",
            fontSize: "clamp(0.88rem, 1.1vw, 1rem)",
            lineHeight: 1.75,
            color: "var(--cream-muted)",
            opacity: 0,
            willChange: "opacity",
          }}>
          {STORY.text}
        </div>

        <div
          ref={statementRef}
          className="font-serif"
          style={{
            position: "absolute",
            right: "8%",
            top: "42%",
            maxWidth: "max(380px, 32vw)",
            fontSize: "clamp(1.3rem, 2.4vw, 2rem)",
            lineHeight: 1.45,
            color: "var(--gold)",
            fontStyle: "italic",
            opacity: 0,
            willChange: "opacity, transform",
          }}>
          {STORY.iStatement}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   C. TIMELINE RAIL
   Cards shrink and align along a vertical center rail.
   Stories extend out alternating sides.
   ════════════════════════════════════════════════════════════ */

function TimelineRailSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(containerRef);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statementRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  const railPositions = [
    { x: 50, y: 20 },
    { x: 50, y: 45 },
    { x: 50, y: 70 },
  ];

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;

      // Phase 1 (0–0.25): cards converge to center rail
      const converge = smoothstep(0.05, 0.25, p);

      // Rail appears
      if (railRef.current) {
        railRef.current.style.opacity = String(smoothstep(0.1, 0.2, p));
        railRef.current.style.height = `${smoothstep(0.1, 0.25, p) * 60}%`;
      }

      for (let i = 0; i < 3; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const from = SCATTERED[i];
        const to = railPositions[i];
        const x = lerp(from.x, to.x, converge);
        const y = lerp(from.y, to.y, converge);
        const rot = lerp(from.rot, 0, converge);
        const scale = lerp(1, 0.85, converge);

        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;

        // Stories extend out from each card
        const storyEl = storyRefs.current[i];
        if (storyEl) {
          const storyStart = 0.3 + i * 0.15;
          const storyProgress = smoothstep(storyStart, storyStart + 0.08, p);
          storyEl.style.opacity = String(storyProgress);
          const direction = i % 2 === 0 ? 1 : -1;
          storyEl.style.transform = `translateX(${lerp(direction * 20, direction * 55, storyProgress)}%)`;
        }
      }

      // Final I-statement
      if (statementRef.current) {
        const stmtIn = smoothstep(0.78, 0.9, p);
        statementRef.current.style.opacity = String(stmtIn);
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [progressRef]);

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <SectionLabel
          num="C"
          name="Timeline Rail"
          desc="Cards shrink and align on a center rail. Stories extend outward. The rail becomes a thread."
        />

        {/* Vertical rail line */}
        <div
          ref={railRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "20%",
            width: 1,
            height: "0%",
            background: "var(--gold-dim)",
            opacity: 0,
            willChange: "height, opacity",
          }}
        />

        {CARD_DATA.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: `${SCATTERED[i].x}%`,
              top: `${SCATTERED[i].y}%`,
              transform: `rotate(${SCATTERED[i].rot}deg)`,
              width: "max(240px, 18vw)",
              willChange: "left, top, transform",
              zIndex: 5 + i,
            }}>
            <MiniCard card={card} dark={i === 1} />

            {/* Story extending from card */}
            <div
              ref={(el) => { storyRefs.current[i] = el; }}
              className="font-sans"
              style={{
                position: "absolute",
                top: "50%",
                [i % 2 === 0 ? "left" : "right"]: "110%",
                transform: "translateY(-50%)",
                width: "max(220px, 18vw)",
                fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                lineHeight: 1.6,
                color: "var(--cream-muted)",
                opacity: 0,
                willChange: "opacity, transform",
              }}>
              {STORY.text.slice(0, 90 + i * 30)}...
            </div>
          </div>
        ))}

        {/* Final I-statement at bottom of rail */}
        <div
          ref={statementRef}
          className="font-serif"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "8%",
            transform: "translateX(-50%)",
            maxWidth: "max(500px, 45vw)",
            fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
            lineHeight: 1.45,
            color: "var(--gold)",
            fontStyle: "italic",
            textAlign: "center",
            opacity: 0,
            willChange: "opacity",
          }}>
          {STORY.iStatement}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   D. CARD-TO-QUOTE MORPH
   Each card morphs in place — UI chrome fades, card becomes
   a minimal quote card with the I-statement. Same positions.
   ════════════════════════════════════════════════════════════ */

function CardMorphSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(containerRef);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;

      for (let i = 0; i < 3; i++) {
        const wrapper = wrapperRefs.current[i];
        const front = cardFrontRefs.current[i];
        const back = cardBackRefs.current[i];
        if (!wrapper || !front || !back) continue;

        // Stagger each card's morph
        const morphStart = 0.25 + i * 0.15;
        const morphEnd = morphStart + 0.18;
        const morph = smoothstep(morphStart, morphEnd, p);

        front.style.opacity = String(1 - morph);
        back.style.opacity = String(morph);

        // Subtle scale pulse during morph
        const pulse = morph > 0 && morph < 1 ? Math.sin(morph * Math.PI) * 0.04 : 0;
        wrapper.style.transform = `rotate(${SCATTERED[i].rot}deg) scale(${1 + pulse})`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [progressRef]);

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <SectionLabel
          num="D"
          name="Card-to-Quote Morph"
          desc="Each artifact card morphs in place. The UI chrome dissolves, revealing the I-statement. Same positions, new content."
        />

        {CARD_DATA.map((card, i) => (
          <div
            key={i}
            ref={(el) => { wrapperRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: `${SCATTERED[i].x}%`,
              top: `${SCATTERED[i].y}%`,
              transform: `rotate(${SCATTERED[i].rot}deg)`,
              width: "max(300px, 24vw)",
              zIndex: 5 + i,
              willChange: "transform",
            }}>
            {/* Front: artifact card */}
            <div ref={(el) => { cardFrontRefs.current[i] = el; }} style={{ willChange: "opacity" }}>
              <MiniCard card={card} dark={i === 1} />
            </div>

            {/* Back: quote card */}
            <div
              ref={(el) => { cardBackRefs.current[i] = el; }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 8,
                background: "linear-gradient(145deg, rgba(15,14,18,0.95), rgba(26,24,32,0.95))",
                border: "1px solid var(--gold-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(16px, 3vw, 28px)",
                opacity: 0,
                willChange: "opacity",
              }}>
              <div
                className="font-serif"
                style={{
                  fontSize: "clamp(0.85rem, 1.3vw, 1.1rem)",
                  color: "var(--gold)",
                  textAlign: "center",
                  lineHeight: 1.55,
                  fontStyle: "italic",
                }}>
                {STORY.iStatement}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   E. SCROLL ACCORDION
   Cards stay scattered. As you scroll past each, it "opens"
   downward to reveal story text, then condenses to I-statement.
   ════════════════════════════════════════════════════════════ */

function AccordionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(containerRef);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quoteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;

      for (let i = 0; i < 3; i++) {
        const expand = expandRefs.current[i];
        const story = storyRefs.current[i];
        const quote = quoteRefs.current[i];
        if (!expand || !story || !quote) continue;

        // Each card gets a window
        const openStart = 0.15 + i * 0.22;
        const openEnd = openStart + 0.08;
        const condenseStart = openEnd + 0.06;
        const condenseEnd = condenseStart + 0.06;

        const openProgress = smoothstep(openStart, openEnd, p);
        const condenseProgress = smoothstep(condenseStart, condenseEnd, p);

        // Expandable area height
        const maxHeight = 140;
        expand.style.maxHeight = `${openProgress * maxHeight}px`;
        expand.style.opacity = String(openProgress);

        // Story fades out, quote fades in
        story.style.opacity = String(openProgress * (1 - condenseProgress));
        quote.style.opacity = String(condenseProgress);
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [progressRef]);

  return (
    <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <SectionLabel
          num="E"
          name="Scroll Accordion"
          desc="Each card opens like an envelope as you scroll past. The story unfolds, then condenses into the I-statement."
        />

        {CARD_DATA.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: `${SCATTERED[i].x}%`,
              top: `${SCATTERED[i].y}%`,
              transform: `rotate(${SCATTERED[i].rot}deg)`,
              width: "max(300px, 24vw)",
              zIndex: 5 + i,
            }}>
            <MiniCard card={card} dark={i === 1} />

            {/* Expandable area below card */}
            <div
              ref={(el) => { expandRefs.current[i] = el; }}
              style={{
                maxHeight: 0,
                overflow: "hidden",
                opacity: 0,
                borderRadius: "0 0 8px 8px",
                background: "rgba(15,14,18,0.9)",
                borderLeft: "1px solid var(--gold-dim)",
                borderRight: "1px solid var(--gold-dim)",
                borderBottom: "1px solid var(--gold-dim)",
                padding: "0 14px",
                willChange: "max-height, opacity",
                position: "relative",
              }}>
              {/* Story text */}
              <div
                ref={(el) => { storyRefs.current[i] = el; }}
                className="font-sans"
                style={{
                  fontSize: "clamp(0.72rem, 0.85vw, 0.8rem)",
                  lineHeight: 1.6,
                  color: "var(--cream-muted)",
                  padding: "12px 0",
                  willChange: "opacity",
                }}>
                {STORY.text.slice(0, 120)}...
              </div>

              {/* Quote overlay */}
              <div
                ref={(el) => { quoteRefs.current[i] = el; }}
                className="font-serif"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 14px",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  color: "var(--gold)",
                  fontStyle: "italic",
                  textAlign: "center",
                  lineHeight: 1.5,
                  opacity: 0,
                  willChange: "opacity",
                }}>
                {STORY.iStatement}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */

export default function LabTransitionsPage() {
  return (
    <>
      <LabNav />

      {/* Header */}
      <div
        style={{
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          textAlign: "center",
          padding: "0 24px",
        }}>
        <div
          className="font-ui"
          style={{
            fontSize: "clamp(0.5rem, 0.65vw, 0.6rem)",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--gold-dim)",
            marginBottom: 14,
            fontWeight: 600,
          }}>
          Transition Explorations
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
            color: "var(--cream)",
            fontWeight: 400,
            marginBottom: 14,
            lineHeight: 1.2,
          }}>
          Cards to I-Statement
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: "clamp(0.82rem, 1vw, 0.95rem)",
            color: "var(--cream-muted)",
            maxWidth: 480,
            lineHeight: 1.6,
          }}>
          Five approaches for transitioning 3 scattered artifact cards
          through their stories to a distilled I-statement.
        </p>
        <div
          className="font-ui"
          style={{
            marginTop: 36,
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.2em",
          }}>
          SCROLL TO EXPLORE
        </div>
      </div>

      <StackSpotlightSection />
      <SectionDivider />
      <FocusSection />
      <SectionDivider />
      <TimelineRailSection />
      <SectionDivider />
      <CardMorphSection />
      <SectionDivider />
      <AccordionSection />

      <div style={{ height: "25vh", background: "var(--bg)" }} />
    </>
  );
}
