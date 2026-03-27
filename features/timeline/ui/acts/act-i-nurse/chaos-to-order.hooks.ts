"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { BREAKPOINTS } from "@utilities";
import {
  MOUSE_RADIUS,
  MOUSE_STRENGTH,
  MAX_DISPLACEMENT,
  SPRING_CONFIG,
} from "./chaos-to-order.constants";

/** Ref-based breakpoint check — no re-renders on resize */
export function useIsLgRef() {
  const ref = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    ref.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return ref;
}

/** Water-like repulsion via useSpring — desktop only (no re-renders) */
export function useMouseDisplacement(
  containerRef: React.RefObject<HTMLDivElement | null>,
  nodeLeft: number,
  nodeTop: number,
  weight: number,
  enabled: boolean,
) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const nx = (nodeLeft / 100) * rect.width;
        const ny = (nodeTop / 100) * rect.height;
        const dx = nx - mx;
        const dy = ny - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const t = 1 - dist / MOUSE_RADIUS;
          const force = Math.min(
            t * t * MOUSE_STRENGTH * weight,
            MAX_DISPLACEMENT,
          );
          rawX.set((dx / dist) * force);
          rawY.set((dy / dist) * force);
        } else {
          rawX.set(0);
          rawY.set(0);
        }
      });
    };

    const handleLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef, nodeLeft, nodeTop, weight, enabled, rawX, rawY]);

  return { x, y };
}
