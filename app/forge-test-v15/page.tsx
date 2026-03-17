"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ForgeNav } from "../forge-nav";

/* ── helpers ─────────────────────────────────────────────────────── */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
/* ── data ────────────────────────────────────────────────────────── */
const COMPANIES = [
  {
    name: "AMBOSS",
    period: "Berlin, 2018–2019",
    color: "#60A5FA",
    scene:
      "Half a million medical students. I came from the ward — I knew what it felt like when the system you depend on doesn't understand your context.",
    action:
      "Migrated vanilla JS to React. Introduced A/B testing. Broke production once — learned testing discipline.",
    shift:
      "The gap between 'works technically' and 'works for the person' is where most products fail.",
  },
  {
    name: "Compado",
    period: "Berlin, 2019–2021",
    color: "#42B883",
    scene:
      "Sites were replicas of each other. Every change meant touching six copies. Visitors arrived from search with zero loyalty.",
    action:
      "Rebuilt as swappable components. Attacked load times: Lighthouse, lazy loading, CSS compression.",
    shift: "Every millisecond is a user who stays or leaves.",
  },
  {
    name: "CAPinside",
    period: "Hamburg, 2021",
    color: "#3178C6",
    scene:
      "Ten thousand financial advisors on a fragile platform. Nobody reviewed code. Tests were sparse.",
    action:
      "Started seeing the codebase as a record of how the team communicated. Every shortcut was a frozen habit.",
    shift: "You can't fix code without fixing process.",
  },
  {
    name: "DKB",
    period: "Berlin, 2021–2024",
    color: "#F472B6",
    scene:
      "Germany's largest direct bank. Five million users. Monthly releases. Zero automated tests when I arrived.",
    action:
      "Introduced Playwright. Monthly to weekly releases. Feature flags. Found myself in the product room.",
    shift: "Then they promoted me to engineering manager.",
  },
];

const TRAIL_MAX = 40;

