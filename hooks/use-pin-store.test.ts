import { describe, expect, it, beforeEach } from "vitest";
import { usePinStore } from "./use-pin-store";

describe("usePinStore", () => {
  beforeEach(() => {
    usePinStore.setState({ completed: {} });
  });

  it("starts with no completed sections", () => {
    expect(usePinStore.getState().completed).toEqual({});
  });

  it("marks a section as done", () => {
    usePinStore.getState().markDone("portrait");
    expect(usePinStore.getState().completed["portrait"]).toBe(true);
  });

  it("preserves previously completed sections when marking new ones", () => {
    usePinStore.getState().markDone("portrait");
    usePinStore.getState().markDone("methods");
    const { completed } = usePinStore.getState();
    expect(completed["portrait"]).toBe(true);
    expect(completed["methods"]).toBe(true);
  });

  it("is idempotent — marking the same section twice does not error", () => {
    usePinStore.getState().markDone("portrait");
    usePinStore.getState().markDone("portrait");
    expect(usePinStore.getState().completed["portrait"]).toBe(true);
  });
});
