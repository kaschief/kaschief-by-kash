import type { ReactNode } from "react";
export interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}

export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export interface RevealLineProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}
