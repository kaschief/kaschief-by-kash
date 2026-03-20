"use client";

import { LabNav } from "../lab-nav";

/* ── Palette ── */

const INK = "#1A1917";
const INK_2 = "#3D3B37";
const INK_3 = "#6E6B65";
const INK_4 = "#9C9890";
const BORDER = "#E2DED6";

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const SYSTEM =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/* ── Pillar label ── */

function CompanyPillar({
  company,
  pillar,
}: {
  company: string;
  pillar: string;
}) {
  return (
    <div
      className="font-ui"
      style={{
        fontSize: 9,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: INK_4,
        marginBottom: 16,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
      <span style={{ color: INK_3 }}>{company}</span>
      <span
        style={{
          width: 16,
          height: 1,
          background: BORDER,
          display: "inline-block",
        }}
      />
      <span>{pillar}</span>
    </div>
  );
}

/* ── Artifact shell ── */

function ArtifactShell({
  children,
  bg = "#FFFFFF",
  border = BORDER,
  rotation = 0,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  border?: string;
  rotation?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: dark
          ? [
              "0 1px 3px rgba(0,0,0,0.3)",
              "0 8px 24px rgba(0,0,0,0.25)",
              "0 20px 48px rgba(0,0,0,0.15)",
            ].join(", ")
          : [
              "0 1px 2px rgba(26,25,23,0.06)",
              "0 3px 8px rgba(26,25,23,0.04)",
              "0 8px 24px rgba(26,25,23,0.06)",
              "0 24px 48px rgba(26,25,23,0.04)",
            ].join(", "),
        transform: `rotate(${rotation}deg)`,
        position: "relative",
        overflow: "hidden",
      }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   1. JIRA CARD — Atlassian cloud UI, 2024+ design
   ══════════════════════════════════════════════════════════ */

function JiraCard() {
  return (
    <ArtifactShell rotation={-0.6}>
      {/* Atlassian blue top accent */}
      <div style={{ height: 3, background: "#1868DB" }} />
      <div style={{ padding: "14px 18px 16px", fontFamily: SYSTEM }}>
        {/* Breadcrumb row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 12,
            color: INK_3,
          }}>
          {/* Jira mark */}
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

        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 10,
          }}>
          {/* Bug icon */}
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
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.4,
                fontWeight: 500,
                color: INK,
                marginBottom: 4,
              }}>
              Images on cardiology article not displaying on mobile
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#1868DB",
                fontWeight: 500,
              }}>
              MED-2847
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: INK_2,
            marginBottom: 18,
            padding: "10px 12px",
            background: "#F8F7F5",
            borderRadius: 6,
            border: "1px solid #EDEAE4",
          }}>
          The images on the cardiology article are not showing up on my phone. Tested on iPhone 11,
          Safari. Other articles seem fine.
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}>
          {/* Priority */}
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
          {/* Status */}
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
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Assignee */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: INK_3,
            }}>
            <span>Reporter</span>
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

/* ══════════════════════════════════════════════════════════
   2. SENTRY CARD — dark Sentry issue detail
   ══════════════════════════════════════════════════════════ */

