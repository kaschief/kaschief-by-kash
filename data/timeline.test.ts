import { describe, expect, it } from "vitest";
import { METHOD_GROUPS } from "./methods";
import { ACT_I, ACT_II, ACT_III, ACT_IV, JOBS, MGMT_STORIES } from "./timeline";

const ALL_METHOD_SKILL_IDS = new Set(
  METHOD_GROUPS.flatMap(({ skills }) => skills.map(({ id }) => id)),
);

describe("timeline data contracts", () => {
  it("keeps job and story ids unique", () => {
    const jobIds = JOBS.map(({ id }) => id);
    const storyIds = MGMT_STORIES.map(({ id }) => id);

    expect(new Set(jobIds).size).toBe(jobIds.length);
    expect(new Set(storyIds).size).toBe(storyIds.length);
  });

  it("references only known method skill ids across all acts", () => {
    const actSkills = [ACT_I, ACT_II, ACT_III, ACT_IV].flatMap(({ skills }) =>
      skills.map(({ id }) => id),
    );

    expect(actSkills.every((id) => ALL_METHOD_SKILL_IDS.has(id))).toBe(true);
  });
});

describe("Act I skill scenarios", () => {
  const { skillScenarios } = ACT_I;

  it("keeps scenario ids unique", () => {
    const ids = skillScenarios.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has accent text that is a substring of the question", () => {
    for (const scenario of skillScenarios) {
      expect(scenario.question).toContain(scenario.accentText);
    }
  });

  it("has non-empty required fields on every scenario", () => {
    for (const scenario of skillScenarios) {
      expect(scenario.id.length).toBeGreaterThan(0);
      expect(scenario.question.length).toBeGreaterThan(0);
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.proof.length).toBeGreaterThan(0);
      expect(scenario.capability.length).toBeGreaterThan(0);
    }
  });
});

describe("act color contracts", () => {
  it("uses valid color values for each act", () => {
    const colorPattern = /^(#[0-9A-Fa-f]{6}|var\(--.+\))$/;
    for (const act of [ACT_I, ACT_II, ACT_III, ACT_IV]) {
      expect(act.color).toMatch(colorPattern);
    }
  });

  it("assigns unique colors to each act", () => {
    const colors = [ACT_I, ACT_II, ACT_III, ACT_IV].map(({ color }) => color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
