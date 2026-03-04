/**
 * Interaction constants shared across keyboard, DOM event, and detail overlay
 * behavior. Keeps string literals out of component logic.
 */

export const KEYBOARD_EVENT = {
  TYPE: {
    KEY_DOWN: "keydown",
  },
  KEY: {
    ESCAPE: "Escape",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
  },
} as const;

export const POINTER_EVENT = {
  MOUSE_DOWN: "mousedown",
} as const;

export const HISTORY_EVENT = {
  POP_STATE: "popstate",
} as const;

export const DETAIL_OVERLAY_NAV_LABEL = {
  PREVIOUS_METHOD: "Previous method",
  NEXT_METHOD: "Next method",
  PREVIOUS_JOB: "Previous job",
  NEXT_JOB: "Next job",
} as const;
