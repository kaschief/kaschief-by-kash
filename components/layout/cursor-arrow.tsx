"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCustomCursorEnabled } from "@hooks";
import { Z_INDEX } from "@utilities";

const { cursor: cursorZ } = Z_INDEX;

const GOLD_HEX = "#C9A84C";

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [tabindex]:not([tabindex="-1"])';

/**
 * Minimal custom cursor — a small refined circle that tracks the mouse
 * with a slight spring lag. On interactive elements, it expands and
 * gets a border. Designed to feel premium without distracting.
 */
export function CursorArrow() {
  const enabled = useCustomCursorEnabled();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 500, damping: 40, mass: 0.3 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.dataset.customCursor = "on";
      return () => {
        delete root.dataset.customCursor;
      };
    }
    delete root.dataset.customCursor;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;
    const dot = container.querySelector<HTMLElement>("[data-dot]");

    let shown = false;
    let isPointer = false;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!shown) {
        container.style.opacity = "1";
        shown = true;
      }
    };

    const handleOver = (e: MouseEvent) => {
      const next = !!(e.target as Element).closest(INTERACTIVE_SELECTOR);
      if (next === isPointer) return;
      isPointer = next;
      if (dot) {
        dot.style.width = isPointer ? "8px" : "32px";
        dot.style.height = isPointer ? "8px" : "32px";
        dot.style.backgroundColor = isPointer ? GOLD_HEX : "transparent";
        dot.style.borderColor = isPointer ? "transparent" : `${GOLD_HEX}60`;
        dot.style.borderWidth = isPointer ? "0px" : "1px";
        dot.style.mixBlendMode = isPointer ? "normal" : "normal";
      }
    };

    const handleLeave = () => {
      container.style.opacity = "0";
    };

    const handleEnter = () => {
      if (shown) container.style.opacity = "1";
    };

    document.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: cursorZ,
        opacity: 0,
        transition: "opacity 0.3s ease",
      }}>
      <motion.div
        data-dot
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "transparent",
          borderColor: `${GOLD_HEX}60`,
          borderWidth: 1,
          borderStyle: "solid",
          transition: "width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1), background-color 0.3s ease, border-color 0.3s ease, border-width 0.3s ease, mix-blend-mode 0.2s ease",
        }}
      />
    </div>
  );
}
