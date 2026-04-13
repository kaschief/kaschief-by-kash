import { HomePageClient } from "./ui/home-page.client";
import { getHomePageViewModel } from "./model/get-home-page-view-model";

/**
 * Server entry for the home route.
 *
 * This keeps server concerns (data assembly / future integrations)
 * out of client bundles while letting the client shell focus on interaction.
 *
 * Synchronous to avoid triggering the Suspense fallback on hard refresh.
 */
export function HomePage() {
  const viewModel = getHomePageViewModel();
  return <HomePageClient viewModel={viewModel} />;
}
