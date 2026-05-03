import { describe, expect, it } from "vitest";
import { WORKSPACE_STORY_ELEMENT_ID, buildWorkspaceStoryRun } from "@/mocks/workspaceNarrative";

describe("buildWorkspaceStoryRun", () => {
  it("reserves a stable DOM id for post-tour hash navigation", () => {
    expect(WORKSPACE_STORY_ELEMENT_ID).toBe("workspace-story");
  });

  it("links chapters to operational and governance fixture ids", () => {
    const run = buildWorkspaceStoryRun();
    expect(run.chapters).toHaveLength(7);
    expect(run.chapters[0]?.to).toBe("/sources/src_ok_01");
    expect(run.chapters[1]?.to).toBe("/competitions/cmp_100");
    expect(run.chapters[4]?.to).toMatch(/^\/trust\?q=/);
    expect(run.chapters[5]?.to).toBe("/partners?status=pending");
    expect(run.chapters[6]?.to).toContain("/integrator?tab=pipeline");
  });
});
