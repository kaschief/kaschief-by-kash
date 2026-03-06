import { describe, expect, it } from "vitest";
import { getHomePageViewModel, type HomePageViewModel } from "./get-home-page-view-model";

describe("getHomePageViewModel", () => {
  it("returns a complete view model with correct types", async () => {
    const vm: HomePageViewModel = await getHomePageViewModel();

    expect(typeof vm.enableCustomCursor).toBe("boolean");
    expect(typeof vm.timelineLoadingLabel).toBe("string");
    expect(vm.timelineLoadingLabel.length).toBeGreaterThan(0);
  });

  it("enables custom cursor by default", async () => {
    const vm = await getHomePageViewModel();
    expect(vm.enableCustomCursor).toBe(true);
  });
});
