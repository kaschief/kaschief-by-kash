"use client";

import { DetailOverlay } from "@components";
import { DETAIL_OVERLAY_NAV_LABEL, TOKENS } from "@utilities";
import type { SkillDetailOverlayProps } from "./methods.types";

const { cream, fontUi, fontSerif, gold, textDim } = TOKENS;
const { NEXT_METHOD, PREVIOUS_METHOD } = DETAIL_OVERLAY_NAV_LABEL;

export function SkillDetailOverlay({
  skill,
  groupLabel,
  onClose,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: SkillDetailOverlayProps) {
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
              fontFamily: fontUi,
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
