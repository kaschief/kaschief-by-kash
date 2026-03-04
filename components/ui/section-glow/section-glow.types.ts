import type { MotionValue } from "framer-motion";
export type SectionGlowSize = "sm" | "md" | "lg";

export interface SectionGlowProps {
  opacity?: MotionValue<number>;
  color?: string;
  size?: SectionGlowSize;
}