/* ── bezier helpers ──────────────────────────────────────────────── */
function bezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/* ── component ───────────────────────────────────────────────────── */
export default function ParticleScribePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const rafRef = useRef<number>(0);
  const lastCompanyRef = useRef(-1);

  const { scrollYProgress } = useScroll({ target: containerRef });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  /* ── canvas loop ─────────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const p = progressRef.current;

    ctx.clearRect(0, 0, W, H);

    // which company
    const companyIndex = Math.min(3, Math.floor(p * 4));
    const localP = (p * 4 - companyIndex) / 1; // 0..1 within this company's segment

    // reset trail on company change
    if (companyIndex !== lastCompanyRef.current) {
      trailRef.current = [];
      lastCompanyRef.current = companyIndex;
    }

    const company = COMPANIES[companyIndex];
    if (!company) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    // dark pause at transitions (last 5% of each segment)
    const drawPhase = Math.min(localP / 0.95, 1);
    if (localP > 0.95) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    // particle travels during scene writing: 0..0.55 of the phase
    const particleT = smoothstep(0, 0.55, drawPhase);

    // entry direction: odd from left, even from right
    const fromLeft = companyIndex % 2 === 0;

    // bezier control points
    const p0 = fromLeft ? { x: -30, y: H * 0.3 } : { x: W + 30, y: H * 0.3 };
    const p3 = fromLeft ? { x: W + 30, y: H * 0.6 } : { x: -30, y: H * 0.6 };
    const p1 = fromLeft
      ? { x: W * 0.3, y: H * 0.15 }
      : { x: W * 0.7, y: H * 0.15 };
    const p2 = fromLeft
      ? { x: W * 0.7, y: H * 0.7 }
      : { x: W * 0.3, y: H * 0.7 };

    const pos = bezierPoint(particleT, p0, p1, p2, p3);

    // update trail
    const trail = trailRef.current;
    if (particleT < 1) {
      trail.unshift({ x: pos.x, y: pos.y, age: 0 });
    }
    for (let i = 0; i < trail.length; i++) {
      trail[i].age += 0.025;
    }
    while (trail.length > TRAIL_MAX) trail.pop();

    // draw trail (additive)
    ctx.globalCompositeOperation = "lighter";
    for (let i = 1; i < trail.length; i++) {
      const alpha = 1 - trail[i].age / 1;
      if (alpha <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = company.color;
      ctx.globalAlpha = alpha * 0.6;
      ctx.lineWidth = 2 + alpha * 2;
      ctx.stroke();
    }

    // draw particle head
    if (particleT < 1) {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // radial glow
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
      glow.addColorStop(0, company.color + "CC");
      glow.addColorStop(0.4, company.color + "44");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // bright dot
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = company.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  /* ── resize + start loop ─────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  /* ── derived state for text overlay ─────────────────────────── */
  // We compute inline during render using a sync read of progressRef,
  // but since scrollYProgress triggers re-render via useMotionValueEvent we
  // keep a state mirror.
  // Actually framer re-renders are not guaranteed, so we use a separate
  // state-driven approach with requestAnimationFrame overlay updates.
  // For simplicity, we'll use a second effect that patches DOM directly.

  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = textContainerRef.current;
      if (!el) {
        frame = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;
      const companyIndex = Math.min(3, Math.floor(p * 4));
      const localP = p * 4 - companyIndex;
      const drawPhase = Math.min(localP / 0.95, 1);

      const company = COMPANIES[companyIndex];
      if (!company) {
        frame = requestAnimationFrame(update);
        return;
      }

      // text reveal timings within drawPhase
      const sceneReveal = smoothstep(0, 0.55, drawPhase);
      const actionFade = smoothstep(0.58, 0.7, drawPhase);
      const shiftFade = smoothstep(0.72, 0.85, drawPhase);
      // pause fade-out
      const fadeOut = localP > 0.9 ? smoothstep(0.9, 0.95, localP) : 0;
      const containerOpacity = 1 - fadeOut;

      // Update DOM
      el.style.opacity = String(containerOpacity);

      const nameEl = el.querySelector<HTMLElement>("[data-role=name]");
      const periodEl = el.querySelector<HTMLElement>("[data-role=period]");
      const sceneEl = el.querySelector<HTMLElement>("[data-role=scene]");
      const actionEl = el.querySelector<HTMLElement>("[data-role=action]");
      const shiftEl = el.querySelector<HTMLElement>("[data-role=shift]");

      if (nameEl) {
        nameEl.textContent = company.name;
        nameEl.style.color = company.color;
        nameEl.style.opacity = String(smoothstep(0, 0.05, drawPhase));
      }
      if (periodEl) {
        periodEl.textContent = company.period;
        periodEl.style.opacity = String(smoothstep(0, 0.05, drawPhase));
      }
      if (sceneEl) {
        sceneEl.textContent = company.scene;
        const clipRight = 100 - sceneReveal * 100;
        sceneEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
      }
      if (actionEl) {
        actionEl.textContent = company.action;
        actionEl.style.opacity = String(actionFade);
      }
      if (shiftEl) {
        shiftEl.textContent = company.shift;
        shiftEl.style.opacity = String(shiftFade);
      }

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: "1000vh", background: "var(--bg, #07070A)" }}
    >
      <ForgeNav />

      {/* sticky viewport */}
      <div
        className="sticky top-0"
        style={{ height: "100vh", width: "100%", overflow: "hidden" }}
      >
        {/* canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ pointerEvents: "none" }}
        />

        {/* text overlay */}
        <div
          ref={textContainerRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none", zIndex: 1 }}
        >
          <div className="max-w-[500px] px-6 text-center">
            {/* company label */}
            <div className="mb-4">
              <span
                data-role="name"
                className="font-sans text-[11px] uppercase tracking-widest"
              />
              <span
                data-role="period"
                className="font-sans text-[11px] ml-2"
                style={{ color: "var(--text-dim, #8A8478)" }}
              />
            </div>

            {/* scene */}
            <p
              data-role="scene"
              className="font-serif text-lg leading-relaxed mb-6"
              style={{ color: "var(--cream, #F0E6D0)" }}
            />

            {/* action */}
            <p
              data-role="action"
              className="font-sans text-sm leading-relaxed mb-4"
              style={{ color: "var(--cream-muted, #B0A890)", opacity: 0 }}
            />

            {/* shift */}
            <p
              data-role="shift"
              className="font-serif text-base italic leading-relaxed"
              style={{ color: "var(--cream, #F0E6D0)", opacity: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
