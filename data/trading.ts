export interface Indicator {
  name: string;
  category: string;
  color: string;
  image: string;
  desc: string;
  lines: string;
}

export interface ProgressionStep {
  step: string;
  title: string;
  desc: string;
  image: string;
}

export const CATEGORIES = ["Liquidity", "Session", "Range"] as const;

export const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  Liquidity: "var(--act-blue)",
  Session: "var(--act-gold)",
  Range: "var(--act-green)",
};

export const INDICATORS: Indicator[] = [
  {
    name: "MBZ Core",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/mbz.png",
    desc: "5 gap types as tradable zones",
    lines: "1,400",
  },
  {
    name: "SIF Core",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/sif.png",
    desc: "Institutional trap detection",
    lines: "950",
  },
  {
    name: "Gaps",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/gaps.png",
    desc: "NWOG, NDOG, RTH mapping",
    lines: "1,890",
  },
  {
    name: "Pulse",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse.png",
    desc: "Multi-timeframe sweep levels",
    lines: "1,200",
  },
  {
    name: "HTF Algo",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse-alt.png",
    desc: "Higher timeframe liquidity levels",
    lines: "780",
  },
  {
    name: "LTF Algo",
    category: "Liquidity",
    color: CATEGORY_COLORS.Liquidity,
    image: "/images/indicators/pulse.png",
    desc: "Execution tool for entries",
    lines: "650",
  },
  {
    name: "DTT Weekly",
    category: "Session",
    color: CATEGORY_COLORS.Session,
    image: "/images/indicators/dtt-weekly.png",
    desc: "4 named sessions with Fibonacci",
    lines: "1,100",
  },
  {
    name: "DTT Intraday",
    category: "Session",
    color: CATEGORY_COLORS.Session,
    image: "/images/indicators/dtt-intraday.png",
    desc: "15-session model with IQR",
    lines: "1,350",
  },
  {
    name: "Deviations",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/deviations.png",
    desc: "Statistical session expansion using IQR",
    lines: "890",
  },
  {
    name: "ADR",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/adr.png",
    desc: "Average Daily Range with ceiling/floor",
    lines: "420",
  },
  {
    name: "MBZ Prime",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/mbz-prime.png",
    desc: "Session liquidity pools aggregated",
    lines: "1,050",
  },
  {
    name: "MBZ Relay",
    category: "Range",
    color: CATEGORY_COLORS.Range,
    image: "/images/indicators/mbz.png",
    desc: "Auto HTF pairing and zone broadcasting",
    lines: "520",
  },
];

export const PROGRESSION: ProgressionStep[] = [
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
