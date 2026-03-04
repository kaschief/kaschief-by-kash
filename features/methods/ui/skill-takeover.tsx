"use client";

import { DetailOverlay } from "@components";
import { TOKENS, TAKEOVER_NAV_LABEL } from "@utilities";
import type { SkillTakeoverProps } from "./methods.types";

const { cream, fontMono, fontSerif, gold, textDim } = TOKENS;
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
  return (
    <DetailOverlay
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      canGoPrev={canGoPrev}
      canGoNext={canGoNext}
      prevLabel={PREVIOUS_METHOD}
      nextLabel={NEXT_METHOD}>
      {({ item }) => (
        <>
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
        </>
      )}
    </DetailOverlay>
  );
}
