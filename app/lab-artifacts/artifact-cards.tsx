"use client";

/**
 * Skeuomorphic artifact card components — pure visual templates.
 * ZERO hardcoded content. Every string comes via typed props.
 * Data lives in data/lenses.ts. Wiring lives in render-card.tsx.
 */

/** Outer border radius shared across all card shells and the morph back-face */
export const CARD_SHELL_RADIUS = 12;

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

/* ── Shell ── */

export function ArtifactShell({
  children,
  bg = "#FFFFFF",
  border = BORDER,
  rotation = 0,
  dark = false,
  className = "",
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  border?: string;
  rotation?: number;
  dark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: CARD_SHELL_RADIUS,
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
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   1. JIRA CARD
   ══════════════════════════════════════════════════════════ */

const PRIORITY_STYLES = {
  low: { color: "#216E4E", bg: "#DCFFF1", border: "#BAF3DB" },
  medium: { color: "#AE5A00", bg: "#FFF4E5", border: "#FFDDB5" },
  high: { color: "#AE2A19", bg: "#FFEDEB", border: "#FFD2CC" },
  critical: { color: "#AE2A19", bg: "#FFEDEB", border: "#FFD2CC" },
} as const;

const STATUS_STYLES = {
  open: { color: "#216E4E", bg: "#DCFFF1", border: "#BAF3DB" },
  "in-progress": { color: "#0055CC", bg: "#DEEBFF", border: "#B3D4FF" },
  done: { color: "#216E4E", bg: "#DCFFF1", border: "#BAF3DB" },
} as const;

export interface JiraCardProps {
  breadcrumb: { org: string; team: string };
  title: string;
  ticketId: string;
  description: string;
  priority: { label: string; level: "low" | "medium" | "high" | "critical" };
  status: { label: string; tone: "open" | "in-progress" | "done" };
  reporter: { name: string; avatar: string };
  style?: React.CSSProperties;
}

export function JiraCard({
  breadcrumb,
  title,
  ticketId,
  description,
  priority,
  status,
  reporter,
  style,
}: JiraCardProps) {
  const ps = PRIORITY_STYLES[priority.level];
  const ss = STATUS_STYLES[status.tone];

  return (
    <ArtifactShell style={style}>
      <div style={{ height: 3, background: "#1868DB" }} />
      <div style={{ padding: "14px 18px 16px", fontFamily: SYSTEM }}>
        {/* Breadcrumb */}
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
          <span style={{ color: "#1868DB", fontWeight: 600 }}>{breadcrumb.org}</span>
          <span style={{ color: INK_4 }}>/</span>
          <span>{breadcrumb.team}</span>
        </div>

        {/* Title row */}
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
              {title}
            </div>
            <div style={{ fontSize: 12, color: "#1868DB", fontWeight: 500 }}>{ticketId}</div>
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
          {description}
        </div>

        {/* Metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: ps.color,
              background: ps.bg,
              padding: "3px 8px",
              borderRadius: 4,
              border: `1px solid ${ps.border}`,
              fontWeight: 500,
            }}>
            <svg width="10" height="10" viewBox="0 0 16 16">
              <path d="M8 2l6 12H2z" fill="#E87800" />
            </svg>
            {priority.label}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: ss.color,
              background: ss.bg,
              padding: "3px 8px",
              borderRadius: 4,
              border: `1px solid ${ss.border}`,
            }}>
            {status.label}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: INK_3 }}>
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
              {reporter.avatar}
            </div>
            <span style={{ fontWeight: 600, color: INK_2 }}>{reporter.name}</span>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   2. SENTRY CARD
   ══════════════════════════════════════════════════════════ */

export interface SentryCardProps {
  project: { org: string; repo: string };
  eventCount: string;
  error: { type: string; message: string };
  stackTrace: { file: string; line: number; code: string };
  tags: string[];
  firstSeen: string;
  style?: React.CSSProperties;
}

export function SentryCard({
  project,
  eventCount,
  error,
  stackTrace,
  tags,
  firstSeen,
  style,
}: SentryCardProps) {
  return (
    <ArtifactShell bg="#140C1F" border="#2A1D3A" dark style={style}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 72 66" fill="#E1567C">
              <path d="M29 2.26a3.68 3.68 0 00-6.38 0L1.22 40.8a3.71 3.71 0 001.6 5 3.67 3.67 0 001.58.36h8.73a.47.47 0 00.43-.25 20.32 20.32 0 00-2.14-21.43A3.68 3.68 0 0114.6 20h16.18L22.4 6.47 8.53 30.34a.47.47 0 00.06.53 16.43 16.43 0 011.72 17.38H5.39L22.44 7.56z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0F0", fontFamily: SYSTEM }}>
              {project.org}
            </span>
            <span style={{ fontSize: 12, color: "#6B5A80" }}>/</span>
            <span style={{ fontSize: 12, color: "#8B7BA0", fontFamily: SYSTEM }}>
              {project.repo}
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
                animation: "sentry-pulse 2s ease-in-out infinite",
              }}
            />
            {eventCount}
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
          {error.type}<span style={{ color: "#6B5A80" }}>:</span>{" "}
          <span style={{ color: "#E8B4B8" }}>{error.message}</span>
        </div>

        {/* Stack trace */}
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
            <span style={{ color: "#A78BFA" }}>{stackTrace.file}</span>
            <span style={{ color: "#4B3D60" }}>:</span>
            <span style={{ color: "#F5B234" }}>{stackTrace.line}</span>
          </div>
          <div style={{ color: "#4B3D60" }}>
            {">"} {stackTrace.code}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {tags.map((tag, i) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: i === 0 ? "#D8B4FE" : "#8B7BA0",
                background: i === 0 ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${i === 0 ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.06)"}`,
                padding: "3px 8px",
                borderRadius: 4,
                fontFamily: MONO,
              }}>
              {tag}
            </span>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "#4B3D60", fontFamily: MONO }}>{firstSeen}</span>
        </div>
      </div>

      <style>{`
        @keyframes sentry-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   3. SLACK MESSAGE
   ══════════════════════════════════════════════════════════ */

export interface SlackMessageProps {
  sender: string;
  avatar: string;
  avatarBg?: string;
  timestamp: string;
  text: string;
  channel?: string;
  direct?: boolean;
  emoji?: { icon: string; count: number }[];
  style?: React.CSSProperties;
}

export function SlackMessage({
  sender,
  avatar,
  avatarBg,
  timestamp,
  text,
  channel,
  direct,
  emoji,
  style,
}: SlackMessageProps) {
  return (
    <ArtifactShell border="#E8E5DF" style={style}>
      {/* Workspace header */}
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
        {channel ? (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="#E8D5E1">
            <path
              d="M4.5 10h11M4.5 6h11M8 3v14M12 3v14"
              stroke="#E8D5E1"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: INK }}>{sender}</span>
              <span style={{ fontSize: 11, color: INK_4, fontWeight: 400 }}>{timestamp}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.58, color: INK, fontWeight: 400 }}>{text}</div>
            {emoji && (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
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
   4. FIGMA COMMENT
   ══════════════════════════════════════════════════════════ */

export interface FigmaCommentProps {
  author: string;
  avatar: string;
  page: string;
  comment: string;
  devMode?: boolean;
  style?: React.CSSProperties;
}

export function FigmaComment({
  author,
  avatar,
  page,
  comment,
  devMode,
  style,
}: FigmaCommentProps) {
  return (
    <ArtifactShell border="#E5E0EA" style={style}>
      {/* Tab bar */}
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
          <svg width="14" height="14" viewBox="0 0 38 57">
            <path fill="#F24E1E" d="M19 28.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" />
            <path fill="#FF7262" d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 01-19 0z" />
            <path fill="#A259FF" d="M19 0v19h9.5a9.5 9.5 0 000-19H19z" />
            <path fill="#1ABCFE" d="M38 9.5a9.5 9.5 0 01-9.5 9.5H19V0h9.5A9.5 9.5 0 0138 9.5z" />
            <path fill="#0ACF83" d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z" />
          </svg>
          <span style={{ fontSize: 12, color: devMode ? "#999" : INK_3, fontWeight: 500 }}>{page}</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{author}</span>
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
            <div style={{ fontSize: 13, lineHeight: 1.6, color: INK_2 }}>{comment}</div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   5. MEETING NOTE
   ══════════════════════════════════════════════════════════ */

export interface MeetingNoteProps {
  date: string;
  title: string;
  agendaLabel: string;
  agendaText: string;
  highlightedQuote: string;
  footnote: string;
  viewers: { avatar: string; color: string }[];
  style?: React.CSSProperties;
}

export function MeetingNote({
  date,
  title,
  agendaLabel,
  agendaText,
  highlightedQuote,
  footnote,
  viewers,
  style,
}: MeetingNoteProps) {
  return (
    <ArtifactShell bg="#FFFFFF" border="#E8E5DF" style={style}>
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
        <span style={{ fontSize: 12, color: INK_3, fontWeight: 500 }}>{title}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 3 }}>
          {viewers.map((v) => (
            <div
              key={v.avatar}
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: v.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                border: "2px solid #fff",
                marginLeft: -4,
              }}>
              {v.avatar}
            </div>
          ))}
          <span style={{ fontSize: 10, color: INK_4, marginLeft: 4, alignSelf: "center" }}>
            {viewers.length} viewers
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px 20px", fontFamily: SYSTEM }}>
        <div style={{ fontSize: 11, color: INK_4, marginBottom: 6, fontWeight: 500 }}>{date}</div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: INK,
            margin: "0 0 16px",
            lineHeight: 1.3,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
          {title}
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
            {agendaLabel}
          </div>
          <div style={{ marginBottom: 6 }}>{agendaText}</div>
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
            {highlightedQuote}
          </div>
          <div style={{ fontStyle: "italic", color: INK_3, fontSize: 13 }}>{footnote}</div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   6. ADR COMMENT
   ══════════════════════════════════════════════════════════ */

export interface AdrCommentProps {
  docId: string;
  subject: string;
  status: { label: string; tone: "under-review" | "accepted" | "superseded" };
  commenter: { role: string; avatar: string };
  comment: string;
  style?: React.CSSProperties;
}

export function AdrComment({
  docId,
  subject,
  status,
  commenter,
  comment,
  style,
}: AdrCommentProps) {
  return (
    <ArtifactShell style={style}>
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
        <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, fontFamily: MONO }}>{docId}</span>
        <span style={{ fontSize: 12, color: INK_3 }}>{subject}</span>
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
          {status.label}
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
            {commenter.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{commenter.role}</span>
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
              {comment}
            </div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   7. GITHUB PR REVIEW
   ══════════════════════════════════════════════════════════ */

export interface GithubReviewCardProps {
  repo: { org: string; name: string };
  pr: { title: string; number: string };
  labels: { text: string; color: string }[];
  reviewer: { name: string; timeAgo: string };
  style?: React.CSSProperties;
}

export function GithubReviewCard({
  repo,
  pr,
  labels,
  reviewer,
  style,
}: GithubReviewCardProps) {
  return (
    <ArtifactShell border="#D0D7DE" style={style}>
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#24292F">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span style={{ fontSize: 12, color: "#57606A", fontWeight: 600 }}>{repo.org}</span>
        <span style={{ color: "#D0D7DE" }}>/</span>
        <span style={{ fontSize: 12, color: "#0969DA", fontWeight: 600 }}>{repo.name}</span>
      </div>

      <div style={{ padding: "14px 16px 16px", fontFamily: SYSTEM }}>
        {/* PR title */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#1F883D">
              <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#24292F", lineHeight: 1.3 }}>
              {pr.title}
            </span>
            <span style={{ fontSize: 16, color: "#57606A", fontWeight: 400 }}>{pr.number}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {labels.map((l) => (
              <span
                key={l.text}
                style={{
                  fontSize: 11,
                  color: "#fff",
                  background: l.color,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 600,
                }}>
                {l.text}
              </span>
            ))}
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
          <span style={{ color: "#7C5B00", fontWeight: 500 }}>{reviewer.name} requested your review</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "#9A6700", fontWeight: 400, fontSize: 11 }}>{reviewer.timeAgo}</span>
        </div>
      </div>
    </ArtifactShell>
  );
}

/* ══════════════════════════════════════════════════════════
   8a. PLAIN TEXT — "bare" variant
   ══════════════════════════════════════════════════════════ */

export interface PlainTextBareProps {
  context: string;
  quote: string;
  rotation?: number;
  style?: React.CSSProperties;
}

export function PlainTextBare({ context, quote, rotation = 0, style }: PlainTextBareProps) {
  return (
    <div
      style={{
        padding: "6px 0",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        ...style,
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
   8b. PLAIN TEXT — "sticky note" variant
   ══════════════════════════════════════════════════════════ */

export interface PlainTextStickyProps {
  context: string;
  quote: string;
  rotation?: number;
  style?: React.CSSProperties;
}

export function PlainTextSticky({ context, quote, rotation = 0, style }: PlainTextStickyProps) {
  return (
    <div
      style={{
        background: "#FDF8EE",
        border: "1px solid #EDE4D0",
        borderRadius: 6,
        padding: "20px 24px 22px",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        boxShadow: [
          "0 1px 2px rgba(26,25,23,0.05)",
          "0 4px 12px rgba(26,25,23,0.04)",
        ].join(", "),
        maxWidth: 560,
        ...style,
      }}>
      <div
        className="font-ui"
        style={{
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: INK_4,
          marginBottom: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#D4A373",
            flexShrink: 0,
          }}
        />
        {context}
      </div>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: INK_2,
          margin: 0,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
        }}>
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   8c. PLAIN TEXT — "annotation" variant
   ══════════════════════════════════════════════════════════ */

export interface PlainTextAnnotationProps {
  context: string;
  quote: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

export function PlainTextAnnotation({
  context,
  quote,
  accentColor = "#6366F1",
  style,
}: PlainTextAnnotationProps) {
  return (
    <ArtifactShell style={style}>
      <div
        style={{
          borderLeft: `3px solid ${accentColor}`,
          padding: "18px 22px 20px",
        }}>
        <div
          className="font-ui"
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: accentColor,
            marginBottom: 10,
            fontWeight: 600,
          }}>
          {context}
        </div>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: INK,
            margin: 0,
            fontFamily: SYSTEM,
            fontWeight: 400,
          }}>
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </ArtifactShell>
  );
}
