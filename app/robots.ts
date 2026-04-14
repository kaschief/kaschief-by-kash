import type { MetadataRoute } from "next";

/** Lab routes are disallowed even when NEXT_PUBLIC_ENABLE_LAB is on for previews. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/lab", "/lab-builder", "/lab-methods", "/lab-wip-5"],
      },
    ],
  };
}
