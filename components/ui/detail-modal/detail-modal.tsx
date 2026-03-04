"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TRANSITION } from "@components";
import { TOKENS, KEYBOARD_EVENT, POINTER_EVENT } from "@utilities";
import { useSectionScroll } from "@hooks";
import { DETAIL_MODAL_VARIANT, type DetailModalProps, type ModalCloseButtonProps } from "./detail-modal.types";

const { KEY: { ESCAPE }, TYPE: { KEY_DOWN } } = KEYBOARD_EVENT;
const { gold } = TOKENS;
const { INLINE, OVERLAY } = DETAIL_MODAL_VARIANT;
const { MOUSE_DOWN } = POINTER_EVENT;

export function DetailModal({
  onClose,
  children,
  variant = INLINE,
  color = gold,
}: DetailModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollToY } = useSectionScroll();

  useEffect(() => {
    let savedScrollY = 0;
    if (variant === OVERLAY) {
      savedScrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === ESCAPE) onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener(MOUSE_DOWN, handleClickOutside);
      document.addEventListener(KEY_DOWN, handleEscape);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener(
        MOUSE_DOWN,
        handleClickOutside,
      );
      document.removeEventListener(KEY_DOWN, handleEscape);
      if (variant === OVERLAY) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        scrollToY(savedScrollY, { behavior: "auto" });
      }
    };
  }, [onClose, scrollToY, variant]);

  if (variant === OVERLAY) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={TRANSITION.snap}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ ...TRANSITION.base, delay: 0.05 }}
          className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)]">
          <ModalCloseButton
            onClose={onClose}
            color={color}
            className="absolute right-4 top-4 z-10"
          />
          {children}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.fast}
      className="relative">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-elevated)] p-8 sm:p-12">
        {children}
      </motion.div>
      <ModalCloseButton
        onClose={onClose}
        color={color}
        className="mx-auto mt-6 block"
      />
    </motion.div>
  );
}

export function ModalCloseButton({
  onClose,
  className,
  color = gold,
}: ModalCloseButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      onClick={onClose}
      style={{ color }}
      className={`cursor-pointer transition-colors hover:text-[var(--cream)] ${className ?? ""}`}
      aria-label="Close">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5">
        <path d="M4 4l12 12M16 4L4 16" />
      </svg>
    </motion.button>
  );
}
