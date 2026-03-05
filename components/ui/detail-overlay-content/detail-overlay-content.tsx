import type { MouseEventHandler, ReactNode } from "react";

interface DetailOverlayContentProps {
  children: ReactNode;
  /** Stops click propagation (prevents the backdrop dismiss handler firing). */
  onClick?: MouseEventHandler<HTMLDivElement>;
}

/**
 * Shared responsive content wrapper for full-screen detail overlays.
 *
 * Owns breakpoint-specific padding so individual overlays stay layout-agnostic.
 */
export function DetailOverlayContent({
  children,
  onClick,
}: DetailOverlayContentProps) {
  return (
    <div
      onClick={onClick}
      className="mx-auto w-full max-w-[1024px] px-5 pt-[10vh] pb-[8.5rem] sm:px-8 sm:pt-[18vh] sm:pb-[10vh] md:px-10 lg:px-12">
      {children}
    </div>
  );
}
