export interface Indicator {
  readonly name: string;
  readonly category: string;
  readonly color: string;
  readonly image: string;
  readonly desc: string;
}

export interface ProgressionStep {
  readonly step: string;
  readonly title: string;
  readonly desc: string;
  readonly image: string;
}

export const CATEGORIES = ["Liquidity", "Session", "Range"] as const;

export const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  Liquidity: "var(--act-blue)",
  Session: "var(--act-gold)",
  Range: "var(--act-green)",
};

export const INDICATORS: readonly Indicator[] = [
  {
    name: "MBZ Core",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/mbz.png",
    desc: "5 gap types as tradable zones",
  },
  {
    name: "SIF Core",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/sif.png",
    desc: "Institutional trap detection",
  },
  {
    name: "Gaps",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/gaps.png",
    desc: "NWOG, NDOG, RTH mapping",
  },
  {
    name: "Pulse",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse.png",
    desc: "Multi-timeframe sweep levels",
  },
  {
    name: "HTF Algo",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse-alt.png",
    desc: "Higher timeframe liquidity levels",
  },
  {
    name: "LTF Algo",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse.png",
    desc: "Execution tool for entries",
  },
  {
    name: "DTT Weekly",
    category: "Session",
    color: CATEGORY_COLORS.Session,
    image: "/images/indicators/dtt-weekly.png",
    desc: "4 named sessions with Fibonacci",
  },
  {
    name: "DTT Intraday",
    category: "Session",
    color: CATEGORY_COLORS.Session,
    image: "/images/indicators/dtt-intraday.png",
    desc: "15-session model with IQR",
  },
  {
    name: "Deviations",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/deviations.png",
    desc: "Statistical session expansion using IQR",
  },
  {
    name: "ADR",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/adr.png",
    desc: "Average Daily Range with ceiling/floor",
  },
  {
    name: "MBZ Prime",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/mbz-prime.png",
    desc: "Session liquidity pools aggregated",
  },
  {
    name: "MBZ Relay",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/mbz.png",
    desc: "Auto HTF pairing and zone broadcasting",
  },
];

export const PROGRESSION: readonly ProgressionStep[] = [
  {
    step: "01",
    title: "Naked Price",
    desc: "Where everyone starts. Candlesticks tell a story, but not enough of one.",
    image: "/images/indicators/naked.png",
  },
  {
    step: "02",
    title: "+ Statistical Context",
    desc: "Deviations show where price is relative to session norms.",
    image: "/images/indicators/deviations.png",
  },
  {
    step: "03",
    title: "+ Session Structure",
    desc: "DTT adds the weekly rhythm. Different sessions behave differently.",
    image: "/images/indicators/dtt-weekly.png",
  },
  {
    step: "04",
    title: "+ Full Stack",
    desc: "Zones, sweeps, traps — the complete picture.",
    image: "/images/indicators/naked-pulse.png",
  },
];
