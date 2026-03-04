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
