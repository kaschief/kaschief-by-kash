"use client";

/**
 * Shared skeuomorphic artifact card components.
 * Used by lab-artifacts (gallery view) and curtain-thesis (scroll choreography).
 */

const INK = "#1A1917";
const INK_2 = "#3D3B37";
const INK_3 = "#6E6B65";
const INK_4 = "#9C9890";
const BORDER = "#E2DED6";

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const SYSTEM =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/* ── Shell ── */

export function ArtifactShell({
  children,
  bg = "#FFFFFF",
  border = BORDER,
  dark = false,
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  border?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: dark
          ? [
              "0 2px 4px rgba(0,0,0,0.4)",
              "0 12px 32px rgba(0,0,0,0.35)",
              "0 28px 56px rgba(0,0,0,0.2)",
            ].join(", ")
          : [
              "0 1px 2px rgba(26,25,23,0.08)",
              "0 4px 12px rgba(26,25,23,0.06)",
              "0 12px 32px rgba(26,25,23,0.08)",
              "0 28px 56px rgba(26,25,23,0.05)",
            ].join(", "),
        position: "relative",
        overflow: "hidden",
        ...style,
      }}>
      {children}
    </div>
  );
}

/* ── Jira Card ── */

export function JiraCard({ style }: { style?: React.CSSProperties }) {
  return (
    <ArtifactShell style={style}>
      <div style={{ height: 3, background: "#1868DB" }} />
      <div style={{ padding: "14px 18px 16px", fontFamily: SYSTEM }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 12,
            color: INK_3,
          }}>
          <svg width="16" height="16" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="jb" x1="98%" y1="9%" x2="58%" y2="60%">
                <stop offset="18%" stopColor="#0052CC" />
                <stop offset="100%" stopColor="#2684FF" />
              </linearGradient>
            </defs>
            <path
              d="M27.5 15.1L16.9 4.5 16 3.6 5.5 14.1c-.6.6-.6 1.6 0 2.2L12.2 23 16 19.2l4.8 4.8 6.7-6.7c.6-.6.6-1.6 0-2.2z"
              fill="#2684FF"
            />
            <path
              d="M16 12.1c-2.1-2.1-2.1-5.4-.1-7.5L5.5 15.1c-.6.6-.6 1.6 0 2.2L12.2 24l3.8-3.8-4-4z"
              fill="url(#jb)"
              opacity="0.65"
            />
          </svg>
          <span style={{ color: "#1868DB", fontWeight: 600 }}>AMBOSS</span>
          <span style={{ color: INK_4 }}>/</span>
          <span>Medical Content</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: "#E2483D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 2,
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <circle cx="6" cy="6" r="4" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="6" cy="6" r="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, lineHeight: 1.4, fontWeight: 500, color: INK, marginBottom: 4 }}>
              Images on cardiology article not displaying on mobile
            </div>
            <div style={{ fontSize: 12, color: "#1868DB", fontWeight: 500 }}>MED-2847</div>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: INK_2,
            marginBottom: 14,
            padding: "10px 12px",
            background: "#F8F7F5",
            borderRadius: 6,
            border: "1px solid #EDEAE4",
          }}>
          The images on the cardiology article are not showing up on my phone. Tested on iPhone 11,
          Safari. Other articles seem fine.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "#AE5A00",
              background: "#FFF4E5",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid #FFDDB5",
              fontWeight: 500,
            }}>
            <svg width="10" height="10" viewBox="0 0 16 16">
              <path d="M8 2l6 12H2z" fill="#E87800" />
            </svg>
            Medium
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#216E4E",
              background: "#DCFFF1",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid #BAF3DB",
            }}>
            Open
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: INK_3 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "linear-gradient(135deg, #FF8B7A, #FF5630)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}>
              S
            </div>
            <span style={{ fontWeight: 600, color: INK_2 }}>Sarah K.</span>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ── Sentry Card ── */

