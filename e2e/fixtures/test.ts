import { test as base, expect } from "@playwright/test";
import { ActIPage } from "../pages/act-i.page";
import { ActIIPage } from "../pages/act-ii.page";
import { ActIIIPage } from "../pages/act-iii.page";
import { HomePage } from "../pages/home.page";
import { MethodsPage } from "../pages/methods.page";
import { NavigationComponent } from "../pages/navigation.component";
import { SiteContentPage } from "../pages/site-content.page";

type AppFixtures = {
  actI: ActIPage;
  actII: ActIIPage;
  actIII: ActIIIPage;
  home: HomePage;
  methods: MethodsPage;
  navigation: NavigationComponent;
  runtimeErrors: void;
  siteContent: SiteContentPage;
};

export const test = base.extend<AppFixtures>({
  runtimeErrors: [
    async ({ page }, run) => {
      const errors: string[] = [];

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      page.on("console", (message) => {
        const text = message.text();
        const isDevHmrNoise =
          text.includes("/_next/webpack-hmr") &&
          text.includes("WebSocket connection");
        const isReactDevHydrationNoise =
          text.includes("hydrated but some attributes") ||
          text.includes("getServerSnapshot should be cached");
        const isBrowserResourceNoise = text.includes(
          "Failed to load resource: the server responded with a status of 404",
        );
        if (
          message.type() === "error" &&
          !isDevHmrNoise &&
          !isReactDevHydrationNoise &&
          !isBrowserResourceNoise
        ) {
          errors.push(text);
        }
      });

      await run();

      expect(errors, "no uncaught page errors or console errors").toEqual([]);
    },
    { auto: true },
  ],

  home: async ({ page }, run) => {
    await run(new HomePage(page));
  },

  navigation: async ({ page }, run) => {
    await run(new NavigationComponent(page));
  },

  actI: async ({ page }, run) => {
    await run(new ActIPage(page));
  },

  actII: async ({ page }, run) => {
    await run(new ActIIPage(page));
  },

  actIII: async ({ page }, run) => {
    await run(new ActIIIPage(page));
  },

  methods: async ({ page }, run) => {
    await run(new MethodsPage(page));
  },

  siteContent: async ({ page }, run) => {
    await run(new SiteContentPage(page));
  },
});

export { expect };
