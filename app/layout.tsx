import "./globals.css";
import {
  Crimson_Pro,
  Inter,
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

const fontVariables = [
  inter.variable,
  playfair.variable,
  urbanist.variable,
  crimsonPro.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Kaschief Johnson | Portfolio",
  description:
    "Four careers. One adaptable mind. Portfolio of Kaschief Johnson — critical care nurse, software engineer, engineering manager, and independent product builder.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="font-sans antialiased">
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
