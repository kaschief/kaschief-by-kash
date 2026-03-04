import { HomePageClient } from "./ui/home-page.client";
import { getHomePageViewModel } from "./model/get-home-page-view-model";

/**
 * Server entry for the home route.
 *
 * This keeps server concerns (data assembly / future integrations)
 * out of client bundles while letting the client shell focus on interaction.
 */
export async function HomePage() {
  const viewModel = await getHomePageViewModel();
  return <HomePageClient viewModel={viewModel} />;
}
