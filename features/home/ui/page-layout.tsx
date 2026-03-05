"use client";

import type { CSSProperties, ReactNode } from "react";
import { useBreakpoint } from "@hooks";
import { BP } from "@utilities";

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Parent page shell that owns the horizontal gutter for all timeline sections.
 * Children consume `--page-gutter` instead of hard-coding breakpoint paddings.
 */
export function PageLayout({ children }: PageLayoutProps) {
  const isTabletUp = useBreakpoint(BP.md);
  const isDesktopXl = useBreakpoint(BP.xl);
  const pageGutter = isTabletUp && !isDesktopXl ? "2.5rem" : "1.5rem";

  return (
    <main
      style={
        {
          "--page-gutter": pageGutter,
        } as CSSProperties
      }>
      {children}
    </main>
  );
}
