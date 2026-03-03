import type { ReactNode } from "react";

export const DETAIL_MODAL_VARIANT = {
  INLINE: "inline",
  OVERLAY: "overlay",
} as const;

export type DetailModalVariant =
  (typeof DETAIL_MODAL_VARIANT)[keyof typeof DETAIL_MODAL_VARIANT];

export interface DetailModalProps {
  onClose: () => void;
  children: ReactNode;
  variant?: DetailModalVariant;
  color?: string;
}

export interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  color?: string;
}
