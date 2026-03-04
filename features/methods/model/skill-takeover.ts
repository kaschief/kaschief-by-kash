import type { MethodGroup, MethodSkill } from "@data";

export interface ActiveSkill {
  skill: MethodSkill;
  groupLabel: string;
  groupIndex: number;
  skillIndex: number;
}

export type SkillTakeoverState =
  | { kind: "closed" }
  | { kind: "open"; active: ActiveSkill };

export const SKILL_TAKEOVER_INITIAL_STATE = {
  kind: "closed",
} as const satisfies SkillTakeoverState;

/**
 * Opens takeover with an explicit cursor into the method graph.
 *
 * Trade-off: this keeps UI state minimal (one discriminated union)
 * while still carrying enough context to render and navigate.
 */
export function createOpenSkillTakeoverState(active: ActiveSkill): SkillTakeoverState {
  return {
    kind: "open",
    active,
  };
}

export function closeSkillTakeoverState(): SkillTakeoverState {
  return SKILL_TAKEOVER_INITIAL_STATE;
}

export interface SkillTakeoverNavigationSnapshot {
  activeSkill: ActiveSkill | null;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function deriveSkillTakeoverNavigation(
  state: SkillTakeoverState,
  methodGroups: readonly MethodGroup[],
): SkillTakeoverNavigationSnapshot {
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

export type SkillTakeoverDirection = "prev" | "next";

export function moveSkillTakeoverSelection(
  state: SkillTakeoverState,
  methodGroups: readonly MethodGroup[],
  direction: SkillTakeoverDirection,
): SkillTakeoverState {
  if (state.kind === "closed") {
    return state;
  }

  const {
    active: { groupIndex, skillIndex },
  } = state;
  const group = methodGroups[groupIndex];

  if (!group) {
    return closeSkillTakeoverState();
  }

  const delta = direction === "prev" ? -1 : 1;
  const nextSkillIndex = skillIndex + delta;

  if (nextSkillIndex < 0 || nextSkillIndex >= group.skills.length) {
    return state;
  }

  return createOpenSkillTakeoverState({
    skill: group.skills[nextSkillIndex],
    groupLabel: group.label,
    groupIndex,
    skillIndex: nextSkillIndex,
  });
}
