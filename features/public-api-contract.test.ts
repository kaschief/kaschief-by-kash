import { describe, expect, it } from "vitest";
import * as ContactFeature from "@features/contact";
import * as HeroFeature from "@features/hero";
import * as HomeFeature from "@features/home";
import * as MethodsFeature from "@features/methods";
import * as NavigationFeature from "@features/navigation";
import * as PhilosophyFeature from "@features/philosophy";
import * as TimelineFeature from "@features/timeline";

describe("feature public-api contracts", () => {
  it("exports stable feature entrypoints", () => {
    expect(typeof HomeFeature.HomePage).toBe("function");
    expect(typeof HomeFeature.getHomePageViewModel).toBe("function");

    expect(typeof NavigationFeature.Navigation).toBe("function");
    expect(typeof NavigationFeature.navigationReducer).toBe("function");
    expect(typeof NavigationFeature.resolveActiveSection).toBe("function");

    expect(typeof HeroFeature.Hero).toBe("function");
    expect(typeof PhilosophyFeature.Philosophy).toBe("function");
    expect(typeof MethodsFeature.Methods).toBe("function");
    expect(typeof ContactFeature.Contact).toBe("function");
    expect(typeof TimelineFeature.Timeline).toBe("function");
  });
});
