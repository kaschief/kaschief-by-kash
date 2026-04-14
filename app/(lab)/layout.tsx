/**
 * Lab route group layout — loads experimental fonts on top of the
 * 4 production fonts from the root layout. These are only downloaded
 * when visiting /lab-*, /legacy-engineer, or /act-ii routes.
 *
 * Production gate
 * ---------------
 * Every route under `app/(lab)/` is hard-gated behind
 * `NEXT_PUBLIC_ENABLE_LAB`. When the flag is unset (production
 * builds on main), the layout calls `notFound()` before any child
 * renders, so `/lab`, `/lab-builder`, `/lab-methods`, `/lab-wip-5`,
 * and any future lab route all return the site's canonical 404 page.
 *
 * The flag should be:
 * - `true` in local dev (set via .env.local, see .env.example)
 * - `true` on Vercel Preview deploys (set via Project Settings
 *   → Environment Variables, scoped to Preview + Development only)
 * - UNSET on Vercel Production (main branch) — do not add it at all
 *
 * Layer 1 (UI entry points in nav + hero) and layer 3 (robots.ts
 * disallow rules) are gated separately. This layout is layer 2 —
 * the hard route gate. See app/robots.ts and the
 * `NEXT_PUBLIC_ENABLE_LAB` references in features/navigation and
 * features/hero for the other two layers.
 */

import { notFound } from "next/navigation";
import {
  Alegreya,
  Archivo,
  Bodoni_Moda,
  Bricolage_Grotesque,
  Cardo,
  Chivo_Mono,
  Cormorant_Garamond,
  DM_Mono,
  EB_Garamond,
  Fira_Code,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inconsolata,
  JetBrains_Mono,
  Libre_Baskerville,
  Literata,
  Lora,
  Manrope,
  Merriweather,
  Newsreader,
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
  Work_Sans,
} from "next/font/google";

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
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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

const labFontVariables = [
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
  ebGaramond.variable,
  firaCode.variable,
  lora.variable,
  literata.variable,
  sourceCodePro.variable,
  spaceGrotesk.variable,
  spectral.variable,
  alegreya.variable,
  bricolageGrotesque.variable,
  cardo.variable,
  chivoMono.variable,
  ibmPlexSans.variable,
  merriweather.variable,
  prata.variable,
  syne.variable,
].join(" ");

export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_LAB !== "true") {
    notFound();
  }
  return <div className={labFontVariables}>{children}</div>;
}
