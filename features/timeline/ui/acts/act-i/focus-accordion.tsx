"use client";

import { useState } from "react";
import { motion, useTransform, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ORBIT_NODES } from "@data";
import { C, MOBILE_ACCORDION_START, MOBILE_ACCORDION_END } from "./chaos-to-order.constants";

export function FocusAccordion({
  scrollProgress,
}: {
  scrollProgress: import("framer-motion").MotionValue<number>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const bgOpacity = useTransform(
    scrollProgress,
    [MOBILE_ACCORDION_START - 0.01, MOBILE_ACCORDION_START],
    [0, 1],
  );

  const contentOpacity = useTransform(
    scrollProgress,
    [MOBILE_ACCORDION_START, MOBILE_ACCORDION_END],
    [0, 1],
  );

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-50 sm:hidden">
      <motion.div
        className="absolute inset-0"
        style={{ opacity: bgOpacity, background: "var(--bg)" }}
      />
      <motion.div
        className="relative h-full overflow-y-auto px-[var(--page-gutter)] pt-24"
        style={{ opacity: contentOpacity }}>
        {ORBIT_NODES.map((node, i) => (
          <AccordionItem
            key={node.label}
            node={node}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </div>
  );
}

function AccordionItem({
  node,
  isOpen,
  onToggle,
}: {
  node: (typeof ORBIT_NODES)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-3 text-left">
        <div className="min-w-0 flex-1">
          <div
            className="mb-0.5 font-sans text-[8px] font-medium uppercase tracking-[0.12em]"
            style={{ color: C.accent, opacity: 0.5 }}>
            {node.label}
          </div>
          <div
            className="font-sans text-[clamp(14px,4vw,17px)] leading-tight tracking-[-0.01em]"
            style={{ color: isOpen ? C.cardTitleHover : C.cardTitle }}>
            {node.title}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 pl-3"
          style={{ color: C.accent, opacity: 0.3 }}>
          <ChevronRight size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden">
            <p
              className="pb-4 font-serif text-[13px] italic leading-relaxed"
              style={{ color: C.narrator }}>
              {node.capability}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
