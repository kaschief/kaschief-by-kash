import { describe, expect, it } from "vitest";
import { getHomePageViewModel } from "./get-home-page-view-model";

describe("getHomePageViewModel", () => {
  it("returns the default home view model contract", async () => {
    const viewModel = await getHomePageViewModel();

    expect(viewModel.enableCustomCursor).toBe(true);
    expect(viewModel.timelineLoadingLabel).toBe("Loading timeline section...");
  });
});
