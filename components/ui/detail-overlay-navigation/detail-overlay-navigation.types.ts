export interface DetailOverlayNavigationProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  prevLabel: string;
  nextLabel: string;
  zIndex: number;
}
