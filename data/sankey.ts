/* ================================================================== */
/*  Shared Sankey data for lab prototypes                              */
/* ================================================================== */

export interface SankeyStream {
  id: string
  label: string
  color: string
  /** Company node indices this stream passes through */
  path: number[]
  /** Relative importance / width (1-5) */
  width: number
}

export interface SankeyNode {
  id: string
  label: string
  period: string
  color: string
}

export const STREAMS: SankeyStream[] = [
  { id: "empathy", label: "Empathy", color: "#E05252", path: [0, 1, 2, 3], width: 3 },
  { id: "evidence", label: "Evidence", color: "#61DAFB", path: [0, 3], width: 4 },
  { id: "speed", label: "Speed", color: "#42B883", path: [1, 2], width: 3 },
  { id: "diagnosis", label: "Diagnosis", color: "#3178C6", path: [2, 3], width: 4 },
  { id: "process", label: "Process", color: "#F59E0B", path: [1, 2, 3], width: 2 },
  { id: "testing", label: "Testing", color: "#2EAD33", path: [0, 3], width: 3 },
  { id: "architecture", label: "Architecture", color: "#8B5CF6", path: [1, 2, 3], width: 3 },
  { id: "product", label: "Product Sense", color: "#EC4899", path: [0, 1, 2, 3], width: 2 },
  { id: "judgment", label: "Judgment", color: "#06B6D4", path: [2, 3], width: 2 },
]

export const NODES: SankeyNode[] = [
  { id: "amboss", label: "AMBOSS", period: "2018 — 2019", color: "#60A5FA" },
  { id: "compado", label: "Compado", period: "2019 — 2021", color: "#42B883" },
  { id: "capinside", label: "CAPinside", period: "2021", color: "#3178C6" },
  { id: "dkb", label: "DKB", period: "2021 — 2024", color: "#F472B6" },
]

/* ---- Math helpers (re-exported from canonical source) ---- */
export { smoothstep, lerp, clamp } from "../features/timeline/ui/acts/act-ii/math"
// TODO: math helpers should move to a shared utility, not re-exported from a feature

