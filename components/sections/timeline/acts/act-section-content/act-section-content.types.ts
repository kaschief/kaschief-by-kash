import type { ReactNode } from "react";
import type { ActContent } from "@data";
export interface ActSectionContentProps extends ActContent {
  children?: ReactNode;
}
