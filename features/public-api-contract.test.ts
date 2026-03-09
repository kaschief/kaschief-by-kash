import { describe, expect, it } from "vitest";
import * as ContactFeature from "@features/contact";
import * as HeroFeature from "@features/hero";
import * as HomeFeature from "@features/home";
import * as MethodsFeature from "@features/methods";
import * as NavigationFeature from "@features/navigation";
import * as PhilosophyFeature from "@features/philosophy";
import * as PortraitFeature from "@features/portrait";
import * as TimelineFeature from "@features/timeline";

describe("feature public-api contracts", () => {
  it("exports exactly the expected home feature surface", () => {
    const keys = Object.keys(HomeFeature).sort();
    expect(keys).toEqual(["HomePage", "HomePageFallback", "getHomePageViewModel"]);
  });

  it("exports exactly the expected navigation feature surface", () => {
    const keys = Object.keys(NavigationFeature).sort();
    expect(keys).toEqual([
      "ACTIVE_SECTION_CONFIG",
      "INITIAL_NAVIGATION_STATE",
      "NAVIGATION_TIMING",
      "Navigation",
      "isSectionId",
      "navigationReducer",
      "resolveActiveSection",
    ]);
  });

  it("exports a single component from each section feature", () => {
    expect(Object.keys(HeroFeature)).toEqual(["Hero"]);
    expect(Object.keys(PhilosophyFeature)).toEqual(["Philosophy"]);
    expect(Object.keys(PortraitFeature)).toEqual(["Portrait"]);
    expect(Object.keys(MethodsFeature)).toEqual(["Methods"]);
    expect(Object.keys(ContactFeature)).toEqual(["Contact"]);
    expect(Object.keys(TimelineFeature).sort()).toEqual([
      "ActI",
      "ActII",
      "ActIII",
      "ActIIILeader",
      "ActIV",
      "Timeline",
      "TradingArsenal",
      "TradingSystem",
    ]);
  });
});
