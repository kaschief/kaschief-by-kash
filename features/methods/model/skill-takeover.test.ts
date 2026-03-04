import { describe, expect, it } from "vitest";
import { METHOD_GROUPS } from "@data";
import {
  closeSkillTakeoverState,
  createOpenSkillTakeoverState,
  deriveSkillTakeoverNavigation,
  moveSkillTakeoverSelection,
  SKILL_TAKEOVER_INITIAL_STATE,
} from "./skill-takeover";

const firstGroup = METHOD_GROUPS[0];
const firstSkill = firstGroup.skills[0];
const secondSkill = firstGroup.skills[1];

describe("skill takeover model", () => {
  it("starts in a closed state", () => {
    const snapshot = deriveSkillTakeoverNavigation(
      SKILL_TAKEOVER_INITIAL_STATE,
      METHOD_GROUPS,
    );

    expect(snapshot.activeSkill).toBeNull();
    expect(snapshot.canGoPrev).toBe(false);
    expect(snapshot.canGoNext).toBe(false);
  });

  it("opens and reports navigation capabilities", () => {
    const state = createOpenSkillTakeoverState({
      skill: firstSkill,
      groupLabel: firstGroup.label,
      groupIndex: 0,
      skillIndex: 0,
    });

    const snapshot = deriveSkillTakeoverNavigation(state, METHOD_GROUPS);

    expect(snapshot.activeSkill?.skill.id).toBe(firstSkill.id);
    expect(snapshot.canGoPrev).toBe(false);
    expect(snapshot.canGoNext).toBe(true);
  });

  it("moves next/prev without creating invalid states", () => {
    const opened = createOpenSkillTakeoverState({
      skill: firstSkill,
      groupLabel: firstGroup.label,
      groupIndex: 0,
      skillIndex: 0,
    });

    const movedNext = moveSkillTakeoverSelection(opened, METHOD_GROUPS, "next");
    const movedPrev = moveSkillTakeoverSelection(movedNext, METHOD_GROUPS, "prev");

    const nextSnapshot = deriveSkillTakeoverNavigation(movedNext, METHOD_GROUPS);
    const prevSnapshot = deriveSkillTakeoverNavigation(movedPrev, METHOD_GROUPS);

    expect(nextSnapshot.activeSkill?.skill.id).toBe(secondSkill.id);
    expect(prevSnapshot.activeSkill?.skill.id).toBe(firstSkill.id);
  });

  it("closes when asked and preserves closed boundary behavior", () => {
    const closed = closeSkillTakeoverState();
    const moved = moveSkillTakeoverSelection(closed, METHOD_GROUPS, "next");

    expect(closed.kind).toBe("closed");
    expect(moved.kind).toBe("closed");
  });
});
