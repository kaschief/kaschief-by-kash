import type { SectionId } from "@utilities";

interface NavigationTiming {
  navVisibleViewportRatio: number;
  suppressScrollMs: number;
}

export const NAVIGATION_TIMING = {
  navVisibleViewportRatio: 0.75,
  suppressScrollMs: 1200,
} as const satisfies NavigationTiming;

export type ScrollSuppressionState =
  | { kind: "idle" }
  | { kind: "suppressed"; untilMs: number };

export type MobileMenuState =
  | { kind: "closed" }
  | { kind: "open" };

interface NavigationContext {
  activeSection: SectionId | "";
  hoveredLink: SectionId | null;
  suppression: ScrollSuppressionState;
  mobileMenu: MobileMenuState;
}

export type NavigationState =
  | ({ kind: "hidden" } & NavigationContext)
  | ({ kind: "visible" } & NavigationContext);

export type NavigationAction =
  | {
      type: "SCROLLED";
      payload: {
        nowMs: number;
        isVisible: boolean;
        activeSection: SectionId | "";
      };
    }
  | {
      type: "SET_ACTIVE_SECTION";
      payload: {
        activeSection: SectionId | "";
      };
    }
  | {
      type: "SET_HOVERED_LINK";
      payload: {
        sectionId: SectionId | null;
      };
    }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "CLOSE_MOBILE_MENU" }
  | {
      type: "SUPPRESS_SCROLL";
      payload: {
        untilMs: number;
      };
    }
  | { type: "CLEAR_SUPPRESSION" };

const INITIAL_CONTEXT = {
  activeSection: "" as SectionId | "",
  hoveredLink: null,
  suppression: { kind: "idle" } as const,
  mobileMenu: { kind: "closed" } as const,
} satisfies NavigationContext;

export const INITIAL_NAVIGATION_STATE = {
  kind: "hidden",
  ...INITIAL_CONTEXT,
} as const satisfies NavigationState;

function shouldRespectSuppression(
  suppression: ScrollSuppressionState,
  nowMs: number,
): suppression is { kind: "suppressed"; untilMs: number } {
  return suppression.kind === "suppressed" && nowMs < suppression.untilMs;
}

/**
 * Discriminated-union reducer that keeps nav behavior explicit.
 *
 * Why this shape:
 * - Makes impossible states unrepresentable (menu cannot be "maybe open").
 * - Keeps scroll suppression as explicit lifecycle state.
 * - Supports deterministic tests over behavior regressions.
 */
export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case "SCROLLED": {
      const { nowMs, isVisible, activeSection } = action.payload;
      const isSuppressed = shouldRespectSuppression(state.suppression, nowMs);

      return {
        ...state,
        kind: isVisible ? "visible" : "hidden",
        suppression: isSuppressed ? state.suppression : { kind: "idle" },
        activeSection: isSuppressed ? state.activeSection : activeSection,
      };
    }

    case "SET_ACTIVE_SECTION": {
      return {
        ...state,
        activeSection: action.payload.activeSection,
      };
    }

    case "SET_HOVERED_LINK": {
      return {
        ...state,
        hoveredLink: action.payload.sectionId,
      };
    }

    case "TOGGLE_MOBILE_MENU": {
      return {
        ...state,
        mobileMenu:
          state.mobileMenu.kind === "open"
            ? { kind: "closed" }
            : { kind: "open" },
      };
    }

    case "CLOSE_MOBILE_MENU": {
      return {
        ...state,
        mobileMenu: { kind: "closed" },
      };
    }

    case "SUPPRESS_SCROLL": {
      return {
        ...state,
        suppression: {
          kind: "suppressed",
          untilMs: action.payload.untilMs,
        },
      };
    }

    case "CLEAR_SUPPRESSION": {
      return {
        ...state,
        suppression: { kind: "idle" },
      };
    }

    default: {
      return state;
    }
  }
}
