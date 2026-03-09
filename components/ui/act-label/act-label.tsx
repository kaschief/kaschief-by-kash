"use client";

import { motion } from "framer-motion";
import type { ActLabelProps } from "./act-label.types";

export function ActLabel({ label, color, inView }: ActLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, letterSpacing: "0.3em" }}
      animate={inView ? { opacity: 1, letterSpacing: "0.5em" } : {}}
      transition={{ duration: 1.2, delay: 0.2 }}
      className="mb-6 text-xs sm:text-sm md:text-base"
      style={{ color }}>
      {label}
    </motion.div>
  );
}
