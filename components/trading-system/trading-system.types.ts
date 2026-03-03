import type { Indicator } from "@/data/trading";

export interface IndicatorDetailProps {
  indicator: Indicator;
  onClose: () => void;
}
