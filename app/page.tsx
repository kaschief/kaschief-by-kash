import { Suspense } from "react";
import { HomePage, HomePageFallback } from "@features/home";

export default function Page() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePage />
    </Suspense>
  );
}
