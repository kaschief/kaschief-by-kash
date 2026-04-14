import type { MetadataRoute } from "next";

/**
 * `/sitemap.xml` generator.
 *
 * Next.js App Router auto-serves this at `/sitemap.xml` at build time.
 * The portfolio is effectively a single page with in-page anchors for
 * each act, so the sitemap just lists the canonical root. In-page
 * anchors (`#portrait`, `#nurse`, `#engineer`, `#leader`, `#contact`)
 * are not separate URLs and should NOT be included here — crawlers
 * discover them via the HTML, not the sitemap.
 *
 * Lab routes are deliberately omitted because they're disallowed in
 * `app/robots.ts` and gated behind `NEXT_PUBLIC_ENABLE_LAB` in
 * `app/(lab)/layout.tsx`. Including them here would contradict the
 * robots rules and confuse crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kaschief.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
