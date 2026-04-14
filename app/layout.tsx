import "./globals.css";
import {
  Crimson_Pro,
  Inter,
  Kaisei_Decol,
  Playfair_Display,
  Urbanist,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Z_INDEX } from "@utilities";
import type { Metadata, Viewport } from "next";
const { scrollFade } = Z_INDEX;

/* ── Production fonts (4 total) ── */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600"],
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

const kaiseiDecol = Kaisei_Decol({
  subsets: ["latin"],
  variable: "--font-kaisei-decol",
  display: "swap",
  weight: ["400"],
});

const fontVariables = [
  inter.variable,
  playfair.variable,
  urbanist.variable,
  crimsonPro.variable,
  kaiseiDecol.variable,
].join(" ");

const SITE_URL = "https://kaschief.com";
const SITE_TITLE = "Kaschief Johnson | Portfolio";
const SITE_DESCRIPTION =
  "Portfolio of Kaschief Johnson — critical care nurse, software engineer, and engineering manager.";

export const metadata: Metadata = {
  // metadataBase makes every relative URL in openGraph / twitter /
  // icons / alternates resolve to an absolute URL. Social platforms
  // reject relative image paths, so this is required for share cards
  // to render at all.
  metadataBase: new URL(SITE_URL),

  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // Favicon served statically from `public/kj-monogram.svg`. Do NOT
  // move this file under `app/` as an `icon.svg` convention — Next 16
  // Turbopack caches the result of the icon route handler in a way
  // that survives `.next` nukes in some environments.
  //
  // IMPORTANT for anyone editing the SVG: keep it free of XML comments
  // that contain the literal sequence `- -` (double hyphen). The XML
  // spec forbids `- -` inside comments, and a malformed SVG silently
  // fails in favicon contexts (the tab renders as empty). An earlier
  // version of this file had a comment mentioning `var(- -bg)` which
  // broke the entire favicon pipeline without any visible error.
  icons: {
    icon: [{ url: "/kj-monogram.svg", type: "image/svg+xml" }],
  },

  // openGraph images come from the `app/opengraph-image.tsx` file
  // convention automatically — Next.js picks it up and injects it
  // into metadata at build time. Do not duplicate the entry here.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Kaschief Johnson",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },

  // Twitter card mirrors openGraph. When `twitter.images` is not set,
  // Next.js and most clients fall back to the openGraph image, so the
  // `app/opengraph-image.tsx` file is reused for Twitter automatically.
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },

  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} style={{ colorScheme: "dark", backgroundColor: "#07070A" }}>
      <head>
        {/* When a URL hash is present, hide content before first paint
            and disable scroll restoration. visibility:hidden keeps the
            dark background painted (no white canvas leak). The navigation
            barrier system reveals after scrolling to the correct position. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.hash){document.documentElement.style.visibility="hidden";history.scrollRestoration="manual"}`,
          }}
        />
      </head>
      <body className="font-sans antialiased" style={{ backgroundColor: "#07070A", color: "#F0E6D0" }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded focus:bg-[var(--gold)] focus:px-4 focus:py-2 focus:font-ui focus:text-xs focus:font-semibold focus:uppercase focus:tracking-wider focus:text-[var(--bg)]">
          Skip to content
        </a>
        {/*
          Scroll-exit fade — fixed gradient at the top of the viewport.
          As content scrolls up and exits, it dissolves into the background.
          z-index 40: below nav (100) and modals (800+), above page content.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "var(--scroll-fade-height)",
            background:
              "linear-gradient(to bottom, var(--bg) 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: scrollFade,
          }}
        />
        <main id="main-content">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