function SentryCard() {
  return (
    <ArtifactShell bg="#140C1F" border="#2A1D3A" rotation={0.4} dark>
      {/* Sentry signature gradient */}
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg, #6C5FC7 0%, #E1567C 50%, #F5B234 100%)",
        }}
      />
      <div style={{ padding: "16px 18px 18px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
            {/* Sentry mark */}
            <svg width="18" height="18" viewBox="0 0 72 66" fill="#E1567C">
              <path d="M29 2.26a3.68 3.68 0 00-6.38 0L1.22 40.8a3.71 3.71 0 001.6 5 3.67 3.67 0 001.58.36h8.73a.47.47 0 00.43-.25 20.32 20.32 0 00-2.14-21.43A3.68 3.68 0 0114.6 20h16.18L22.4 6.47 8.53 30.34a.47.47 0 00.06.53 16.43 16.43 0 011.72 17.38H5.39L22.44 7.56z" />
            </svg>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#E8E0F0",
                fontFamily: SYSTEM,
              }}>
              Compado
            </span>
            <span style={{ fontSize: 12, color: "#6B5A80" }}>/</span>
            <span
              style={{
                fontSize: 12,
                color: "#8B7BA0",
                fontFamily: SYSTEM,
              }}>
              meal-kit-recommendation
            </span>
          </div>
          {/* Event count */}
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
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            312 events
          </div>
        </div>

        {/* Error title */}
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
          TypeError
          <span style={{ color: "#6B5A80" }}>:</span>{" "}
          <span style={{ color: "#E8B4B8" }}>
            Cannot read property &apos;href&apos; of null
          </span>
        </div>

        {/* Stack trace preview */}
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
            {" "}
            {">"} const url = event.target.parentNode
            <span style={{ color: "#E1567C" }}>.href</span>
          </div>
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}>
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
            iPhone
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "#4B3D60", fontFamily: MONO }}>
            First seen 3d ago
          </span>
        </div>
      </div>

      {/* CSS pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   3. SLACK MESSAGE — authentic Slack chrome
   ══════════════════════════════════════════════════════════ */

function SlackMessage({
  sender,
  avatar,
  avatarBg,
  timestamp,
  text,
  channel,
  direct,
  emoji,
}: {
  sender: string;
  avatar: string;
  avatarBg?: string;
  timestamp: string;
  text: string;
  channel?: string;
  direct?: boolean;
  emoji?: { icon: string; count: number }[];
}) {
  return (
    <ArtifactShell rotation={-0.3} border="#E8E5DF">
      {/* Slack workspace header */}
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
        {/* Slack hash/lock icon */}
        {channel ? (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="#E8D5E1">
            <path d="M4.5 10h11M4.5 6h11M8 3v14M12 3v14" stroke="#E8D5E1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="8" width="14" height="9" rx="2" stroke="#E8D5E1" strokeWidth="1.6" />
            <path d="M6 8V5a4 4 0 018 0v3" stroke="#E8D5E1" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
        <span>{channel || "Direct Message"}</span>
      </div>

      <div style={{ padding: "12px 16px 14px", fontFamily: SYSTEM }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: avatarBg || (direct ? "#5B5FC7" : "#2B5A3F"),
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
              fontFamily: SYSTEM,
            }}>
            {avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + timestamp */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 3,
              }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: INK,
                }}>
                {sender}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: INK_4,
                  fontWeight: 400,
                }}>
                {timestamp}
              </span>
            </div>
            {/* Message text */}
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.58,
                color: INK,
                fontWeight: 400,
              }}>
              {text}
            </div>
            {/* Reactions */}
            {emoji && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 8,
                }}>
                {emoji.map((e) => (
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
            )}
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   4. FIGMA COMMENT — Figma inspector pane
   ══════════════════════════════════════════════════════════ */

function FigmaComment({
  author,
  avatar,
  page,
  comment,
  devMode,
}: {
  author: string;
  avatar: string;
  page: string;
  comment: string;
  devMode?: boolean;
}) {
  return (
    <ArtifactShell rotation={0.5} border="#E5E0EA">
      {/* Figma tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: devMode ? "#1E1E1E" : "#F5F5F5",
          borderBottom: `1px solid ${devMode ? "#333" : "#E0DCD4"}`,
          fontFamily: SYSTEM,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Figma logo */}
          <svg width="14" height="14" viewBox="0 0 38 57">
            <path fill="#F24E1E" d="M19 28.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" />
            <path fill="#FF7262" d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 01-19 0z" />
            <path fill="#A259FF" d="M19 0v19h9.5a9.5 9.5 0 000-19H19z" />
            <path fill="#1ABCFE" d="M38 9.5a9.5 9.5 0 01-9.5 9.5H19V0h9.5A9.5 9.5 0 0138 9.5z" />
            <path fill="#0ACF83" d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z" />
          </svg>
          <span
            style={{
              fontSize: 12,
              color: devMode ? "#999" : INK_3,
              fontWeight: 500,
            }}>
            {page}
          </span>
        </div>
        {devMode && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              color: "#0ACF83",
              background: "rgba(10,207,131,0.1)",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid rgba(10,207,131,0.2)",
              fontWeight: 600,
            }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4L3 6L7 2" stroke="#0ACF83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dev Mode
          </div>
        )}
      </div>

      {/* Comment thread */}
      <div style={{ padding: "14px 16px", fontFamily: SYSTEM }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Figma comment pin */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "linear-gradient(135deg, #A259FF, #7B2FE0)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(162,89,255,0.3)",
            }}>
            {avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: INK,
                }}>
                {author}
              </span>
              <span style={{ fontSize: 11, color: INK_4 }}>2m ago</span>
              <span
                style={{
                  fontSize: 9,
                  color: "#D97706",
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  padding: "2px 6px",
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                Unresolved
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: INK_2,
              }}>
              {comment}
            </div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   5. MEETING NOTE — Notion-style document
   ══════════════════════════════════════════════════════════ */

