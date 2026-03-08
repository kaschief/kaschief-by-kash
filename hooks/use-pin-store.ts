import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PinState {
  completed: Record<string, boolean>;
  markDone: (sectionId: string) => void;
}

export const usePinStore = create<PinState>()(
  devtools(
    (set) => ({
      completed: {},
      markDone: (sectionId) =>
        set(
          (s) => ({ completed: { ...s.completed, [sectionId]: true } }),
          false,
          `pin/${sectionId}/done`,
        ),
    }),
    { name: "pin-store" },
  ),
);
