"use client";

import { useState } from "react";
import { motion, useTransform, AnimatePresence } from "framer-motion";
import { ACT_I } from "@data";
import {
  COLORS,
  MOBILE_ACCORDION_START,
  MOBILE_ACCORDION_END,
  ACCORDION_BG_LEAD,
  WATERMARK_COLOR_MOBILE,
  COLOR_TRANSITION,
} from "./chaos-to-order.constants";

export function FocusAccordion({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const bgOpacity = useTransform(
    scrollProgress,
    [MOBILE_ACCORDION_START - ACCORDION_BG_LEAD, MOBILE_ACCORDION_START],
    [0, 1],
  );

  const contentOpacity = useTransform(
    scrollProgress,
    [MOBILE_ACCORDION_START, MOBILE_ACCORDION_END],
    [0, 1],
  );

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-50 lg:hidden">
      <motion.div
        className="absolute inset-0"
        style={{ opacity: bgOpacity, background: "var(--bg)" }}
      />

      <motion.div
        className="relative flex h-full flex-col justify-start overflow-y-auto px-[var(--page-gutter)] pt-[15cqh]"
        style={{ opacity: contentOpacity }}
        role="list"
        aria-label="Skills breakdown">
        <div className="space-y-1">
          {ACT_I.skillScenarios.map((node, i) => (
            <AccordionItem
              key={node.id}
              node={node}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AccordionItem({
  node,
  isOpen,
  onToggle,
}: {
  node: (typeof ACT_I.skillScenarios)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `accordion-panel-${node.id}`;

  return (
    <div
      role="listitem"
      className="relative border-b overflow-hidden"
      style={{ borderColor: isOpen ? COLORS.hairlineBorderHover : COLORS.hairlineBorder }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="relative flex w-full cursor-pointer items-center gap-3 py-4 text-left">
        {/* Watermark — pinned to button row, not the expanding panel */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center select-none font-serif font-bold uppercase leading-none"
          style={{
            fontSize: "clamp(32px, 10vw, 48px)",
            color: WATERMARK_COLOR_MOBILE,
          }}
          aria-hidden="true">
          {node.id}
        </span>
        {/* Title */}
        <span
          className="min-w-0 flex-1 font-sans text-[clamp(14px,4vw,17px)] leading-snug tracking-[-0.01em]"
          style={{
            color: isOpen ? COLORS.narrator : COLORS.cardTitle,
            transition: `color ${COLOR_TRANSITION}`,
          }}>
          {node.title}
        </span>

        {/* Toggle indicator */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-[14px] leading-none"
          style={{ color: COLORS.accent, opacity: isOpen ? 0.5 : 0.2 }}
          aria-hidden="true">
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden">
            <div className="pb-5">
              <p
                className="mb-3 font-narrator font-semibold text-[15px] leading-relaxed"
                style={{ color: COLORS.cardBody }}>
                {node.question}
              </p>
              <p
                className="font-narrator text-[16px] leading-relaxed"
                style={{ color: "var(--gold)" }}>
                {node.iStatement}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
