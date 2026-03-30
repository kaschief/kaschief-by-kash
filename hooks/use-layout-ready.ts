import { create } from "zustand";

/**
 * Barrier-based layout readiness store.
 *
 * Components that shift layout asynchronously (lazy-loaded Timeline,
 * Portrait GSAP pin spacer) register barriers. When all barriers clear,
 * the registered callback fires — signaling that element positions are
 * stable and hash-based scroll navigation is safe.
 *
 * Zero cost when no hash is present (no barriers registered, no callbacks).
 */

interface LayoutReadyState {
  /** IDs of pending barriers that haven't cleared yet. */
  pending: Set<string>;
  /** One-shot callback fired when all barriers clear. */
  callback: (() => void) | null;

  /** Register a barrier that must clear before layout is ready. */
  registerBarrier: (id: string) => void;
  /** Clear a barrier. Fires callback if all barriers are now cleared. */
  clearBarrier: (id: string) => void;
  /** Register a one-shot ready callback. Fires immediately if already ready. */
  onReady: (cb: () => void) => () => void;
  /** Reset all state (safety / HMR). */
  reset: () => void;
}

export const useLayoutReady = create<LayoutReadyState>((set, get) => ({
  pending: new Set(),
  callback: null,

  registerBarrier: (id) => {
    set((state) => {
      const next = new Set(state.pending);
      next.add(id);
      return { pending: next };
    });
  },

  clearBarrier: (id) => {
    const { pending, callback } = get();
    if (!pending.has(id)) return;

    const next = new Set(pending);
    next.delete(id);
    set({ pending: next });

    if (next.size === 0 && callback) {
      set({ callback: null });
      callback();
    }
  },

  onReady: (cb) => {
    const { pending } = get();
    if (pending.size === 0) {
      // Already ready — fire synchronously
      cb();
      return () => {};
    }
    set({ callback: cb });
    return () => {
      // Unsubscribe if the effect tears down before barriers clear
      const { callback: current } = get();
      if (current === cb) set({ callback: null });
    };
  },

  reset: () => set({ pending: new Set(), callback: null }),
}));