function MeetingNote() {
  return (
    <ArtifactShell rotation={-0.5} bg="#FFFFFF" border="#E8E5DF">
      {/* Notion-style top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderBottom: "1px solid #F0EDE7",
          fontFamily: SYSTEM,
        }}>
        <span style={{ fontSize: 16 }}>&#x1F4DD;</span>
        <span style={{ fontSize: 12, color: INK_3, fontWeight: 500 }}>
          Cross-team sync notes
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 3 }}>
          {["#E8734A", "#45B26B", "#5B5FC7"].map((c) => (
            <div
              key={c}
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: c,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                border: "2px solid #fff",
                marginLeft: -4,
              }}>
              {c === "#E8734A" ? "K" : c === "#45B26B" ? "A" : "M"}
            </div>
          ))}
          <span style={{ fontSize: 10, color: INK_4, marginLeft: 4, alignSelf: "center" }}>
            3 viewers
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px 20px", fontFamily: SYSTEM }}>
        {/* Date */}
        <div
          style={{
            fontSize: 11,
            color: INK_4,
            marginBottom: 6,
            fontWeight: 500,
          }}>
          March 14, 2024
        </div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: INK,
            margin: "0 0 16px",
            lineHeight: 1.3,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
          Cross-team sync notes
        </h3>

        <div style={{ fontSize: 14, lineHeight: 1.75, color: INK_2 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: INK_4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
            Agenda
          </div>
          <div style={{ marginBottom: 6 }}>
            Marketing terminology and implementation handoff
          </div>
          <div
            style={{
              marginBottom: 6,
              background: "#FEF9C3",
              borderLeft: "3px solid #EAB308",
              padding: "6px 10px",
              borderRadius: "0 4px 4px 0",
              fontSize: 13,
              color: INK,
            }}>
            Marketing keeps referring to &ldquo;the widget&rdquo; and engineering keeps
            asking &ldquo;which widget?&rdquo;
          </div>
          <div
            style={{
              fontStyle: "italic",
              color: INK_3,
              fontSize: 13,
            }}>
            Need shared naming before next sprint.
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   6. ADR COMMENT — Confluence/doc review
   ══════════════════════════════════════════════════════════ */

function AdrComment() {
  return (
    <ArtifactShell rotation={0.3}>
      {/* Doc header */}
      <div
        style={{
          padding: "10px 16px",
          background: "#FAFAF8",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: SYSTEM,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="12" height="12" rx="2" stroke="#6366F1" strokeWidth="1.3" />
          <path d="M4 5h6M4 7h4M4 9h5" stroke="#6366F1" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontSize: 12,
            color: "#6366F1",
            fontWeight: 600,
            fontFamily: MONO,
          }}>
          ADR-012
        </span>
        <span style={{ fontSize: 12, color: INK_3 }}>
          Frontend rendering approach
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 10,
            color: "#B45309",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            padding: "2px 7px",
            borderRadius: 4,
            fontWeight: 600,
          }}>
          Under review
        </span>
      </div>

      <div style={{ padding: "14px 16px", fontFamily: SYSTEM }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#E0E7FF",
              color: "#4338CA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}>
            A
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
                Architect
              </span>
              <span style={{ fontSize: 11, color: INK_4 }}>commented</span>
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: INK_2,
                padding: "8px 12px",
                background: "#F8F7FF",
                borderRadius: 6,
                borderLeft: "3px solid #6366F1",
              }}>
              Why did you choose this approach over the alternative? Walk us through the
              trade-offs.
            </div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   7. GITHUB PR REVIEW — GitHub pull request
   ══════════════════════════════════════════════════════════ */

function GithubReviewCard() {
  return (
    <ArtifactShell rotation={-0.4} border="#D0D7DE">
      {/* GitHub header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "#F6F8FA",
          borderBottom: "1px solid #D0D7DE",
          fontFamily: SYSTEM,
        }}>
        {/* GitHub octocat */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#24292F">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span style={{ fontSize: 12, color: "#57606A", fontWeight: 600 }}>
          dkb-app
        </span>
        <span style={{ color: "#D0D7DE" }}>/</span>
        <span
          style={{
            fontSize: 12,
            color: "#0969DA",
            fontWeight: 600,
          }}>
          frontend
        </span>
      </div>

      <div style={{ padding: "14px 16px 16px", fontFamily: SYSTEM }}>
        {/* PR title */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}>
            {/* Open PR icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#1F883D">
              <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
            </svg>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#24292F",
                lineHeight: 1.3,
              }}>
              feat: account settings redesign
            </span>
            <span
              style={{
                fontSize: 16,
                color: "#57606A",
                fontWeight: 400,
              }}>
              #847
            </span>
          </div>
          {/* Labels */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                color: "#fff",
                background: "#7057FF",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 600,
              }}>
              frontend
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#fff",
                background: "#0E8A16",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 600,
              }}>
              enhancement
            </span>
          </div>
        </div>

        {/* Review status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "#FFF8C5",
            border: "1px solid #D4A72C",
            borderRadius: 6,
            fontSize: 12,
          }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#9A6700">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575zM8 5a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 008 5zm1 6a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <span style={{ color: "#7C5B00", fontWeight: 500 }}>
            Lisa K. requested your review
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "#9A6700", fontWeight: 400, fontSize: 11 }}>
            2 days ago
          </span>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   8. PLAIN TEXT MOMENT
   ══════════════════════════════════════════════════════════ */

function PlainTextMoment({
  context,
  quote,
  rotation = 0,
}: {
  context: string;
  quote: string;
  rotation?: number;
}) {
  return (
    <div
      style={{
        padding: "6px 0",
        transform: `rotate(${rotation}deg)`,
      }}>
      <div
        className="font-ui"
        style={{
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: INK_4,
          marginBottom: 12,
          fontWeight: 600,
        }}>
        {context}
      </div>
      <p
        className="font-serif"
        style={{
          fontSize: "clamp(22px, 3.5vw, 30px)",
          lineHeight: 1.4,
          color: INK,
          maxWidth: 640,
          margin: 0,
          letterSpacing: "-0.015em",
          fontWeight: 400,
        }}>
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════ */

export default function LabArtifactsPage() {
  return (
    <>
      <LabNav />
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F3EE",
          color: INK,
          padding: "80px 24px 120px",
        }}>
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
          }}>
          {/* Header */}
          <div style={{ marginBottom: 72 }}>
            <div
              className="font-ui"
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: INK_4,
                marginBottom: 14,
                fontWeight: 600,
              }}>
              Lab / Story Artifacts
            </div>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 400,
                color: INK,
                margin: "0 0 10px",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}>
              Fragments from the work
            </h1>
            <p
              style={{
                fontSize: 14,
                color: INK_3,
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 480,
              }}>
              Skeuomorphic UI artifacts — real tools, real moments.
              Each one maps to a story inside users, gaps, or patterns.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 54 }}>
            {/* Users */}
            <div>
              <CompanyPillar company="AMBOSS" pillar="Users" />
              <JiraCard />
            </div>

            <div>
              <CompanyPillar company="Compado" pillar="Users" />
              <SentryCard />
            </div>

            <div>
              <CompanyPillar company="DKB" pillar="Users" />
              <SlackMessage
                sender="Thomas M."
                avatar="T"
                avatarBg="#2B5A3F"
                timestamp="10:17 AM"
                text="Kash, the transfer page shows the amount but not the recipient. That is going to scare people."
                channel="#frontend-dkb"
                emoji={[
                  { icon: "\uD83D\uDC40", count: 3 },
                  { icon: "\u26A0\uFE0F", count: 1 },
                ]}
              />
            </div>

            {/* Structure */}
            <div>
              <CompanyPillar company="AMBOSS" pillar="Structure" />
              <FigmaComment
                author="Lisa"
                avatar="L"
                page="Side Menu v2"
                comment="Here is the menu. It opens from the side."
              />
            </div>

            <div>
              <CompanyPillar company="Compado" pillar="Structure" />
              <SlackMessage
                sender="Marcus W."
                avatar="M"
                avatarBg="#5B5FC7"
                timestamp="3:42 PM"
                text="This ticket said &lsquo;small change&rsquo; but I have been on it for two days."
                direct
              />
            </div>

            <div>
              <CompanyPillar company="CAPinside" pillar="Structure" />
              <FigmaComment
                author="Designer"
                avatar="D"
                page="Fund Detail v3"
                comment="The new fund detail page looks clean in Figma but the data it needs does not exist in the API the same way."
                devMode
              />
            </div>

            {/* Clarity */}
            <div>
              <CompanyPillar company="Compado" pillar="Clarity" />
              <MeetingNote />
            </div>

            <div>
              <CompanyPillar company="CAPinside" pillar="Clarity" />
              <AdrComment />
            </div>

            <div>
              <CompanyPillar company="DKB" pillar="Clarity" />
              <GithubReviewCard />
            </div>

            <div>
              <CompanyPillar company="AMBOSS" pillar="Clarity" />
              <PlainTextMoment
                context="1:1 with Product Owner"
                quote="Can you start on this? We will figure out the details as we go."
                rotation={0.4}
              />
            </div>

            {/* Scale */}
            <div>
              <CompanyPillar company="AMBOSS" pillar="Scale" />
              <PlainTextMoment
                context="New team member, week 1"
                quote="How does anyone work on this file? It is massive."
                rotation={-0.3}
              />
            </div>

            <div>
              <CompanyPillar company="DKB" pillar="Scale" />
              <PlainTextMoment
                context="During standup"
                quote="We have fourteen feature flags in production. Does anyone know which ones are still active?"
                rotation={0.5}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
