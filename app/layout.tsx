import "./globals.css";
import {
  Alegreya,
  Archivo,
  Bodoni_Moda,
  Bricolage_Grotesque,
  Cardo,
  Chivo_Mono,
  Cormorant_Garamond,
  Crimson_Pro,
  DM_Mono,
  EB_Garamond,
  Fira_Code,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inconsolata,
  Inter,
  JetBrains_Mono,
  Libre_Baskerville,
  Literata,
  Manrope,
  Merriweather,
  Newsreader,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Prata,
  Public_Sans,
  Roboto_Mono,
  Sora,
  Source_Code_Pro,
  Space_Grotesk,
  Space_Mono,
  Spectral,
  Syne,
  Urbanist,
  Work_Sans,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FontPackSwitcher } from "@components";
import { Z_INDEX } from "@utilities";
import type { Metadata, Viewport } from "next";
const { scrollFade } = Z_INDEX;

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

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  weight: ["400", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  weight: ["400", "500"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
  weight: ["400", "700"],
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  weight: ["400", "500"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  display: "swap",
  weight: ["400", "500", "600"],
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

const cardo = Cardo({
  subsets: ["latin"],
  variable: "--font-cardo",
  display: "swap",
  weight: ["400", "700"],
});

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  variable: "--font-chivo-mono",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
  weight: ["400", "700"],
});

const prata = Prata({
  subsets: ["latin"],
  variable: "--font-prata",
  display: "swap",
  weight: "400",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const fontVariables = [
  inter.variable,
  playfair.variable,
  jetBrainsMono.variable,
  manrope.variable,
  fraunces.variable,
  spaceMono.variable,
  plusJakartaSans.variable,
  cormorantGaramond.variable,
  ibmPlexMono.variable,
  workSans.variable,
  newsreader.variable,
  robotoMono.variable,
  publicSans.variable,
  libreBaskerville.variable,
  inconsolata.variable,
  sora.variable,
  bodoniModa.variable,
  dmMono.variable,
  archivo.variable,
  crimsonPro.variable,
  ebGaramond.variable,
  firaCode.variable,
  literata.variable,
  sourceCodePro.variable,
  spaceGrotesk.variable,
  spectral.variable,
  urbanist.variable,
  alegreya.variable,
  bricolageGrotesque.variable,
  cardo.variable,
  chivoMono.variable,
  ibmPlexSans.variable,
  merriweather.variable,
  prata.variable,
  syne.variable,
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
        <FontPackSwitcher />
        <Analytics />
      </body>
    </html>
  );
}
