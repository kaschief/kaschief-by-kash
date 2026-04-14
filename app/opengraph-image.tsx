import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Satori footguns (do not re-learn):
 * - every element needs `display: "flex"` or `"none"`
 * - WOFF/TTF/OTF only (no WOFF2)
 * - no `filter`, no `textTransform`, no `<span>` in flex rows
 * - no `next/image` — plain `<img>` only
 * - base64 image payload has a size ceiling; keep source <200 KB
 */
export const runtime = "nodejs";

export const alt =
  "Kaschief Johnson — Portfolio. Nurse, Engineer, Leader.";

export const size = {
  width: 1200,
  height: 630,
} as const;

export const contentType = "image/png";

/* Satori has no CSS variable support — brand tokens must be literal. */
const BG = "#07070A";
const CREAM = "#F0E6D0";
const TEXT_DIM = "#8A8478";
const ACT_RED = "#E05252";
const ACT_BLUE = "#5B9EC2";
const ACT_GOLD = "#C9A84C";

const PORTRAIT_WIDTH_PX = 500;
const FADE_OVERLAP_PX = 140;

/** Google Fonts with `?text=<subset>` returns WOFF, which Satori accepts. */
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

/* Pre-uppercased: Satori does not reliably apply `textTransform` to subset fonts. */
const EYEBROW_TEXT = "PORTFOLIO";
const NAME_FIRST = "Kaschief";
const NAME_LAST = "Johnson";
const ROLE_NURSE = "NURSE";
const ROLE_ENGINEER = "ENGINEER";
const ROLE_LEADER = "LEADER";
const ROLE_SEPARATOR = "·";

export default async function OpengraphImage() {
  // Downsized portrait (~150 KB). Full-size kaschief.jpg (1.8 MB) crashes Satori.
  // Regenerate with: sips -Z 800 public/images/kaschief.jpg --out public/images/kaschief-og.jpg
  const imageBuffer = readFileSync(
    path.join(process.cwd(), "public", "images", "kaschief-og.jpg"),
  );
  const portraitDataUri = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "70px 80px",
          }}
        >
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
