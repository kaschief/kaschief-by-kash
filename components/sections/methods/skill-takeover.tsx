"use client";

import { useEffect } from "react";
import { useTakeover } from "@/components/motion";
import { TOKENS } from "@/lib/tokens";
import { Z_INDEX } from "@/lib/constants";
import { KEYBOARD_EVENT, TAKEOVER_NAV_LABEL } from "@/lib/interaction";
import { TakeoverNavigation } from "@/components/ui/takeover-navigation";
import type { SkillTakeoverProps } from "./methods.types";

export function SkillTakeover({
  skill,
  groupLabel,
  onClose,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: SkillTakeoverProps) {
  const { item } = useTakeover(onClose);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_EVENT.KEY.ARROW_LEFT && canGoPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === KEYBOARD_EVENT.KEY.ARROW_RIGHT && canGoNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener(KEYBOARD_EVENT.TYPE.KEY_DOWN, handleKey);
    return () =>
      document.removeEventListener(KEYBOARD_EVENT.TYPE.KEY_DOWN, handleKey);
  }, [canGoNext, canGoPrev, onNext, onPrev]);

  return (
    <div
      onClick={() => history.back()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: Z_INDEX.takeover,
        background: TOKENS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
      <TakeoverNavigation
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev}
        onNext={onNext}
        prevLabel={TAKEOVER_NAV_LABEL.PREVIOUS_METHOD}
        nextLabel={TAKEOVER_NAV_LABEL.NEXT_METHOD}
        zIndex={Z_INDEX.takeover + 1}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <p
          style={{
            fontFamily: TOKENS.fontMono,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: TOKENS.gold,
            marginBottom: 32,
            ...item(0.08),
          }}>
          {groupLabel}
        </p>
        <h2
          style={{
            fontFamily: TOKENS.fontSerif,
            fontWeight: 400,
            fontSize: "clamp(44px, 7vw, 96px)",
            color: TOKENS.cream,
            lineHeight: 1,
            marginBottom: 36,
            ...item(0.04),
          }}>
          {skill.label}
        </h2>
        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            lineHeight: 1.85,
            color: TOKENS.textDim,
            maxWidth: 580,
            ...item(0.12),
          }}>
          {skill.detail}
        </p>
      </div>
    </div>
  );
}
