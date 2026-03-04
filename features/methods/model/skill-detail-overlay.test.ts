import { describe, expect, it } from "vitest";
import { METHOD_GROUPS } from "@data";
import {
  closeSkillDetailOverlayState,
  createOpenSkillDetailOverlayState,
  deriveSkillDetailOverlayNavigation,
  moveSkillDetailOverlaySelection,
  SKILL_DETAIL_OVERLAY_INITIAL_STATE,
} from "./skill-detail-overlay";

const firstGroup = METHOD_GROUPS[0];
const firstSkill = firstGroup.skills[0];
const secondSkill = firstGroup.skills[1];

describe("skill detail overlay model", () => {
  it("starts in a closed state", () => {
    const snapshot = deriveSkillDetailOverlayNavigation(
      SKILL_DETAIL_OVERLAY_INITIAL_STATE,
      METHOD_GROUPS,
    );

    expect(snapshot.activeSkill).toBeNull();
    expect(snapshot.canGoPrev).toBe(false);
    expect(snapshot.canGoNext).toBe(false);
  });

  it("opens and reports navigation capabilities", () => {
    const state = createOpenSkillDetailOverlayState({
      skill: firstSkill,
      groupLabel: firstGroup.label,
      groupIndex: 0,
      skillIndex: 0,
    });

    const snapshot = deriveSkillDetailOverlayNavigation(state, METHOD_GROUPS);

    expect(snapshot.activeSkill?.skill.id).toBe(firstSkill.id);
    expect(snapshot.canGoPrev).toBe(false);
    expect(snapshot.canGoNext).toBe(true);
  });

  it("moves next/prev without creating invalid states", () => {
    const opened = createOpenSkillDetailOverlayState({
      skill: firstSkill,
      groupLabel: firstGroup.label,
      groupIndex: 0,
      skillIndex: 0,
    });

    const movedNext = moveSkillDetailOverlaySelection(opened, METHOD_GROUPS, "next");
    const movedPrev = moveSkillDetailOverlaySelection(movedNext, METHOD_GROUPS, "prev");

    const nextSnapshot = deriveSkillDetailOverlayNavigation(movedNext, METHOD_GROUPS);
    const prevSnapshot = deriveSkillDetailOverlayNavigation(movedPrev, METHOD_GROUPS);

    expect(nextSnapshot.activeSkill?.skill.id).toBe(secondSkill.id);
    expect(prevSnapshot.activeSkill?.skill.id).toBe(firstSkill.id);
  });

  it("closes when asked and preserves closed boundary behavior", () => {
    const closed = closeSkillDetailOverlayState();
    const moved = moveSkillDetailOverlaySelection(closed, METHOD_GROUPS, "next");

    expect(closed.kind).toBe("closed");
    expect(moved.kind).toBe("closed");
  });
});