export function SentryCard({ style }: { style?: React.CSSProperties }) {
  return (
    <ArtifactShell bg="#140C1F" border="#2A1D3A" dark style={style}>
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg, #6C5FC7 0%, #E1567C 50%, #F5B234 100%)",
        }}
      />
      <div style={{ padding: "16px 18px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 72 66" fill="#E1567C">
              <path d="M29 2.26a3.68 3.68 0 00-6.38 0L1.22 40.8a3.71 3.71 0 001.6 5 3.67 3.67 0 001.58.36h8.73a.47.47 0 00.43-.25 20.32 20.32 0 00-2.14-21.43A3.68 3.68 0 0114.6 20h16.18L22.4 6.47 8.53 30.34a.47.47 0 00.06.53 16.43 16.43 0 011.72 17.38H5.39L22.44 7.56z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0F0", fontFamily: SYSTEM }}>
              Compado
            </span>
            <span style={{ fontSize: 12, color: "#6B5A80" }}>/</span>
            <span style={{ fontSize: 12, color: "#8B7BA0", fontFamily: SYSTEM }}>
              meal-kit-recommendation
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontFamily: MONO,
              color: "#FCA5A5",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              padding: "4px 10px",
              borderRadius: 6,
            }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#EF4444",
                boxShadow: "0 0 8px rgba(239,68,68,0.6)",
              }}
            />
            312 events
          </div>
        </div>

        <div
          style={{
            fontSize: 16,
            lineHeight: 1.4,
            color: "#F9FAFB",
            fontFamily: MONO,
            marginBottom: 6,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}>
          TypeError<span style={{ color: "#6B5A80" }}>:</span>{" "}
          <span style={{ color: "#E8B4B8" }}>Cannot read property &apos;href&apos; of null</span>
        </div>

        <div
          style={{
            fontSize: 11,
            fontFamily: MONO,
            color: "#6B5A80",
            marginBottom: 16,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.04)",
            lineHeight: 1.7,
          }}>
          <div>
            <span style={{ color: "#A78BFA" }}>click-handler.js</span>
            <span style={{ color: "#4B3D60" }}>:</span>
            <span style={{ color: "#F5B234" }}>47</span>
          </div>
          <div style={{ color: "#4B3D60" }}>
            {">"} const url = event.target.parentNode
            <span style={{ color: "#E1567C" }}>.href</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span
            style={{
              fontSize: 10,
              color: "#D8B4FE",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.15)",
              padding: "3px 8px",
              borderRadius: 4,
              fontFamily: MONO,
            }}>
            safari 14.1.2
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#8B7BA0",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "3px 8px",
              borderRadius: 4,
              fontFamily: MONO,
            }}>
            iOS 14.8
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "#4B3D60", fontFamily: MONO }}>First seen 3d ago</span>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ── Slack Message ── */

export function SlackCard({ style }: { style?: React.CSSProperties }) {
  return (
    <ArtifactShell border="#E8E5DF" style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "#3F0E40",
          color: "#E8D5E1",
          fontSize: 12,
          fontWeight: 600,
          fontFamily: SYSTEM,
        }}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="#E8D5E1">
          <path
            d="M4.5 10h11M4.5 6h11M8 3v14M12 3v14"
            stroke="#E8D5E1"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span>#frontend-dkb</span>
      </div>

      <div style={{ padding: "12px 16px 14px", fontFamily: SYSTEM }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "#2B5A3F",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
              fontFamily: SYSTEM,
            }}>
            T
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: INK }}>Thomas M.</span>
              <span style={{ fontSize: 11, color: INK_4, fontWeight: 400 }}>10:17 AM</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.58, color: INK, fontWeight: 400 }}>
              Kash, the transfer page shows the amount but not the recipient. That is going to scare
              people.
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[
                { icon: "\uD83D\uDC40", count: 3 },
                { icon: "\u26A0\uFE0F", count: 1 },
              ].map((e) => (
                <span
                  key={e.icon}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#EEF0F8",
                    border: "1px solid #D0D5E4",
                    color: INK_2,
                    fontWeight: 500,
                  }}>
                  {e.icon} <span style={{ fontSize: 11 }}>{e.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}
