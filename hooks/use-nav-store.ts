import { create } from "zustand";
import type { SectionId } from "@utilities";

interface NavState {
  /** True while a programmatic nav scroll is in flight. */
  isNavigating: boolean;
  /** The section being navigated to (set immediately on click). */
  targetSection: SectionId | null;
  /** Start a nav scroll — freezes all scroll-based detection. */
  startNavigation: (sectionId: SectionId) => void;
  /** End a nav scroll — unfreezes scroll-based detection. */
  endNavigation: () => void;
  /** Settled section — set on endNavigation so scroll detection starts from correct state. */
  settledSection: SectionId | null;
  clearSettled: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  isNavigating: false,
  targetSection: null,
  settledSection: null,
  startNavigation: (sectionId) =>
    set({ isNavigating: true, targetSection: sectionId, settledSection: null }),
  endNavigation: () => {
    const { targetSection } = get();
    set({ isNavigating: false, targetSection: null, settledSection: targetSection });
  },
  clearSettled: () => set({ settledSection: null }),
}));
