/* ================================================================== */
/*  Shared Sankey data for lab prototypes                              */
/* ================================================================== */

export interface SankeyStream {
  id: string;
  label: string;
  color: string;
  /** Company node indices this stream passes through */
  path: number[];
  /** Relative importance / width (1-5) */
  width: number;
}

export interface SankeyNode {
  id: string;
  label: string;
  period: string;
  color: string;
}

export const STREAMS: SankeyStream[] = [
  { id: "empathy",      label: "User Empathy",     color: "#E05252", path: [0, 1, 2, 3], width: 3 },
  { id: "evidence",     label: "Evidence",         color: "#61DAFB", path: [0, 3],       width: 4 },
  { id: "speed",        label: "Speed",            color: "#42B883", path: [1, 2],       width: 3 },
  { id: "diagnosis",    label: "Diagnosis",        color: "#3178C6", path: [2, 3],       width: 4 },
  { id: "process",      label: "Process",          color: "#F59E0B", path: [1, 2, 3],    width: 2 },
  { id: "testing",      label: "Testing",          color: "#2EAD33", path: [0, 3],       width: 3 },
  { id: "architecture", label: "Architecture",     color: "#8B5CF6", path: [1, 2, 3],    width: 3 },
  { id: "product",      label: "Product Sense",    color: "#EC4899", path: [0, 1, 2, 3], width: 2 },
  { id: "judgment",     label: "Judgment",         color: "#06B6D4", path: [2, 3],       width: 2 },
];

export const NODES: SankeyNode[] = [
  { id: "amboss",    label: "AMBOSS",     period: "2018 — 2019", color: "#60A5FA" },
  { id: "compado",   label: "Compado",    period: "2019 — 2021", color: "#42B883" },
  { id: "capinside", label: "CAPinside",  period: "2021",        color: "#3178C6" },
  { id: "dkb",       label: "DKB",        period: "2021 — 2024", color: "#F472B6" },
];

/* ---- Math helpers (re-exported from canonical source) ---- */
export { smoothstep, lerp, clamp } from "./engineer-candidate/math";

/* ---- SVG path generator for a Sankey flow (horizontal) ---- */

export function hFlowPath(
  x1: number, y1: number, w1: number,
  x2: number, y2: number, w2: number,
): string {
  const mx = (x1 + x2) / 2;
  return [
    `M ${x1} ${y1 - w1 / 2}`,
    `C ${mx} ${y1 - w1 / 2}, ${mx} ${y2 - w2 / 2}, ${x2} ${y2 - w2 / 2}`,
    `L ${x2} ${y2 + w2 / 2}`,
    `C ${mx} ${y2 + w2 / 2}, ${mx} ${y1 + w1 / 2}, ${x1} ${y1 + w1 / 2}`,
    `Z`,
  ].join(" ");
}

/* ---- SVG path generator for a Sankey flow (vertical) ---- */

export function vFlowPath(
  x1: number, y1: number, w1: number,
  x2: number, y2: number, w2: number,
): string {
  const my = (y1 + y2) / 2;
  return [
    `M ${x1 - w1 / 2} ${y1}`,
    `C ${x1 - w1 / 2} ${my}, ${x2 - w2 / 2} ${my}, ${x2 - w2 / 2} ${y2}`,
    `L ${x2 + w2 / 2} ${y2}`,
    `C ${x2 + w2 / 2} ${my}, ${x1 + w1 / 2} ${my}, ${x1 + w1 / 2} ${y1}`,
    `Z`,
  ].join(" ");
}

/* ---- Compute stream positions stacked at each node ---- */

export interface StreamPos {
  nodeIdx: number;
  x: number;
  y: number;
  w: number;
}

/**
 * For horizontal layout: nodes have fixed x, streams stack vertically at each node.
 * Returns a Map from stream id → array of positions at each node it passes through.
 */
export function computeHLayout(
  nodeXPositions: number[],
  nodeCenterY: number,
  unitWidth: number = 6,
  gap: number = 4,
): Map<string, StreamPos[]> {
  const layout = new Map<string, StreamPos[]>();

  for (let ni = 0; ni < NODES.length; ni++) {
    const passing = STREAMS.filter((s) => s.path.includes(ni));
    const totalH = passing.reduce((sum, s) => sum + s.width * unitWidth, 0) + (passing.length - 1) * gap;
    let cy = nodeCenterY - totalH / 2;

    for (const stream of passing) {
      const w = stream.width * unitWidth;
      if (!layout.has(stream.id)) layout.set(stream.id, []);
      layout.get(stream.id)!.push({
        nodeIdx: ni,
        x: nodeXPositions[ni],
        y: cy + w / 2,
        w,
      });
      cy += w + gap;
    }
  }

  return layout;
}

/**
 * For vertical layout: nodes have fixed y, streams stack horizontally at each node.
 */
export function computeVLayout(
  nodeYPositions: number[],
  nodeCenterX: number,
  unitWidth: number = 6,
  gap: number = 4,
): Map<string, StreamPos[]> {
  const layout = new Map<string, StreamPos[]>();

  for (let ni = 0; ni < NODES.length; ni++) {
    const passing = STREAMS.filter((s) => s.path.includes(ni));
    const totalW = passing.reduce((sum, s) => sum + s.width * unitWidth, 0) + (passing.length - 1) * gap;
    let cx = nodeCenterX - totalW / 2;

    for (const stream of passing) {
      const w = stream.width * unitWidth;
      if (!layout.has(stream.id)) layout.set(stream.id, []);
      layout.get(stream.id)!.push({
        nodeIdx: ni,
        x: cx + w / 2,
        y: nodeYPositions[ni],
        w,
      });
      cx += w + gap;
    }
  }

  return layout;
}
