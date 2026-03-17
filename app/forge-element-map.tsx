"use client";

/* Inline debug label — attach directly to elements */

const LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  fontSize: 9,
  padding: "1px 6px",
  background: "rgba(0,0,0,0.75)",
  color: "rgba(0,255,200,0.7)",
  borderLeft: "2px solid rgba(0,255,200,0.5)",
  pointerEvents: "none",
  zIndex: 9999,
  fontFamily: "var(--font-sans)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

export function DL({
  children,
  style,
}: {
  children: string;
  style?: React.CSSProperties;
}) {
  return <div style={{ ...LABEL_STYLE, ...style }}>{children}</div>;
}

/* SVG debug label — for use inside <svg> */
export const DL_SVG_STYLE = {
  fill: "rgba(0,255,200,0.55)",
  fontSize: 9,
  fontFamily: "var(--font-sans)",
  letterSpacing: "0.1em",
} as const;
