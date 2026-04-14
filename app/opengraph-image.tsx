import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image for social share cards.
 *
 * Generated at build time via Next.js ImageResponse (powered by
 * Satori). Reused automatically by the Twitter card because
 * `twitter.images` is not explicitly set in `metadata`, so Next
 * falls back to the openGraph image for both surfaces.
 *
 * Layout: portrait photo on the left, typography block on the
 * right. The right edge of the photo gradient-fades into the site
 * background so the composition feels like a single frame rather
 * than two panels.
 *
 * Runtime is `nodejs` (not edge) so we can `readFileSync` the
 * portrait from `public/images/kaschief.jpg`. Edge runtime would
 * require fetching the image over the network at build time, which
 * is circular before the first deploy exists.
 *
 * Satori / ImageResponse constraints:
 * - Every element must use `display: "flex"` or `display: "none"`.
 *   No `display: "block"`.
 * - No Tailwind class names — inline styles only.
 * - Web fonts must be TTF / OTF / WOFF (not WOFF2). Google Fonts
 *   returns WOFF when we pass `?text=<subset>`, which Satori
 *   accepts natively — no User-Agent spoofing needed.
 * - Use plain `<img>` (not `next/image`) — Satori does not support
 *   the `next/image` component.
 * - Limited `filter` support (no `saturate`, `contrast`, etc.).
 * - Use `<div>` for role text instead of `<span>` — Satori's flex
 *   layout is more reliable with block-level children.
 */
export const runtime = "nodejs";

export const alt =
  "Kaschief Johnson — Portfolio. Nurse, Engineer, Leader.";

export const size = {
  width: 1200,
  height: 630,
} as const;

export const contentType = "image/png";

/* ── Brand tokens (duplicated here because Satori has no CSS variable support) ── */
const BG = "#07070A";
const CREAM = "#F0E6D0";
const TEXT_DIM = "#8A8478";
const ACT_RED = "#E05252";
const ACT_BLUE = "#5B9EC2";
const ACT_GOLD = "#C9A84C";

/* ── Layout constants ── */
const PORTRAIT_WIDTH_PX = 500;
const FADE_OVERLAP_PX = 140;

/**
 * Fetch a Google Font as an ArrayBuffer ready to pass to
 * ImageResponse's `fonts` option.
 *
 * Google Fonts serves WOFF when we pass `?text=<subset>`, which is
 * exactly the format Satori accepts. The `text` param narrows the
 * subset to only the characters we actually render, so each font is
 * a few KB instead of a few hundred.
 */
async function loadGoogleFont({
  family,
  weight,
  italic = false,
  text,
}: {
  family: string;
  weight: number;
  italic?: boolean;
  text: string;
}): Promise<ArrayBuffer> {
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const familyParam = `${family}:${axis}`;
  const params = new URLSearchParams({
    family: familyParam,
    text,
  });
  const cssUrl = `https://fonts.googleapis.com/css2?${params.toString()}`;

  const cssResponse = await fetch(cssUrl);
  if (!cssResponse.ok) {
    throw new Error(
      `Failed to fetch Google Fonts CSS for ${family}: ${cssResponse.status}`,
    );
  }
  const css = await cssResponse.text();
  // Accept TTF, OTF, and WOFF — all three are valid for Satori.
  const match = css.match(
    /src: url\((.+?)\) format\('(truetype|opentype|woff)'\)/,
  );
  if (!match) {
    throw new Error(
      `No TTF/OTF/WOFF source in Google Fonts CSS for ${family}. Got:\n${css}`,
    );
  }
  const fontResponse = await fetch(match[1]);
  if (!fontResponse.ok) {
    throw new Error(
      `Failed to fetch font binary for ${family}: ${fontResponse.status}`,
    );
  }
  return fontResponse.arrayBuffer();
}

/* ── Text content (declared once so font-subsetting can target it) ──
 *
 * All display text is pre-uppercased here rather than via CSS
 * `textTransform: "uppercase"`, which Satori does not reliably
 * apply to the font subset it downloads.
 */
const EYEBROW_TEXT = "PORTFOLIO";
const NAME_FIRST = "Kaschief";
const NAME_LAST = "Johnson";
const ROLE_NURSE = "NURSE";
const ROLE_ENGINEER = "ENGINEER";
const ROLE_LEADER = "LEADER";
const ROLE_SEPARATOR = "·";

export default async function OpengraphImage() {
  // Read the pre-downsized 800px portrait (~150 KB) — NOT the full
  // 1.8 MB source at kaschief.jpg. Satori embeds the image as a base64
  // data URL, and the full-size source trips internal size limits
  // and/or OOMs. If you replace the portrait, re-run:
  //   sips -Z 800 public/images/kaschief.jpg --out public/images/kaschief-og.jpg
  const imageBuffer = readFileSync(
    path.join(process.cwd(), "public", "images", "kaschief-og.jpg"),
  );
  const portraitDataUri = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

  // Fonts fetched in parallel. Each subset is constrained to the
  // exact glyphs it renders, so the total font payload is ~10 KB.
  const interSubsetText = `${EYEBROW_TEXT}${ROLE_NURSE}${ROLE_ENGINEER}${ROLE_LEADER}${ROLE_SEPARATOR}`;
  const [playfairDisplay, inter] = await Promise.all([
    loadGoogleFont({
      family: "Playfair Display",
      weight: 500,
      text: `${NAME_FIRST}${NAME_LAST}`,
    }),
    loadGoogleFont({
      family: "Inter",
      weight: 500,
      text: interSubsetText,
    }),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: BG,
          fontFamily: "Playfair Display",
        }}
      >
        {/* ── Left: portrait photo with right-edge gradient fade ── */}
        <div
          style={{
            display: "flex",
            width: PORTRAIT_WIDTH_PX,
            height: "100%",
            position: "relative",
          }}
        >
          <img
            src={portraitDataUri}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: FADE_OVERLAP_PX,
              background: `linear-gradient(to right, rgba(7, 7, 10, 0) 0%, ${BG} 100%)`,
            }}
          />
        </div>

        {/* ── Right: typography ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "70px 80px",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 6,
              color: ACT_GOLD,
              fontFamily: "Inter",
              fontWeight: 500,
              marginBottom: 36,
            }}
          >
            {EYEBROW_TEXT}
          </div>

          {/* Name (two lines for visual weight, in Playfair Display) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: CREAM,
              letterSpacing: -3,
              lineHeight: 0.92,
              marginBottom: 56,
              fontFamily: "Playfair Display",
            }}
          >
            <div style={{ fontSize: 96 }}>{NAME_FIRST}</div>
            <div style={{ fontSize: 96 }}>{NAME_LAST}</div>
          </div>

          {/* Role row — pre-uppercased Inter, with colored role names.
              Uses <div> children instead of <span> because Satori's
              flex layout engine lays out divs more reliably than spans. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 20,
              fontFamily: "Inter",
              fontWeight: 500,
              letterSpacing: 3,
            }}
          >
            <div style={{ display: "flex", color: ACT_RED }}>{ROLE_NURSE}</div>
            <div style={{ display: "flex", color: TEXT_DIM }}>{ROLE_SEPARATOR}</div>
            <div style={{ display: "flex", color: ACT_BLUE }}>{ROLE_ENGINEER}</div>
            <div style={{ display: "flex", color: TEXT_DIM }}>{ROLE_SEPARATOR}</div>
            <div style={{ display: "flex", color: ACT_GOLD }}>{ROLE_LEADER}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairDisplay,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: inter,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
