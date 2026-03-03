import type { ReactNode } from "react";
import type { ActContent } from "@/data/timeline";

export interface ActSectionContentProps extends ActContent {
  children?: ReactNode;
}
