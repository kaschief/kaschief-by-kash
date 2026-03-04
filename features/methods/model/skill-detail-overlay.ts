import type { MethodGroup, MethodSkill } from "@data";

export interface ActiveSkill {
  skill: MethodSkill;
  groupLabel: string;
  groupIndex: number;
  skillIndex: number;
}

export type SkillDetailOverlayState =
  | { kind: "closed" }
  | { kind: "open"; active: ActiveSkill };

export const SKILL_DETAIL_OVERLAY_INITIAL_STATE = {
  kind: "closed",
} as const satisfies SkillDetailOverlayState;

/**
 * Opens detail overlay with an explicit cursor into the method graph.
 *
 * Trade-off: this keeps UI state minimal (one discriminated union)
 * while still carrying enough context to render and navigate.
 */
export function createOpenSkillDetailOverlayState(
  active: ActiveSkill,
): SkillDetailOverlayState {
  return {
    kind: "open",
    active,
  };
}

export function closeSkillDetailOverlayState(): SkillDetailOverlayState {
  return SKILL_DETAIL_OVERLAY_INITIAL_STATE;
}

export interface SkillDetailOverlayNavigationSnapshot {
  activeSkill: ActiveSkill | null;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function deriveSkillDetailOverlayNavigation(
  state: SkillDetailOverlayState,
  methodGroups: readonly MethodGroup[],
): SkillDetailOverlayNavigationSnapshot {
  if (state.kind === "closed") {
    return {
      activeSkill: null,
      canGoPrev: false,
      canGoNext: false,
    };
  }

  const { active } = state;
  const { groupIndex, skillIndex } = active;
  const group = methodGroups[groupIndex];

  // Defensive fallback keeps impossible indexes from leaking into the UI.
  if (!group) {
    return {
      activeSkill: null,
      canGoPrev: false,
      canGoNext: false,
    };
  }

  const maxSkillIndex = group.skills.length - 1;

  return {
    activeSkill: active,
    canGoPrev: skillIndex > 0,
    canGoNext: skillIndex < maxSkillIndex,
  };
}

export type SkillDetailOverlayDirection = "prev" | "next";

export function moveSkillDetailOverlaySelection(
  state: SkillDetailOverlayState,
  methodGroups: readonly MethodGroup[],
  direction: SkillDetailOverlayDirection,
): SkillDetailOverlayState {
  if (state.kind === "closed") {
    return state;
  }

  const {
    active: { groupIndex, skillIndex },
  } = state;
  const group = methodGroups[groupIndex];

  if (!group) {
    return closeSkillDetailOverlayState();
  }

  const delta = direction === "prev" ? -1 : 1;
  const nextSkillIndex = skillIndex + delta;

  if (nextSkillIndex < 0 || nextSkillIndex >= group.skills.length) {
    return state;
  }

  return createOpenSkillDetailOverlayState({
    skill: group.skills[nextSkillIndex],
    groupLabel: group.label,
    groupIndex,
    skillIndex: nextSkillIndex,
  });
}
