import { describe, expect, it, beforeEach } from "vitest";
import { useNavStore } from "./use-nav-store";
import type { SectionId } from "@utilities";

describe("useNavStore", () => {
  beforeEach(() => {
    const { endNavigation } = useNavStore.getState();
    endNavigation();
    useNavStore.getState().clearSettled();
  });

  it("starts in idle state", () => {
    const state = useNavStore.getState();
    expect(state.isNavigating).toBe(false);
    expect(state.targetSection).toBeNull();
    expect(state.settledSection).toBeNull();
  });

  it("startNavigation locks to target section", () => {
    useNavStore.getState().startNavigation("contact" as SectionId);
    const state = useNavStore.getState();
    expect(state.isNavigating).toBe(true);
    expect(state.targetSection).toBe("contact");
    expect(state.settledSection).toBeNull();
  });

  it("endNavigation unlocks and sets settled section", () => {
    useNavStore.getState().startNavigation("methods" as SectionId);
    useNavStore.getState().endNavigation();
    const state = useNavStore.getState();
    expect(state.isNavigating).toBe(false);
    expect(state.targetSection).toBeNull();
    expect(state.settledSection).toBe("methods");
  });

  it("clearSettled clears the settled section", () => {
    useNavStore.getState().startNavigation("contact" as SectionId);
    useNavStore.getState().endNavigation();
    useNavStore.getState().clearSettled();
    expect(useNavStore.getState().settledSection).toBeNull();
  });

  it("startNavigation clears previous settled", () => {
    useNavStore.getState().startNavigation("contact" as SectionId);
    useNavStore.getState().endNavigation();
    expect(useNavStore.getState().settledSection).toBe("contact");

    useNavStore.getState().startNavigation("methods" as SectionId);
    expect(useNavStore.getState().settledSection).toBeNull();
    expect(useNavStore.getState().targetSection).toBe("methods");
  });
});
