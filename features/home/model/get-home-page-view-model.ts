export interface HomePageViewModel {
  enableCustomCursor: boolean;
  timelineLoadingLabel: string;
}

const DEFAULT_HOME_PAGE_VIEW_MODEL = {
  enableCustomCursor: true,
  timelineLoadingLabel: "Loading timeline section...",
} as const satisfies HomePageViewModel;

/**
 * Server-side view-model factory for the home route.
 *
 * Why keep this on the server even for static data:
 * - Preserves a clean seam for future data sources (CMS, feature flags, A/B).
 * - Keeps client components focused on rendering and interaction only.
 *
 * Synchronous to avoid triggering Suspense boundaries on static data,
 * which causes a visible flash on hard refresh. Make this async again
 * only when a real data source is added.
 */
export function getHomePageViewModel(): HomePageViewModel {
  return DEFAULT_HOME_PAGE_VIEW_MODEL;
}
