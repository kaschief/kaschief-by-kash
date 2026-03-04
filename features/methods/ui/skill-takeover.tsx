"use client";

import { useEffect } from "react";
import { TakeoverNavigation, TakeoverContent } from "@components";
import { useTakeover } from "@hooks";
import { TOKENS, Z_INDEX, KEYBOARD_EVENT, TAKEOVER_NAV_LABEL } from "@utilities";
import type { SkillTakeoverProps } from "./methods.types";
const { KEY: { ARROW_LEFT, ARROW_RIGHT }, TYPE: { KEY_DOWN } } = KEYBOARD_EVENT;
const { bg, cream, fontMono, fontSerif, gold, textDim } = TOKENS;
const { takeover } = Z_INDEX;
const { NEXT_METHOD, PREVIOUS_METHOD } = TAKEOVER_NAV_LABEL;

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
      if (e.key === ARROW_LEFT && canGoPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === ARROW_RIGHT && canGoNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener(KEY_DOWN, handleKey);
    return () =>
      document.removeEventListener(KEY_DOWN, handleKey);
  }, [canGoNext, canGoPrev, onNext, onPrev]);

  return (
    <div
      onClick={() => history.back()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: takeover,
        background: bg,
        overflowY: "auto",
      }}>
      <TakeoverNavigation
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev}
        onNext={onNext}
        prevLabel={PREVIOUS_METHOD}
        nextLabel={NEXT_METHOD}
        zIndex={takeover + 1}
      />
      <TakeoverContent onClick={(e) => e.stopPropagation()}>
        <p
          style={{
            fontFamily: fontMono,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: gold,
            marginBottom: 32,
            ...item(0.08),
          }}>
          {groupLabel}
        </p>
        <h2
          style={{
            fontFamily: fontSerif,
            fontWeight: 400,
            fontSize: "clamp(36px, 7vw, 96px)",
            color: cream,
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
            color: textDim,
            maxWidth: 580,
            ...item(0.12),
          }}>
          {skill.detail}
        </p>
      </TakeoverContent>
    </div>
  );
}
