import type { ReactNode, MouseEventHandler } from "react";
interface TakeoverContentProps {
  children: ReactNode;
  /** Stops click propagation (prevents the backdrop dismiss handler firing). */
  onClick?: MouseEventHandler<HTMLDivElement>;
}

/**
 * Shared responsive content wrapper used by every full-screen takeover
 * (JobTakeover, StoryTakeover, SkillTakeover).
 *
 * Owns all breakpoint-specific padding so individual takeover components
 * stay layout-agnostic.  To adjust spacing site-wide, edit only this file.
 *
 *   Mobile  (< 640px)  — tighter vertical padding, narrower side gutter
 *   sm+     (≥ 640px)  — original desktop spacing
 */
export function TakeoverContent({ children, onClick }: TakeoverContentProps) {
  return (
    <div
      onClick={onClick}
      className="mx-auto w-full max-w-[1024px] px-5 pt-[10vh] pb-[8vh] sm:px-6 sm:pt-[18vh] sm:pb-[10vh]">
      {children}
    </div>
  );
}
