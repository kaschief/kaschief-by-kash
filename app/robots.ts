import type { MetadataRoute } from "next";

/**
 * `/robots.txt` generator.
 *
 * Next.js App Router auto-serves this as `/robots.txt` at build time.
 *
 * Lab routes are disallowed unconditionally — they're gated in
 * production via `NEXT_PUBLIC_ENABLE_LAB` and `notFound()` in
 * `app/(lab)/layout.tsx`, but this is the belt-and-braces crawler
 * hint: even on the preview deployment where the flag is ON and
 * the pages are reachable, search engines still should not index
 * them. Lab content is scratch / experimental and never meant to
 * rank.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/lab",
          "/lab-builder",
          "/lab-methods",
          "/lab-wip-5",
        ],
      },
    ],
  };
}
